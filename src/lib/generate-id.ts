import { randomBytes } from "crypto";

/**
 * Generate a CUID-compatible ID for Prisma models
 * Format: c[timestamp][randomness]
 */
export function generateId(): string {
  const timestamp = Date.now().toString(36);
  const randomness = randomBytes(12).toString("base64url");
  return `c${timestamp}${randomness}`;
}
