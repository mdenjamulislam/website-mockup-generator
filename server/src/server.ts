import "dotenv/config";
import app from "./app.js";
import { config } from "./config/index.js";

// ── Local HTTP Server ────────────────────────────────────────────────────────
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
