import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { nowPayments } from "@/lib/nowpayments";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const {
      amount,
      currency = "USD",
      paymentMethod,
      cryptoType,
    } = await request.json();

    // Validate input
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Valid amount is required" },
        { status: 400 }
      );
    }

    if (
      !paymentMethod ||
      !["crypto", "credit_card", "bank_transfer"].includes(paymentMethod)
    ) {
      return NextResponse.json(
        { error: "Valid payment method is required" },
        { status: 400 }
      );
    }

    // Find user with portfolio
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { portfolio: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create or get portfolio
    let portfolio = user.portfolio;
    if (!portfolio) {
      portfolio = await prisma.portfolio.create({
        data: {
          userId: user.id,
          balance: 0.0,
          assets: [],
        },
      });
    }

    // Generate transaction ID
    const transactionId = `dep_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Handle crypto payments via NowPayments
    if (paymentMethod === "crypto") {
      try {
        // Create NowPayments payment
        const payCurrency = (cryptoType || "BTC").toLowerCase();
        const payment = await nowPayments.createPayment({
          price_amount: amount,
          price_currency: currency,
          pay_currency: payCurrency,
          order_id: transactionId,
          order_description: `Deposit ${amount} ${currency}`,
          ipn_callback_url: `${process.env.NEXTAUTH_URL}/api/payment/webhook`,
        });

        // Create deposit record with NowPayments data
        const deposit = await prisma.deposit.create({
          data: {
            portfolioId: portfolio.id,
            amount: amount,
            currency: currency.toUpperCase(),
            status: "PENDING",
            method: `NOWPAYMENTS_${payCurrency.toUpperCase()}`,
            paymentId: payment.payment_id,
            paymentAddress: payment.pay_address,
            paymentAmount: payment.pay_amount,
            cryptoCurrency: payment.pay_currency.toUpperCase(),
            paymentStatus: payment.payment_status,
          },
        });

        return NextResponse.json({
          success: true,
          deposit: {
            id: deposit.id,
            transactionId: transactionId,
            amount: parseFloat(deposit.amount.toString()),
            currency: deposit.currency,
            status: deposit.status,
            paymentMethod,
            createdAt: deposit.createdAt,
          },
          paymentInstructions: {
            type: "crypto",
            address: payment.pay_address,
            cryptoType: payment.pay_currency.toUpperCase(),
            amount: payment.pay_amount,
            amountUSD: amount,
            network:
              payment.network ||
              (payCurrency === "btc" ? "Bitcoin" : "Ethereum"),
            paymentId: payment.payment_id,
            expiresAt: payment.expiration_estimate_date,
            instructions: [
              `Send exactly ${
                payment.pay_amount
              } ${payment.pay_currency.toUpperCase()} to the address above`,
              "Include the exact amount to avoid processing delays",
              "Transaction will be confirmed automatically",
              "Do not close this page until payment is confirmed",
            ],
          },
        });
      } catch (error) {
        console.error("NowPayments API error:", error);
        return NextResponse.json(
          {
            error: "Failed to create crypto payment",
            details: error instanceof Error ? error.message : "Unknown error",
          },
          { status: 500 }
        );
      }
    }

    // Handle non-crypto payments (credit card, bank transfer)
    const deposit = await prisma.deposit.create({
      data: {
        portfolioId: portfolio.id,
        amount: amount,
        currency: currency.toUpperCase(),
        status: "COMPLETED",
        method: paymentMethod.toUpperCase(),
      },
    });

    // Update portfolio balance for completed payments
    await prisma.portfolio.update({
      where: { id: portfolio.id },
      data: {
        balance: {
          increment: amount,
        },
      },
    });

    // Get payment instructions
    const paymentInstructions = getPaymentInstructions(
      paymentMethod,
      undefined,
      amount,
      currency
    );

    return NextResponse.json({
      success: true,
      deposit: {
        id: deposit.id,
        transactionId: transactionId, // We'll store this when migration is applied
        amount: parseFloat(deposit.amount.toString()),
        currency: deposit.currency,
        status: deposit.status,
        paymentMethod,
        createdAt: deposit.createdAt,
      },
      paymentInstructions,
    });
  } catch (error) {
    console.error("Deposit API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Generate payment instructions for non-crypto payments
function getPaymentInstructions(
  paymentMethod: string,
  cryptoType?: string,
  amount?: number,
  currency?: string
) {
  switch (paymentMethod) {
    case "credit_card":
      return {
        type: "credit_card",
        instructions: [
          "Your card will be charged immediately",
          "Funds will appear in your account within minutes",
          "A confirmation email will be sent to your registered email",
          "Transaction fees may apply",
        ],
        processingTime: "1-3 minutes",
      };

    case "bank_transfer":
      return {
        type: "bank_transfer",
        instructions: [
          "Use the following details for bank transfer:",
          "Account Name: M4Capital Ltd",
          "Account Number: 1234567890",
          "Routing Number: 021000021",
          "Reference: Include your account email as reference",
          "Processing time: 1-3 business days",
        ],
        processingTime: "1-3 business days",
      };

    default:
      return {
        type: "unknown",
        instructions: ["Please contact support for assistance"],
      };
  }
}
