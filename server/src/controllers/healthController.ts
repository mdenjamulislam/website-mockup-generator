import { Request, Response } from "express";

interface HealthResponse {
  success: boolean;
  message: string;
}

export function getHealth(_req: Request, res: Response): void {
  const response: HealthResponse = {
    success: true,
    message: "Server is running",
  };
  res.status(200).json(response);
}
