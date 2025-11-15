import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 minutes max execution

/**
 * GET /api/cron/process-confirmations
 * Background cron job to automatically increment confirmations
 * Run this every 3 minutes via Vercel Cron or external scheduler
 */
export async function GET(req: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET || "your-secret-key";

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all pending deposits with confirmations < 6
    const pendingDeposits = await prisma.deposit.findMany({
      where: {
        status: "PENDING",
        confirmations: {
          lt: 6,
        },
      },
      include: {
        user: {
          include: {
            portfolio: true,
          },
        },
      },
    });

    console.log(
      `📊 [CRON] Processing ${pendingDeposits.length} pending deposits...`
    );

    const results = [];

    for (const deposit of pendingDeposits) {
      const newConfirmations = deposit.confirmations + 1;
      const isComplete = newConfirmations >= 6;

      // Update deposit confirmations
      await prisma.deposit.update({
        where: { id: deposit.id },
        data: {
          confirmations: newConfirmations,
          status: isComplete ? "COMPLETED" : "PENDING",
        },
      });

      console.log(
        `✅ [CRON] Updated deposit ${deposit.id}: ${newConfirmations}/6 confirmations`
      );

      // Update or create notification
      const existingNotification = await prisma.notification.findFirst({
        where: {
          userId: deposit.userId!,
          metadata: {
            path: ["depositId"],
            equals: deposit.id,
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      if (existingNotification) {
        await prisma.notification.update({
          where: { id: existingNotification.id },
          data: {
            title: isComplete
              ? `${deposit.targetAsset || deposit.currency} Deposit Confirmed`
              : `Incoming ${deposit.targetAsset || deposit.currency} Deposit`,
            message: isComplete
              ? `Your deposit of ${
                  deposit.targetAsset
                    ? `${deposit.amount} ${deposit.targetAsset}`
                    : `$${deposit.amount}`
                } has been confirmed and credited to your account.`
              : `Your deposit of ${
                  deposit.targetAsset
                    ? `${deposit.amount} ${deposit.targetAsset}`
                    : `$${deposit.amount}`
                } is being processed. Confirmations: ${newConfirmations}/6`,
            metadata: {
              ...((existingNotification.metadata as any) || {}),
              confirmations: newConfirmations,
              status: isComplete ? "COMPLETED" : "PENDING",
              updatedAt: new Date().toISOString(),
            },
          },
        });
      }

      // If completed, credit the portfolio
      if (isComplete && deposit.user && deposit.user.portfolio) {
        const portfolio = deposit.user.portfolio;
        const depositType = (deposit.metadata as any)?.depositType;

        if (depositType === "crypto" && deposit.targetAsset) {
          // Update crypto asset
          const assets = Array.isArray(portfolio.assets)
            ? portfolio.assets
            : [];
          const existingAssetIndex = assets.findIndex(
            (a: any) => a.symbol === deposit.targetAsset
          );

          if (existingAssetIndex >= 0 && assets[existingAssetIndex]) {
            const asset = assets[existingAssetIndex] as any;
            asset.amount += parseFloat(deposit.amount.toString());
          } else {
            assets.push({
              symbol: deposit.targetAsset,
              amount: parseFloat(deposit.amount.toString()),
            });
          }

          await prisma.portfolio.update({
            where: { id: portfolio.id },
            data: { assets },
          });

          console.log(
            `💰 [CRON] Credited ${deposit.amount} ${deposit.targetAsset} to user ${deposit.user.email}`
          );
        } else {
          // Update USD balance
          await prisma.portfolio.update({
            where: { id: portfolio.id },
            data: {
              balance: {
                increment: deposit.amount,
              },
            },
          });

          console.log(
            `💰 [CRON] Credited $${deposit.amount} to user ${deposit.user.email} balance`
          );
        }

        // Create completion notification
        await prisma.notification.create({
          data: {
            userId: deposit.user.id,
            type: "SUCCESS",
            title: "Deposit Completed!",
            message: `Your deposit of ${
              deposit.targetAsset
                ? `${deposit.amount} ${deposit.targetAsset}`
                : `$${deposit.amount}`
            } has been successfully credited to your account.`,
            amount: deposit.amount,
            asset: deposit.targetAsset || deposit.currency,
            metadata: {
              depositId: deposit.id,
              transactionId: deposit.transactionId,
              transactionHash: deposit.transactionHash,
              confirmations: 6,
              status: "COMPLETED",
              completedAt: new Date().toISOString(),
            },
          },
        });

        console.log(
          `🎉 [CRON] Deposit ${deposit.id} completed for user ${deposit.user.email}`
        );
      }

      results.push({
        depositId: deposit.id,
        confirmations: newConfirmations,
        isComplete,
      });
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ [CRON] Error processing confirmations:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Confirmation processing failed",
      },
      { status: 500 }
    );
  }
}
