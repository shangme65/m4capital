/**
 * Currency utilities for M4Capital
 */

// Currencies array sorted alphabetically by country name (matching countries.ts structure)
const CURRENCIES_UNSORTED = [
  { code: "AFN", symbol: "؋", name: "Afghan Afghani", country: "Afghanistan" },
  { code: "ALL", symbol: "L", name: "Albanian Lek", country: "Albania" },
  { code: "DZD", symbol: "د.ج", name: "Algerian Dinar", country: "Algeria" },
  { code: "AOA", symbol: "Kz", name: "Angolan Kwanza", country: "Angola" },
  { code: "ARS", symbol: "AR$", name: "Argentine Peso", country: "Argentina" },
  { code: "AMD", symbol: "֏", name: "Armenian Dram", country: "Armenia" },
  {
    code: "AUD",
    symbol: "A$",
    name: "Australian Dollar",
    country: "Australia",
  },
  { code: "EUR", symbol: "€", name: "Euro", country: "Austria" },
  {
    code: "AZN",
    symbol: "₼",
    name: "Azerbaijani Manat",
    country: "Azerbaijan",
  },
  { code: "BHD", symbol: ".د.ب", name: "Bahraini Dinar", country: "Bahrain" },
  { code: "BDT", symbol: "৳", name: "Bangladeshi Taka", country: "Bangladesh" },
  {
    code: "BBD",
    symbol: "Bds$",
    name: "Barbadian Dollar",
    country: "Barbados",
  },
  { code: "BYN", symbol: "Br", name: "Belarusian Ruble", country: "Belarus" },
  { code: "EUR", symbol: "€", name: "Euro", country: "Belgium" },
  {
    code: "BOB",
    symbol: "Bs.",
    name: "Bolivian Boliviano",
    country: "Bolivia",
  },
  {
    code: "BAM",
    symbol: "KM",
    name: "Bosnia-Herzegovina Mark",
    country: "Bosnia and Herzegovina",
  },
  { code: "BWP", symbol: "P", name: "Botswana Pula", country: "Botswana" },
  { code: "BRL", symbol: "R$", name: "Brazilian Real", country: "Brazil" },
  { code: "BGN", symbol: "лв", name: "Bulgarian Lev", country: "Bulgaria" },
  { code: "BIF", symbol: "FBu", name: "Burundian Franc", country: "Burundi" },
  { code: "KHR", symbol: "៛", name: "Cambodian Riel", country: "Cambodia" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar", country: "Canada" },
  {
    code: "XAF",
    symbol: "FCFA",
    name: "Central African CFA Franc",
    country: "Central African Republic",
  },
  { code: "CLP", symbol: "CL$", name: "Chilean Peso", country: "Chile" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan", country: "China" },
  { code: "COP", symbol: "COL$", name: "Colombian Peso", country: "Colombia" },
  {
    code: "CRC",
    symbol: "₡",
    name: "Costa Rican Colón",
    country: "Costa Rica",
  },
  { code: "HRK", symbol: "kn", name: "Croatian Kuna", country: "Croatia" },
  { code: "CZK", symbol: "Kč", name: "Czech Koruna", country: "Czechia" },
  { code: "DKK", symbol: "kr", name: "Danish Krone", country: "Denmark" },
  { code: "DJF", symbol: "Fdj", name: "Djiboutian Franc", country: "Djibouti" },
  {
    code: "DOP",
    symbol: "RD$",
    name: "Dominican Peso",
    country: "Dominican Republic",
  },
  { code: "EGP", symbol: "£", name: "Egyptian Pound", country: "Egypt" },
  { code: "ETB", symbol: "Br", name: "Ethiopian Birr", country: "Ethiopia" },
  { code: "FJD", symbol: "$", name: "Fijian Dollar", country: "Fiji" },
  { code: "EUR", symbol: "€", name: "Euro", country: "Finland" },
  { code: "EUR", symbol: "€", name: "Euro", country: "France" },
  { code: "GEL", symbol: "₾", name: "Georgian Lari", country: "Georgia" },
  { code: "EUR", symbol: "€", name: "Euro", country: "Germany" },
  { code: "GHS", symbol: "₵", name: "Ghanaian Cedi", country: "Ghana" },
  { code: "EUR", symbol: "€", name: "Euro", country: "Greece" },
  {
    code: "GTQ",
    symbol: "Q",
    name: "Guatemalan Quetzal",
    country: "Guatemala",
  },
  { code: "HNL", symbol: "L", name: "Honduran Lempira", country: "Honduras" },
  {
    code: "HKD",
    symbol: "HK$",
    name: "Hong Kong Dollar",
    country: "Hong Kong",
  },
  { code: "HUF", symbol: "Ft", name: "Hungarian Forint", country: "Hungary" },
  { code: "ISK", symbol: "kr", name: "Icelandic Króna", country: "Iceland" },
  { code: "INR", symbol: "₹", name: "Indian Rupee", country: "India" },
  {
    code: "IDR",
    symbol: "Rp",
    name: "Indonesian Rupiah",
    country: "Indonesia",
  },
  { code: "IRR", symbol: "﷼", name: "Iranian Rial", country: "Iran" },
  { code: "IQD", symbol: "ع.د", name: "Iraqi Dinar", country: "Iraq" },
  { code: "EUR", symbol: "€", name: "Euro", country: "Ireland" },
  { code: "ILS", symbol: "₪", name: "Israeli Shekel", country: "Israel" },
  { code: "EUR", symbol: "€", name: "Euro", country: "Italy" },
  { code: "JMD", symbol: "J$", name: "Jamaican Dollar", country: "Jamaica" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen", country: "Japan" },
  { code: "JOD", symbol: "د.ا", name: "Jordanian Dinar", country: "Jordan" },
  {
    code: "KZT",
    symbol: "₸",
    name: "Kazakhstani Tenge",
    country: "Kazakhstan",
  },
  { code: "KES", symbol: "KSh", name: "Kenyan Shilling", country: "Kenya" },
  {
    code: "KRW",
    symbol: "₩",
    name: "South Korean Won",
    country: "Korea (South)",
  },
  { code: "KWD", symbol: "د.ك", name: "Kuwaiti Dinar", country: "Kuwait" },
  {
    code: "LAK",
    symbol: "₭",
    name: "Lao Kip",
    country: "Lao People's Democratic Republic",
  },
  { code: "LBP", symbol: "ل.ل", name: "Lebanese Pound", country: "Lebanon" },
  { code: "LYD", symbol: "ل.د", name: "Libyan Dinar", country: "Libya" },
  { code: "MWK", symbol: "MK", name: "Malawian Kwacha", country: "Malawi" },
  { code: "MYR", symbol: "RM", name: "Malaysian Ringgit", country: "Malaysia" },
  { code: "MUR", symbol: "₨", name: "Mauritian Rupee", country: "Mauritius" },
  { code: "MXN", symbol: "MX$", name: "Mexican Peso", country: "Mexico" },
  { code: "MDL", symbol: "L", name: "Moldovan Leu", country: "Moldova" },
  { code: "MAD", symbol: "د.م.", name: "Moroccan Dirham", country: "Morocco" },
  {
    code: "MZN",
    symbol: "MT",
    name: "Mozambican Metical",
    country: "Mozambique",
  },
  { code: "MMK", symbol: "K", name: "Myanmar Kyat", country: "Myanmar" },
  { code: "NAD", symbol: "$", name: "Namibian Dollar", country: "Namibia" },
  { code: "NPR", symbol: "Rs", name: "Nepalese Rupee", country: "Nepal" },
  { code: "EUR", symbol: "€", name: "Euro", country: "Netherlands" },
  {
    code: "NZD",
    symbol: "NZ$",
    name: "New Zealand Dollar",
    country: "New Zealand",
  },
  {
    code: "NIO",
    symbol: "C$",
    name: "Nicaraguan Córdoba",
    country: "Nicaragua",
  },
  { code: "NGN", symbol: "₦", name: "Nigerian Naira", country: "Nigeria" },
  {
    code: "MKD",
    symbol: "ден",
    name: "Macedonian Denar",
    country: "North Macedonia",
  },
  { code: "NOK", symbol: "kr", name: "Norwegian Krone", country: "Norway" },
  { code: "OMR", symbol: "﷼", name: "Omani Rial", country: "Oman" },
  { code: "PKR", symbol: "₨", name: "Pakistani Rupee", country: "Pakistan" },
  { code: "PAB", symbol: "B/.", name: "Panamanian Balboa", country: "Panama" },
  {
    code: "PGK",
    symbol: "K",
    name: "Papua New Guinean Kina",
    country: "Papua New Guinea",
  },
  { code: "PYG", symbol: "₲", name: "Paraguayan Guaraní", country: "Paraguay" },
  { code: "PEN", symbol: "S/", name: "Peruvian Sol", country: "Peru" },
  { code: "PHP", symbol: "₱", name: "Philippine Peso", country: "Philippines" },
  { code: "PLN", symbol: "zł", name: "Polish Zloty", country: "Poland" },
  { code: "EUR", symbol: "€", name: "Euro", country: "Portugal" },
  { code: "QAR", symbol: "﷼", name: "Qatari Riyal", country: "Qatar" },
  { code: "RON", symbol: "lei", name: "Romanian Leu", country: "Romania" },
  {
    code: "RUB",
    symbol: "₽",
    name: "Russian Ruble",
    country: "Russian Federation",
  },
  { code: "RWF", symbol: "FRw", name: "Rwandan Franc", country: "Rwanda" },
  { code: "SAR", symbol: "﷼", name: "Saudi Riyal", country: "Saudi Arabia" },
  { code: "RSD", symbol: "дин", name: "Serbian Dinar", country: "Serbia" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar", country: "Singapore" },
  { code: "EUR", symbol: "€", name: "Euro", country: "Slovakia" },
  { code: "EUR", symbol: "€", name: "Euro", country: "Slovenia" },
  {
    code: "SBD",
    symbol: "$",
    name: "Solomon Islands Dollar",
    country: "Solomon Islands",
  },
  { code: "SOS", symbol: "S", name: "Somali Shilling", country: "Somalia" },
  {
    code: "ZAR",
    symbol: "R",
    name: "South African Rand",
    country: "South Africa",
  },
  { code: "EUR", symbol: "€", name: "Euro", country: "Spain" },
  { code: "LKR", symbol: "Rs", name: "Sri Lankan Rupee", country: "Sri Lanka" },
  { code: "SDG", symbol: "ج.س.", name: "Sudanese Pound", country: "Sudan" },
  { code: "SEK", symbol: "kr", name: "Swedish Krona", country: "Sweden" },
  { code: "CHF", symbol: "CHF", name: "Swiss Franc", country: "Switzerland" },
  {
    code: "SYP",
    symbol: "£",
    name: "Syrian Pound",
    country: "Syrian Arab Republic",
  },
  { code: "TWD", symbol: "NT$", name: "Taiwan Dollar", country: "Taiwan" },
  {
    code: "TZS",
    symbol: "TSh",
    name: "Tanzanian Shilling",
    country: "Tanzania",
  },
  { code: "THB", symbol: "฿", name: "Thai Baht", country: "Thailand" },
  { code: "TOP", symbol: "T$", name: "Tongan Paʻanga", country: "Tonga" },
  {
    code: "TTD",
    symbol: "TT$",
    name: "Trinidad & Tobago Dollar",
    country: "Trinidad and Tobago",
  },
  { code: "TND", symbol: "د.ت", name: "Tunisian Dinar", country: "Tunisia" },
  { code: "TRY", symbol: "₺", name: "Turkish Lira", country: "Türkiye" },
  { code: "UGX", symbol: "USh", name: "Ugandan Shilling", country: "Uganda" },
  { code: "UAH", symbol: "₴", name: "Ukrainian Hryvnia", country: "Ukraine" },
  {
    code: "AED",
    symbol: "د.إ",
    name: "UAE Dirham",
    country: "United Arab Emirates",
  },
  {
    code: "GBP",
    symbol: "£",
    name: "British Pound",
    country: "United Kingdom",
  },
  { code: "USD", symbol: "$", name: "US Dollar", country: "United States" },
  { code: "UYU", symbol: "$U", name: "Uruguayan Peso", country: "Uruguay" },
  {
    code: "UZS",
    symbol: "so'm",
    name: "Uzbekistani Som",
    country: "Uzbekistan",
  },
  { code: "VUV", symbol: "VT", name: "Vanuatu Vatu", country: "Vanuatu" },
  {
    code: "VES",
    symbol: "Bs.",
    name: "Venezuelan Bolívar",
    country: "Venezuela",
  },
  { code: "VND", symbol: "₫", name: "Vietnamese Dong", country: "Viet Nam" },
  {
    code: "XOF",
    symbol: "CFA",
    name: "West African CFA Franc",
    country: "West Africa",
  },
  { code: "WST", symbol: "WS$", name: "Samoan Tālā", country: "Samoa" },
  { code: "YER", symbol: "﷼", name: "Yemeni Rial", country: "Yemen" },
  { code: "ZMW", symbol: "ZK", name: "Zambian Kwacha", country: "Zambia" },
];

// Export sorted by currency name alphabetically
export const CURRENCIES = [...CURRENCIES_UNSORTED].sort((a, b) =>
  a.name.localeCompare(b.name)
);

// Export sorted by country name for matching countries.ts
export const CURRENCIES_BY_COUNTRY = [...CURRENCIES_UNSORTED].sort((a, b) =>
  a.country.localeCompare(b.country)
);

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

/**
 * Get default currency code for a country
 * Maps country names from countries.ts to currency codes
 */
export function getDefaultCurrencyForCountry(countryName: string): string {
  // Normalize country name for matching
  const normalized = countryName.trim();

  // Find currency by exact country match
  const currency = CURRENCIES_UNSORTED.find(
    (c) => c.country.toLowerCase() === normalized.toLowerCase()
  );

  if (currency) return currency.code;

  // Special cases and alternative names
  const specialCases: Record<string, string> = {
    "United States of America": "USD",
    USA: "USD",
    UK: "GBP",
    England: "GBP",
    Scotland: "GBP",
    Wales: "GBP",
    "Northern Ireland": "GBP",
    Korea: "KRW",
    "South Korea": "KRW",
    "North Korea": "KRW",
    "Republic of Korea": "KRW",
    Vietnam: "VND",
    "Viet Nam": "VND",
    Turkey: "TRY",
    Türkiye: "TRY",
    "Czech Republic": "CZK",
    Czechia: "CZK",
    Macedonia: "MKD",
    "North Macedonia": "MKD",
    Bosnia: "BAM",
    "Bosnia and Herzegovina": "BAM",
    Russia: "RUB",
    "Russian Federation": "RUB",
    "Iran (Islamic Republic of)": "IRR",
    "Bolivia (Plurinational State of)": "BOB",
    "Venezuela (Bolivarian Republic of)": "VES",
    "Tanzania, United Republic of": "TZS",
    "Congo (Democratic Republic of the)": "XAF",
    "Côte d'Ivoire": "XOF",
    "Ivory Coast": "XOF",
  };

  if (specialCases[normalized]) {
    return specialCases[normalized];
  }

  // Default to USD if no match found
  return "USD";
}
