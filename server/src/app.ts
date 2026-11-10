import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { config } from "./config/index.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import healthRoutes from "./routes/healthRoutes.js";
import screenshotRoutes from "./routes/screenshotRoutes.js";

const app = express();
app.set("trust proxy", 1);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Security Headers ─────────────────────────────────────────────────────────
app.use(helmet());

// ── Rate Limiting ───────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: "RATE_LIMITED",
      message: "Too many requests from this IP, please try again later.",
    },
  },
});
app.use(limiter);

// ── CORS ────────────────────────────────────────────────────────────────────
const originsList = config.allowedOrigins
  ? config.allowedOrigins.split(",").map((o) => o.trim())
  : ["http://localhost:5173"];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, server-to-server, health checks)
      if (!origin) return callback(null, true);
      if (config.nodeEnv !== "production") return callback(null, true);
      if (originsList.includes("*") || originsList.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(requestLogger);

// ── API Routes ──────────────────────────────────────────────────────────────
app.use("/api", healthRoutes);
app.use("/api", screenshotRoutes);

// ── Static Frontend (Local Production Standalone Only) ──────────────────────
// When deployed as separate Vercel projects, client is hosted statically on Vercel
// and not served by the serverless function container.
if (config.nodeEnv === "production" && !process.env.VERCEL) {
  const clientDistPath = path.join(__dirname, "../../client/dist");
  if (fs.existsSync(clientDistPath)) {
    app.use(express.static(clientDistPath));

    app.get("*", (req, res, next) => {
      if (req.path.startsWith("/api/")) {
        return next();
      }
      res.sendFile(path.join(clientDistPath, "index.html"));
    });
  }
}

// ── Error Handling ──────────────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
