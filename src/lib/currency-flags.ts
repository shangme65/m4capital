/**
 * Maps currency codes to their corresponding flag codes for use with flag CDNs
 * Uses circle-flags CDN: https://hatscripts.github.io/circle-flags/flags/{code}.svg
 */

export const CURRENCY_TO_FLAG_MAP: Record<string, string> = {
  // Major currencies
  EUR: "eu", // European Union
  USD: "us", // United States
  GBP: "gb", // United Kingdom
  JPY: "jp", // Japan
  CHF: "ch", // Switzerland
  CAD: "ca", // Canada
  AUD: "au", // Australia
  NZD: "nz", // New Zealand
  
  // European currencies
  SEK: "se", // Sweden
  NOK: "no", // Norway
  DKK: "dk", // Denmark
  PLN: "pl", // Poland
  CZK: "cz", // Czech Republic
  HUF: "hu", // Hungary
  RON: "ro", // Romania
  BGN: "bg", // Bulgaria
  HRK: "hr", // Croatia
  ISK: "is", // Iceland
  
  // Asian currencies
  CNY: "cn", // China
  INR: "in", // India
  KRW: "kr", // South Korea
  SGD: "sg", // Singapore
  HKD: "hk", // Hong Kong
  MYR: "my", // Malaysia
  THB: "th", // Thailand
  IDR: "id", // Indonesia
  PHP: "ph", // Philippines
  VND: "vn", // Vietnam
  PKR: "pk", // Pakistan
  BDT: "bd", // Bangladesh
  
  // Middle East & Africa
  AED: "ae", // UAE
  SAR: "sa", // Saudi Arabia
  ILS: "il", // Israel
  TRY: "tr", // Turkey
  ZAR: "za", // South Africa
  EGP: "eg", // Egypt
  NGN: "ng", // Nigeria
  KES: "ke", // Kenya
  
  // Americas
  BRL: "br", // Brazil
  MXN: "mx", // Mexico
  ARS: "ar", // Argentina
  CLP: "cl", // Chile
  COP: "co", // Colombia
  PEN: "pe", // Peru
  VEF: "ve", // Venezuela
  CRC: "cr", // Costa Rica
  
  // Other currencies
  RUB: "ru", // Russia
  UAH: "ua", // Ukraine
  IQD: "iq", // Iraq
  IRR: "ir", // Iran
  KWD: "kw", // Kuwait
  QAR: "qa", // Qatar
  OMR: "om", // Oman
  BHD: "bh", // Bahrain
  JOD: "jo", // Jordan
  LBP: "lb", // Lebanon
  
  // Caribbean & Pacific
  BBD: "bb", // Barbados
  JMD: "jm", // Jamaica
  TTD: "tt", // Trinidad and Tobago
  BSD: "bs", // Bahamas
  FJD: "fj", // Fiji
  
  // Africa
  GHS: "gh", // Ghana
  TZS: "tz", // Tanzania
  UGX: "ug", // Uganda
  MAD: "ma", // Morocco
  TND: "tn", // Tunisia
  DZD: "dz", // Algeria
  
  // Special territories
  SHP: "sh", // Saint Helena
  FKP: "fk", // Falkland Islands
  GIP: "gi", // Gibraltar
  
  // Additional currencies
  AZN: "az", // Azerbaijan
  GEL: "ge", // Georgia
  AMD: "am", // Armenia
  KZT: "kz", // Kazakhstan
  UZS: "uz", // Uzbekistan
  BYN: "by", // Belarus
  MDL: "md", // Moldova
  MKD: "mk", // North Macedonia
  RSD: "rs", // Serbia
  ALL: "al", // Albania
  BAM: "ba", // Bosnia and Herzegovina
  
  // More Asian currencies
  MMK: "mm", // Myanmar
  KHR: "kh", // Cambodia
  LAK: "la", // Laos
  BND: "bn", // Brunei
  MOP: "mo", // Macau
  NPR: "np", // Nepal
  LKR: "lk", // Sri Lanka
  
  // More African currencies
  ETB: "et", // Ethiopia
  MUR: "mu", // Mauritius
  MWK: "mw", // Malawi
  BWP: "bw", // Botswana
  NAD: "na", // Namibia
  ZMW: "zm", // Zambia
  AOA: "ao", // Angola
  MZN: "mz", // Mozambique
  
  // More Americas
  GTQ: "gt", // Guatemala
  HNL: "hn", // Honduras
  NIO: "ni", // Nicaragua
  PAB: "pa", // Panama
  DOP: "do", // Dominican Republic
  HTG: "ht", // Haiti
  PYG: "py", // Paraguay
  UYU: "uy", // Uruguay
  BOB: "bo", // Bolivia
  
  // More currencies
  AFN: "af", // Afghanistan
  BIF: "bi", // Burundi
  CDF: "cd", // Congo (DRC)
  CVE: "cv", // Cape Verde
  DJF: "dj", // Djibouti
  ERN: "er", // Eritrea
  GMD: "gm", // Gambia
  GNF: "gn", // Guinea
  KMF: "km", // Comoros
  LRD: "lr", // Liberia
  LSL: "ls", // Lesotho
  MGA: "mg", // Madagascar
  MRU: "mr", // Mauritania
  MVR: "mv", // Maldives
  PGK: "pg", // Papua New Guinea
  RWF: "rw", // Rwanda
  SBD: "sb", // Solomon Islands
  SCR: "sc", // Seychelles
  SDG: "sd", // Sudan
  SLL: "sl", // Sierra Leone
  SOS: "so", // Somalia
  SRD: "sr", // Suriname
  SSP: "ss", // South Sudan
  STN: "st", // São Tomé and Príncipe
  SYP: "sy", // Syria
  SZL: "sz", // Eswatini
  TJS: "tj", // Tajikistan
  TMT: "tm", // Turkmenistan
  TOP: "to", // Tonga
  TWD: "tw", // Taiwan
  VES: "ve", // Venezuela
  VUV: "vu", // Vanuatu
  WST: "ws", // Samoa
  XAF: "cm", // Central African CFA franc (using Cameroon)
  XCD: "ag", // East Caribbean dollar (using Antigua and Barbuda)
  XOF: "sn", // West African CFA franc (using Senegal)
  XPF: "pf", // CFP franc (using French Polynesia)
  YER: "ye", // Yemen
  ZWL: "zw", // Zimbabwe
  
  // Additional mappings
  ANG: "cw", // Netherlands Antillean Guilder (Curaçao)
  AWG: "aw", // Aruban Florin
  BMD: "bm", // Bermudan Dollar
  BTN: "bt", // Bhutanese Ngultrum
  BZD: "bz", // Belize Dollar
  CUP: "cu", // Cuban Peso
  GYD: "gy", // Guyanese Dollar
  KGS: "kg", // Kyrgyzstani Som
  KPW: "kp", // North Korean Won
  KYD: "ky", // Cayman Islands Dollar
  LYD: "ly", // Libyan Dinar
  MNT: "mn", // Mongolian Tugrik
};

/**
 * Get the flag code for a currency code
 * @param currencyCode ISO 4217 currency code (e.g., "EUR", "USD")
 * @returns Flag code for use with CDN (e.g., "eu", "us")
 */
export function getCurrencyFlagCode(currencyCode: string): string {
  const normalized = currencyCode.toUpperCase();
  return CURRENCY_TO_FLAG_MAP[normalized] || normalized.substring(0, 2).toLowerCase();
}

/**
 * Get the full CDN URL for a currency flag
 * Uses HatScripts circle-flags CDN
 * @param currencyCode ISO 4217 currency code (e.g., "EUR", "USD")
 * @returns CDN URL for the flag SVG
 */
export function getCurrencyFlagUrl(currencyCode: string): string {
  const flagCode = getCurrencyFlagCode(currencyCode);
  return `https://hatscripts.github.io/circle-flags/flags/${flagCode}.svg`;
}
