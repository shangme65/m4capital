/**
 * Comprehensive list of currencies with ISO 4217 codes and names
 * Extracted from COUNTRY_CURRENCY_MAP and sorted alphabetically by code
 */

export interface Currency {
  code: string;
  name: string;
  symbol?: string;
}

export const CURRENCIES: Currency[] = [
  { code: "AED", name: "UAE Dirham", symbol: "د.إ" },
  { code: "AFN", name: "Afghan Afghani", symbol: "؋" },
  { code: "ALL", name: "Albanian Lek", symbol: "L" },
  { code: "AMD", name: "Armenian Dram", symbol: "֏" },
  { code: "ANG", name: "Netherlands Antillean Guilder", symbol: "ƒ" },
  { code: "AOA", name: "Angolan Kwanza", symbol: "Kz" },
  { code: "ARS", name: "Argentine Peso", symbol: "$" },
  { code: "AUD", name: "Australian Dollar", symbol: "$" },
  { code: "AWG", name: "Aruban Florin", symbol: "ƒ" },
  { code: "AZN", name: "Azerbaijani Manat", symbol: "₼" },
  { code: "BAM", name: "Bosnia-Herzegovina Convertible Mark", symbol: "KM" },
  { code: "BBD", name: "Barbadian Dollar", symbol: "$" },
  { code: "BDT", name: "Bangladeshi Taka", symbol: "৳" },
  { code: "BGN", name: "Bulgarian Lev", symbol: "лв" },
  { code: "BHD", name: "Bahraini Dinar", symbol: ".د.ب" },
  { code: "BIF", name: "Burundian Franc", symbol: "Fr" },
  { code: "BMD", name: "Bermudian Dollar", symbol: "$" },
  { code: "BND", name: "Brunei Dollar", symbol: "$" },
  { code: "BOB", name: "Bolivian Boliviano", symbol: "Bs." },
  { code: "BRL", name: "Brazilian Real", symbol: "R$" },
  { code: "BSD", name: "Bahamian Dollar", symbol: "$" },
  { code: "BTN", name: "Bhutanese Ngultrum", symbol: "Nu." },
  { code: "BWP", name: "Botswanan Pula", symbol: "P" },
  { code: "BYN", name: "Belarusian Ruble", symbol: "Br" },
  { code: "BZD", name: "Belize Dollar", symbol: "$" },
  { code: "CAD", name: "Canadian Dollar", symbol: "$" },
  { code: "CDF", name: "Congolese Franc", symbol: "Fr" },
  { code: "CHF", name: "Swiss Franc", symbol: "Fr" },
  { code: "CLP", name: "Chilean Peso", symbol: "$" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
  { code: "COP", name: "Colombian Peso", symbol: "$" },
  { code: "CRC", name: "Costa Rican Colón", symbol: "₡" },
  { code: "CUP", name: "Cuban Peso", symbol: "$" },
  { code: "CVE", name: "Cape Verdean Escudo", symbol: "$" },
  { code: "CZK", name: "Czech Koruna", symbol: "Kč" },
  { code: "DJF", name: "Djiboutian Franc", symbol: "Fr" },
  { code: "DKK", name: "Danish Krone", symbol: "kr" },
  { code: "DOP", name: "Dominican Peso", symbol: "$" },
  { code: "DZD", name: "Algerian Dinar", symbol: "د.ج" },
  { code: "EGP", name: "Egyptian Pound", symbol: "£" },
  { code: "ERN", name: "Eritrean Nakfa", symbol: "Nfk" },
  { code: "ETB", name: "Ethiopian Birr", symbol: "Br" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "FJD", name: "Fijian Dollar", symbol: "$" },
  { code: "FKP", name: "Falkland Islands Pound", symbol: "£" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "GEL", name: "Georgian Lari", symbol: "₾" },
  { code: "GHS", name: "Ghanaian Cedi", symbol: "₵" },
  { code: "GIP", name: "Gibraltar Pound", symbol: "£" },
  { code: "GMD", name: "Gambian Dalasi", symbol: "D" },
  { code: "GNF", name: "Guinean Franc", symbol: "Fr" },
  { code: "GTQ", name: "Guatemalan Quetzal", symbol: "Q" },
  { code: "GYD", name: "Guyanese Dollar", symbol: "$" },
  { code: "HKD", name: "Hong Kong Dollar", symbol: "$" },
  { code: "HNL", name: "Honduran Lempira", symbol: "L" },
  { code: "HTG", name: "Haitian Gourde", symbol: "G" },
  { code: "HUF", name: "Hungarian Forint", symbol: "Ft" },
  { code: "IDR", name: "Indonesian Rupiah", symbol: "Rp" },
  { code: "ILS", name: "Israeli New Shekel", symbol: "₪" },
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
  { code: "IQD", name: "Iraqi Dinar", symbol: "ع.د" },
  { code: "IRR", name: "Iranian Rial", symbol: "﷼" },
  { code: "ISK", name: "Icelandic Króna", symbol: "kr" },
  { code: "JMD", name: "Jamaican Dollar", symbol: "$" },
  { code: "JOD", name: "Jordanian Dinar", symbol: "د.ا" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "KES", name: "Kenyan Shilling", symbol: "Sh" },
  { code: "KGS", name: "Kyrgyzstani Som", symbol: "с" },
  { code: "KHR", name: "Cambodian Riel", symbol: "៛" },
  { code: "KMF", name: "Comorian Franc", symbol: "Fr" },
  { code: "KPW", name: "North Korean Won", symbol: "₩" },
  { code: "KRW", name: "South Korean Won", symbol: "₩" },
  { code: "KWD", name: "Kuwaiti Dinar", symbol: "د.ك" },
  { code: "KYD", name: "Cayman Islands Dollar", symbol: "$" },
  { code: "KZT", name: "Kazakhstani Tenge", symbol: "₸" },
  { code: "LAK", name: "Lao Kip", symbol: "₭" },
  { code: "LBP", name: "Lebanese Pound", symbol: "ل.ل" },
  { code: "LKR", name: "Sri Lankan Rupee", symbol: "Rs" },
  { code: "LRD", name: "Liberian Dollar", symbol: "$" },
  { code: "LSL", name: "Lesotho Loti", symbol: "L" },
  { code: "LYD", name: "Libyan Dinar", symbol: "ل.د" },
  { code: "MAD", name: "Moroccan Dirham", symbol: "د.م." },
  { code: "MDL", name: "Moldovan Leu", symbol: "L" },
  { code: "MGA", name: "Malagasy Ariary", symbol: "Ar" },
  { code: "MKD", name: "Macedonian Denar", symbol: "ден" },
  { code: "MMK", name: "Myanmar Kyat", symbol: "K" },
  { code: "MNT", name: "Mongolian Tugrik", symbol: "₮" },
  { code: "MOP", name: "Macanese Pataca", symbol: "P" },
  { code: "MRU", name: "Mauritanian Ouguiya", symbol: "UM" },
  { code: "MUR", name: "Mauritian Rupee", symbol: "₨" },
  { code: "MVR", name: "Maldivian Rufiyaa", symbol: "ރ." },
  { code: "MWK", name: "Malawian Kwacha", symbol: "MK" },
  { code: "MXN", name: "Mexican Peso", symbol: "$" },
  { code: "MYR", name: "Malaysian Ringgit", symbol: "RM" },
  { code: "MZN", name: "Mozambican Metical", symbol: "MT" },
  { code: "NAD", name: "Namibian Dollar", symbol: "$" },
  { code: "NGN", name: "Nigerian Naira", symbol: "₦" },
  { code: "NIO", name: "Nicaraguan Córdoba", symbol: "C$" },
  { code: "NOK", name: "Norwegian Krone", symbol: "kr" },
  { code: "NPR", name: "Nepalese Rupee", symbol: "₨" },
  { code: "NZD", name: "New Zealand Dollar", symbol: "$" },
  { code: "OMR", name: "Omani Rial", symbol: "ر.ع." },
  { code: "PAB", name: "Panamanian Balboa", symbol: "B/." },
  { code: "PEN", name: "Peruvian Sol", symbol: "S/" },
  { code: "PGK", name: "Papua New Guinean Kina", symbol: "K" },
  { code: "PHP", name: "Philippine Peso", symbol: "₱" },
  { code: "PKR", name: "Pakistani Rupee", symbol: "₨" },
  { code: "PLN", name: "Polish Zloty", symbol: "zł" },
  { code: "PYG", name: "Paraguayan Guarani", symbol: "₲" },
  { code: "QAR", name: "Qatari Riyal", symbol: "ر.ق" },
  { code: "RON", name: "Romanian Leu", symbol: "lei" },
  { code: "RSD", name: "Serbian Dinar", symbol: "дин." },
  { code: "RUB", name: "Russian Ruble", symbol: "₽" },
  { code: "RWF", name: "Rwandan Franc", symbol: "Fr" },
  { code: "SAR", name: "Saudi Riyal", symbol: "ر.س" },
  { code: "SBD", name: "Solomon Islands Dollar", symbol: "$" },
  { code: "SCR", name: "Seychellois Rupee", symbol: "₨" },
  { code: "SDG", name: "Sudanese Pound", symbol: "ج.س." },
  { code: "SEK", name: "Swedish Krona", symbol: "kr" },
  { code: "SGD", name: "Singapore Dollar", symbol: "$" },
  { code: "SHP", name: "Saint Helena Pound", symbol: "£" },
  { code: "SLL", name: "Sierra Leonean Leone", symbol: "Le" },
  { code: "SOS", name: "Somali Shilling", symbol: "Sh" },
  { code: "SRD", name: "Surinamese Dollar", symbol: "$" },
  { code: "SSP", name: "South Sudanese Pound", symbol: "£" },
  { code: "STN", name: "São Tomé and Príncipe Dobra", symbol: "Db" },
  { code: "SYP", name: "Syrian Pound", symbol: "£" },
  { code: "SZL", name: "Swazi Lilangeni", symbol: "L" },
  { code: "THB", name: "Thai Baht", symbol: "฿" },
  { code: "TJS", name: "Tajikistani Somoni", symbol: "ЅМ" },
  { code: "TMT", name: "Turkmenistani Manat", symbol: "m" },
  { code: "TND", name: "Tunisian Dinar", symbol: "د.ت" },
  { code: "TOP", name: "Tongan Paʻanga", symbol: "T$" },
  { code: "TRY", name: "Turkish Lira", symbol: "₺" },
  { code: "TTD", name: "Trinidad and Tobago Dollar", symbol: "$" },
  { code: "TWD", name: "New Taiwan Dollar", symbol: "$" },
  { code: "TZS", name: "Tanzanian Shilling", symbol: "Sh" },
  { code: "UAH", name: "Ukrainian Hryvnia", symbol: "₴" },
  { code: "UGX", name: "Ugandan Shilling", symbol: "Sh" },
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "UYU", name: "Uruguayan Peso", symbol: "$" },
  { code: "UZS", name: "Uzbekistani Som", symbol: "so'm" },
  { code: "VES", name: "Venezuelan Bolívar", symbol: "Bs." },
  { code: "VND", name: "Vietnamese Dong", symbol: "₫" },
  { code: "VUV", name: "Vanuatu Vatu", symbol: "Vt" },
  { code: "WST", name: "Samoan Tala", symbol: "T" },
  { code: "XAF", name: "Central African CFA Franc", symbol: "Fr" },
  { code: "XCD", name: "East Caribbean Dollar", symbol: "$" },
  { code: "XOF", name: "West African CFA Franc", symbol: "Fr" },
  { code: "XPF", name: "CFP Franc", symbol: "₣" },
  { code: "YER", name: "Yemeni Rial", symbol: "﷼" },
  { code: "ZAR", name: "South African Rand", symbol: "R" },
  { code: "ZMW", name: "Zambian Kwacha", symbol: "ZK" },
  { code: "ZWL", name: "Zimbabwean Dollar", symbol: "$" },
];

/**
 * Get currency name by code
 */
export function getCurrencyName(code: string): string {
  const currency = CURRENCIES.find((c) => c.code === code);
  return currency ? currency.name : code;
}

/**
 * Get currency symbol by code
 */
export function getCurrencySymbol(code: string): string {
  const currency = CURRENCIES.find((c) => c.code === code);
  return currency?.symbol || code;
}

// Fallback exchange rates (approximate) for when API is unavailable
// These should be updated periodically but provide reasonable defaults
export const FALLBACK_EXCHANGE_RATES: Record<string, number> = {
  USD: 1,
  BRL: 5.2, // Brazilian Real
  EUR: 0.92, // Euro
  GBP: 0.79, // British Pound
  JPY: 154.5, // Japanese Yen
  CAD: 1.37, // Canadian Dollar
  AUD: 1.53, // Australian Dollar
  CHF: 0.88, // Swiss Franc
  CNY: 7.24, // Chinese Yuan
  INR: 83.5, // Indian Rupee
  MXN: 17.1, // Mexican Peso
  KRW: 1350, // South Korean Won
  SGD: 1.35, // Singapore Dollar
  HKD: 7.82, // Hong Kong Dollar
  NOK: 10.8, // Norwegian Krone
  SEK: 10.5, // Swedish Krona
  DKK: 6.87, // Danish Krone
  NZD: 1.65, // New Zealand Dollar
  ZAR: 18.5, // South African Rand
  TRY: 32.0, // Turkish Lira
  PLN: 3.95, // Polish Zloty
  THB: 35.5, // Thai Baht
  IDR: 15900, // Indonesian Rupiah
  MYR: 4.47, // Malaysian Ringgit
  PHP: 56.5, // Philippine Peso
  NGN: 1550, // Nigerian Naira
  RUB: 92.0, // Russian Ruble
};

/**
 * Fetch exchange rates from an external API
 * Returns rates with USD as base currency
 */
export async function getExchangeRates(): Promise<Record<string, number>> {
  // Return fallback rates immediately in server-side rendering
  if (typeof window === "undefined") {
    return { ...FALLBACK_EXCHANGE_RATES };
  }
  
  try {
    // Use AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch("https://api.frankfurter.app/latest?from=USD", {
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      // Silently return fallback rates on HTTP errors
      return { ...FALLBACK_EXCHANGE_RATES };
    }
    const data = await response.json();
    // Merge API rates with fallback rates (API rates take precedence)
    return { ...FALLBACK_EXCHANGE_RATES, ...data.rates };
  } catch {
    // Silently return fallback rates on network failures (common when offline)
    return { ...FALLBACK_EXCHANGE_RATES };
  }
}

/**
 * Convert an amount from USD to another currency
 */
export function convertCurrency(
  amountUSD: number,
  targetCurrency: string,
  exchangeRates: Record<string, number>
): number {
  const rate = exchangeRates[targetCurrency] || 1;
  return amountUSD * rate;
}

/**
 * Format a currency amount with the appropriate symbol and decimals
 */
export function formatCurrency(
  amount: number,
  currencyCode: string,
  decimals: number = 2
): string {
  const symbol = getCurrencySymbol(currencyCode);
  const formattedAmount = amount.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  // For currencies with symbols that typically go before the amount
  // Note: R$ (BRL) traditionally goes before the amount in Brazilian format
  const symbolBeforeAmount = [
    "$",
    "£",
    "€",
    "¥",
    "₹",
    "₦",
    "₱",
    "₩",
    "₪",
    "R$",
  ];
  if (symbolBeforeAmount.includes(symbol)) {
    return `${symbol}${formattedAmount}`;
  }

  return `${formattedAmount} ${symbol}`;
}
