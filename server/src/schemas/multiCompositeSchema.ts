import { z } from "zod";

const deviceLayerSchema = z.object({
  visible: z.boolean(),
  scale: z.number().min(0.1).max(10),
  x: z.number(),
  y: z.number(),
  rotation: z.number(),
  zIndex: z.number(),
  shadow: z.boolean(),
  shadowBlur: z.number(),
  shadowSpread: z.number(),
  shadowOpacity: z.number(),
});

export const multiCompositeSchema = z.object({
  format: z.enum(["png", "webp"]).default("png"),
  screenshots: z.object({
    desktop: z.string().optional(), // Base64 data
    laptop: z.string().optional(),
    tablet: z.string().optional(),
    mobile: z.string().optional(),
  }),
  configuration: z.object({
    canvas: z.object({
      width: z.number().int().min(1).max(4000),
      height: z.number().int().min(1).max(4000),
      backgroundColor: z.string().max(50),
      transparent: z.boolean(),
      padding: z.number(),
    }),
    devices: z.object({
      desktop: deviceLayerSchema,
      laptop: deviceLayerSchema,
      tablet: deviceLayerSchema,
      mobile: deviceLayerSchema,
    }),
  }),
});

export type MultiCompositeRequest = z.infer<typeof multiCompositeSchema>;
