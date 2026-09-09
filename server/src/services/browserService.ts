import { chromium, Browser } from "playwright";
import { validateUrl } from "../utils/urlValidator.js";
import { config } from "../config/index.js";
import type { DevicePreset } from "../config/devicePresets.js";

// ── Shared browser singleton ──────────────────────────────────────────────────
// One browser process is reused across all requests. Each render gets its own
// isolated BrowserContext (separate cookies, storage, etc.).

let sharedBrowser: Browser | null = null;

async function getSharedBrowser(): Promise<Browser> {
  if (sharedBrowser && sharedBrowser.isConnected()) {
    return sharedBrowser;
  }

  sharedBrowser = await chromium.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--no-zygote",
      "--disable-accelerated-2d-canvas",
      "--disable-extensions",
      "--mute-audio",
      "--allow-running-insecure-content=false",
      "--disable-background-timer-throttling",
      "--disable-backgrounding-occluded-windows",
      "--disable-renderer-backgrounding",
    ],
  });

  sharedBrowser.on("disconnected", () => {
    console.warn("⚠️ Shared browser disconnected — will restart on next request.");
    sharedBrowser = null;
  });

  return sharedBrowser;
}

// ── Internal helper ───────────────────────────────────────────────────────────

/**
 * Renders a URL at the specified viewport width/height and returns a PNG buffer.
 * Uses an isolated BrowserContext per render to avoid cross-request state leaks.
 */
async function renderAtViewport(
  url: string,
  width: number,
  height: number
): Promise<Buffer> {
  const browser = await getSharedBrowser();

  const context = await browser.newContext({
    viewport: { width, height },
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 (MockupMakerBot)",
  });

  try {
    const page = await context.newPage();

    const timeout = config.screenshotTimeout;
    page.setDefaultNavigationTimeout(timeout);
    page.setDefaultTimeout(timeout);

    // SSRF protection — re-validate all outbound requests inside the page
    const dnsCache = new Map<string, boolean>();

    await page.route("**/*", async (route) => {
      const request = route.request();
      const requestUrl = request.url();
      const urlObj = new URL(requestUrl);
      const hostname = urlObj.hostname;

      if (urlObj.protocol === "data:" || urlObj.protocol === "blob:") {
        return route.continue();
      }

      try {
        if (dnsCache.has(hostname)) {
          return dnsCache.get(hostname)
            ? route.continue()
            : route.abort("accessdenied");
        }
        await validateUrl(requestUrl);
        dnsCache.set(hostname, true);
        await route.continue();
      } catch {
        dnsCache.set(hostname, false);
        console.warn(`Blocked SSRF attempt to: ${requestUrl}`);
        await route.abort("accessdenied");
      }
    });

    // Wait for 'load' event so the page is fully painted before screenshotting
    await page.goto(url, { waitUntil: "load" });

    // Give late-loading assets (fonts, images) a moment to settle
    await page.waitForLoadState("networkidle").catch(() => {
      // networkidle can time-out on pages with persistent connections; continue anyway
    });

    const screenshotBuffer = await page.screenshot({
      fullPage: false,
      type: "png",
    });

    return screenshotBuffer;
  } finally {
    // Always release the context, even on error
    await context.close();
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

export interface ScreenshotOptions {
  width: number;
  height: number;
  fullPage: boolean;
}

/**
 * Renders a website at the given DevicePreset viewport.
 * Each call creates an isolated BrowserContext and closes it when done.
 */
export async function renderWebsite(
  url: string,
  preset: DevicePreset
): Promise<Buffer> {
  return renderAtViewport(url, preset.width, preset.height);
}

/**
 * Backward-compatible single-screenshot function.
 * Still used by compositeController and the legacy /api/screenshot endpoint.
 */
export async function captureScreenshot(
  url: string,
  options: ScreenshotOptions
): Promise<Buffer> {
  return renderAtViewport(url, options.width, options.height);
}
