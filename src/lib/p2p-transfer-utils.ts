/**
 * Utility functions for P2P transfer system
 */

/**
 * Generate a unique 10-digit account number with random digits
 */
export function generateAccountNumber(): string {
  // Generate 10 completely random digits
  let accountNumber = "";
  for (let i = 0; i < 10; i++) {
    accountNumber += Math.floor(Math.random() * 10);
  }
  return accountNumber;
}

/**
 * Generate a unique transaction reference
 */
export function generateTransactionReference(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `TRF${timestamp}${random}`;
}

/**
 * Validate transfer PIN (must be 4 digits)
 */
export function validateTransferPin(pin: string): boolean {
  return /^\d{4}$/.test(pin);
}

/**
 * Format amount for display
 */
export function formatTransferAmount(
  amount: number,
  currency: string = "USD"
): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount);
}
