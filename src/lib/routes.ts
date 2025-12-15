/**
 * Type-safe route definitions
 *
 * Use these constants instead of string literals for routes
 * Provides autocomplete and catches typos at compile time
 */

export const ROUTES = {
  // Public pages
  HOME: "/",
  ABOUT: "/about",
  CONTACT: "/contact",
  BLOG: "/blog",
  DOWNLOAD: "/download",
  HELP: "/help",
  NEWS: "/news-feed",
  ASSETS: "/assets",
  INDUSTRIES: "/industries",
  STOCK_COLLECTIONS: "/stock-collections",
  TRADING_SPECS: "/trading-specifications",
  MARGIN_BASICS: "/margin-trading-basics",
  VIDEO_TUTORIALS: "/video-tutorials",
  CALENDARS: "/calendars",
  HISTORICAL_QUOTES: "/historical-quotes",
  AWARDS: "/awards",
  PRESS: "/press",
  IN_NUMBERS: "/in-numbers",
  LICENSES: "/licenses-and-safeguards",
  PRIVACY: "/privacy",
  TERMS: "/terms",
  DATA_DELETION: "/data-deletion",

  // Auth pages
  LOGIN: "/?login=true",
  SIGNUP: "/?signup=true",
  RESET_PASSWORD: "/reset-password",
  VERIFY_EMAIL: "/?verify=true",

  // Dashboard pages
  DASHBOARD: "/dashboard",
  SETTINGS: "/settings",
  TRADEROOM: "/traderoom",
  DEPOSIT: "/deposit",
  FINANCE: "/finance",
  COMMUNITY: "/community",
  ACADEMY: "/academy",

  // Admin pages
  ADMIN: "/admin",
  ADMIN_ANALYTICS: "/admin/analytics",
  ADMIN_KYC: "/admin/kyc",
  STAFF_ADMIN: "/staff-admin",

  // API routes
  API: {
    AUTH: {
      SIGNUP: "/api/auth/signup",
      LOGIN: "/api/auth/callback/credentials",
      LOGOUT: "/api/auth/logout",
      FORGOT_PASSWORD: "/api/auth/forgot-password",
      RESET_PASSWORD: "/api/auth/reset-password",
      VERIFY_CODE: "/api/auth/verify-code",
      RESEND_CODE: "/api/auth/resend-code",
    },
    USER: {
      PROFILE: "/api/user/profile",
      CURRENCY: "/api/user/currency",
      PASSWORD: "/api/user/password",
      BALANCE: "/api/user/balance",
      PREFERENCES: "/api/user/preferences",
    },
    CRYPTO: {
      BUY: "/api/crypto/buy",
      SELL: "/api/crypto/sell",
      CONVERT: "/api/crypto/convert",
      PRICES: "/api/crypto/prices",
      TRANSFER: "/api/crypto/transfer",
    },
    PORTFOLIO: "/api/portfolio",
    TRANSACTIONS: "/api/transactions",
    NOTIFICATIONS: "/api/notifications",
    PAYMENT: {
      CREATE_CRYPTO: "/api/payment/create-crypto",
      CREATE_PIX: "/api/payment/create-pix",
      CREATE_WITHDRAWAL: "/api/payment/create-withdrawal",
      STATUS: (id: string) => `/api/payment/status/${id}`,
    },
  },
} as const;

/**
 * Get blog post URL
 */
export function getBlogPostUrl(slug: string): string {
  return `/blog/${slug}`;
}

/**
 * Get asset details URL
 */
export function getAssetUrl(symbol: string): string {
  return `/assets?symbol=${symbol.toUpperCase()}`;
}

/**
 * Build query string from params
 */
export function buildQueryString(
  params: Record<string, string | number | boolean>
): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });
  return searchParams.toString();
}

/**
 * Add query params to route
 */
export function withQuery(
  route: string,
  params: Record<string, string | number | boolean>
): string {
  const queryString = buildQueryString(params);
  return queryString ? `${route}?${queryString}` : route;
}
