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

    const { userId, asset, investmentAmount, profitPercentage, direction } = await req.json();

    // Validate inputs
    if (!userId || !asset || !investmentAmount || !profitPercentage || !direction) {
      return NextResponse.json(
        { error: "Missing required fields: userId, asset, investmentAmount, profitPercentage, direction" },
        { status: 400 }
      );
    }

    if (![
      "HIGHER", "LOWER"].includes(direction)) {
      return NextResponse.json(
        { error: "Direction must be either HIGHER or LOWER" },
        { status: 400 }
      );
    }

    const investment = parseFloat(investmentAmount);
    if (isNaN(investment) || investment <= 0) {
      return NextResponse.json(
        { error: "Investment amount must be a positive number" },
        { status: 400 }
      );
    }

    const percentage = parseFloat(profitPercentage);
    if (isNaN(percentage) || percentage <= 0) {
      return NextResponse.json(
        { error: "Profit percentage must be a positive number" },
        { status: 400 }
      );
    }

    // Calculate profit from investment and percentage
    const profit = investment * (percentage / 100);

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

    // Create trade record that looks like a real traderoom trade
    // Calculate realistic entry and exit prices based on profit and direction
    const entryPrice = 1.0; // Normalized entry price
    
    // Calculate exit price based on direction and profit
    let exitPrice: number;
    if (direction === "HIGHER") {
      // Win on HIGHER means price went up
      exitPrice = entryPrice * (1 + percentage / 100);
    } else {
      // Win on LOWER means price went down
      exitPrice = entryPrice * (1 - percentage / 100);
    }

    const trade = await prisma.trade.create({
      data: {
        id: `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        symbol: asset,
        side: direction === "HIGHER" ? "BUY" : "SELL",
        entryPrice: new Decimal(entryPrice),
        exitPrice: new Decimal(exitPrice),
        quantity: new Decimal(investment), // Investment amount
        profit: new Decimal(profit), // Profit in USD (calculated from investment × percentage)
        status: "CLOSED",
        closedAt: new Date(),
        updatedAt: new Date(),
        metadata: {
          direction: direction, // Store direction for traderoom display
          tradeType: "binary",
          payout: percentage, // Store the percentage as payout
          addedByAdmin: true,
          addedBy: session.user.id,
          addedAt: new Date().toISOString(),
          manualProfit: true,
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

    // Create notification for user (matching traderoom exact format)
    await prisma.notification.create({
      data: {
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: userId,
        type: "TRADE",
        title: "Trade Won!",
        message: `${asset} ${direction} trade won. Profit: $${profit.toFixed(2)}`,
        amount: new Decimal(profit), // Store USD amount - frontend will convert
        asset: asset, // Store the trading asset
        metadata: {
          tradeId: trade.id,
          tradingAsset: asset,
          profitUSD: profit,
          direction: direction,
          percentage: percentage,
          addedByAdmin: true,
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

        const directionEmoji = direction === "HIGHER" ? "📈" : "📉";

        await sendEmail({
          to: user.email,
          subject: `${directionEmoji} Trade Won - ${asset} ${direction} - Profit: ${currencySymbol}${displayAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} - M4 Capital`,
          html: emailTemplate(`
            ${emailHero("✅", "Trade Won!", `Your ${asset} ${direction} trade was successful`, "success")}
            ${emailGreeting(user.name || "Valued Client")}
            ${emailParagraph(`Congratulations! Your ${asset} ${direction} trade has closed successfully with a profit.`)}
            ${emailTransactionTable([
              { label: "Asset", value: asset },
              { label: "Direction", value: emailBadge(direction, direction === "HIGHER" ? "success" : "danger") },
              { label: "Result", value: emailBadge("Won", "success") },
              { label: "Profit (USD)", value: `$${profit.toFixed(2)}` },
              ...(userCurrency !== "USD" ? [{ label: `Profit (${userCurrency})`, value: `${currencySymbol}${displayAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` }] : []),
              { label: "Return", value: `+${percentage.toFixed(2)}%` },
              { label: "Date", value: new Date().toLocaleString() },
            ])}
            ${emailAlert("Your profit has been credited to your Traderoom balance. Keep trading to multiply your earnings!", "success", "🚀")}
            ${emailButton("View Traderoom History", `${process.env.NEXTAUTH_URL || "https://m4capital.online"}/traderoom`)}
            ${emailSignature()}
          `),
          text: `Trade Won! Your ${asset} ${direction} trade won with a profit of $${profit.toFixed(2)} (+${percentage.toFixed(2)}%). It has been credited to your Traderoom balance.`,
        });
        console.log(`📧 Trade profit email sent to ${user.email}`);
      } catch (emailError) {
        console.error("Failed to send trade profit email:", emailError);
        // Don't fail the operation if email fails
      }
    }

    // Send browser push notification (matching real trade format)
    try {
      await sendWebPushToUser(user.id, {
        title: "Trade Won!",
        body: `${asset} ${direction} trade won. Profit: $${profit.toFixed(2)}`,
        icon: "/icons/icon-192.png",
        badge: "/icons/icon-96.png",
        tag: `m4capital-trade-${Date.now()}`,
        data: {
          url: "/traderoom",
          type: "trade_won",
          tradeId: trade.id,
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
