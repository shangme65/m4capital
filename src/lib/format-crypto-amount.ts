/**
 * Format crypto amount with smart truncation to prevent layout breaking
 * Keeps significant digits visible and truncates trailing decimals if too long
 * 
 * @param amount - The numeric amount to format
 * @param maxLength - Maximum character length before truncation (default: 16)
 * @returns Formatted string with ellipsis if truncated
 * 
 * Examples:
 * - 31535550.02833893 → "31,535,550.028..."
 * - 0.00000123 → "0.00000123"
 * - 1234.5678 → "1,234.5678"
 */
export function formatCryptoAmount(
  amount: number,
  maxLength: number = 16
): string {
  if (!amount || isNaN(amount)) return "0";

  // Format with locale and appropriate decimals
  const formatted = amount.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 8,
  });

  // If it fits within limit, return as is
  if (formatted.length <= maxLength) {
    return formatted;
  }

  // Too long - need to truncate
  // Strategy: Keep the integer part and some decimals, add ellipsis
  
  // Split into integer and decimal parts
  const parts = formatted.split(".");
  const integerPart = parts[0];
  const decimalPart = parts[1] || "";

  // If integer part alone is too long, just show it with ellipsis
  if (integerPart.length >= maxLength - 3) {
    return integerPart + "...";
  }

  // Calculate how many decimal characters we can show
  const remainingSpace = maxLength - integerPart.length - 1; // -1 for decimal point
  const decimalsToShow = Math.max(0, remainingSpace - 3); // -3 for ellipsis

  if (decimalsToShow <= 0) {
    return integerPart + "...";
  }

  return `${integerPart}.${decimalPart.substring(0, decimalsToShow)}...`;
}

/**
 * Format crypto amount to fixed decimals with smart truncation
 * Used when you need a specific decimal precision
 * 
 * @param amount - The numeric amount to format
 * @param decimals - Number of decimal places (default: 8)
 * @param maxLength - Maximum character length before truncation (default: 16)
 */
export function formatCryptoFixed(
  amount: number,
  decimals: number = 8,
  maxLength: number = 16
): string {
  if (!amount || isNaN(amount)) return "0";

  const formatted = amount.toFixed(decimals);

  // If it fits within limit, return as is
  if (formatted.length <= maxLength) {
    return formatted;
  }

  // Too long - truncate with ellipsis
  return formatted.substring(0, maxLength - 3) + "...";
}

/**
 * Truncate a formatted currency string if it's too long
 * Works with already-formatted strings from formatAmount()
 * 
 * @param formattedString - Already formatted currency string (e.g., "R$1,234,567.89")
 * @param maxLength - Maximum character length before truncation (default: 20)
 * @returns Truncated string with ellipsis if needed
 * 
 * Examples:
 * - "R$31,535,550.02" (15 chars) → "R$31,535,550.02"
 * - "R$315,355,500.28" (17 chars, max 15) → "R$315,355,50..."
 */
export function truncateCurrencyString(
  formattedString: string,
  maxLength: number = 20
): string {
  if (!formattedString || formattedString.length <= maxLength) {
    return formattedString;
  }

  // Truncate and add ellipsis
  return formattedString.substring(0, maxLength - 3) + "...";
}
