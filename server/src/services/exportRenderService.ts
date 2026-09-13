import sharp from "sharp";
import { getSharedBrowser } from "./browserService.js";
import { config } from "../config/index.js";
import type { MultiCompositeRequest } from "../schemas/multiCompositeSchema.js";

// ── Export page URL ───────────────────────────────────────────────────────────
// Dev:  Vite dev server at localhost:5173  (or CLIENT_PORT override)
// Prod: Express serves the built client at the same port as the API
function getExportUrl(): string {
  if (config.nodeEnv === "production") {
    return `http://localhost:${config.port}/export`;
  }
  const clientPort = process.env.CLIENT_PORT ?? "5173";
  return `http://localhost:${clientPort}/export`;
}

// ── Readiness predicate (string form avoids Node TS "window" error) ───────────
// page.waitForFunction accepts either a function or a JS expression string.
// Using a string prevents tsc from complaining that "window" is unknown in Node.
const READY_PREDICATE = "window.__MOCKUP_READY__ === true";

// ── Main export renderer ──────────────────────────────────────────────────────

/**
 * Renders the multi-device mockup using the actual React/CSS device components.
 *
 * Flow:
 *  1. Inject payload into the browser page via addInitScript (runs before React).
 *  2. Navigate to /export — ExportPage reads the payload, pre-loads images,
 *     then sets window.__MOCKUP_READY__ = true after two rAF cycles.
 *  3. Screenshot #mockup-canvas (exact canvas element, no UI chrome).
 *  4. Convert to WebP with Sharp if requested.
 */
export async function renderExportComposition(
  request: MultiCompositeRequest
): Promise<Buffer> {
  const { configuration, screenshots, format } = request;
  const { width, height } = configuration.canvas;

  const exportUrl = getExportUrl();
  console.log(`[exportRenderService] Rendering export via ${exportUrl}`);

  const browser = await getSharedBrowser();

  const context = await browser.newContext({
    viewport: {
      // Use at least 1920x1080 so custom canvas sizes don't get clipped
      width: Math.max(width, 1920),
      height: Math.max(height, 1080),
    },
    deviceScaleFactor: 1,
  });

  try {
    const page = await context.newPage();

    // Inject payload BEFORE navigation so it is available when React mounts.
    // The callback runs in the browser context — the @ts-ignore suppresses the
    // Node-side tsc complaint about "window" which does not exist in Node.
    const payload = { screenshots, configuration, format };
    await page.addInitScript((p: unknown) => {
      // @ts-ignore
      window.__EXPORT_PAYLOAD__ = p;
    }, payload as unknown);

    // Forward browser-side errors to the server console for debugging
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        console.warn(`[ExportPage error] ${msg.text()}`);
      }
    });
    page.on("pageerror", (err) => {
      console.warn(`[ExportPage pageerror] ${err.message}`);
    });

    // Navigate — wait only for DOM ready; images are loaded by ExportPage itself
    await page.goto(exportUrl, { waitUntil: "domcontentloaded", timeout: 15000 });

    // Wait for ExportPage to finish loading all device images and signal readiness.
    // READY_PREDICATE is a JS string so tsc does not see "window" as unknown.
    await page.waitForFunction(READY_PREDICATE, { timeout: 30000 });

    // Screenshot only the #mockup-canvas element (no editor chrome)
    const canvasEl = page.locator("#mockup-canvas");
    await canvasEl.waitFor({ state: "visible", timeout: 5000 });
    const pngBuffer = await canvasEl.screenshot({ type: "png" });

    if (format === "webp") {
      return sharp(pngBuffer).webp({ quality: 92 }).toBuffer();
    }

    return pngBuffer;
  } finally {
    await context.close();
  }
}
