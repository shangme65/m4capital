import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { nowPayments } from "@/lib/nowpayments";
import { generateId } from "@/lib/generate-id";

// ─── Plan Definitions ────────────────────────────────────────────────────────

export const MINING_PLANS: Record<
  string,
  {
    name: string;
    hashrate: string;
    hashrateValue: number;
    hashrateUnit: string;
    price: number;
    duration: number;
    algorithm: string;
    coin: string;
    dailyProfit: string;
    popular?: boolean;
  }
> = {
  starter: {
    name: "Starter",
    hashrate: "50 TH/s",
    hashrateValue: 50,
    hashrateUnit: "TH/s",
    price: 14999,
    duration: 30,
    algorithm: "SHA-256",
    coin: "BTC",
    dailyProfit: "0.03856 BTC", // $2,313.33/day · total $69,400 over 30d
  },
  basic: {
    name: "Basic",
    hashrate: "150 TH/s",
    hashrateValue: 150,
    hashrateUnit: "TH/s",
    price: 29999,
    duration: 60,
    algorithm: "SHA-256",
    coin: "BTC",
    dailyProfit: "0.04241 BTC", // $2,544.67/day (+10%) · total $152,680 over 60d
  },
  standard: {
    name: "Standard",
    hashrate: "500 TH/s",
    hashrateValue: 500,
    hashrateUnit: "TH/s",
    price: 49999,
    duration: 90,
    algorithm: "SHA-256",
    coin: "BTC",
    dailyProfit: "0.04665 BTC", // $2,799.13/day (+10%) · total $251,922 over 90d
  },
  professional: {
    name: "Professional",
    hashrate: "1.5 PH/s",
    hashrateValue: 1500,
    hashrateUnit: "TH/s",
    price: 99999,
    duration: 120,
    algorithm: "SHA-256",
    coin: "BTC",
    dailyProfit: "0.05132 BTC", // $3,079.05/day (+10%) · total $369,486 over 120d
    popular: true,
  },
  advanced: {
    name: "Advanced",
    hashrate: "5 PH/s",
    hashrateValue: 5000,
    hashrateUnit: "TH/s",
    price: 199999,
    duration: 180,
    algorithm: "SHA-256",
    coin: "BTC",
    dailyProfit: "0.05645 BTC", // $3,386.95/day (+10%) · total $609,651 over 180d
  },
  enterprise: {
    name: "Enterprise",
    hashrate: "15 PH/s",
    hashrateValue: 15000,
    hashrateUnit: "TH/s",
    price: 499999,
    duration: 365,
    algorithm: "SHA-256",
    coin: "BTC",
    dailyProfit: "0.07903 BTC", // $4,741.73/day (+40% bonus) · total $1,730,732 over 365d
  },
};

// Supported crypto currencies for plan purchase
const SUPPORTED_PURCHASE_CRYPTOS = ["btc", "eth", "usdttrc20", "ltc", "bnbbsc"];

// ─── POST /api/mining/purchase ───────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      planId,
      paymentMethod,
      cryptoCurrency = "btc",
    }: {
      planId: string;
      paymentMethod: "FIAT" | "CRYPTO";
      cryptoCurrency?: string;
    } = body;

    // Validate plan
    const plan = MINING_PLANS[planId];
    if (!plan) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    // Validate payment method
    if (!paymentMethod || !["FIAT", "CRYPTO"].includes(paymentMethod)) {
      return NextResponse.json(
        { error: "Invalid payment method" },
        { status: 400 },
      );
    }

    const userId = session.user.id;

    // ─── FIAT Payment ─────────────────────────────────────────────────────

    if (paymentMethod === "FIAT") {
      const portfolio = await prisma.portfolio.findUnique({
        where: { userId },
      });
      if (!portfolio) {
        return NextResponse.json(
          { error: "Portfolio not found" },
          { status: 404 },
        );
      }

      const balance = Number(portfolio.balance);
      if (balance < plan.price) {
        return NextResponse.json(
          {
            error: `Insufficient balance. You need $${plan.price.toLocaleString()} but have $${balance.toFixed(2)}.`,
          },
          { status: 400 },
        );
      }

      // Deduct from portfolio and create contract atomically
      const [, contract] = await prisma.$transaction([
        prisma.portfolio.update({
          where: { id: portfolio.id },
          data: { balance: { decrement: plan.price } },
        }),
        prisma.miningContract.create({
          data: {
            id: generateId(),
            userId,
            planName: plan.name,
            coin: plan.coin,
            algorithm: plan.algorithm,
            hashrate: plan.hashrate,
            hashrateValue: plan.hashrateValue,
            hashrateUnit: plan.hashrateUnit,
            price: plan.price,
            currency: "USD",
            duration: plan.duration,
            status: "ACTIVE",
            endDate: new Date(Date.now() + plan.duration * 24 * 60 * 60 * 1000),
          },
        }),
      ]);

      // Create notification
      await prisma.notification.create({
        data: {
          id: generateId(),
          userId,
          type: "INFO",
          title: "Mining Contract Activated",
          message: `Your ${plan.name} mining contract (${plan.hashrate}) is now active!`,
          amount: plan.price,
          asset: "USD",
        },
      });

      return NextResponse.json({
        success: true,
        paymentMethod: "FIAT",
        contract,
        message: `${plan.name} plan activated! Mining starts now.`,
      });
    }

    // ─── CRYPTO Payment ───────────────────────────────────────────────────

    const cryptoKey = cryptoCurrency.toLowerCase();
    if (!SUPPORTED_PURCHASE_CRYPTOS.includes(cryptoKey)) {
      return NextResponse.json(
        { error: `Unsupported crypto: ${cryptoCurrency}` },
        { status: 400 },
      );
    }

    const callbackUrl = process.env.NEXTAUTH_URL
      ? `${process.env.NEXTAUTH_URL}/api/mining/purchase/callback`
      : undefined;

    // Create pending contract first so we have an ID
    const pendingContract = await prisma.miningContract.create({
      data: {
        id: generateId(),
        userId,
        planName: plan.name,
        coin: plan.coin,
        algorithm: plan.algorithm,
        hashrate: plan.hashrate,
        hashrateValue: plan.hashrateValue,
        hashrateUnit: plan.hashrateUnit,
        price: plan.price,
        currency: "USD",
        duration: plan.duration,
        status: "PENDING",
        endDate: new Date(Date.now() + plan.duration * 24 * 60 * 60 * 1000),
      },
    });

    // Create NowPayments payment
    let payment;
    try {
      payment = await nowPayments.createPayment({
        price_amount: plan.price,
        price_currency: "usd",
        pay_currency: cryptoKey,
        order_id: pendingContract.id,
        order_description: `M4Capital Mining - ${plan.name} Plan`,
        ...(callbackUrl ? { ipn_callback_url: callbackUrl } : {}),
      });
    } catch (paymentError: any) {
      // Try invoice as fallback
      try {
        const invoice = await nowPayments.createInvoice({
          price_amount: plan.price,
          price_currency: "usd",
          pay_currency: cryptoKey,
          order_id: pendingContract.id,
          order_description: `M4Capital Mining - ${plan.name} Plan`,
          ...(callbackUrl ? { ipn_callback_url: callbackUrl } : {}),
        });
        // For invoices, redirect to the invoice URL
        return NextResponse.json({
          success: true,
          paymentMethod: "CRYPTO",
          paymentType: "INVOICE",
          invoiceUrl: invoice.invoice_url,
          contractId: pendingContract.id,
          planName: plan.name,
          amount: plan.price,
          currency: "USD",
        });
      } catch {
        // Clean up pending contract
        await prisma.miningContract.delete({
          where: { id: pendingContract.id },
        });
        throw paymentError;
      }
    }

    return NextResponse.json({
      success: true,
      paymentMethod: "CRYPTO",
      paymentType: "DIRECT",
      paymentId: payment.payment_id,
      payAddress: payment.pay_address,
      payAmount: payment.pay_amount,
      payCurrency: payment.pay_currency,
      expiresAt: payment.expiration_estimate_date,
      contractId: pendingContract.id,
      planName: plan.name,
      priceAmount: plan.price,
      priceCurrency: "USD",
    });
  } catch (error: any) {
    console.error("[mining/purchase] error:", error);
    return NextResponse.json(
      { error: error?.message ?? "Internal server error" },
      { status: 500 },
    );
  }
}

// ─── GET /api/mining/purchase — return plans list ────────────────────────────

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Also return user's fiat balance so front-end can show it
    const portfolio = await prisma.portfolio.findUnique({
      where: { userId: session.user.id },
      select: { balance: true, balanceCurrency: true },
    });

    return NextResponse.json({
      plans: MINING_PLANS,
      balance: Number(portfolio?.balance ?? 0),
      balanceCurrency: portfolio?.balanceCurrency ?? "USD",
    });
  } catch (error) {
    console.error("[mining/purchase GET] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
