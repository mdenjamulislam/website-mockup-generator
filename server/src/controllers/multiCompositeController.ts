import { Request, Response } from "express";
import { renderMultiDeviceComposition } from "../services/multiDeviceCompositorService.js";
import { multiCompositeSchema } from "../schemas/multiCompositeSchema.js";

export async function renderMultiComposite(req: Request, res: Response): Promise<void> {
  try {
    let parsedData;
    try {
      parsedData = multiCompositeSchema.parse(req.body);
    } catch (err: any) {
      if (err && err.errors && Array.isArray(err.errors)) {
        res.status(400).json({
          success: false,
          error: { code: "VALIDATION_ERROR", message: err.errors.map((e: any) => e.message).join(", ") },
        });
        return;
      }
      res.status(400).json({
        success: false,
        error: { code: "INVALID_CONFIG", message: "Mockup config must be valid." },
      });
      return;
    }

    const finalImageBuffer = await renderMultiDeviceComposition(parsedData);

    if (parsedData.format === "webp") {
      res.setHeader("Content-Type", "image/webp");
      res.setHeader("Content-Disposition", 'attachment; filename="website-mockup.webp"');
    } else {
      res.setHeader("Content-Type", "image/png");
      res.setHeader("Content-Disposition", 'attachment; filename="website-mockup.png"');
    }
    
    res.send(finalImageBuffer);
  } catch (err) {
    console.error("Multi-composite error:", err);
    res.status(500).json({
      success: false,
      error: {
        code: "COMPOSITE_FAILED",
        message: "Failed to composite mockup.",
      },
    });
  }
}
