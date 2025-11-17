import { generateId } from "@/lib/generate-id";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

/**
 * POST /api/admin/process-single-deposit
 * Process confirmations for a single deposit progressively
 * This endpoint can be called multiple times to update confirmation status
 */
export async function POST(req: NextRequest) {
  try {
    const { depositId } = await req.json();

    if (!depositId) {
      return NextResponse.json(
        { error: "Deposit ID required" },
        { status: 400 }
      );
    }

    const deposit = await prisma.deposit.findUnique({
      where: { id: depositId },
      include: {
        Portfolio: {
          include: {
            User: true,
          },
        },
      },
    });

    if (!deposit) {
      return NextResponse.json({ error: "Deposit not found" }, { status: 404 });
    }

    // If already completed, skip
    if (deposit.status === "COMPLETED") {
      return NextResponse.json({ message: "Already completed" });
    }

    const metadata = (deposit.metadata as any) || {};
    const startTime = metadata.startTime
      ? new Date(metadata.startTime)
      : deposit.createdAt;
    const now = new Date();
    const elapsedSeconds = (now.getTime() - startTime.getTime()) / 1000;

    // Progressive confirmations: 1 confirmation every 10 seconds for 60 seconds total
    const targetConfirmation = Math.min(Math.floor(elapsedSeconds / 10) + 1, 6);
    const currentConfirmations = deposit.confirmations || 0;

    if (targetConfirmation > currentConfirmations && targetConfirmation <= 6) {
      // Update confirmation count
      await prisma.deposit.update({
        where: { id: depositId },
        data: { confirmations: targetConfirmation },
      });

      console.log(
        `✅ Deposit ${depositId}: Updated to ${targetConfirmation}/6 confirmations`
      );

      // Send progress notification ONLY at 1/6
      if (targetConfirmation === 1 && deposit.Portfolio?.User) {
        await prisma.notification.create({
          data: {
            id: generateId(),
            userId: deposit.Portfolio.User.id,
            type: "DEPOSIT",
            title: "Deposit Confirmation Progress",
            message: `Your deposit confirmation is in progress: 1/6 confirmations received.`,
            amount: Number(deposit.amount),
            asset:
              metadata.depositType === "crypto" ? metadata.cryptoAsset : "USD",
            metadata: {
              depositId,
              confirmations: 1,
              targetConfirmations: 6,
            },
          },
        });
      }

      // If not yet complete, schedule next check
      if (targetConfirmation < 6) {
        setTimeout(() => {
          fetch(
            `${
              process.env.NEXTAUTH_URL || "http://localhost:3000"
            }/api/admin/process-single-deposit`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ depositId }),
            }
          ).catch((err) =>
            console.error("Failed to schedule next confirmation:", err)
          );
        }, 10000); // Check again in 10 seconds
      }
    }

    // Complete the deposit after 6 confirmations
    if (targetConfirmation >= 6 && deposit.status !== "COMPLETED") {
      await completeDeposit(deposit, metadata);
    }

    return NextResponse.json({
      message: "Confirmation processed",
      confirmations: targetConfirmation,
      status: targetConfirmation >= 6 ? "COMPLETED" : "PENDING",
    });
  } catch (error) {
    console.error("Error processing deposit confirmation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function completeDeposit(deposit: any, metadata: any) {
  try {
    const user = deposit.Portfolio?.User;
    const portfolioId = deposit.portfolioId;
    const depositType = metadata.depositType;
    const cryptoAsset = metadata.cryptoAsset;
    const amount = Number(deposit.amount);

    // Update deposit status
    await prisma.deposit.update({
      where: { id: deposit.id },
      data: {
        status: "COMPLETED",
        confirmations: 6,
      },
    });

    // Credit the account
    const portfolio = await prisma.portfolio.findUnique({
      where: { id: portfolioId },
    });

    if (!portfolio) {
      console.error("Portfolio not found");
      return;
    }

    if (depositType === "balance") {
      // Credit USD balance
      await prisma.portfolio.update({
        where: { id: portfolioId },
        data: {
          balance: {
            increment: amount,
          },
        },
      });
    } else if (depositType === "crypto" && cryptoAsset) {
      // Credit crypto asset
      const assets = Array.isArray(portfolio.assets) ? portfolio.assets : [];
      const existingAssetIndex = assets.findIndex(
        (a: any) => a.symbol === cryptoAsset
      );

      if (existingAssetIndex >= 0 && assets[existingAssetIndex]) {
        const asset = assets[existingAssetIndex] as any;
        asset.amount = (asset.amount || 0) + amount;
      } else {
        assets.push({
          symbol: cryptoAsset,
          amount: amount,
        });
      }

      await prisma.portfolio.update({
        where: { id: portfolioId },
        data: { assets },
      });
    }

    // Send completion notification
    if (user) {
      await prisma.notification.create({
        data: {
          id: generateId(),
          userId: user.id,
          type: "DEPOSIT",
          title: "Deposit Completed!",
          message: `Your deposit of ${
            depositType === "crypto" ? `${amount} ${cryptoAsset}` : `$${amount}`
          } has been confirmed and credited to your account.`,
          amount: amount,
          asset: depositType === "crypto" ? cryptoAsset : "USD",
          metadata: {
            depositId: deposit.id,
            confirmations: 6,
            status: "COMPLETED",
          },
        },
      });

      // Send completion email
      if (user.email && user.isEmailVerified) {
        await sendEmail({
          to: user.email,
          subject: "Deposit Confirmed & Credited",
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; background-color: #f5f5f5;">
              <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
                  <img src="${
                    process.env.NEXTAUTH_URL || "https://m4capital.online"
                  }/m4capitallogo2.png" alt="M4 Capital" style="max-width: 180px; height: auto; display: block; margin: 0 auto; background-color: white; padding: 10px; border-radius: 8px;" />
                </div>
                <div style="padding: 40px 30px;">
                  <h2 style="color: #10b981;">✅ Deposit Successfully Completed!</h2>
                  <p>Hello ${user.name || "User"},</p>
                  <p>Great news! Your deposit has been confirmed and credited to your account.</p>
                  <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 5px 0;"><strong>Amount:</strong> ${
                      depositType === "crypto"
                        ? `${amount} ${cryptoAsset}`
                        : `$${amount}`
                    }</p>
                    <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: #10b981;">COMPLETED</span></p>
                    <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date().toLocaleString()}</p>
                  </div>
                  <p style="background-color: #d1fae5; padding: 15px; border-left: 4px solid #10b981; margin: 20px 0;">
                    <strong>✅ Your funds are now available!</strong> You can start trading immediately.
                  </p>
                </div>
                <div style="padding: 30px; text-align: center; color: #999999; font-size: 14px; border-top: 1px solid #eeeeee;">
                  <p>© 2025 M4 Capital. All rights reserved.</p>
                  <p>This is an automated message. Please do not reply to this email.</p>
                </div>
              </div>
            </body>
            </html>
          `,
        });
      }
    }

    console.log(`🎉 Deposit ${deposit.id} completed successfully`);
  } catch (error) {
    console.error("Error completing deposit:", error);
  }
}
