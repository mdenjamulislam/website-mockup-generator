import { z } from "zod";
import { config } from "../config/index.js";
import { DEVICE_IDS } from "../config/devicePresets.js";
import type { DeviceId } from "../config/devicePresets.js";

export const screenshotSchema = z.object({
  url: z.string().url("Must be a valid URL."),
  width: z.number().int().min(320).max(config.maxScreenshotWidth).default(1280),
  height: z.number().int().min(320).max(config.maxScreenshotHeight).default(800),
  fullPage: z.boolean().default(false),
});

export type ScreenshotRequest = z.infer<typeof screenshotSchema>;

// ── Multi-device schema ───────────────────────────────────────────────────────

const DEVICE_IDS_TUPLE = DEVICE_IDS as [DeviceId, ...DeviceId[]];

export const multiScreenshotSchema = z.object({
  url: z.string().url("Must be a valid URL."),
  devices: z
    .array(z.enum(DEVICE_IDS_TUPLE))
    .min(1, "At least one device must be specified.")
    .default([...DEVICE_IDS]),
});

export type MultiScreenshotRequest = z.infer<typeof multiScreenshotSchema>;
