import { URL } from "node:url";

/**
 * Normalizes a URL for consistent database storage and comparison.
 *
 * - Lowercases the protocol and hostname
 * - Removes default ports (80 for http, 443 for https)
 * - Removes a trailing slash when the path is just "/"
 * - Preserves meaningful path, query parameters, and fragment
 * - Does NOT arbitrarily remove query parameters
 *
 * @param rawUrl - The URL string to normalize
 * @returns The normalized URL string
 */
export function normalizeUrl(rawUrl: string): string {
  const parsed = new URL(rawUrl);

  // The URL constructor already lowercases protocol and hostname.

  // Remove default ports (URL API sometimes keeps them)
  if (
    (parsed.protocol === "http:" && parsed.port === "80") ||
    (parsed.protocol === "https:" && parsed.port === "443")
  ) {
    parsed.port = "";
  }

  // Remove trailing slash when the path is exactly "/"
  // and there is no search or hash component.
  // e.g. "https://example.com/" → "https://example.com"
  // but  "https://example.com/about/" stays as-is
  if (parsed.pathname === "/" && !parsed.search && !parsed.hash) {
    // Reconstruct without trailing slash
    const origin = parsed.origin; // protocol + host (already normalized)
    return origin;
  }

  // For paths deeper than root, preserve the trailing slash as-is
  // because /about/ and /about may be semantically different.
  return parsed.toString();
}
