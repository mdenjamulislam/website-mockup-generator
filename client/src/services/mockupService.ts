import type { MockupConfig } from "../types/index";
import { api, ApiError } from "./api";

export interface GenerateMockupResult {
  imageUrl: string;
  width: number;
  height: number;
}

export async function generateMockup(
  url: string,
  config: MockupConfig
): Promise<GenerateMockupResult> {
  const response = await fetch("/api/screenshot", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url,
      width: config.width,
      height: config.height,
      fullPage: false,
    }),
  });

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}`;
    try {
      const errorData = await response.json();
      if (errorData.error && errorData.error.message) {
        errorMessage = errorData.error.message;
      }
    } catch {
      // Ignore JSON parse error if response is not JSON
    }
    throw new Error(errorMessage);
  }

  const blob = await response.blob();
  const imageUrl = URL.createObjectURL(blob);

  return {
    imageUrl,
    width: config.width,
    height: config.height,
  };
}

export async function checkHealth(): Promise<boolean> {
  try {
    const result = await api.get<never>("/health");
    return result.success;
  } catch {
    return false;
  }
}
