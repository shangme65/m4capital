/**
 * Comprehensive mapping of country codes to their currencies (ISO 4217)
 * Based on the 250 countries in countries.ts
 */
export const COUNTRY_CURRENCY_MAP: Record<string, string> = {
  // A
  AF: "AFN", // Afghanistan - Afghan Afghani
  AX: "EUR", // Aland Islands - Euro
  AL: "ALL", // Albania - Albanian Lek
  DZ: "DZD", // Algeria - Algerian Dinar
  AS: "USD", // American Samoa - US Dollar
  AD: "EUR", // Andorra - Euro
  AO: "AOA", // Angola - Angolan Kwanza
  AI: "XCD", // Anguilla - East Caribbean Dollar
  AQ: "USD", // Antarctica - US Dollar
  AG: "XCD", // Antigua and Barbuda - East Caribbean Dollar
  AR: "ARS", // Argentina - Argentine Peso
  AM: "AMD", // Armenia - Armenian Dram
  AW: "AWG", // Aruba - Aruban Florin
  AU: "AUD", // Australia - Australian Dollar
  AT: "EUR", // Austria - Euro
  AZ: "AZN", // Azerbaijan - Azerbaijani Manat

  // B
  BS: "BSD", // Bahamas - Bahamian Dollar
  BH: "BHD", // Bahrain - Bahraini Dinar
  BD: "BDT", // Bangladesh - Bangladeshi Taka
  BB: "BBD", // Barbados - Barbadian Dollar
  BY: "BYN", // Belarus - Belarusian Ruble
  BE: "EUR", // Belgium - Euro
  BZ: "BZD", // Belize - Belize Dollar
  BJ: "XOF", // Benin - West African CFA Franc
  BM: "BMD", // Bermuda - Bermudian Dollar
  BT: "BTN", // Bhutan - Bhutanese Ngultrum
  BO: "BOB", // Bolivia - Bolivian Boliviano
  BQ: "USD", // Bonaire, Sint Eustatius and Saba - US Dollar
  BA: "BAM", // Bosnia and Herzegovina - Bosnia-Herzegovina Convertible Mark
  BW: "BWP", // Botswana - Botswanan Pula
  BV: "NOK", // Bouvet Island - Norwegian Krone
  BR: "BRL", // Brazil - Brazilian Real
  IO: "USD", // British Indian Ocean Territory - US Dollar
  BN: "BND", // Brunei - Brunei Dollar
  BG: "BGN", // Bulgaria - Bulgarian Lev
  BF: "XOF", // Burkina Faso - West African CFA Franc
  BI: "BIF", // Burundi - Burundian Franc

  // C
  KH: "KHR", // Cambodia - Cambodian Riel
  CM: "XAF", // Cameroon - Central African CFA Franc
  CA: "CAD", // Canada - Canadian Dollar
  CV: "CVE", // Cabo Verde - Cape Verdean Escudo
  KY: "KYD", // Cayman Islands - Cayman Islands Dollar
  CF: "XAF", // Central African Republic - Central African CFA Franc
  TD: "XAF", // Chad - Central African CFA Franc
  CL: "CLP", // Chile - Chilean Peso
  CN: "CNY", // China - Chinese Yuan
  CX: "AUD", // Christmas Island - Australian Dollar
  CC: "AUD", // Cocos (Keeling) Islands - Australian Dollar
  CO: "COP", // Colombia - Colombian Peso
  KM: "KMF", // Comoros - Comorian Franc
  CG: "XAF", // Congo - Central African CFA Franc
  CD: "CDF", // Congo, Democratic Republic - Congolese Franc
  CK: "NZD", // Cook Islands - New Zealand Dollar
  CR: "CRC", // Costa Rica - Costa Rican Colón
  CI: "XOF", // Côte d'Ivoire - West African CFA Franc
  HR: "EUR", // Croatia - Euro
  CU: "CUP", // Cuba - Cuban Peso
  CW: "ANG", // Curaçao - Netherlands Antillean Guilder
  CY: "EUR", // Cyprus - Euro
  CZ: "CZK", // Czechia - Czech Koruna

  // D
  DK: "DKK", // Denmark - Danish Krone
  DJ: "DJF", // Djibouti - Djiboutian Franc
  DM: "XCD", // Dominica - East Caribbean Dollar
  DO: "DOP", // Dominican Republic - Dominican Peso

  // E
  EC: "USD", // Ecuador - US Dollar
  EG: "EGP", // Egypt - Egyptian Pound
  SV: "USD", // El Salvador - US Dollar
  GQ: "XAF", // Equatorial Guinea - Central African CFA Franc
  ER: "ERN", // Eritrea - Eritrean Nakfa
  EE: "EUR", // Estonia - Euro
  SZ: "SZL", // Eswatini - Swazi Lilangeni
  ET: "ETB", // Ethiopia - Ethiopian Birr

  // F
  FK: "FKP", // Falkland Islands - Falkland Islands Pound
  FO: "DKK", // Faroe Islands - Danish Krone
  FJ: "FJD", // Fiji - Fijian Dollar
  FI: "EUR", // Finland - Euro
  FR: "EUR", // France - Euro
  GF: "EUR", // French Guiana - Euro
  PF: "XPF", // French Polynesia - CFP Franc
  TF: "EUR", // French Southern Territories - Euro

  // G
  GA: "XAF", // Gabon - Central African CFA Franc
  GM: "GMD", // Gambia - Gambian Dalasi
  GE: "GEL", // Georgia - Georgian Lari
  DE: "EUR", // Germany - Euro
  GH: "GHS", // Ghana - Ghanaian Cedi
  GI: "GIP", // Gibraltar - Gibraltar Pound
  GR: "EUR", // Greece - Euro
  GL: "DKK", // Greenland - Danish Krone
  GD: "XCD", // Grenada - East Caribbean Dollar
  GP: "EUR", // Guadeloupe - Euro
  GU: "USD", // Guam - US Dollar
  GT: "GTQ", // Guatemala - Guatemalan Quetzal
  GG: "GBP", // Guernsey - British Pound
  GN: "GNF", // Guinea - Guinean Franc
  GW: "XOF", // Guinea-Bissau - West African CFA Franc
  GY: "GYD", // Guyana - Guyanese Dollar

  // H
  HT: "HTG", // Haiti - Haitian Gourde
  HM: "AUD", // Heard Island and McDonald Islands - Australian Dollar
  VA: "EUR", // Holy See - Euro
  HN: "HNL", // Honduras - Honduran Lempira
  HK: "HKD", // Hong Kong - Hong Kong Dollar
  HU: "HUF", // Hungary - Hungarian Forint

  // I
  IS: "ISK", // Iceland - Icelandic Króna
  IN: "INR", // India - Indian Rupee
  ID: "IDR", // Indonesia - Indonesian Rupiah
  IR: "IRR", // Iran - Iranian Rial
  IQ: "IQD", // Iraq - Iraqi Dinar
  IE: "EUR", // Ireland - Euro
  IM: "GBP", // Isle of Man - British Pound
  IL: "ILS", // Israel - Israeli New Shekel
  IT: "EUR", // Italy - Euro

  // J
  JM: "JMD", // Jamaica - Jamaican Dollar
  JP: "JPY", // Japan - Japanese Yen
  JE: "GBP", // Jersey - British Pound
  JO: "JOD", // Jordan - Jordanian Dinar

  // K
  KZ: "KZT", // Kazakhstan - Kazakhstani Tenge
  KE: "KES", // Kenya - Kenyan Shilling
  KI: "AUD", // Kiribati - Australian Dollar
  KP: "KPW", // Korea (North) - North Korean Won
  KR: "KRW", // Korea (South) - South Korean Won
  KW: "KWD", // Kuwait - Kuwaiti Dinar
  KG: "KGS", // Kyrgyzstan - Kyrgyzstani Som

  // L
  LA: "LAK", // Laos - Lao Kip
  LV: "EUR", // Latvia - Euro
  LB: "LBP", // Lebanon - Lebanese Pound
  LS: "LSL", // Lesotho - Lesotho Loti
  LR: "LRD", // Liberia - Liberian Dollar
  LY: "LYD", // Libya - Libyan Dinar
  LI: "CHF", // Liechtenstein - Swiss Franc
  LT: "EUR", // Lithuania - Euro
  LU: "EUR", // Luxembourg - Euro

  // M
  MO: "MOP", // Macao - Macanese Pataca
  MG: "MGA", // Madagascar - Malagasy Ariary
  MW: "MWK", // Malawi - Malawian Kwacha
  MY: "MYR", // Malaysia - Malaysian Ringgit
  MV: "MVR", // Maldives - Maldivian Rufiyaa
  ML: "XOF", // Mali - West African CFA Franc
  MT: "EUR", // Malta - Euro
  MH: "USD", // Marshall Islands - US Dollar
  MQ: "EUR", // Martinique - Euro
  MR: "MRU", // Mauritania - Mauritanian Ouguiya
  MU: "MUR", // Mauritius - Mauritian Rupee
  YT: "EUR", // Mayotte - Euro
  MX: "MXN", // Mexico - Mexican Peso
  FM: "USD", // Micronesia - US Dollar
  MD: "MDL", // Moldova - Moldovan Leu
  MC: "EUR", // Monaco - Euro
  MN: "MNT", // Mongolia - Mongolian Tugrik
  ME: "EUR", // Montenegro - Euro
  MS: "XCD", // Montserrat - East Caribbean Dollar
  MA: "MAD", // Morocco - Moroccan Dirham
  MZ: "MZN", // Mozambique - Mozambican Metical
  MM: "MMK", // Myanmar - Myanmar Kyat

  // N
  NA: "NAD", // Namibia - Namibian Dollar
  NR: "AUD", // Nauru - Australian Dollar
  NP: "NPR", // Nepal - Nepalese Rupee
  NL: "EUR", // Netherlands - Euro
  NC: "XPF", // New Caledonia - CFP Franc
  NZ: "NZD", // New Zealand - New Zealand Dollar
  NI: "NIO", // Nicaragua - Nicaraguan Córdoba
  NE: "XOF", // Niger - West African CFA Franc
  NG: "NGN", // Nigeria - Nigerian Naira
  NU: "NZD", // Niue - New Zealand Dollar
  NF: "AUD", // Norfolk Island - Australian Dollar
  MK: "MKD", // North Macedonia - Macedonian Denar
  MP: "USD", // Northern Mariana Islands - US Dollar
  NO: "NOK", // Norway - Norwegian Krone

  // O
  OM: "OMR", // Oman - Omani Rial

  // P
  PK: "PKR", // Pakistan - Pakistani Rupee
  PW: "USD", // Palau - US Dollar
  PS: "ILS", // Palestine - Israeli New Shekel
  PA: "PAB", // Panama - Panamanian Balboa
  PG: "PGK", // Papua New Guinea - Papua New Guinean Kina
  PY: "PYG", // Paraguay - Paraguayan Guarani
  PE: "PEN", // Peru - Peruvian Sol
  PH: "PHP", // Philippines - Philippine Peso
  PN: "NZD", // Pitcairn - New Zealand Dollar
  PL: "PLN", // Poland - Polish Zloty
  PT: "EUR", // Portugal - Euro
  PR: "USD", // Puerto Rico - US Dollar

  // Q
  QA: "QAR", // Qatar - Qatari Riyal

  // R
  RE: "EUR", // Réunion - Euro
  RO: "RON", // Romania - Romanian Leu
  RU: "RUB", // Russia - Russian Ruble
  RW: "RWF", // Rwanda - Rwandan Franc

  // S
  BL: "EUR", // Saint Barthélemy - Euro
  SH: "SHP", // Saint Helena - Saint Helena Pound
  KN: "XCD", // Saint Kitts and Nevis - East Caribbean Dollar
  LC: "XCD", // Saint Lucia - East Caribbean Dollar
  MF: "EUR", // Saint Martin - Euro
  PM: "EUR", // Saint Pierre and Miquelon - Euro
  VC: "XCD", // Saint Vincent and the Grenadines - East Caribbean Dollar
  WS: "WST", // Samoa - Samoan Tala
  SM: "EUR", // San Marino - Euro
  ST: "STN", // Sao Tome and Principe - São Tomé and Príncipe Dobra
  SA: "SAR", // Saudi Arabia - Saudi Riyal
  SN: "XOF", // Senegal - West African CFA Franc
  RS: "RSD", // Serbia - Serbian Dinar
  SC: "SCR", // Seychelles - Seychellois Rupee
  SL: "SLL", // Sierra Leone - Sierra Leonean Leone
  SG: "SGD", // Singapore - Singapore Dollar
  SX: "ANG", // Sint Maarten - Netherlands Antillean Guilder
  SK: "EUR", // Slovakia - Euro
  SI: "EUR", // Slovenia - Euro
  SB: "SBD", // Solomon Islands - Solomon Islands Dollar
  SO: "SOS", // Somalia - Somali Shilling
  ZA: "ZAR", // South Africa - South African Rand
  GS: "GBP", // South Georgia - British Pound
  SS: "SSP", // South Sudan - South Sudanese Pound
  ES: "EUR", // Spain - Euro
  LK: "LKR", // Sri Lanka - Sri Lankan Rupee
  SD: "SDG", // Sudan - Sudanese Pound
  SR: "SRD", // Suriname - Surinamese Dollar
  SJ: "NOK", // Svalbard and Jan Mayen - Norwegian Krone
  SE: "SEK", // Sweden - Swedish Krona
  CH: "CHF", // Switzerland - Swiss Franc
  SY: "SYP", // Syria - Syrian Pound

  // T
  TW: "TWD", // Taiwan - New Taiwan Dollar
  TJ: "TJS", // Tajikistan - Tajikistani Somoni
  TZ: "TZS", // Tanzania - Tanzanian Shilling
  TH: "THB", // Thailand - Thai Baht
  TL: "USD", // Timor-Leste - US Dollar
  TG: "XOF", // Togo - West African CFA Franc
  TK: "NZD", // Tokelau - New Zealand Dollar
  TO: "TOP", // Tonga - Tongan Paʻanga
  TT: "TTD", // Trinidad and Tobago - Trinidad and Tobago Dollar
  TN: "TND", // Tunisia - Tunisian Dinar
  TR: "TRY", // Türkiye - Turkish Lira
  TM: "TMT", // Turkmenistan - Turkmenistani Manat
  TC: "USD", // Turks and Caicos Islands - US Dollar
  TV: "AUD", // Tuvalu - Australian Dollar

  // U
  UG: "UGX", // Uganda - Ugandan Shilling
  UA: "UAH", // Ukraine - Ukrainian Hryvnia
  AE: "AED", // United Arab Emirates - UAE Dirham
  GB: "GBP", // United Kingdom - British Pound
  US: "USD", // United States - US Dollar
  UM: "USD", // US Minor Outlying Islands - US Dollar
  UY: "UYU", // Uruguay - Uruguayan Peso
  UZ: "UZS", // Uzbekistan - Uzbekistani Som

  // V
  VU: "VUV", // Vanuatu - Vanuatu Vatu
  VE: "VES", // Venezuela - Venezuelan Bolívar
  VN: "VND", // Viet Nam - Vietnamese Dong
  VG: "USD", // Virgin Islands (British) - US Dollar
  VI: "USD", // Virgin Islands (U.S.) - US Dollar

  // W
  WF: "XPF", // Wallis and Futuna - CFP Franc

  // Y & Z
  EH: "MAD", // Western Sahara - Moroccan Dirham
  YE: "YER", // Yemen - Yemeni Rial
  ZM: "ZMW", // Zambia - Zambian Kwacha
  ZW: "ZWL", // Zimbabwe - Zimbabwean Dollar

  // X
  XK: "EUR", // Kosovo - Euro
};
