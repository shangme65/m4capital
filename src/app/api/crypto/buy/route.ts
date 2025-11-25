import { generateId } from "@/lib/generate-id";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";

export const dynamic = "force-dynamic";

// Crypto name mapping
const CRYPTO_NAMES: Record<string, string> = {
  BTC: "Bitcoin",
  ETH: "Ethereum",
  XRP: "Ripple",
  TRX: "Tron",
  TON: "Toncoin",
  LTC: "Litecoin",
  BCH: "Bitcoin Cash",
  ETC: "Ethereum Classic",
  USDC: "USD Coin",
  USDT: "Tether",
  BNB: "Binance Coin",
  SOL: "Solana",
  ADA: "Cardano",
  DOGE: "Dogecoin",
  DOT: "Polkadot",
  MATIC: "Polygon",
  AVAX: "Avalanche",
  LINK: "Chainlink",
  UNI: "Uniswap",
  ATOM: "Cosmos",
};

interface BuyCryptoRequest {
  symbol: string; // e.g., "BTC", "ETH"
  amount: number; // Amount of crypto to buy
  price: number; // Current price per unit
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body: BuyCryptoRequest = await request.json();
    const { symbol, amount, price } = body;

    // Validate required fields
    if (!symbol || !amount || !price) {
      return NextResponse.json(
        { error: "Missing required fields: symbol, amount, price" },
        { status: 400 }
      );
    }

    // Calculate total cost in USD
    const totalCost = amount * price;

    // Find user with portfolio
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { Portfolio: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create portfolio if it doesn't exist
    let portfolio = user.Portfolio;
    if (!portfolio) {
      portfolio = await prisma.portfolio.create({
        data: {
          id: generateId(),
          userId: user.id,
          balance: 0.0,
          assets: [],
        },
      });
    }

    const currentBalance = parseFloat(portfolio.balance.toString());

    // Check if user has enough balance
    if (currentBalance < totalCost) {
      return NextResponse.json(
        {
          error: "Insufficient balance",
          required: totalCost,
          available: currentBalance,
        },
        { status: 400 }
      );
    }

    // Update portfolio: deduct USD balance and add crypto asset
    const assets = portfolio.assets as any[];
    const existingAssetIndex = assets.findIndex((a) => a.symbol === symbol);

    let updatedAssets;
    if (existingAssetIndex >= 0) {
      // Add to existing asset
      updatedAssets = assets.map((asset, index) =>
        index === existingAssetIndex
          ? { ...asset, amount: asset.amount + amount }
          : asset
      );
    } else {
      // Add new asset with full structure (name, symbol, amount, etc.)
      const cryptoName = CRYPTO_NAMES[symbol] || symbol;
      updatedAssets = [
        ...assets,
        {
          symbol,
          name: cryptoName,
          amount,
          averagePrice: price,
          totalInvested: totalCost,
        },
      ];
    }

    // Use transaction to atomically update portfolio and create trade record
    const [updatedPortfolio, trade] = await prisma.$transaction([
      prisma.portfolio.update({
        where: { id: portfolio.id },
        data: {
          balance: {
            decrement: new Decimal(totalCost),
          },
          assets: updatedAssets,
        },
      }),
      prisma.trade.create({
        data: {
          id: generateId(),
          userId: user.id,
          symbol: symbol,
          side: "BUY",
          entryPrice: new Decimal(price),
          quantity: new Decimal(amount),
          profit: new Decimal(0),
          commission: new Decimal(0),
          status: "CLOSED",
          openedAt: new Date(),
          closedAt: new Date(),
          updatedAt: new Date(),
          metadata: {
            method: "USD_BALANCE",
            cryptoSymbol: symbol,
            cryptoAmount: amount,
            pricePerUnit: price,
            totalCost: totalCost,
            purchaseType: "SPOT",
          },
        },
      }),
    ]);

    const newBalance = parseFloat(updatedPortfolio.balance.toString());

    console.log(
      `✅ Crypto purchase: ${amount} ${symbol} for $${totalCost.toFixed(
        2
      )} | New balance: $${newBalance}`
    );

    // Send email notification
    try {
      console.log("📧 Starting email notification process...");

      const { sendEmail } = await import("@/lib/email");
      const { cryptoPurchaseTemplate, cryptoPurchaseTextTemplate } =
        await import("@/lib/email-templates");
      const { getCurrencySymbol, getExchangeRates, convertCurrency } =
        await import("@/lib/currencies");

      // Check if user has email notifications enabled and fetch preferred currency
      const userWithPrefs = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
          emailNotifications: true,
          email: true,
          name: true,
          preferredCurrency: true,
        },
      });

      console.log(`📧 User email preferences:`, {
        email: userWithPrefs?.email,
        emailNotifications: userWithPrefs?.emailNotifications,
        preferredCurrency: userWithPrefs?.preferredCurrency,
        hasSmtpUser: !!process.env.SMTP_USER,
        hasSmtpPass: !!process.env.SMTP_PASS,
        smtpHost: process.env.SMTP_HOST,
      });

      if (userWithPrefs?.emailNotifications && userWithPrefs.email) {
        console.log(`📧 Attempting to send email to ${userWithPrefs.email}...`);

        // Get user's preferred currency
        const preferredCurrency = userWithPrefs.preferredCurrency || "USD";
        const currencySymbol = getCurrencySymbol(preferredCurrency);

        // Convert amounts to user's preferred currency if not USD
        let displayPrice = price;
        let displayTotalCost = totalCost;
        let displayNewBalance = newBalance;

        if (preferredCurrency !== "USD") {
          const exchangeRates = await getExchangeRates();
          displayPrice = convertCurrency(
            price,
            preferredCurrency,
            exchangeRates
          );
          displayTotalCost = convertCurrency(
            totalCost,
            preferredCurrency,
            exchangeRates
          );
          displayNewBalance = convertCurrency(
            newBalance,
            preferredCurrency,
            exchangeRates
          );
        }

        const emailResult = await sendEmail({
          to: userWithPrefs.email,
          subject: `✅ Crypto Purchase Successful - ${amount.toFixed(
            8
          )} ${symbol}`,
          html: cryptoPurchaseTemplate(
            userWithPrefs.name || "User",
            symbol,
            amount,
            displayPrice,
            displayTotalCost,
            displayNewBalance,
            preferredCurrency,
            currencySymbol
          ),
          text: cryptoPurchaseTextTemplate(
            userWithPrefs.name || "User",
            symbol,
            amount,
            displayPrice,
            displayTotalCost,
            displayNewBalance,
            preferredCurrency,
            currencySymbol
          ),
        });

        console.log(`📧 Email sent successfully:`, emailResult);
      } else {
        console.log(
          "📧 Email not sent - user has notifications disabled or no email"
        );
      }
    } catch (emailError) {
      console.error("❌ Failed to send email notification:", emailError);
      if (emailError instanceof Error) {
        console.error("❌ Email error details:", emailError.message);
        console.error("❌ Email error stack:", emailError.stack);
      }
      // Don't fail the transaction if email fails
    }

    // Send push notification
    try {
      // Get user's preferred currency
      const userCurrency = user.preferredCurrency || "USD";
      const assetName =
        symbol === "BTC"
          ? "Bitcoin"
          : symbol === "ETH"
          ? "Ethereum"
          : symbol === "XRP"
          ? "Ripple"
          : symbol === "LTC"
          ? "Litecoin"
          : symbol === "BCH"
          ? "Bitcoin Cash"
          : symbol === "ETC"
          ? "Ethereum Classic"
          : symbol === "TRX"
          ? "Tron"
          : symbol === "TON"
          ? "Toncoin"
          : symbol === "USDC"
          ? "USD Coin"
          : symbol === "USDT"
          ? "Tether"
          : symbol;

      // Convert amount to user's preferred currency
      let displayAmount = totalCost;
      let currencySymbol = "$";

      if (userCurrency !== "USD") {
        // Fetch exchange rate
        const ratesResponse = await fetch(
          "https://api.frankfurter.app/latest?from=USD"
        );
        if (ratesResponse.ok) {
          const ratesData = await ratesResponse.json();
          const rate = ratesData.rates[userCurrency] || 1;
          displayAmount = totalCost * rate;
          currencySymbol =
            userCurrency === "EUR"
              ? "€"
              : userCurrency === "GBP"
              ? "£"
              : userCurrency === "JPY"
              ? "¥"
              : userCurrency;
        }
      }

      await prisma.notification.create({
        data: {
          id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: user.id,
          type: "TRANSACTION" as any,
          title: `You've bought ${assetName}`,
          message: `You successfully purchased ${amount.toFixed(
            8
          )} ${symbol} for ${currencySymbol}${displayAmount.toFixed(2)}`,
          amount: totalCost,
          asset: symbol,
          read: false,
        },
      });
      console.log(`🔔 Push notification created for user ${user.id}`);
    } catch (notifError) {
      console.error("Failed to create push notification:", notifError);
      // Don't fail the transaction if notification fails
    }

    return NextResponse.json({
      success: true,
      trade: {
        id: trade.id,
        symbol,
        amount,
        price,
        totalCost,
        status: trade.status,
      },
      portfolio: {
        balance: newBalance,
        assets: updatedPortfolio.assets,
      },
    });
  } catch (error) {
    console.error("❌ Crypto purchase error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to purchase crypto",
      },
      { status: 500 }
    );
  }
}
