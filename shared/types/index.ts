// Shared types used by both client and server

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
  deviceType: "browser" | "desktop" | "laptop" | "tablet" | "mobile";
  theme: "light" | "dark";
  showBrowserChrome: boolean;
  backgroundColor: string;
  padding: number;
  shadow: boolean;
  rounded: boolean;
  scale: number;
  positionX: number;
  positionY: number;
  width: number;        // screenshot content width
  height: number;       // screenshot content height
  canvasWidth: number;  // output canvas width
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

export type DeviceType = MockupConfig["deviceType"];
export type Theme = MockupConfig["theme"];
