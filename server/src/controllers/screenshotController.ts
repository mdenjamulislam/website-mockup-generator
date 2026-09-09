import { Request, Response } from "express";
import { z } from "zod";
import { validateUrl } from "../utils/urlValidator.js";
import { captureScreenshot, renderWebsite } from "../services/browserService.js";
import {
  screenshotSchema,
  multiScreenshotSchema,
} from "../schemas/screenshotSchema.js";
import {
  createGenerationIfNotExists,
  markGenerationSuccessful,
} from "../services/mockupGenerationService.js";
import { DEVICE_PRESETS } from "../config/devicePresets.js";
import type { DeviceId } from "../config/devicePresets.js";

// ── Legacy single-screenshot endpoint ────────────────────────────────────────

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

    // Step 2: Track generation (silently skips if URL already exists)
    let generationId: string | null = null;
    try {
      const result = await createGenerationIfNotExists(safeUrl);
      generationId = result.id;
    } catch (dbErr) {
      // Database errors must never prevent mockup generation.
      // Log for observability, but continue with screenshot capture.
      console.error("Database error (insert):", dbErr);
    }

    // Step 3: Capture screenshot — always proceeds regardless of DB outcome
    const imageBuffer = await captureScreenshot(safeUrl, { width, height, fullPage });

    // Step 4: Track generation success (only if we have a record ID)
    if (generationId) {
      try {
        await markGenerationSuccessful(generationId);
      } catch (dbErr) {
        console.error("Database error (update):", dbErr);
        // We don't hide the screenshot success from the user if DB update fails
      }
    }

    // Send the raw image
    res.setHeader("Content-Type", "image/png");
    res.send(imageBuffer);
  } catch (err: any) {
    if (err && err.errors && Array.isArray(err.errors)) {
      res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: err.errors.map((e: any) => e.message).join(", "),
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

// ── Multi-device screenshot endpoint ─────────────────────────────────────────

interface DeviceResult {
  success: boolean;
  data?: string;   // base64-encoded PNG
  error?: string;
}

export async function createMultiScreenshot(req: Request, res: Response): Promise<void> {
  try {
    const { url, devices } = multiScreenshotSchema.parse(req.body);

    // SSRF Validation — validate once for the whole request
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

    // Track generation in Supabase — exactly once per URL (existing behaviour)
    let generationId: string | null = null;
    try {
      const result = await createGenerationIfNotExists(safeUrl);
      generationId = result.id;
    } catch (dbErr) {
      console.error("Database error (insert):", dbErr);
    }

    // Fan out — render each requested device in parallel using the shared browser
    const renderResults = await Promise.allSettled(
      devices.map(async (deviceId) => {
        const preset = DEVICE_PRESETS[deviceId as DeviceId];
        const buffer = await renderWebsite(safeUrl, preset);
        return { deviceId, buffer };
      })
    );

    // Assemble response object
    const screenshots: Record<string, DeviceResult> = {};
    let anySuccess = false;

    for (const result of renderResults) {
      if (result.status === "fulfilled") {
        const { deviceId, buffer } = result.value;
        screenshots[deviceId] = {
          success: true,
          data: buffer.toString("base64"),
        };
        anySuccess = true;
      } else {
        // Find the device ID from the original devices array for this settled index
        const idx = renderResults.indexOf(result);
        const deviceId = devices[idx];
        const errorMessage =
          result.reason instanceof Error
            ? result.reason.message
            : "Unknown render error.";
        console.error(`Device render failed [${deviceId}]:`, result.reason);
        screenshots[deviceId] = { success: false, error: errorMessage };
      }
    }

    // Mark Supabase generation as successful if at least one device rendered
    if (generationId && anySuccess) {
      try {
        await markGenerationSuccessful(generationId);
      } catch (dbErr) {
        console.error("Database error (update):", dbErr);
      }
    }

    res.json({ success: anySuccess, screenshots });
  } catch (err: any) {
    if (err && err.errors && Array.isArray(err.errors)) {
      res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: err.errors.map((e: any) => e.message).join(", "),
        },
      });
      return;
    }

    console.error("Multi-screenshot error:", err);
    res.status(500).json({
      success: false,
      error: {
        code: "SCREENSHOT_FAILED",
        message: "Unable to capture multi-device screenshots.",
      },
    });
  }
}
