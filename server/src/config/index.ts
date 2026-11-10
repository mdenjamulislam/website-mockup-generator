const frontendOrigin =
  process.env.FRONTEND_ORIGIN ||
  process.env.ALLOWED_ORIGINS ||
  process.env.CLIENT_ORIGIN ||
  "http://localhost:5173";

export const config = {
  port: Number(process.env.PORT) || 3001,
  nodeEnv: process.env.NODE_ENV || "development",
  frontendOrigin,
  allowedOrigins: frontendOrigin,
  maxScreenshotWidth: Number(process.env.MAX_SCREENSHOT_WIDTH) || 1920,
  maxScreenshotHeight: Number(process.env.MAX_SCREENSHOT_HEIGHT) || 2160,
  screenshotTimeout:
    Number(process.env.SCREENSHOT_TIMEOUT_MS || process.env.SCREENSHOT_TIMEOUT) ||
    60000,
  supabaseUrl: process.env.SUPABASE_URL || "",
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  supabaseStorageBucket: process.env.SUPABASE_STORAGE_BUCKET || "temp-mockups",
} as const;

if (!config.supabaseUrl || !config.supabaseServiceKey) {
  console.warn(
    "⚠️ Warning: Missing required SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables."
  );
}
