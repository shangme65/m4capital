import { generateId } from "@/lib/generate-id";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";

export const dynamic = "force-dynamic";

interface SellCryptoRequest {
  symbol: string; // e.g., "BTC", "ETH"
  amount: number; // Amount of crypto to sell
  price: number; // Current price per unit
}

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

    const body: SellCryptoRequest = await request.json();
    const { symbol, amount, price } = body;

    // Validate required fields
    if (!symbol || !amount || !price) {
      return NextResponse.json(
        { error: "Missing required fields: symbol, amount, price" },
        { status: 400 }
      );
    }

    // Calculate total value in USD
    const totalValue = amount * price;
    const fee = totalValue * 0.015; // 1.5% fee
    const netReceived = totalValue - fee;

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

    // Update portfolio and create trade record
    const newBalance = new Decimal(portfolio.balance).plus(netReceived);

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
          profit: new Decimal(netReceived - amount * price),
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
            netReceived: netReceived,
            saleType: "SPOT",
          },
        },
      }),
    ]);

    console.log(
      `✅ Crypto sale: ${amount} ${symbol} for $${totalValue.toFixed(
        2
      )} | New balance: $${parseFloat(newBalance.toString())}`
    );

    // Send email notification
    try {
      console.log("📧 Starting email notification process for sell...");

      const { sendEmail } = await import("@/lib/email");

      const userWithPrefs = await prisma.user.findUnique({
        where: { id: user.id },
        select: { emailNotifications: true, email: true, name: true },
      });

      console.log(`📧 User email preferences:`, {
        email: userWithPrefs?.email,
        emailNotifications: userWithPrefs?.emailNotifications,
        hasSmtpUser: !!process.env.SMTP_USER,
        hasSmtpPass: !!process.env.SMTP_PASS,
        smtpHost: process.env.SMTP_HOST,
      });

      if (userWithPrefs?.emailNotifications && userWithPrefs.email) {
        console.log(`📧 Attempting to send email to ${userWithPrefs.email}...`);

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
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #10b981;">Crypto Sale Successful</h2>
              <p>Hi ${userWithPrefs.name || "User"},</p>
              <p>You have successfully sold <strong>${amount.toFixed(
                8
              )} ${symbol}</strong>.</p>
              <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Asset:</strong> ${assetName} (${symbol})</p>
                <p style="margin: 5px 0;"><strong>Amount Sold:</strong> ${amount.toFixed(
                  8
                )} ${symbol}</p>
                <p style="margin: 5px 0;"><strong>Price per Unit:</strong> $${price.toFixed(
                  2
                )}</p>
                <p style="margin: 5px 0;"><strong>Total Value:</strong> $${totalValue.toFixed(
                  2
                )}</p>
                <p style="margin: 5px 0;"><strong>Fee (1.5%):</strong> $${fee.toFixed(
                  2
                )}</p>
                <p style="margin: 5px 0; color: #10b981; font-size: 16px;"><strong>Net Received:</strong> $${netReceived.toFixed(
                  2
                )}</p>
                <p style="margin: 5px 0;"><strong>New Balance:</strong> $${parseFloat(
                  newBalance.toString()
                ).toFixed(2)}</p>
              </div>
              <p>Thank you for using M4Capital!</p>
            </div>
          `,
          text: `Crypto Sale Successful\n\nHi ${
            userWithPrefs.name || "User"
          },\n\nYou have successfully sold ${amount.toFixed(
            8
          )} ${symbol}.\n\nAsset: ${assetName} (${symbol})\nAmount Sold: ${amount.toFixed(
            8
          )} ${symbol}\nPrice per Unit: $${price.toFixed(
            2
          )}\nTotal Value: $${totalValue.toFixed(
            2
          )}\nFee (1.5%): $${fee.toFixed(
            2
          )}\nNet Received: $${netReceived.toFixed(
            2
          )}\nNew Balance: $${parseFloat(newBalance.toString()).toFixed(
            2
          )}\n\nThank you for using M4Capital!`,
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

      let displayAmount = netReceived;
      let currencySymbol = "$";

      if (userCurrency !== "USD") {
        const ratesResponse = await fetch(
          "https://api.frankfurter.app/latest?from=USD"
        );
        if (ratesResponse.ok) {
          const ratesData = await ratesResponse.json();
          const rate = ratesData.rates[userCurrency] || 1;
          displayAmount = netReceived * rate;
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
          title: `You've sold ${assetName}`,
          message: `Successfully sold ${amount.toFixed(
            8
          )} ${symbol} for ${currencySymbol}${displayAmount.toFixed(2)}`,
          amount: -netReceived, // Negative to indicate sell
          asset: symbol,
          read: false,
        },
      });
      console.log(`🔔 Push notification created for user ${user.id}`);
    } catch (notifError) {
      console.error("Failed to create push notification:", notifError);
    }

    return NextResponse.json({
      success: true,
      message: `Successfully sold ${amount} ${symbol}`,
      totalValue,
      fee,
      netReceived,
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
