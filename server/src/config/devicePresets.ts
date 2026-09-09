/**
 * Central device preset configuration.
 *
 * All viewport dimensions are defined here and imported wherever needed.
 * Never hard-code viewport values in individual files.
 */

export type DeviceId = "desktop" | "laptop" | "tablet" | "mobile";

export interface DevicePreset {
  id: DeviceId;
  name: string;
  width: number;
  height: number;
}

export const DEVICE_PRESETS: Record<DeviceId, DevicePreset> = {
  desktop: { id: "desktop", name: "Desktop", width: 1440, height: 900 },
  laptop:  { id: "laptop",  name: "Laptop",  width: 1366, height: 768 },
  tablet:  { id: "tablet",  name: "Tablet",  width: 768,  height: 1024 },
  mobile:  { id: "mobile",  name: "Mobile",  width: 390,  height: 844 },
};

/** Ordered list of all supported device IDs. */
export const DEVICE_IDS: readonly DeviceId[] = Object.keys(
  DEVICE_PRESETS
) as DeviceId[];
