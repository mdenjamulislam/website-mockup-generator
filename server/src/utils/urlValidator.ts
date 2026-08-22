import dns from "node:dns/promises";
import { URL } from "node:url";

const BLOCKED_IP_BLOCKS = [
  // IPv4 Private & Special Blocks
  /^0\./,          // Current network (RFC 1122)
  /^10\./,         // Private IPv4 (RFC 1918)
  /^127\./,        // Loopback IPv4 (RFC 1122)
  /^169\.254\./,   // Link-local IPv4 (RFC 3927)
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // Private IPv4 (RFC 1918)
  /^192\.0\.0\./,  // IETF Protocol Assignments (RFC 6890)
  /^192\.0\.2\./,  // TEST-NET-1 (RFC 5737)
  /^192\.88\.99\./,// IPv6 to IPv4 relay (RFC 3068)
  /^192\.168\./,   // Private IPv4 (RFC 1918)
  /^198\.18\./,    // Network Interconnect Device Benchmark Testing (RFC 2544)
  /^198\.51\.100\./,// TEST-NET-2 (RFC 5737)
  /^203\.0\.113\./,// TEST-NET-3 (RFC 5737)
  /^224\./,        // Multicast (RFC 1112)
  /^240\./,        // Reserved (RFC 1112)
  /^255\.255\.255\.255$/, // Limited Broadcast (RFC 919)

  // IPv6 Special Blocks
  /^::1$/,         // Loopback IPv6 (RFC 4291)
  /^::$/,          // Unspecified IPv6 (RFC 4291)
  /^fc00:/i,       // Unique local address IPv6 (RFC 4193)
  /^fd/,           // Unique local address IPv6 (RFC 4193)
  /^fe80:/i,       // Link-local IPv6 (RFC 4291)
  /^ff00:/i,       // Multicast IPv6 (RFC 4291)
  /^::ffff:0:0\/96/i, // IPv4-mapped IPv6 (RFC 4291)
];

const BLOCKED_HOSTNAMES = [
  "localhost",
  "kubernetes.default",
  "metadata.google.internal",
  "169.254.169.254",
];

export async function validateUrl(targetUrl: string): Promise<string> {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(targetUrl);
  } catch (err) {
    throw new Error("Invalid URL format.");
  }

  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    throw new Error("Only HTTP and HTTPS protocols are allowed.");
  }

  const hostname = parsedUrl.hostname.toLowerCase();

  if (BLOCKED_HOSTNAMES.includes(hostname)) {
    throw new Error("Hostname is not allowed.");
  }

  try {
    const lookupResult = await dns.lookup(hostname);
    const ip = lookupResult.address;

    for (const block of BLOCKED_IP_BLOCKS) {
      if (block.test(ip)) {
        throw new Error("Resolved IP address is in a blocked range.");
      }
    }
  } catch (err) {
    if (err instanceof Error && err.message.includes("blocked range")) {
      throw err;
    }
    // DNS resolution failure
    throw new Error(`Failed to resolve hostname: ${hostname}`);
  }

  return parsedUrl.toString();
}
