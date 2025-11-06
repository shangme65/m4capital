import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    // Create deposit record (using only existing fields for now)
    const deposit = await prisma.deposit.create({
      data: {
        portfolioId: portfolio.id,
        amount: amount,
        currency: currency.toUpperCase(),
        status: paymentMethod === "crypto" ? "PENDING" : "COMPLETED",
        // Note: type, transactionId, and metadata fields will be added after migration
      },
    });

    // If payment is completed (non-crypto), update user's portfolio balance
    if (paymentMethod !== "crypto") {
      await prisma.portfolio.update({
        where: { id: portfolio.id },
        data: {
          balance: {
            increment: amount,
          },
        },
      });
    }

    // Get payment instructions
    const paymentInstructions = getPaymentInstructions(
      paymentMethod,
      cryptoType,
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

// TODO: REPLACE WITH REAL CRYPTO WALLET SERVICE INTEGRATION
// This function generates FAKE addresses and must be replaced with:
// - Integration with NowPayments, Coinbase Commerce, or similar payment gateway
// - Real wallet address generation per user/transaction
// - Proper transaction tracking and confirmations
// - NEVER use these hardcoded addresses in production
function generateCryptoAddress(cryptoType: string): string {
  const addresses = {
    BTC: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    ETH: "0x742d35Cc6734C0532925a3b8D6E382dE0C86E6a0",
    USDT: "0x742d35Cc6734C0532925a3b8D6E382dE0C86E6a0",
    LTC: "LQTpS7xRbVXz5xrXhQk1UL8N8gUjBZqm1H",
  };

  return addresses[cryptoType as keyof typeof addresses] || addresses.BTC;
}

// Generate payment instructions based on method
function getPaymentInstructions(
  paymentMethod: string,
  cryptoType?: string,
  amount?: number,
  currency?: string
) {
  switch (paymentMethod) {
    case "crypto":
      return {
        type: "crypto",
        address: generateCryptoAddress(cryptoType || "BTC"),
        cryptoType: cryptoType || "BTC",
        amount: amount,
        network:
          cryptoType === "ETH" || cryptoType === "USDT"
            ? "Ethereum"
            : "Bitcoin",
        instructions: [
          `Send exactly ${amount} ${cryptoType || "BTC"} to the address above`,
          "Include the exact amount to avoid processing delays",
          "Transaction will be confirmed within 30 minutes",
          "Contact support if you have any issues",
        ],
      };

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
