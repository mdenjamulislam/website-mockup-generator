import { Request, Response } from "express";
import { renderExportComposition } from "../services/exportRenderService.js";
import { multiCompositeSchema } from "../schemas/multiCompositeSchema.js";

/**
 * POST /api/mockup/render-multi
 *
 * Accepts the composition configuration and base64-encoded device screenshots,
 * then renders the final mockup image using a headless Playwright browser that
 * loads the actual React app with @codinix/device-mockup components.
 *
 * This guarantees the exported PNG/WebP matches the in-browser preview exactly.
 */
export async function renderMultiComposite(req: Request, res: Response): Promise<void> {
  try {
    // Validate request body
    let parsedData;
    try {
      parsedData = multiCompositeSchema.parse(req.body);
    } catch (err: any) {
      if (err?.errors && Array.isArray(err.errors)) {
        res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: err.errors.map((e: any) => e.message).join(", "),
          },
        });
        return;
      }
      res.status(400).json({
        success: false,
        error: { code: "INVALID_CONFIG", message: "Mockup config must be valid." },
      });
      return;
    }

    // Render via Playwright browser (uses @codinix/device-mockup components)
    const finalImageBuffer = await renderExportComposition(parsedData);

    if (parsedData.format === "webp") {
      res.setHeader("Content-Type", "image/webp");
      res.setHeader("Content-Disposition", 'attachment; filename="website-mockup.webp"');
    } else {
      res.setHeader("Content-Type", "image/png");
      res.setHeader("Content-Disposition", 'attachment; filename="website-mockup.png"');
    }

    res.send(finalImageBuffer);
  } catch (err) {
    console.error("Multi-composite render error:", err);
    res.status(500).json({
      success: false,
      error: {
        code: "COMPOSITE_FAILED",
        message: "Failed to composite mockup.",
      },
    });
  }
}
