// ── Shared domain types ─────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface HealthResponse {
  success: boolean;
  message: string;
}

export interface MockupConfig {
  deviceType: DeviceType;
  theme: Theme;
  showBrowserChrome: boolean;
  backgroundColor: string;
  padding: number;
  shadow: boolean;
  rounded: boolean;
  scale: number;
  positionX: number;
  positionY: number;
  width: number; // screenshot content width
  height: number; // screenshot content height
  canvasWidth: number; // output canvas width
  canvasHeight: number; // output canvas height
}

export interface ScreenshotRequest {
  url: string;
  config: MockupConfig;
}

export interface ScreenshotResponse {
  imageUrl: string;
  width: number;
  height: number;
}

export type DeviceType = "browser" | "desktop" | "laptop" | "tablet" | "mobile";
export type Theme = "light" | "dark";

// ── Multi-device types ───────────────────────────────────────────────────────

/** The four responsive viewport device IDs used by the multi-screenshot API. */
export type DeviceId = "desktop" | "laptop" | "tablet" | "mobile";

/** Per-device result after screenshots have been converted to object URLs. */
export interface DeviceScreenshotResult {
  success: boolean;
  /** Blob object URL — revoke when no longer needed to free memory. */
  imageUrl?: string;
  error?: string;
}

/** Map of all four device screenshot results. */
export type MultiDeviceScreenshots = Record<DeviceId, DeviceScreenshotResult>;

/** Raw API response shape from /api/screenshot/multi */
export interface MultiScreenshotApiResponse {
  success: boolean;
  screenshots: Record<
    string,
    { success: boolean; data?: string; error?: string }
  >;
}

/** Viewport metadata for each device preset (mirrors server config). */
export interface DevicePresetInfo {
  id: DeviceId;
  name: string;
  width: number;
  height: number;
}

export const DEVICE_PRESET_INFO: Record<DeviceId, DevicePresetInfo> = {
  desktop: { id: "desktop", name: "Desktop", width: 1440, height: 900 },
  laptop:  { id: "laptop",  name: "Laptop",  width: 1366, height: 768 },
  tablet:  { id: "tablet",  name: "Tablet",  width: 768,  height: 1024 },
  mobile:  { id: "mobile",  name: "Mobile",  width: 390,  height: 844 },
};

export const ORDERED_DEVICE_IDS: readonly DeviceId[] = [
  "desktop",
  "laptop",
  "tablet",
  "mobile",
];

