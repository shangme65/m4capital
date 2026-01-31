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

interface Asset {
  symbol: string;
  amount: number;
  name?: string;
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
    const validation = await validateBody(request, schemas.sellOrder);
    if (!validation.success) {
      return validation.error;
    }

    const { symbol, amount, price } = validation.data;

    // Calculate total value in USD
    const totalValue = amount * price;
    const fee = totalValue * 0.015; // 1.5% fee
    const netReceivedUSD = totalValue - fee;

    // Find user with portfolio
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { Portfolio: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.Portfolio) {
      return NextResponse.json(
        { error: "Portfolio not found" },
        { status: 404 }
      );
    }

    const portfolio = user.Portfolio;
    const balanceCurrency = portfolio.balanceCurrency || "USD";

    // Convert netReceived from USD to the portfolio's balance currency
    let netReceivedInBalanceCurrency = netReceivedUSD;
    if (balanceCurrency !== "USD") {
      const { getExchangeRates, convertCurrency } = await import(
        "@/lib/currencies"
      );
      const exchangeRates = await getExchangeRates();
      netReceivedInBalanceCurrency = convertCurrency(
        netReceivedUSD,
        balanceCurrency,
        exchangeRates
      );
    }

    // Parse current assets with proper typing
    const currentAssets: Asset[] = Array.isArray(portfolio.assets)
      ? (portfolio.assets as unknown as Asset[])
      : [];

    // Find the asset
    const assetIndex = currentAssets.findIndex((a) => a.symbol === symbol);

    if (assetIndex === -1) {
      return NextResponse.json(
        { error: `You don't own any ${symbol}` },
        { status: 400 }
      );
    }

    const currentAsset: Asset = currentAssets[assetIndex];

    // Check if user has enough
    if (currentAsset.amount < amount) {
      return NextResponse.json(
        {
          error: `Insufficient ${symbol}. You have ${currentAsset.amount} but tried to sell ${amount}`,
        },
        { status: 400 }
      );
    }

    // Update assets array
    let updatedAssets: Asset[];
    if (currentAsset.amount === amount) {
      // Remove asset completely if selling all
      updatedAssets = currentAssets.filter((a) => a.symbol !== symbol);
    } else {
      // Reduce amount
      updatedAssets = currentAssets.map((a) =>
        a.symbol === symbol ? { ...a, amount: a.amount - amount } : a
      );
    }

    // Update portfolio balance - add the converted amount in the portfolio's currency
    const newBalance = new Decimal(portfolio.balance).plus(
      netReceivedInBalanceCurrency
    );

    const [updatedPortfolio, trade] = await prisma.$transaction([
      prisma.portfolio.update({
        where: { id: portfolio.id },
        data: {
          balance: newBalance,
          assets: updatedAssets as any,
        },
      }),
      prisma.trade.create({
        data: {
          id: generateId(),
          userId: user.id,
          symbol: symbol,
          side: "SELL",
          entryPrice: new Decimal(price),
          quantity: new Decimal(amount),
          profit: new Decimal(netReceivedUSD - amount * price),
          commission: new Decimal(fee),
          status: "CLOSED",
          openedAt: new Date(),
          closedAt: new Date(),
          updatedAt: new Date(),
          metadata: {
            method: "USD_BALANCE",
            cryptoSymbol: symbol,
            cryptoAmount: amount,
            pricePerUnit: price,
            totalValue: totalValue,
            fee: fee,
            netReceived: netReceivedUSD,
            netReceivedInBalanceCurrency: netReceivedInBalanceCurrency,
            balanceCurrency: balanceCurrency,
            saleType: "SPOT",
          },
        },
      }),
    ]);

    console.log(
      `✅ Crypto sale: ${amount} ${symbol} for ${balanceCurrency} ${netReceivedInBalanceCurrency.toFixed(
        2
      )} (USD $${netReceivedUSD.toFixed(
        2
      )}) | New balance: ${balanceCurrency} ${parseFloat(
        newBalance.toString()
      )}`
    );

    // Send email notification
    try {
      console.log("📧 Starting email notification process for sell...");

      const { sendEmail } = await import("@/lib/email");
      const { cryptoSaleTemplate, cryptoSaleTextTemplate } = await import("@/lib/email-templates");
      const { getCurrencySymbol, getExchangeRates, convertCurrency } =
        await import("@/lib/currencies");

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
        let displayTotalValue = totalValue;
        let displayFee = fee;
        let displayNetReceived = netReceivedUSD;
        let displayNewBalance = parseFloat(newBalance.toString());

        if (preferredCurrency !== "USD") {
          const exchangeRates = await getExchangeRates();
          displayPrice = convertCurrency(
            price,
            preferredCurrency,
            exchangeRates
          );
          displayTotalValue = convertCurrency(
            totalValue,
            preferredCurrency,
            exchangeRates
          );
          displayFee = convertCurrency(fee, preferredCurrency, exchangeRates);
          displayNetReceived = convertCurrency(
            netReceivedUSD,
            preferredCurrency,
            exchangeRates
          );
          // Note: newBalance is already in balanceCurrency, convert from that
          if (balanceCurrency === preferredCurrency) {
            displayNewBalance = parseFloat(newBalance.toString());
          } else {
            // If balanceCurrency differs from preferredCurrency, we need to convert
            displayNewBalance = convertCurrency(
              parseFloat(newBalance.toString()),
              preferredCurrency,
              exchangeRates
            );
          }
        }

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

        const emailResult = await sendEmail({
          to: userWithPrefs.email,
          subject: `✅ Crypto Sale Successful - ${amount.toFixed(8)} ${symbol}`,
          html: cryptoSaleTemplate(
            userWithPrefs.name || "User",
            symbol,
            assetName,
            amount,
            displayPrice,
            displayTotalValue,
            displayFee,
            displayNetReceived,
            displayNewBalance,
            currencySymbol
          ),
          text: cryptoSaleTextTemplate(
            userWithPrefs.name || "User",
            symbol,
            assetName,
            amount,
            displayPrice,
            displayTotalValue,
            displayFee,
            displayNetReceived,
            displayNewBalance,
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
    }

    // Send push notification
    try {
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

      let displayAmount = netReceivedUSD;
      const currencySymbol = getCurrencySymbol(userCurrency);

      if (userCurrency !== "USD") {
        const ratesResponse = await fetch(
          "https://api.frankfurter.app/latest?from=USD"
        );
        if (ratesResponse.ok) {
          const ratesData = await ratesResponse.json();
          const rate = ratesData.rates[userCurrency] || 1;
          displayAmount = netReceivedUSD * rate;
        }
      }

      // Send web push notification to user's devices (in-app notification created by crypto-actions)
      const notificationId = `notif_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      const notificationTitle = `You've sold ${assetName}`;
      const notificationMessage = `Successfully sold ${amount.toFixed(
        8
      )} ${symbol} for ${currencySymbol}${displayAmount.toFixed(2)}`;

      await sendWebPushToUser(user.id, {
        title: notificationTitle,
        body: notificationMessage,
        icon: "/icons/icon-192.png",
        badge: "/icons/icon-96.png",
        tag: `m4capital-sell-${Date.now()}`,
        data: {
          url: "/dashboard",
          notificationId,
          type: "sell",
        },
        renotify: false,
        silent: false,
      });
      console.log(`🔔 Push notification sent for user ${user.id}`);
    } catch (notifError) {
      console.error("Failed to create push notification:", notifError);
    }

    return NextResponse.json({
      success: true,
      message: `Successfully sold ${amount} ${symbol}`,
      totalValue,
      fee,
      netReceived: netReceivedUSD,
      netReceivedInBalanceCurrency,
      balanceCurrency,
      newBalance: parseFloat(newBalance.toString()),
    });
  } catch (error) {
    console.error("Error selling crypto:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
