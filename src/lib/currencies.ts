/**
 * Currency utilities for M4Capital
 */

export const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "CHF", symbol: "CHF", name: "Swiss Franc" },
  { code: "HKD", symbol: "HK$", name: "Hong Kong Dollar" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar" },
  { code: "SEK", symbol: "kr", name: "Swedish Krona" },
  { code: "KRW", symbol: "₩", name: "South Korean Won" },
  { code: "NOK", symbol: "kr", name: "Norwegian Krone" },
  { code: "NZD", symbol: "NZ$", name: "New Zealand Dollar" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "MXN", symbol: "MX$", name: "Mexican Peso" },
  { code: "TWD", symbol: "NT$", name: "Taiwan Dollar" },
  { code: "ZAR", symbol: "R", name: "South African Rand" },
  { code: "BRL", symbol: "R$", name: "Brazilian Real" },
  { code: "DKK", symbol: "kr", name: "Danish Krone" },
  { code: "PLN", symbol: "zł", name: "Polish Zloty" },
  { code: "THB", symbol: "฿", name: "Thai Baht" },
  { code: "ILS", symbol: "₪", name: "Israeli Shekel" },
  { code: "IDR", symbol: "Rp", name: "Indonesian Rupiah" },
  { code: "CZK", symbol: "Kč", name: "Czech Koruna" },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham" },
  { code: "TRY", symbol: "₺", name: "Turkish Lira" },
  { code: "HUF", symbol: "Ft", name: "Hungarian Forint" },
  { code: "CLP", symbol: "CL$", name: "Chilean Peso" },
  { code: "SAR", symbol: "﷼", name: "Saudi Riyal" },
  { code: "PHP", symbol: "₱", name: "Philippine Peso" },
  { code: "MYR", symbol: "RM", name: "Malaysian Ringgit" },
  { code: "COP", symbol: "COL$", name: "Colombian Peso" },
  { code: "RUB", symbol: "₽", name: "Russian Ruble" },
  { code: "RON", symbol: "lei", name: "Romanian Leu" },
  { code: "PEN", symbol: "S/", name: "Peruvian Sol" },
  { code: "BHD", symbol: ".د.ب", name: "Bahraini Dinar" },
  { code: "PKR", symbol: "₨", name: "Pakistani Rupee" },
  { code: "NGN", symbol: "₦", name: "Nigerian Naira" },
  { code: "VND", symbol: "₫", name: "Vietnamese Dong" },
  { code: "ARS", symbol: "AR$", name: "Argentine Peso" },
  { code: "KWD", symbol: "د.ك", name: "Kuwaiti Dinar" },
  { code: "QAR", symbol: "﷼", name: "Qatari Riyal" },
  { code: "OMR", symbol: "﷼", name: "Omani Rial" },
  { code: "JOD", symbol: "د.ا", name: "Jordanian Dinar" },
  { code: "EGP", symbol: "£", name: "Egyptian Pound" },
];

export function getCurrencySymbol(code: string): string {
  const currency = CURRENCIES.find((c) => c.code === code);
  return currency?.symbol || "$";
}

export function getCurrencyName(code: string): string {
  const currency = CURRENCIES.find((c) => c.code === code);
  return currency?.name || "US Dollar";
}

// Cache for exchange rates (1 hour)
let exchangeRatesCache: {
  rates: Record<string, number>;
  timestamp: number;
} | null = null;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

/**
 * Fetch exchange rates from Frankfurter API
 * Base currency is always USD
 */
export async function getExchangeRates(): Promise<Record<string, number>> {
  // Check cache first
  if (
    exchangeRatesCache &&
    Date.now() - exchangeRatesCache.timestamp < CACHE_DURATION
  ) {
    return exchangeRatesCache.rates;
  }

  try {
    const response = await fetch("https://api.frankfurter.app/latest?from=USD");
    const data = await response.json();

    const rates: Record<string, number> = {
      USD: 1, // Base currency
      ...data.rates,
    };

    // Update cache
    exchangeRatesCache = {
      rates,
      timestamp: Date.now(),
    };

    return rates;
  } catch (error) {
    console.error("Failed to fetch exchange rates:", error);
    // Return default rates if API fails
    return { USD: 1 };
  }
}

/**
 * Convert USD amount to target currency
 */
export function convertCurrency(
  amountUSD: number,
  targetCurrency: string,
  rates: Record<string, number>
): number {
  if (targetCurrency === "USD") return amountUSD;
  const rate = rates[targetCurrency];
  if (!rate) return amountUSD;
  return amountUSD * rate;
}

/**
 * Format amount with currency symbol
 */
export function formatCurrency(
  amount: number,
  currencyCode: string,
  decimals: number = 2
): string {
  const symbol = getCurrencySymbol(currencyCode);
  const formatted = amount.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  // For some currencies, symbol goes after the amount
  const symbolAfter = ["SEK", "NOK", "DKK", "CZK", "PLN", "HUF", "RON"];
  if (symbolAfter.includes(currencyCode)) {
    return `${formatted} ${symbol}`;
  }

  return `${symbol}${formatted}`;
}
