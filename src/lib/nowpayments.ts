/**
 * NOWPayments API Integration
 * Documentation: https://documenter.getpostman.com/view/7907941/S1a32n38
 */

const NOWPAYMENTS_API_URL =
  process.env.NOWPAYMENTS_SANDBOX === "true"
    ? "https://api-sandbox.nowpayments.io/v1"
    : "https://api.nowpayments.io/v1";

const API_KEY = process.env.NOWPAYMENTS_API_KEY!;

interface PaymentStatus {
  payment_id: string;
  payment_status: string;
  pay_address: string;
  price_amount: number;
  price_currency: string;
  pay_amount: number;
  pay_currency: string;
  order_id?: string;
  order_description?: string;
  ipn_callback_url?: string;
  created_at: string;
  updated_at: string;
  purchase_id?: string;
  smart_contract?: string;
  network?: string;
  network_precision?: number;
  time_limit?: string;
  burning_percent?: number;
  expiration_estimate_date?: string;
}

interface CreatePaymentParams {
  price_amount: number;
  price_currency: string;
  pay_currency: string;
  ipn_callback_url?: string;
  order_id?: string;
  order_description?: string;
}

interface CreateInvoiceParams {
  price_amount: number;
  price_currency: string;
  pay_currency?: string;
  ipn_callback_url?: string;
  order_id?: string;
  order_description?: string;
  success_url?: string;
  cancel_url?: string;
}

interface Invoice {
  id: string;
  order_id?: string;
  order_description?: string;
  price_amount: number;
  price_currency: string;
  pay_currency?: string;
  pay_amount?: number;
  pay_address?: string;
  invoice_url: string;
  success_url?: string;
  cancel_url?: string;
  created_at: string;
  updated_at: string;
}

interface EstimateParams {
  amount: number;
  currency_from: string;
  currency_to: string;
}

interface PaymentEstimate {
  currency_from: string;
  amount_from: number;
  currency_to: string;
  estimated_amount: number;
}

class NOWPaymentsClient {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = API_KEY;
    this.baseUrl = NOWPAYMENTS_API_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      "x-api-key": this.apiKey,
      "Content-Type": "application/json",
      "User-Agent": "M4Capital/1.0",
      Accept: "application/json",
      ...options.headers,
    };

    console.log(`NOWPayments request: ${options.method || "GET"} ${url}`);

    const response = await fetch(url, {
      ...options,
      headers,
    });

    console.log(
      `NOWPayments response: ${response.status} ${response.statusText}`
    );

    if (!response.ok) {
      const error = await response.text();
      console.error(`NOWPayments API error:`, error);
      throw new Error(`NOWPayments API error (${response.status}): ${error}`);
    }

    return response.json();
  }

  /**
   * Get list of available currencies
   */
  async getAvailableCurrencies(): Promise<{ currencies: string[] }> {
    return this.request("/currencies");
  }

  /**
   * Get minimum payment amount for a specific currency
   */
  async getMinimumAmount(
    currency: string
  ): Promise<{ currency: string; min_amount: number }> {
    return this.request(
      `/min-amount?currency_from=${currency}&currency_to=${currency}`
    );
  }

  /**
   * Estimate price in crypto
   */
  async estimatePrice(params: EstimateParams): Promise<PaymentEstimate> {
    return this.request("/estimate", {
      method: "POST",
      body: JSON.stringify(params),
    });
  }

  /**
   * Create a payment
   */
  async createPayment(params: CreatePaymentParams): Promise<PaymentStatus> {
    return this.request("/payment", {
      method: "POST",
      body: JSON.stringify(params),
    });
  }

  /**
   * Create an invoice (alternative to payment - doesn't require payment tool setup)
   */
  async createInvoice(params: CreateInvoiceParams): Promise<Invoice> {
    return this.request("/invoice", {
      method: "POST",
      body: JSON.stringify(params),
    });
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(paymentId: string): Promise<PaymentStatus> {
    return this.request(`/payment/${paymentId}`);
  }

  /**
   * Get list of payments
   */
  async getPayments(params?: {
    limit?: number;
    page?: number;
    sortBy?: string;
    orderBy?: "asc" | "desc";
    dateFrom?: string;
    dateTo?: string;
  }): Promise<{ data: PaymentStatus[] }> {
    const queryParams = new URLSearchParams(
      params as Record<string, string>
    ).toString();
    return this.request(`/payment${queryParams ? `?${queryParams}` : ""}`);
  }

  /**
   * Verify IPN callback signature
   */
  verifyIPNSignature(
    body: string,
    signature: string,
    ipnSecret: string
  ): boolean {
    const crypto = require("crypto");
    const hmac = crypto.createHmac("sha512", ipnSecret);
    hmac.update(body);
    const expectedSignature = hmac.digest("hex");
    return signature === expectedSignature;
  }
}

// Export singleton instance
export const nowPayments = new NOWPaymentsClient();

// Export types
export type {
  PaymentStatus,
  CreatePaymentParams,
  EstimateParams,
  PaymentEstimate,
};
