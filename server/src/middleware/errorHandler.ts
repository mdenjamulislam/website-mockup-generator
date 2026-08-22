import { Request, Response, NextFunction } from "express";
import { config } from "../config/index.js";

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export function createError(
  message: string,
  statusCode = 500,
  isOperational = true
): AppError {
  const error: AppError = new Error(message);
  error.statusCode = statusCode;
  error.isOperational = isOperational;
  return error;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.statusCode ?? 500;
  const message =
    err.isOperational === false
      ? "Internal server error"
      : err.message || "Something went wrong";
  console.error(`[Error] ${statusCode} — ${err.message}`);
  if (statusCode === 500) {
    console.error(err.stack);
  }

  const isProd = config.nodeEnv === "production";
  
  res.status(statusCode).json({
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message: isProd ? "An internal server error occurred." : err.message,
      ...(isProd ? {} : { stack: err.stack }),
    },
  });
}

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
}
