export const config = {
  port: Number(process.env.PORT) || 3001,
  nodeEnv: process.env.NODE_ENV || "development",
  allowedOrigins: process.env.ALLOWED_ORIGINS || "http://localhost:5173",
  maxScreenshotWidth: Number(process.env.MAX_SCREENSHOT_WIDTH) || 1920,
  maxScreenshotHeight: Number(process.env.MAX_SCREENSHOT_HEIGHT) || 2160,
  screenshotTimeout: Number(process.env.SCREENSHOT_TIMEOUT) || 60000,
} as const;
