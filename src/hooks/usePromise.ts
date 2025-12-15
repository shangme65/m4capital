"use client";

import { use, Suspense, cache } from "react";

/**
 * React 19 `use()` hook examples and utilities
 *
 * The `use()` hook lets you read the value of a resource like a Promise
 * or context directly in render. Unlike other hooks, `use()` can be
 * called conditionally and inside loops.
 *
 * @example
 * // Reading a promise with use()
 * function UserProfile({ userPromise }: { userPromise: Promise<User> }) {
 *   const user = use(userPromise); // Suspends until resolved
 *   return <div>{user.name}</div>;
 * }
 *
 * // Must wrap in Suspense
 * <Suspense fallback={<Loading />}>
 *   <UserProfile userPromise={fetchUser()} />
 * </Suspense>
 */

// Cache function for deduplicating requests (React 19 feature)
// Use this to wrap fetch functions so they don't re-fetch on every render
export const cachedFetch = cache(async <T>(url: string): Promise<T> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
});

/**
 * Create a cached data fetcher for use with the `use()` hook
 *
 * @example
 * // Create a cached fetcher
 * const fetchUser = createCachedFetcher<User>('/api/user');
 *
 * // Use in component with Suspense
 * function UserProfile() {
 *   const user = use(fetchUser());
 *   return <div>{user.name}</div>;
 * }
 */
export function createCachedFetcher<T>(url: string) {
  return cache(async (): Promise<T> => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}`);
    }
    return response.json();
  });
}

/**
 * Fetch exchange rates - cached to prevent duplicate requests
 * Use with: const rates = use(fetchExchangeRates());
 */
export const fetchExchangeRates = cache(
  async (): Promise<Record<string, number>> => {
    const response = await fetch("https://api.frankfurter.app/latest?from=USD");
    if (!response.ok) {
      return { USD: 1 };
    }
    const data = await response.json();
    return { USD: 1, ...data.rates };
  }
);

/**
 * Fetch crypto prices - cached
 * Use with: const prices = use(fetchCryptoPrices());
 */
export const fetchCryptoPrices = cache(
  async (): Promise<Record<string, number>> => {
    try {
      const response = await fetch(
        "https://api.binance.com/api/v3/ticker/price"
      );
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      const prices: Record<string, number> = {};
      data.forEach((item: { symbol: string; price: string }) => {
        if (item.symbol.endsWith("USDT")) {
          const symbol = item.symbol.replace("USDT", "");
          prices[symbol] = parseFloat(item.price);
        }
      });
      return prices;
    } catch {
      return {};
    }
  }
);

/**
 * Fetch user portfolio - cached
 */
export const fetchPortfolio = cache(async (userId?: string) => {
  const url = userId ? `/api/portfolio?userId=${userId}` : "/api/portfolio";
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch portfolio");
  return response.json();
});

/**
 * Fetch notifications - cached
 */
export const fetchNotifications = cache(async () => {
  const response = await fetch("/api/notifications");
  if (!response.ok) throw new Error("Failed to fetch notifications");
  return response.json();
});

/**
 * Example component showing use() hook pattern:
 *
 * ```tsx
 * import { use, Suspense } from 'react';
 * import { fetchExchangeRates } from '@/hooks/usePromise';
 *
 * // Create the promise outside the component
 * const ratesPromise = fetchExchangeRates();
 *
 * function ExchangeRates() {
 *   // use() suspends until the promise resolves
 *   const rates = use(ratesPromise);
 *
 *   return (
 *     <ul>
 *       {Object.entries(rates).map(([currency, rate]) => (
 *         <li key={currency}>{currency}: {rate}</li>
 *       ))}
 *     </ul>
 *   );
 * }
 *
 * // Must wrap in Suspense
 * export default function Page() {
 *   return (
 *     <Suspense fallback={<div>Loading rates...</div>}>
 *       <ExchangeRates />
 *     </Suspense>
 *   );
 * }
 * ```
 */

// Re-export use for convenience
export { use, Suspense, cache };
