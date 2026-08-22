import { z } from "zod";

export const compositeSchema = z.object({
  format: z.enum(["png", "webp"]).default("png"),
  config: z.object({
    deviceType: z.enum(["browser", "desktop", "laptop", "tablet", "mobile"]),
    theme: z.enum(["light", "dark"]).default("light"),
    width: z.number().int().min(1).max(4000),
    height: z.number().int().min(1).max(4000),
    canvasWidth: z.number().int().min(1).max(4000),
    canvasHeight: z.number().int().min(1).max(4000),
    scale: z.number().min(0.1).max(5).default(1),
    positionX: z.number().default(0),
    positionY: z.number().default(0),
    backgroundColor: z.string().max(50),
    padding: z.number().min(0).max(500),
    rounded: z.boolean(),
    shadow: z.boolean(),
    showBrowserChrome: z.boolean(),
  }),
});

export type CompositeRequest = z.infer<typeof compositeSchema>;
