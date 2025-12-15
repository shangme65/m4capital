/**
 * Next.js Instrumentation
 *
 * This file runs before your application starts and is used for:
 * - Setting up monitoring/observability tools
 * - Initializing database connections
 * - Registering OpenTelemetry
 * - Running startup tasks
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  // Only run in Node.js runtime (not Edge)
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Log application startup
    console.log("🚀 M4Capital application starting...");
    console.log(`📍 Environment: ${process.env.NODE_ENV}`);
    console.log(`🕐 Started at: ${new Date().toISOString()}`);

    // Verify critical environment variables
    const requiredEnvVars = ["DATABASE_URL", "NEXTAUTH_SECRET", "NEXTAUTH_URL"];

    const missingVars = requiredEnvVars.filter(
      (varName) => !process.env[varName]
    );

    if (missingVars.length > 0) {
      console.warn(
        `⚠️ Missing environment variables: ${missingVars.join(", ")}`
      );
    }

    // Optional: Initialize monitoring services
    // Example with Sentry (if installed):
    // if (process.env.SENTRY_DSN) {
    //   const Sentry = await import('@sentry/nextjs');
    //   Sentry.init({
    //     dsn: process.env.SENTRY_DSN,
    //     tracesSampleRate: 1.0,
    //   });
    // }

    // Optional: Warm up database connection
    // This can improve first request latency
    if (process.env.DATABASE_URL) {
      try {
        const { PrismaClient } = await import("@prisma/client");
        const prisma = new PrismaClient();
        await prisma.$connect();
        console.log("✅ Database connection verified");
        await prisma.$disconnect();
      } catch (error) {
        console.warn("⚠️ Database connection check failed:", error);
      }
    }

    console.log("✅ Application instrumentation complete");
  }

  // Edge runtime specific initialization
  if (process.env.NEXT_RUNTIME === "edge") {
    console.log("🌐 Edge runtime initialized");
  }
}

/**
 * Called when an error is caught during rendering
 * Useful for error tracking services
 */
export function onRequestError(
  error: Error,
  request: {
    path: string;
    method: string;
    headers: Record<string, string>;
  },
  context: {
    routerKind: "Pages Router" | "App Router";
    routePath: string;
    routeType: "render" | "route" | "action" | "middleware";
    renderSource?:
      | "react-server-components"
      | "react-server-components-payload"
      | "server-rendering";
    revalidateReason?: "on-demand" | "stale";
    renderType?: "dynamic" | "dynamic-resume";
  }
) {
  // Log errors for debugging
  console.error("🔴 Request Error:", {
    error: error.message,
    path: request.path,
    method: request.method,
    routePath: context.routePath,
    routeType: context.routeType,
    timestamp: new Date().toISOString(),
  });

  // Optional: Send to error tracking service
  // Sentry.captureException(error, {
  //   extra: { request, context }
  // });
}
