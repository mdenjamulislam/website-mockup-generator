import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "./config/index.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import healthRoutes from "./routes/healthRoutes.js";
import screenshotRoutes from "./routes/screenshotRoutes.js";

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: { success: false, error: { code: "RATE_LIMITED", message: "Too many requests from this IP, please try again later." } }
});
app.use(limiter);

app.use(
  cors({
    origin: config.nodeEnv === "production" ? config.allowedOrigins.split(",") : "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api", healthRoutes);
app.use("/api", screenshotRoutes);

if (config.nodeEnv === "production") {
  const clientDistPath = path.join(__dirname, "../../client/dist");
  app.use(express.static(clientDistPath));
  
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api/")) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
}

// ── Error Handling ────────────────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────────────────────────
const server = app.listen(config.port, () => {
  console.log(
    `\n🚀 Server running on http://localhost:${config.port} [${config.nodeEnv}]\n`
  );
});

// ── Graceful Shutdown ─────────────────────────────────────────────────────────
function gracefulShutdown(signal: string) {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);
  server.close(() => {
    console.log("HTTP server closed.");
    process.exit(0);
  });
  
  // Force shutdown after 10s
  setTimeout(() => {
    console.error("Could not close connections in time, forcefully shutting down");
    process.exit(1);
  }, 10000);
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

export default app;
