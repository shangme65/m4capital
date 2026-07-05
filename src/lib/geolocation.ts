/**
 * Geolocation utilities for IP-based location detection
 */

export interface GeoLocationData {
  ip: string;
  country: string;
  countryCode: string;
  region: string;
  city: string;
  timezone: string;
  isp: string;
  success: boolean;
}

/**
 * Extracts the real client IP address from Next.js request headers.
 * Handles proxies, load balancers, and Vercel's forwarding headers.
 */
export function extractIpFromHeaders(headers: Headers): string {
  // Vercel and most CDNs set x-forwarded-for
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    // x-forwarded-for can be a comma-separated list; first IP is the client
    const firstIp = forwarded.split(",")[0]?.trim();
    if (firstIp) return firstIp;
  }

  // Fallback headers
  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp;

  const cfConnectingIp = headers.get("cf-connecting-ip"); // Cloudflare
  if (cfConnectingIp) return cfConnectingIp;

  return "unknown";
}

/**
 * Fetches geolocation data for a given IP address using ip-api.com (free tier).
 * Returns a safe default if the lookup fails.
 */
export async function getGeoLocation(ip: string): Promise<GeoLocationData> {
  const defaultResult: GeoLocationData = {
    ip,
    country: "Unknown",
    countryCode: "",
    region: "Unknown",
    city: "Unknown",
    timezone: "Unknown",
    isp: "Unknown",
    success: false,
  };

  // Skip geolocation for private/local IPs
  if (
    !ip ||
    ip === "unknown" ||
    ip === "::1" ||
    ip.startsWith("127.") ||
    ip.startsWith("192.168.") ||
    ip.startsWith("10.") ||
    ip.startsWith("172.16.") ||
    ip.startsWith("::ffff:127.")
  ) {
    return { ...defaultResult, country: "Local Network", success: true };
  }

  try {
    const response = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,country,countryCode,regionName,city,timezone,isp,query`,
      {
        signal: AbortSignal.timeout(3000), // 3 second timeout
        next: { revalidate: 0 }, // No caching for security
      } as RequestInit,
    );

    if (!response.ok) {
      return defaultResult;
    }

    const data = await response.json();

    if (data.status !== "success") {
      return defaultResult;
    }

    return {
      ip: data.query || ip,
      country: data.country || "Unknown",
      countryCode: data.countryCode || "",
      region: data.regionName || "Unknown",
      city: data.city || "Unknown",
      timezone: data.timezone || "Unknown",
      isp: data.isp || "Unknown",
      success: true,
    };
  } catch {
    return defaultResult;
  }
}

/**
 * Formats geolocation data into a human-readable string.
 */
export function formatLocation(geo: GeoLocationData): string {
  if (!geo.success) return "Unknown Location";

  const parts: string[] = [];
  if (geo.city && geo.city !== "Unknown") parts.push(geo.city);
  if (geo.region && geo.region !== "Unknown" && geo.region !== geo.city)
    parts.push(geo.region);
  if (geo.country && geo.country !== "Unknown") parts.push(geo.country);

  return parts.length > 0 ? parts.join(", ") : "Unknown Location";
}
