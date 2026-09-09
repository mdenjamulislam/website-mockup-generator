import type { MockupConfig, MultiDeviceScreenshots, MultiScreenshotApiResponse, DeviceId } from "../types/index";
import type { CompositionConfig } from "../types/composition";
import { api } from "./api";

export interface GenerateMockupResult {
  imageUrl: string;
  width: number;
  height: number;
}

export async function generateMockup(
  url: string,
  config: MockupConfig
): Promise<GenerateMockupResult> {
  const response = await fetch("/api/screenshot", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url,
      width: config.width,
      height: config.height,
      fullPage: false,
    }),
  });

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}`;
    try {
      const errorData = await response.json();
      if (errorData.error && errorData.error.message) {
        errorMessage = errorData.error.message;
      }
    } catch {
      // Ignore JSON parse error if response is not JSON
    }
    throw new Error(errorMessage);
  }

  const blob = await response.blob();
  const imageUrl = URL.createObjectURL(blob);

  return {
    imageUrl,
    width: config.width,
    height: config.height,
  };
}

// ── Multi-device screenshot ───────────────────────────────────────────────────

/**
 * Generates screenshots for all four device presets in one request.
 * Returns a typed map of per-device results with blob object URLs.
 *
 * The caller is responsible for revoking object URLs when done
 * (e.g., URL.revokeObjectURL) to prevent memory leaks.
 */
export async function generateMultiDeviceMockup(
  url: string,
  onProgress?: (deviceId: DeviceId, success: boolean) => void
): Promise<MultiDeviceScreenshots> {
  const result = {} as MultiDeviceScreenshots;
  const deviceIds: DeviceId[] = ["desktop", "laptop", "tablet", "mobile"];

  // Run fetches concurrently
  const promises = deviceIds.map(async (deviceId) => {
    try {
      const response = await fetch("/api/screenshot/multi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          devices: [deviceId],
        }),
      });

      let apiData: MultiScreenshotApiResponse;
      try {
        apiData = await response.json();
      } catch {
        throw new Error(`HTTP ${response.status}: Invalid response.`);
      }

      if (!response.ok) {
        const msg = (apiData as any)?.error?.message ?? `HTTP ${response.status}`;
        throw new Error(msg);
      }

      const raw = apiData.screenshots?.[deviceId];
      if (!raw || !raw.success || !raw.data) {
        throw new Error(raw?.error ?? "Render failed.");
      }

      // Decode base64 PNG → Blob URL
      const binaryStr = atob(raw.data);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: "image/png" });
      result[deviceId] = { success: true, imageUrl: URL.createObjectURL(blob) };
      
      onProgress?.(deviceId, true);
    } catch (err: any) {
      result[deviceId] = { success: false, error: err.message };
      onProgress?.(deviceId, false);
    }
  });

  await Promise.all(promises);

  return result;
}

// ── Multi-device rendering export ────────────────────────────────────────────

export async function downloadMultiDeviceMockup(
  screenshots: MultiDeviceScreenshots,
  config: CompositionConfig,
  format: "png" | "webp" = "png"
): Promise<void> {
  const payloadScreenshots: Record<string, string> = {};

  // Convert blob URLs back to base64
  for (const deviceId of ["desktop", "laptop", "tablet", "mobile"] as DeviceId[]) {
    const result = screenshots[deviceId];
    if (result && result.success && result.imageUrl) {
      try {
        const response = await fetch(result.imageUrl);
        const blob = await response.blob();
        const buffer = await blob.arrayBuffer();
        
        // binary string to base64
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        payloadScreenshots[deviceId] = btoa(binary);
      } catch (e) {
        console.error("Failed to convert blob to base64 for", deviceId, e);
      }
    }
  }

  const response = await fetch("/api/mockup/render-multi", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      screenshots: payloadScreenshots,
      configuration: config,
      format,
    }),
  });

  if (!response.ok) {
    let msg = `HTTP ${response.status}`;
    try {
      const data = await response.json();
      if (data?.error?.message) msg = data.error.message;
    } catch {}
    throw new Error(msg);
  }

  const blob = await response.blob();
  const downloadUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = downloadUrl;
  a.download = `website-mockup.${format}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(downloadUrl);
}

// ── Health check ─────────────────────────────────────────────────────────────

export async function checkHealth(): Promise<boolean> {
  try {
    const result = await api.get<never>("/health");
    return result.success;
  } catch {
    return false;
  }
}

