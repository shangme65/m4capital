import { generateId } from "@/lib/generate-id";
import { getCurrencySymbol } from "@/lib/currencies";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";
import { sendWebPushToUser } from "@/lib/push-notifications";
import { validateBody, schemas } from "@/lib/api-validation";

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

    // Validate with Zod
    const validation = await validateBody(request, schemas.buyOrder);
    if (!validation.success) {
      return validation.error;
    }

    const { symbol, amount, price } = validation.data;

    // Calculate total cost in USD
    const totalCostUSD = amount * price;

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
          balanceCurrency: "USD",
          assets: [],
        },
      });
    }

    const balanceCurrency = portfolio.balanceCurrency || "USD";
    const currentBalance = parseFloat(portfolio.balance.toString());

    // Convert totalCost from USD to the portfolio's balance currency for comparison and deduction
    let totalCostInBalanceCurrency = totalCostUSD;
    if (balanceCurrency !== "USD") {
      const { getExchangeRates, convertCurrency } = await import(
        "@/lib/currencies"
      );
      const exchangeRates = await getExchangeRates();
      totalCostInBalanceCurrency = convertCurrency(
        totalCostUSD,
        balanceCurrency,
        exchangeRates
      );
    }

    // Check if user has enough balance (in their currency)
    if (currentBalance < totalCostInBalanceCurrency) {
      return NextResponse.json(
        {
          error: "Insufficient balance",
          required: totalCostInBalanceCurrency,
          available: currentBalance,
          currency: balanceCurrency,
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
          totalInvested: totalCostUSD,
        },
      ];
    }

    // Use transaction to atomically update portfolio and create trade record
    // Deduct the converted amount in the portfolio's currency
    const [updatedPortfolio, trade] = await prisma.$transaction([
      prisma.portfolio.update({
        where: { id: portfolio.id },
        data: {
          balance: {
            decrement: new Decimal(totalCostInBalanceCurrency),
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
            totalCostUSD: totalCostUSD,
            totalCostInBalanceCurrency: totalCostInBalanceCurrency,
            balanceCurrency: balanceCurrency,
            purchaseType: "SPOT",
          },
        },
      }),
    ]);

    const newBalance = parseFloat(updatedPortfolio.balance.toString());

    console.log(
      `✅ Crypto purchase: ${amount} ${symbol} for ${balanceCurrency} ${totalCostInBalanceCurrency.toFixed(
        2
      )} (USD $${totalCostUSD.toFixed(
        2
      )}) | New balance: ${balanceCurrency} ${newBalance}`
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
        let displayTotalCost = totalCostUSD;
        let displayNewBalance = newBalance;

        if (preferredCurrency !== "USD") {
          const exchangeRates = await getExchangeRates();
          displayPrice = convertCurrency(
            price,
            preferredCurrency,
            exchangeRates
          );
          displayTotalCost = convertCurrency(
            totalCostUSD,
            preferredCurrency,
            exchangeRates
          );
          // Note: newBalance is already in balanceCurrency
          if (balanceCurrency === preferredCurrency) {
            displayNewBalance = newBalance;
          } else {
            displayNewBalance = convertCurrency(
              newBalance,
              preferredCurrency,
              exchangeRates
            );
          }
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
      let displayAmount = totalCostUSD;
      const currencySymbol = getCurrencySymbol(userCurrency);

      if (userCurrency !== "USD") {
        // Fetch exchange rate
        const ratesResponse = await fetch(
          "https://api.frankfurter.app/latest?from=USD"
        );
        if (ratesResponse.ok) {
          const ratesData = await ratesResponse.json();
          const rate = ratesData.rates[userCurrency] || 1;
          displayAmount = totalCostUSD * rate;
        }
      }

      // Store the pre-converted display amount and user's currency as asset
      // This ensures notifications display correctly without re-conversion
      const notificationId = `notif_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      const notificationTitle = `You've bought ${assetName}`;
      const notificationMessage = `You successfully purchased ${amount.toFixed(
        8
      )} ${symbol} for ${currencySymbol}${displayAmount.toFixed(2)}`;

      await prisma.notification.create({
        data: {
          id: notificationId,
          userId: user.id,
          type: "TRANSACTION" as any,
          title: notificationTitle,
          message: notificationMessage,
          amount: Math.round(displayAmount * 100) / 100, // Store pre-converted amount
          asset: userCurrency, // Store user's currency, not crypto symbol
          read: false,
        },
      });

      // Send web push notification to user's devices
      await sendWebPushToUser(user.id, {
        title: notificationTitle,
        body: notificationMessage,
        icon: "/icons/icon-192.png",
        badge: "/icons/icon-96.png",
        tag: `m4capital-buy-${Date.now()}`,
        data: {
          url: "/dashboard",
          notificationId,
          type: "buy",
        },
        renotify: false,
        silent: false,
      });
      console.log(`🔔 Push notification sent for user ${user.id}`);
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
        totalCost: totalCostUSD,
        totalCostInBalanceCurrency,
        balanceCurrency,
        status: trade.status,
      },
      portfolio: {
        balance: newBalance,
        balanceCurrency,
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
