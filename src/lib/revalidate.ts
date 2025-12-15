import { revalidatePath } from "next/cache";

/**
 * Revalidation Utilities
 *
 * Server-side functions to invalidate cached data
 * Call these from Server Actions after mutations
 *
 * Note: In Next.js 16, use revalidatePath for most use cases
 * Tags are set at build time with unstable_cache
 */

/**
 * Revalidate user-related pages
 */
export async function revalidateUserData() {
  "use server";

  revalidatePath("/dashboard");
  revalidatePath("/settings");
}

/**
 * Revalidate after portfolio changes (buy/sell/deposit)
 */
export async function revalidatePortfolio() {
  "use server";

  revalidatePath("/dashboard");
  revalidatePath("/traderoom");
}

/**
 * Revalidate after transaction
 */
export async function revalidateTransaction() {
  "use server";

  revalidatePath("/dashboard");
}

/**
 * Revalidate notifications
 */
export async function revalidateNotifications() {
  "use server";

  revalidatePath("/dashboard");
}

/**
 * Revalidate admin stats
 */
export async function revalidateAdminStats() {
  "use server";

  revalidatePath("/admin");
  revalidatePath("/admin/analytics");
}

/**
 * Full cache clear (use sparingly)
 */
export async function revalidateAll() {
  "use server";

  revalidatePath("/", "layout");
}

/**
 * Revalidate specific path
 */
export async function revalidateCustomPath(path: string) {
  "use server";

  revalidatePath(path);
}
