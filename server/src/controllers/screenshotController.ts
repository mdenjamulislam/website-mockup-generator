import { Request, Response } from "express";
import { z } from "zod";
import { validateUrl } from "../utils/urlValidator.js";
import { captureScreenshot } from "../services/browserService.js";
import { screenshotSchema } from "../schemas/screenshotSchema.js";
import { createGeneration, markGenerationSuccessful } from "../services/mockupGenerationService.js";

export async function createScreenshot(req: Request, res: Response): Promise<void> {
  try {
    const { url, width, height, fullPage } = screenshotSchema.parse(req.body);

    // SSRF Validation
    let safeUrl: string;
    try {
      safeUrl = await validateUrl(url);
    } catch (err) {
      res.status(403).json({
        success: false,
        error: {
          code: "URL_FORBIDDEN",
          message: err instanceof Error ? err.message : "Forbidden URL.",
        },
      });
      return;
    }

    // Step 2: Track generation start
    let generationId: string;
    try {
      generationId = await createGeneration(safeUrl);
    } catch (dbErr) {
      console.error("Database error (insert):", dbErr);
      res.status(500).json({
        success: false,
        error: {
          code: "DATABASE_ERROR",
          message: "Failed to track mockup generation.",
        },
      });
      return;
    }

    // Step 3: Capture screenshot
    const imageBuffer = await captureScreenshot(safeUrl, { width, height, fullPage });

    // Step 4: Track generation success
    try {
      await markGenerationSuccessful(generationId);
    } catch (dbErr) {
      console.error("Database error (update):", dbErr);
      // We don't hide the screenshot success from the user if DB update fails
    }

    // Send the raw image
    res.setHeader("Content-Type", "image/png");
    res.send(imageBuffer);
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: err.errors.map((e) => e.message).join(", "),
        },
      });
      return;
    }

    console.error("Screenshot error:", err);
    res.status(500).json({
      success: false,
      error: {
        code: "SCREENSHOT_FAILED",
        message: "Unable to capture the website.",
      },
    });
  }
}
