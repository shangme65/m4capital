import "server-only";
import { z } from "zod";

/**
 * Environment Variable Validation
 *
 * Validates all environment variables at startup
 * Provides type-safe access to env vars throughout the app
 */

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid URL"),

  // NextAuth
  NEXTAUTH_SECRET: z
    .string()
    .min(32, "NEXTAUTH_SECRET must be at least 32 characters"),
  NEXTAUTH_URL: z.string().url().optional(),

  // OAuth (optional)
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  FACEBOOK_CLIENT_ID: z.string().optional(),
  FACEBOOK_CLIENT_SECRET: z.string().optional(),

  // Admin
  ORIGIN_ADMIN_EMAIL: z.string().email().optional(),
  ORIGIN_ADMIN_PASSWORD: z.string().min(8).optional(),
  ORIGIN_ADMIN_NAME: z.string().optional(),

  // External APIs
  OPENAI_API_KEY: z.string().optional(),
  TELEGRAM_BOT_TOKEN: z.string().optional(),
  NOWPAYMENTS_API_KEY: z.string().optional(),
  NOWPAYMENTS_IPN_SECRET: z.string().optional(),
  ASAAS_API_KEY: z.string().optional(),

  // Push Notifications
  VAPID_PUBLIC_KEY: z.string().optional(),
  VAPID_PRIVATE_KEY: z.string().optional(),

  // Email
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  EMAIL_FROM: z.string().email().optional(),

  // App
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Validated environment variables
 * Access via: import { env } from '@/lib/env'
 */
function validateEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error("❌ Invalid environment variables:");
    console.error(parsed.error.flatten().fieldErrors);

    // In development, throw to prevent startup
    if (process.env.NODE_ENV === "development") {
      throw new Error("Invalid environment variables");
    }

    // In production, log but don't crash (Vercel may have different env setup)
    console.warn("⚠️ Continuing with potentially invalid env vars");
  }

  return parsed.data as Env;
}

export const env = validateEnv();

/**
 * Type-safe env access helpers
 */
export function getRequiredEnv(key: keyof Env): string {
  const value = env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value as string;
}

export function getOptionalEnv(key: keyof Env): string | undefined {
  return env[key] as string | undefined;
}

/**
 * Check if a feature is enabled based on env vars
 */
export const features = {
  hasOpenAI: () => Boolean(env.OPENAI_API_KEY),
  hasTelegram: () => Boolean(env.TELEGRAM_BOT_TOKEN),
  hasNowPayments: () => Boolean(env.NOWPAYMENTS_API_KEY),
  hasAsaas: () => Boolean(env.ASAAS_API_KEY),
  hasPushNotifications: () =>
    Boolean(env.VAPID_PUBLIC_KEY && env.VAPID_PRIVATE_KEY),
  hasEmail: () => Boolean(env.SMTP_HOST && env.SMTP_USER),
  hasOAuthGoogle: () =>
    Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET),
  hasOAuthFacebook: () =>
    Boolean(env.FACEBOOK_CLIENT_ID && env.FACEBOOK_CLIENT_SECRET),
} as const;
