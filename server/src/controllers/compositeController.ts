import { Request, Response } from "express";
import { compositeMockup } from "../services/compositorService.js";
import { compositeSchema } from "../schemas/compositeSchema.js";
import { z } from "zod";

export async function createComposite(req: Request, res: Response): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        error: { code: "MISSING_IMAGE", message: "Screenshot image is required." },
      });
      return;
    }

    let parsedData;
    try {
      parsedData = compositeSchema.parse({
        format: req.body.format,
        config: JSON.parse(req.body.config),
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: { code: "VALIDATION_ERROR", message: err.errors.map(e => e.message).join(", ") },
        });
        return;
      }
      res.status(400).json({
        success: false,
        error: { code: "INVALID_CONFIG", message: "Mockup config must be valid JSON." },
      });
      return;
    }

    const { format, config } = parsedData;

    const finalImageBuffer = await compositeMockup(req.file.buffer, config, format);

    if (format === "webp") {
      res.setHeader("Content-Type", "image/webp");
      res.setHeader("Content-Disposition", 'attachment; filename="website-mockup.webp"');
    } else {
      res.setHeader("Content-Type", "image/png");
      res.setHeader("Content-Disposition", 'attachment; filename="website-mockup.png"');
    }
    
    res.send(finalImageBuffer);
  } catch (err) {
    console.error("Composite error:", err);
    res.status(500).json({
      success: false,
      error: {
        code: "COMPOSITE_FAILED",
        message: "Failed to composite mockup.",
      },
    });
  }
}
