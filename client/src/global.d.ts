import type { CompositionConfig } from "./types/composition";

/**
 * Payload injected by Playwright's addInitScript before the export page loads.
 * Contains base64-encoded screenshots and the current composition configuration.
 */
export interface ExportPayload {
  screenshots: Record<string, string>; // deviceId -> base64 PNG string
  configuration: CompositionConfig;
  format: "png" | "webp";
}

declare global {
  interface Window {
    /**
     * Set by Playwright before navigating to /export.
     * Contains the screenshots and composition config to render.
     */
    __EXPORT_PAYLOAD__?: ExportPayload;

    /**
     * Set to true by ExportPage once all device images have preloaded
     * and the canvas is fully rendered.
     * Playwright waits for this before taking the screenshot.
     */
    __MOCKUP_READY__?: boolean;
  }
}
