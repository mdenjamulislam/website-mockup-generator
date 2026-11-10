import type { ApiResponse } from "../types/index";

const rawBase = (import.meta.env.VITE_API_BASE_URL || "").trim().replace(/\/+$/, "");
const sanitizedBase = rawBase.endsWith("/api") ? rawBase.slice(0, -4) : rawBase;

export const API_ORIGIN = sanitizedBase;
export const API_BASE_URL = sanitizedBase ? `${sanitizedBase}/api` : "/api";

export function getApiEndpoint(path: string): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  if (cleanPath.startsWith("/api/")) {
    return `${sanitizedBase}${cleanPath}`;
  }
  return `${API_BASE_URL}${cleanPath}`;
}

const BASE_URL = API_BASE_URL;

class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${BASE_URL}${cleanEndpoint}`;

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  const data: ApiResponse<T> = await response.json();

  if (!response.ok) {
    throw new ApiError(
      response.status,
      data.error ?? `HTTP ${response.status}`
    );
  }

  return data;
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint),
  post: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    }),
};

export { ApiError };
