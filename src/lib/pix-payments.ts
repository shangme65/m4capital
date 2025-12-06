/**
 * PIX Payment API Integration for Brazil
 *
 * This module provides integration with Brazilian PIX instant payment system.
 * PIX is the Brazilian Central Bank's instant payment system.
 *
 * Supported PIX Payment Providers:
 * - Mercado Pago (recommended)
 * - PagSeguro
 * - Asaas
 * - Stripe (Brazil)
 */

const API_BASE_URL =
  process.env.PIX_PROVIDER === "mercadopago"
    ? "https://api.mercadopago.com"
    : process.env.PIX_PROVIDER === "asaas"
    ? "https://www.asaas.com/api/v3"
    : "https://api.pagseguro.com";

// Lazy load to avoid build-time warnings
const getAccessToken = () => process.env.PIX_API_TOKEN || "";
const PIX_ENABLED = process.env.PIX_ENABLED === "true";

export interface PIXPaymentRequest {
  amount: number;
  description: string;
  payerEmail: string;
  payerName: string;
  payerDocument: string; // CPF or CNPJ
  expirationMinutes?: number;
}

export interface PIXPaymentResponse {
  paymentId: string;
  qrCode: string; // QR Code image (base64 or URL)
  qrCodeText: string; // QR Code payload for copy/paste
  pixKey?: string;
  expiresAt: Date;
  status: "pending" | "paid" | "expired" | "cancelled";
  amount: number;
}

export interface PIXWebhookPayload {
  id: string;
  status: "approved" | "pending" | "cancelled" | "refunded";
  transactionAmount: number;
  dateApproved?: string;
  payerEmail?: string;
  paymentMethodId: string;
}

class PIXPaymentClient {
  private baseUrl: string;
  private provider: string;
  private _tokenChecked: boolean = false;

  constructor() {
    this.baseUrl = API_BASE_URL;
    this.provider = process.env.PIX_PROVIDER || "mercadopago";
  }

  private get accessToken(): string {
    const token = getAccessToken();
    // Only warn once and only at runtime (not during build)
    if (!this._tokenChecked && typeof window !== "undefined") {
      this._tokenChecked = true;
      if (!token) {
        console.warn(
          "⚠️ PIX API token not configured. PIX payments will not work."
        );
      }
    }
    return token;
  }

  /**
   * Check if PIX is enabled and properly configured
   */
  isEnabled(): boolean {
    return PIX_ENABLED && !!getAccessToken();
  }

  /**
   * Create a PIX payment
   */
  async createPayment(data: PIXPaymentRequest): Promise<PIXPaymentResponse> {
    if (!this.isEnabled()) {
      throw new Error("PIX payments are not enabled");
    }

    try {
      switch (this.provider) {
        case "mercadopago":
          return await this.createMercadoPagoPayment(data);
        case "asaas":
          return await this.createAsaasPayment(data);
        case "pagseguro":
          return await this.createPagSeguroPayment(data);
        default:
          throw new Error(`Unsupported PIX provider: ${this.provider}`);
      }
    } catch (error) {
      console.error("PIX payment creation error:", error);
      throw error;
    }
  }

  /**
   * Check payment status
   */
  async getPaymentStatus(paymentId: string): Promise<PIXPaymentResponse> {
    if (!this.isEnabled()) {
      throw new Error("PIX payments are not enabled");
    }

    try {
      switch (this.provider) {
        case "mercadopago":
          return await this.getMercadoPagoStatus(paymentId);
        case "asaas":
          return await this.getAsaasStatus(paymentId);
        case "pagseguro":
          return await this.getPagSeguroStatus(paymentId);
        default:
          throw new Error(`Unsupported PIX provider: ${this.provider}`);
      }
    } catch (error) {
      console.error("PIX status check error:", error);
      throw error;
    }
  }

  /**
   * Mercado Pago Implementation
   */
  private async createMercadoPagoPayment(
    data: PIXPaymentRequest
  ): Promise<PIXPaymentResponse> {
    const response = await fetch(`${this.baseUrl}/v1/payments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
        "X-Idempotency-Key": `${Date.now()}-${Math.random()}`,
      },
      body: JSON.stringify({
        transaction_amount: data.amount,
        description: data.description,
        payment_method_id: "pix",
        payer: {
          email: data.payerEmail,
          first_name: data.payerName.split(" ")[0],
          last_name:
            data.payerName.split(" ").slice(1).join(" ") || data.payerName,
          identification: {
            type: data.payerDocument.length === 11 ? "CPF" : "CNPJ",
            number: data.payerDocument.replace(/\D/g, ""),
          },
        },
        date_of_expiration: new Date(
          Date.now() + (data.expirationMinutes || 30) * 60000
        ).toISOString(),
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create PIX payment");
    }

    const payment = await response.json();

    return {
      paymentId: payment.id.toString(),
      qrCode: payment.point_of_interaction.transaction_data.qr_code_base64,
      qrCodeText: payment.point_of_interaction.transaction_data.qr_code,
      expiresAt: new Date(payment.date_of_expiration),
      status: this.mapMercadoPagoStatus(payment.status),
      amount: payment.transaction_amount,
    };
  }

  private async getMercadoPagoStatus(
    paymentId: string
  ): Promise<PIXPaymentResponse> {
    const response = await fetch(`${this.baseUrl}/v1/payments/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to get payment status");
    }

    const payment = await response.json();

    return {
      paymentId: payment.id.toString(),
      qrCode:
        payment.point_of_interaction?.transaction_data?.qr_code_base64 || "",
      qrCodeText: payment.point_of_interaction?.transaction_data?.qr_code || "",
      expiresAt: new Date(payment.date_of_expiration),
      status: this.mapMercadoPagoStatus(payment.status),
      amount: payment.transaction_amount,
    };
  }

  private mapMercadoPagoStatus(
    status: string
  ): "pending" | "paid" | "expired" | "cancelled" {
    switch (status) {
      case "approved":
        return "paid";
      case "pending":
      case "in_process":
        return "pending";
      case "cancelled":
      case "rejected":
        return "cancelled";
      default:
        return "expired";
    }
  }

  /**
   * Asaas Implementation
   */
  private async createAsaasPayment(
    data: PIXPaymentRequest
  ): Promise<PIXPaymentResponse> {
    const response = await fetch(`${this.baseUrl}/payments`, {
      method: "POST",
      headers: {
        access_token: this.accessToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        billingType: "PIX",
        value: data.amount,
        dueDate: new Date(Date.now() + (data.expirationMinutes || 30) * 60000)
          .toISOString()
          .split("T")[0],
        description: data.description,
        customer: data.payerDocument,
        externalReference: `m4capital-${Date.now()}`,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.errors?.[0]?.description || "Failed to create PIX payment"
      );
    }

    const payment = await response.json();

    // Get PIX QR Code
    const pixResponse = await fetch(
      `${this.baseUrl}/payments/${payment.id}/pixQrCode`,
      {
        headers: {
          access_token: this.accessToken,
        },
      }
    );

    const pixData = await pixResponse.json();

    return {
      paymentId: payment.id,
      qrCode: pixData.encodedImage,
      qrCodeText: pixData.payload,
      expiresAt: new Date(payment.dueDate),
      status: this.mapAsaasStatus(payment.status),
      amount: payment.value,
    };
  }

  private async getAsaasStatus(paymentId: string): Promise<PIXPaymentResponse> {
    const response = await fetch(`${this.baseUrl}/payments/${paymentId}`, {
      headers: {
        access_token: this.accessToken,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to get payment status");
    }

    const payment = await response.json();

    // Get PIX QR Code
    const pixResponse = await fetch(
      `${this.baseUrl}/payments/${paymentId}/pixQrCode`,
      {
        headers: {
          access_token: this.accessToken,
        },
      }
    );

    const pixData = await pixResponse.json();

    return {
      paymentId: payment.id,
      qrCode: pixData.encodedImage,
      qrCodeText: pixData.payload,
      expiresAt: new Date(payment.dueDate),
      status: this.mapAsaasStatus(payment.status),
      amount: payment.value,
    };
  }

  private mapAsaasStatus(
    status: string
  ): "pending" | "paid" | "expired" | "cancelled" {
    switch (status) {
      case "RECEIVED":
      case "CONFIRMED":
        return "paid";
      case "PENDING":
        return "pending";
      case "OVERDUE":
        return "expired";
      default:
        return "cancelled";
    }
  }

  /**
   * PagSeguro Implementation (placeholder - implement based on their API)
   */
  private async createPagSeguroPayment(
    data: PIXPaymentRequest
  ): Promise<PIXPaymentResponse> {
    throw new Error("PagSeguro PIX integration not yet implemented");
  }

  private async getPagSeguroStatus(
    paymentId: string
  ): Promise<PIXPaymentResponse> {
    throw new Error("PagSeguro PIX integration not yet implemented");
  }
}

// Export singleton instance
export const pixPayments = new PIXPaymentClient();
