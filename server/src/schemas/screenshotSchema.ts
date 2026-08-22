import { z } from "zod";
import { config } from "../config/index.js";

export const screenshotSchema = z.object({
  url: z.string().url("Must be a valid URL."),
  width: z.number().int().min(320).max(config.maxScreenshotWidth).default(1280),
  height: z.number().int().min(320).max(config.maxScreenshotHeight).default(800),
  fullPage: z.boolean().default(false),
});

export type ScreenshotRequest = z.infer<typeof screenshotSchema>;
