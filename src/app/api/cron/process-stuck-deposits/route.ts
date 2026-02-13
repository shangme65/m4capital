import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateId } from "@/lib/generate-id";
import { getCurrencySymbol } from "@/lib/currencies";
import { sendEmail } from "@/lib/email";
import { sendPushNotification } from "@/lib/push-notifications";
import { depositConfirmedTemplate } from "@/lib/email-templates";

export const dynamic = "force-dynamic";

/**
 * POST /api/cron/process-stuck-deposits
 * Cron job to process deposits where paymentStatus is "finished" or "confirmed"
 * but deposit status is still PENDING (webhook missed or failed)
 * 
 * Schedule: Every 5 minutes via Vercel Cron
 */
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.error("❌ Unauthorized cron request");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("🔄 Starting stuck deposits check...");

    // Find deposits where paymentStatus indicates completion but status is still PENDING
    const stuckDeposits = await prisma.deposit.findMany({
      where: {
        status: "PENDING",
        paymentStatus: {
          in: ["finished", "confirmed"],
        },
      },
      include: {
        User: {
          include: {
            Portfolio: true,
          },
        },
      },
    });

    console.log(`📊 Found ${stuckDeposits.length} stuck deposit(s)`);

    if (stuckDeposits.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No stuck deposits found",
        processed: 0,
      });
    }

    const results = {
      processed: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const deposit of stuckDeposits) {
      console.log(`\n💰 Processing deposit ${deposit.id}...`);
      console.log(`   User: ${deposit.User?.email}`);
      console.log(`   Amount: ${deposit.amount} ${deposit.currency}`);
      console.log(`   Payment Status: ${deposit.paymentStatus}`);

      try {
        // Update deposit status to COMPLETED
        await prisma.deposit.update({
          where: { id: deposit.id },
          data: {
            status: "COMPLETED",
            updatedAt: new Date(),
          },
        });

        console.log("   ✅ Updated deposit status to COMPLETED");

        // Credit user's portfolio
        if (!deposit.User) {
          throw new Error("No user found for deposit");
        }

        // Get or create portfolio
        let portfolio = deposit.User.Portfolio;
        if (!portfolio) {
          console.log("   📁 Creating new portfolio for user...");
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
        const depositAmount = parseFloat(deposit.amount.toString());

        // Check if this is a traderoom deposit
        if (deposit.targetAsset === "TRADEROOM") {
          console.log("   🎮 Processing TRADEROOM deposit...");

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

          console.log(
            `   ✅ Credited ${depositAmount} ${depositCurrency} to TRADEROOM balance`
          );

          // Create notification
          const userCurrency = deposit.User.preferredCurrency || depositCurrency;
          await prisma.notification.create({
            data: {
              id: generateId(),
              userId: deposit.User.id,
              type: "DEPOSIT",
              title: `${userCurrency} Traderoom Deposit Completed`,
              message: `Your deposit of ${getCurrencySymbol(userCurrency)}${depositAmount} has been successfully credited to your Traderoom balance.`,
              amount: depositAmount,
              asset: userCurrency,
              metadata: {
                depositId: deposit.id,
                transactionId: deposit.paymentId,
                method: deposit.method,
                target: "TRADEROOM",
                processedBy: "cron-stuck-deposits",
              },
            },
          });
          console.log("   ✅ Created TRADEROOM notification");

          // Send email notification
          if (deposit.User.email && deposit.User.isEmailVerified) {
            try {
              const displayAmount = (Math.round(depositAmount * 100) / 100).toFixed(2);
              await sendEmail({
                to: deposit.User.email,
                subject: `✅ ${depositCurrency} Traderoom Deposit Completed - M4 Capital`,
                html: depositConfirmedTemplate(
                  deposit.User.name || "User",
                  displayAmount,
                  depositCurrency,
                  getCurrencySymbol(depositCurrency),
                  deposit.paymentId || deposit.id,
                  false
                ),
              });
              console.log("   ✅ Email notification sent");
            } catch (emailError) {
              console.error("   ❌ Failed to send email:", emailError);
            }
          }

          // Send web push notification
          try {
            await sendPushNotification(
              deposit.User.id,
              `${userCurrency} Traderoom Deposit Completed!`,
              `Your deposit of ${getCurrencySymbol(userCurrency)}${depositAmount.toFixed(2)} has been credited to your Traderoom balance.`,
              {
                type: "deposit",
                amount: depositAmount,
                asset: depositCurrency,
                url: "/dashboard",
              }
            );
            console.log("   ✅ Web push notification sent");
          } catch (pushError) {
            console.error("   ❌ Failed to send push:", pushError);
          }
        } else {
          console.log("   💼 Processing REGULAR deposit...");

          const currentBalance = parseFloat(portfolio.balance.toString());
          const newBalance = currentBalance + depositAmount;

          await prisma.portfolio.update({
            where: { id: portfolio.id },
            data: {
              balance: newBalance,
              balanceCurrency: depositCurrency,
            },
          });

          console.log(
            `   ✅ Credited ${depositAmount} ${depositCurrency} to regular balance`
          );

          // Create notification
          const userCurrency = deposit.User.preferredCurrency || depositCurrency;
          await prisma.notification.create({
            data: {
              id: generateId(),
              userId: deposit.User.id,
              type: "DEPOSIT",
              title: `${userCurrency} Deposit Completed`,
              message: `Your deposit of ${getCurrencySymbol(userCurrency)}${depositAmount} has been successfully credited to your account.`,
              amount: depositAmount,
              asset: userCurrency,
              metadata: {
                depositId: deposit.id,
                transactionId: deposit.paymentId,
                method: deposit.method,
                processedBy: "cron-stuck-deposits",
              },
            },
          });
          console.log("   ✅ Created deposit notification");

          // Send email notification
          if (deposit.User.email && deposit.User.isEmailVerified) {
            try {
              const displayAmount = (Math.round(depositAmount * 100) / 100).toFixed(2);
              await sendEmail({
                to: deposit.User.email,
                subject: `✅ ${depositCurrency} Deposit Completed - M4 Capital`,
                html: depositConfirmedTemplate(
                  deposit.User.name || "User",
                  displayAmount,
                  depositCurrency,
                  getCurrencySymbol(depositCurrency),
                  deposit.paymentId || deposit.id,
                  false
                ),
              });
              console.log("   ✅ Email notification sent");
            } catch (emailError) {
              console.error("   ❌ Failed to send email:", emailError);
            }
          }

          // Send web push notification
          try {
            await sendPushNotification(
              deposit.User.id,
              `${userCurrency} Deposit Completed!`,
              `Your deposit of ${getCurrencySymbol(userCurrency)}${depositAmount.toFixed(2)} has been credited to your account.`,
              {
                type: "deposit",
                amount: depositAmount,
                asset: depositCurrency,
                url: "/dashboard",
              }
            );
            console.log("   ✅ Web push notification sent");
          } catch (pushError) {
            console.error("   ❌ Failed to send push:", pushError);
          }
        }

        console.log(`   ✅ Successfully processed deposit ${deposit.id}`);
        results.processed++;
      } catch (error) {
        console.error(`   ❌ Error processing deposit ${deposit.id}:`, error);
        results.failed++;
        results.errors.push(
          `${deposit.id}: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }

    console.log("\n🎉 Stuck deposits check complete!");
    console.log(
      `   Processed: ${results.processed}, Failed: ${results.failed}`
    );

    return NextResponse.json({
      success: true,
      message: "Stuck deposits processed",
      ...results,
    });
  } catch (error) {
    console.error("❌ Cron job error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to process stuck deposits",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/cron/process-stuck-deposits
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    message: "Stuck deposits processor is active",
    timestamp: new Date().toISOString(),
  });
}
