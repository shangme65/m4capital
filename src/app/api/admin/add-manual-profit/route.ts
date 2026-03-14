import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";
import { sendWebPushToUser } from "@/lib/push-notifications";
import { getCurrencySymbol } from "@/lib/currencies";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const admin = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (admin?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { userId, asset, profitAmount } = await req.json();

    // Validate inputs
    if (!userId || !asset || !profitAmount) {
      return NextResponse.json(
        { error: "Missing required fields: userId, asset, profitAmount" },
        { status: 400 }
      );
    }

    const profit = parseFloat(profitAmount);
    if (isNaN(profit) || profit <= 0) {
      return NextResponse.json(
        { error: "Profit amount must be a positive number" },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        preferredCurrency: true,
        emailNotifications: true,
        isEmailVerified: true,
        Portfolio: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.Portfolio) {
      return NextResponse.json(
        { error: "User has no portfolio" },
        { status: 400 }
      );
    }

    // Create trade record (profit is stored in USD)
    const trade = await prisma.trade.create({
      data: {
        id: `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        symbol: asset,
        side: "BUY", // Manual profit is treated as a buy trade
        entryPrice: new Decimal(0), // No entry price for manual profits
        quantity: new Decimal(1), // Arbitrary quantity
        profit: new Decimal(profit), // Profit in USD
        status: "CLOSED", // Manual profits are already closed
        closedAt: new Date(),
        updatedAt: new Date(),
        metadata: {
          type: "MANUAL_PROFIT",
          addedBy: session.user.id,
          addedAt: new Date().toISOString(),
        },
        User: {
          connect: { id: userId },
        },
      },
    });

    // Update portfolio traderoom balance (add profit in USD)
    const updatedPortfolio = await prisma.portfolio.update({
      where: { id: user.Portfolio.id },
      data: {
        traderoomBalance: {
          increment: new Decimal(profit),
        },
      },
    });

    // Create notification for user
    // Store amount in USD, asset as the trading symbol
    // The frontend will convert USD to user's preferred currency using formatAmount
    await prisma.notification.create({
      data: {
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: userId,
        type: "TRADE",
        title: "Trade Profit Earned",
        message: `Congratulations! You earned a profit of $${profit.toFixed(
          2
        )} from ${asset} trade.`,
        amount: new Decimal(profit), // Store USD amount - frontend will convert
        asset: asset, // Store the trading asset (BTC, BTC/ETH, EURUSD, etc.)
        metadata: {
          tradeId: trade.id,
          tradingAsset: asset,
          profitUSD: profit,
          type: "MANUAL_PROFIT",
          userCurrency: user.preferredCurrency || "USD",
        },
      },
    });

    // Send email notification
    if (user.email && user.isEmailVerified && user.emailNotifications !== false) {
      try {
        const userCurrency = user.preferredCurrency || "USD";
        const currencySymbol = getCurrencySymbol(userCurrency);
        let displayAmount = profit;

        if (userCurrency !== "USD") {
          const ratesResponse = await fetch("https://api.frankfurter.app/latest?from=USD");
          if (ratesResponse.ok) {
            const ratesData = await ratesResponse.json();
            const rate = ratesData.rates[userCurrency] || 1;
            displayAmount = profit * rate;
          }
        }

        const { sendEmail } = await import("@/lib/email");
        const {
          emailTemplate,
          emailHero,
          emailGreeting,
          emailParagraph,
          emailTransactionTable,
          emailBadge,
          emailAlert,
          emailButton,
          emailSignature,
        } = await import("@/lib/email-templates");

        await sendEmail({
          to: user.email,
          subject: `🏆 Trade Profit Earned - ${currencySymbol}${displayAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} - M4 Capital`,
          html: emailTemplate(`
            ${emailHero("🏆", "Trade Profit Earned!", `Your ${asset} trade has generated a profit`, "success")}
            ${emailGreeting(user.name || "Valued Client")}
            ${emailParagraph(`Congratulations! A trade profit has been credited to your Traderoom balance.`)}
            ${emailTransactionTable([
              { label: "Asset", value: asset },
              { label: "Profit (USD)", value: `$${profit.toFixed(2)}` },
              ...(userCurrency !== "USD" ? [{ label: `Profit (${userCurrency})`, value: `${currencySymbol}${displayAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` }] : []),
              { label: "Status", value: emailBadge("Completed", "success") },
              { label: "Date", value: new Date().toLocaleString() },
            ])}
            ${emailAlert("Your profit has been credited to your Traderoom balance. Keep trading to earn more!", "success", "🚀")}
            ${emailButton("Go to Traderoom", `${process.env.NEXTAUTH_URL || "https://m4capital.online"}/dashboard`)}
            ${emailSignature()}
          `),
          text: `Congratulations ${user.name || "Valued Client"}! You earned a trade profit of $${profit.toFixed(2)} from ${asset} trading. It has been credited to your Traderoom balance.`,
        });
        console.log(`📧 Trade profit email sent to ${user.email}`);
      } catch (emailError) {
        console.error("Failed to send trade profit email:", emailError);
        // Don't fail the operation if email fails
      }
    }

    // Send browser push notification
    try {
      const userCurrency = user.preferredCurrency || "USD";
      const currencySymbol = getCurrencySymbol(userCurrency);
      await sendWebPushToUser(user.id, {
        title: "🏆 Trade Profit Earned!",
        body: `You earned a profit of $${profit.toFixed(2)} from ${asset} trading. Check your Traderoom balance.`,
        icon: "/icons/icon-192.png",
        badge: "/icons/icon-96.png",
        tag: `m4capital-profit-${Date.now()}`,
        data: {
          url: "/dashboard",
          type: "trade_profit",
        },
        renotify: false,
        silent: false,
      });
      console.log(`🔔 Browser push notification sent to user ${user.id}`);
    } catch (pushError) {
      console.error("Failed to send browser push notification:", pushError);
      // Don't fail the operation if push fails
    }

    return NextResponse.json({
      success: true,
      trade: {
        id: trade.id,
        asset: asset,
        profit: profit,
        createdAt: trade.createdAt,
      },
      newTraderoomBalance: updatedPortfolio.traderoomBalance.toString(),
    });
  } catch (error) {
    console.error("Error adding manual profit:", error);
    return NextResponse.json(
      { error: "Failed to add manual profit" },
      { status: 500 }
    );
  }
}
