import { Request, Response } from "express";
import { z } from "zod";
import { validateUrl } from "../utils/urlValidator.js";
import { captureScreenshot } from "../services/browserService.js";
import { screenshotSchema } from "../schemas/screenshotSchema.js";

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

    // Capture screenshot
    const imageBuffer = await captureScreenshot(safeUrl, { width, height, fullPage });

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
