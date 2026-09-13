import { useEffect, useState } from "react";
import type { MultiDeviceScreenshots, DeviceId } from "../types/index";
import type { CompositionConfig } from "../types/composition";
import { MockupCanvasInner } from "../components/mockup/MockupCanvasInner";

/**
 * Headless-only export page — rendered by Playwright to produce the
 * final PNG/WebP download.
 *
 * How it works:
 *   1. Playwright calls page.addInitScript() to inject window.__EXPORT_PAYLOAD__
 *      BEFORE this page loads, so the payload is available on first render.
 *   2. This component reads the payload, converts base64 screenshots to
 *      data-URI src strings, and pre-loads each image.
 *   3. Once all images have loaded, it sets window.__MOCKUP_READY__ = true.
 *   4. Playwright waits for window.__MOCKUP_READY__, then screenshots the
 *      element with id="mockup-canvas".
 *
 * There is NO header, footer, sidebar, or any other UI chrome on this page.
 */

const DEVICE_IDS: DeviceId[] = ["desktop", "laptop", "tablet", "mobile"];

interface ExportState {
  ready: boolean;
  screenshots: MultiDeviceScreenshots | null;
  config: CompositionConfig | null;
}

export function ExportPage() {
  const [state, setState] = useState<ExportState>({
    ready: false,
    screenshots: null,
    config: null,
  });

  useEffect(() => {
    const payload = window.__EXPORT_PAYLOAD__;
    if (!payload) {
      // No payload — nothing to render (should never happen in normal flow)
      console.error("[ExportPage] window.__EXPORT_PAYLOAD__ is not set.");
      return;
    }

    const { screenshots: b64Map, configuration } = payload;

    // Build MultiDeviceScreenshots from the base64 strings.
    // Images are converted to data URIs so they can be displayed without
    // any cross-origin restrictions in the headless context.
    const screenshots: MultiDeviceScreenshots = {} as MultiDeviceScreenshots;
    const loadPromises: Promise<void>[] = [];

    for (const deviceId of DEVICE_IDS) {
      const b64 = b64Map[deviceId];

      if (b64 && configuration.devices[deviceId]?.visible) {
        const src = `data:image/png;base64,${b64}`;
        screenshots[deviceId] = { success: true, imageUrl: src };

        // Pre-load via HTMLImageElement so the browser has decoded the image
        // before we render the React tree (eliminates a flash of empty screens).
        const p = new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => resolve(); // count errors as done so we don't hang
          img.src = src;
        });
        loadPromises.push(p);
      } else {
        // Device is hidden or has no screenshot
        screenshots[deviceId] = { success: false };
      }
    }

    // When every image has decoded, flip ready=true to trigger the render
    Promise.all(loadPromises).then(() => {
      setState({ ready: true, screenshots, config: configuration });
    });
  }, []);

  // Signal Playwright after the canvas has been committed to the DOM
  useEffect(() => {
    if (state.ready) {
      // Small rAF to let the browser paint one frame before we signal readiness
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          window.__MOCKUP_READY__ = true;
        });
      });
    }
  }, [state.ready]);

  // While pre-loading, show an invisible placeholder (0x0) so Playwright
  // does not accidentally screenshot an empty white page.
  if (!state.ready || !state.screenshots || !state.config) {
    return (
      <div
        style={{ width: 0, height: 0, overflow: "hidden" }}
        aria-hidden="true"
      />
    );
  }

  const { width: W, height: H } = state.config.canvas;

  return (
    // Outer wrapper matches the canvas exactly — no margin, no padding.
    // body/html default margin must also be 0 (see ExportPage style tag below).
    <div
      style={{
        width: `${W}px`,
        height: `${H}px`,
        margin: 0,
        padding: 0,
        overflow: "hidden",
      }}
    >
      <MockupCanvasInner
        id="mockup-canvas"
        screenshots={state.screenshots}
        config={state.config}
        exportMode
      />
    </div>
  );
}
