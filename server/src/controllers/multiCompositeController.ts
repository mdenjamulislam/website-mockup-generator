import { Request, Response } from "express";
import { renderExportComposition } from "../services/exportRenderService.js";
import { multiCompositeSchema } from "../schemas/multiCompositeSchema.js";
import { uploadTempImage } from "../services/storageService.js";

/**
 * POST /api/mockup/render-multi
 *
 * Accepts the composition configuration and device screenshots (base64 or URLs),
 * then renders the final mockup image using a headless Playwright browser that
 * loads the actual React app with @codinix/device-mockup components.
 *
 * If the final image buffer exceeds Vercel's 4.5 MB payload limit,
 * it is safely stored in temporary Supabase Storage and returned via a signed URL redirect.
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
    const filename = parsedData.format === "webp" ? "website-mockup.webp" : "website-mockup.png";
    const contentType = parsedData.format === "webp" ? "image/webp" : "image/png";

    // Vercel serverless functions have a 4.5 MB response payload limit.
    // If the image exceeds 4 MB, offload to temporary Supabase Storage and redirect.
    const VERCEL_PAYLOAD_SAFE_LIMIT = 4 * 1024 * 1024; // 4 MB
    if (finalImageBuffer.length > VERCEL_PAYLOAD_SAFE_LIMIT) {
      const uploadResult = await uploadTempImage(
        finalImageBuffer,
        parsedData.format === "webp" ? "webp" : "png",
        600 // 10 minutes signed URL
      );
      if (uploadResult?.signedUrl) {
        res.redirect(302, uploadResult.signedUrl);
        return;
      }
    }

    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
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
