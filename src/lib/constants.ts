/**
 * Application Constants
 *
 * Centralized constants for URLs, API endpoints, and configuration values
 * Import from this file instead of hardcoding values
 */

// =============================================================================
// API URLs
// =============================================================================

export const API_URLS = {
  // Currency/Forex
  FRANKFURTER: "https://api.frankfurter.app",
  FRANKFURTER_LATEST: "https://api.frankfurter.app/latest",

  // Crypto
  BINANCE_REST: "https://api.binance.com/api/v3",
  BINANCE_TICKER: "https://api.binance.com/api/v3/ticker/24hr",
  BINANCE_PRICE: "https://api.binance.com/api/v3/ticker/price",
  BINANCE_WS: "wss://stream.binance.com:9443/stream",

  // Payment Providers
  NOWPAYMENTS: "https://api.nowpayments.io/v1",
  ASAAS: "https://sandbox.asaas.com/api/v3", // Change to production URL when ready

  // AI/ML
  HUGGINGFACE: "https://api-inference.huggingface.co/models",
} as const;

// =============================================================================
// App URLs
// =============================================================================

export const APP_URLS = {
  PRODUCTION: "https://m4capital.online",
  VERCEL_PREVIEW: "https://m4capital-fqpoqgx2h-shang-team.vercel.app",
  LOCALHOST: "http://localhost:3000",
} as const;

export function getAppUrl(): string {
  return (
    process.env.NEXTAUTH_URL || process.env.VERCEL_URL || APP_URLS.LOCALHOST
  );
}

// =============================================================================
// Timing Constants
// =============================================================================

export const TIMING = {
  // Cache durations (in seconds)
  CACHE_SHORT: 30,
  CACHE_MEDIUM: 60,
  CACHE_LONG: 300,
  CACHE_VERY_LONG: 3600,

  // Rate limiting (in milliseconds)
  RATE_LIMIT_WINDOW: 60 * 1000, // 1 minute
  RATE_LIMIT_MAX_REQUESTS: 100,

  // Debounce/throttle (in milliseconds)
  DEBOUNCE_DEFAULT: 300,
  THROTTLE_DEFAULT: 1000,

  // Session/token (in seconds)
  SESSION_MAX_AGE: 30 * 24 * 60 * 60, // 30 days
  JWT_MAX_AGE: 30 * 24 * 60 * 60, // 30 days
  VERIFICATION_CODE_EXPIRY: 10 * 60, // 10 minutes
  PASSWORD_RESET_EXPIRY: 60 * 60, // 1 hour
} as const;

// =============================================================================
// Pagination
// =============================================================================

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  TRANSACTIONS_PER_PAGE: 10,
  NOTIFICATIONS_PER_PAGE: 20,
  USERS_PER_PAGE: 25,
} as const;

// =============================================================================
// Limits
// =============================================================================

export const LIMITS = {
  // File uploads
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_AVATAR_SIZE: 2 * 1024 * 1024, // 2MB
  MAX_KYC_FILE_SIZE: 10 * 1024 * 1024, // 10MB

  // Input validation
  MIN_PASSWORD_LENGTH: 6,
  MAX_PASSWORD_LENGTH: 128,
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 100,
  MAX_BIO_LENGTH: 500,
  MAX_NOTE_LENGTH: 500,

  // Trading
  MIN_TRADE_AMOUNT: 0.00001,
  MAX_TRADE_AMOUNT: 1000000,
  MIN_DEPOSIT_AMOUNT: 10,
  MAX_DEPOSIT_AMOUNT: 1000000,
  MIN_WITHDRAWAL_AMOUNT: 10,
} as const;

// =============================================================================
// Feature Flags
// =============================================================================

export const FEATURES = {
  ENABLE_2FA: true,
  ENABLE_KYC: true,
  ENABLE_P2P_TRANSFER: true,
  ENABLE_CRYPTO_DEPOSITS: true,
  ENABLE_PIX_DEPOSITS: true,
  ENABLE_TELEGRAM_BOT: true,
  ENABLE_PUSH_NOTIFICATIONS: true,
  ENABLE_AI_CHAT: true,
  ENABLE_TRADING_SIGNALS: true,
} as const;

// =============================================================================
// Regex Patterns
// =============================================================================

export const PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[\d\s-()]+$/,
  ACCOUNT_NUMBER: /^M4-\d{6}$/,
  CRYPTO_ADDRESS_BTC: /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,39}$/,
  CRYPTO_ADDRESS_ETH: /^0x[a-fA-F0-9]{40}$/,
} as const;

// =============================================================================
// HTTP Status Messages
// =============================================================================

export const HTTP_MESSAGES = {
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not Found",
  405: "Method Not Allowed",
  409: "Conflict",
  422: "Unprocessable Entity",
  429: "Too Many Requests",
  500: "Internal Server Error",
  503: "Service Unavailable",
} as const;
