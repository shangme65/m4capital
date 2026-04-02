import { generateId } from "@/lib/generate-id";
import { getCurrencySymbol } from "@/lib/currencies";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import { sendPushNotification } from "@/lib/push-notifications";
import { depositConfirmedTemplate } from "@/lib/email-templates";

/**
 * POST /api/admin/recover-deposit
 * Manually recover a deposit that was marked FAILED but actually succeeded
 * For admin use only when webhook fails to process a successful payment
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check admin authorization
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!adminUser || adminUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden - Admin only" }, { status: 403 });
    }

    const { depositId } = await req.json();

    if (!depositId) {
      return NextResponse.json(
        { error: "depositId is required" },
        { status: 400 }
      );
    }

    console.log("🔄 MANUAL DEPOSIT RECOVERY - Admin:", session.user.email);
    console.log("   Deposit ID:", depositId);

    // Find the deposit
    const deposit = await prisma.deposit.findUnique({
      where: { id: depositId },
      include: {
        User: {
          include: {
            Portfolio: true,
          },
        },
      },
    });

    if (!deposit) {
      return NextResponse.json(
        { error: "Deposit not found" },
        { status: 404 }
      );
    }

    console.log("✅ Deposit found:");
    console.log("   User:", deposit.User?.email);
    console.log("   Current status:", deposit.status);
    console.log("   Amount:", deposit.amount, deposit.currency);
    console.log("   Target:", deposit.targetAsset || "REGULAR");

    // Check if already completed
    if (deposit.status === "COMPLETED") {
      return NextResponse.json(
        { error: "Deposit already completed - funds already credited" },
        { status: 400 }
      );
    }

    // Verify user exists
    if (!deposit.User) {
      return NextResponse.json(
        { error: "User not found for this deposit" },
        { status: 404 }
      );
    }

    // Get or create portfolio
    let portfolio = deposit.User.Portfolio;
    if (!portfolio) {
      console.log("📁 Creating portfolio for user...");
      portfolio = await prisma.portfolio.create({
        data: {
          id: generateId(),
          userId: deposit.User.id,
          balance: 0,
          traderoomBalance: 0,
          assets: [],
        },
      });
    }

    const depositCurrency = deposit.currency || "USD";
    let depositAmount = parseFloat(deposit.amount.toString());
    const userPreferredCurrency = deposit.User.preferredCurrency || "USD";

    console.log("💵 Processing recovery:");
    console.log("   Deposit amount:", depositAmount, depositCurrency);
    console.log("   User currency:", userPreferredCurrency);

    // Convert deposit amount to user's preferred currency if different
    if (depositCurrency !== userPreferredCurrency) {
      console.log(`💱 Converting ${depositCurrency} → ${userPreferredCurrency}...`);
      try {
        const ratesResponse = await fetch(
          `https://api.frankfurter.app/latest?from=${depositCurrency}&to=${userPreferredCurrency}`
        );
        if (ratesResponse.ok) {
          const ratesData = await ratesResponse.json();
          const rate = ratesData.rates[userPreferredCurrency];
          if (rate) {
            const originalAmount = depositAmount;
            depositAmount = depositAmount * rate;
            console.log(`   Rate: 1 ${depositCurrency} = ${rate} ${userPreferredCurrency}`);
            console.log(`   Converted: ${originalAmount} → ${depositAmount}`);
          }
        }
      } catch (conversionError) {
        console.error("❌ Currency conversion failed:", conversionError);
      }
    }

    // Check if this is a traderoom deposit
    if (deposit.targetAsset === "TRADEROOM") {
      console.log("🎮 Crediting TRADEROOM balance...");

      const currentTraderoomBalance = parseFloat(
        (portfolio.traderoomBalance || 0).toString()
      );
      const newTraderoomBalance = currentTraderoomBalance + depositAmount;

      await prisma.portfolio.update({
        where: { id: portfolio.id },
        data: {
          traderoomBalance: newTraderoomBalance,
        },
      });

      console.log(`✅ Credited ${depositAmount} ${userPreferredCurrency} to TRADEROOM`);
      console.log(`   New balance: ${newTraderoomBalance}`);
    } else {
      console.log("💰 Crediting regular balance...");

      const newBalance =
        parseFloat(portfolio.balance.toString()) + depositAmount;

      await prisma.portfolio.update({
        where: { id: portfolio.id },
        data: {
          balance: newBalance,
          balanceCurrency: userPreferredCurrency,
        },
      });

      console.log(`✅ Credited ${depositAmount} ${userPreferredCurrency} to balance`);
      console.log(`   New balance: ${newBalance}`);
    }

    // Update deposit status to COMPLETED
    await prisma.deposit.update({
      where: { id: deposit.id },
      data: {
        status: "COMPLETED",
        paymentStatus: "finished",
        confirmations: 6,
        updatedAt: new Date(),
      },
    });

    console.log("✅ Deposit status updated to COMPLETED");

    // Create success notification
    const targetName = deposit.targetAsset === "TRADEROOM" ? "Traderoom" : "";
    await prisma.notification.create({
      data: {
        id: generateId(),
        userId: deposit.User.id,
        type: "DEPOSIT",
        title: `${userPreferredCurrency} ${targetName} Deposit Completed`,
        message: `Your deposit of ${getCurrencySymbol(userPreferredCurrency)}${depositAmount.toFixed(2)} has been successfully credited to your ${targetName || "account"}.`,
        amount: depositAmount,
        asset: userPreferredCurrency,
        metadata: {
          depositId: deposit.id,
          recoveredBy: session.user.email,
          recoveredAt: new Date().toISOString(),
        },
      },
    });

    console.log("✅ Notification created");

    // Send email if user has verified email
    if (deposit.User.email && deposit.User.isEmailVerified) {
      try {
        await sendEmail({
          to: deposit.User.email,
          subject: `✅ ${userPreferredCurrency} Deposit Completed - M4 Capital`,
          html: depositConfirmedTemplate(
            deposit.User.name || "User",
            depositAmount.toFixed(2),
            userPreferredCurrency,
            getCurrencySymbol(userPreferredCurrency),
            deposit.paymentId || deposit.id,
            false
          ),
        });
        console.log("✅ Email sent");
      } catch (emailError) {
        console.error("❌ Email failed:", emailError);
      }
    }

    // Send push notification
    try {
      await sendPushNotification(
        deposit.User.id,
        `${userPreferredCurrency} Deposit Completed!`,
        `Your deposit of ${getCurrencySymbol(userPreferredCurrency)}${depositAmount.toFixed(2)} has been credited.`,
        {
          type: "deposit",
          amount: depositAmount,
          asset: userPreferredCurrency,
          url: "/dashboard",
        }
      );
      console.log("✅ Push notification sent");
    } catch (pushError) {
      console.error("❌ Push notification failed:", pushError);
    }

    console.log("✅✅✅ RECOVERY COMPLETED SUCCESSFULLY!");

    return NextResponse.json({
      success: true,
      message: "Deposit recovered and credited successfully",
      depositId: deposit.id,
      amount: depositAmount,
      currency: userPreferredCurrency,
      target: deposit.targetAsset || "REGULAR",
      user: deposit.User.email,
    });
  } catch (error) {
    console.error("❌ Recovery error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}
