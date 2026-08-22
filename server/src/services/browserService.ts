import { chromium } from "playwright";
import { validateUrl } from "../utils/urlValidator.js";
import { config } from "../config/index.js";

export interface ScreenshotOptions {
  width: number;
  height: number;
  fullPage: boolean;
}

export async function captureScreenshot(
  url: string,
  options: ScreenshotOptions
): Promise<Buffer> {
  const browser = await chromium.launch({
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

  try {
    const context = await browser.newContext({
      viewport: {
        width: options.width,
        height: options.height,
      },
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 (MockupMakerBot)",
    });

    const page = await context.newPage();

    // Set a reasonable navigation timeout
    const timeout = config.screenshotTimeout;
    page.setDefaultNavigationTimeout(timeout);
    page.setDefaultTimeout(timeout);

    // Prevent SSRF via redirects or DNS rebinding on all network requests
    // We cache DNS results for this page load to avoid huge slowdowns
    const dnsCache = new Map<string, boolean>();

    await page.route("**/*", async (route) => {
      const request = route.request();
      const url = request.url();
      const urlObj = new URL(url);
      const hostname = urlObj.hostname;

      // data URIs and blob URIs don't have hostnames in the same way, skip DNS validation
      if (urlObj.protocol === "data:" || urlObj.protocol === "blob:") {
        return route.continue();
      }

      try {
        if (dnsCache.has(hostname)) {
          if (dnsCache.get(hostname)) {
            return route.continue();
          } else {
            return route.abort("accessdenied");
          }
        }

        await validateUrl(url);
        dnsCache.set(hostname, true);
        await route.continue();
      } catch (err) {
        dnsCache.set(hostname, false);
        console.warn(`Blocked SSRF attempt to: ${url}`);
        await route.abort("accessdenied");
      }
    });

    // Wait until 'load' to capture fully loaded pages without waiting for long-polling requests
    await page.goto(url, { waitUntil: "load" });

    // Capture the screenshot
    const screenshotBuffer = await page.screenshot({
      fullPage: options.fullPage,
      type: "png",
    });

    return screenshotBuffer;
  } finally {
    // Always close the browser, even if there's an error
    await browser.close();
  }
}
