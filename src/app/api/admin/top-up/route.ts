import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

// Force dynamic for API routes that use headers
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      userId,
      amount,
      paymentMethod,
      paymentDetails,
      adminNote,
      processedBy,
      depositType, // "balance" or "crypto"
      cryptoAsset, // e.g., "BTC", "ETH"
      isAdminManual, // Flag to indicate admin manual payment
    } = await req.json();

    if (!userId || !amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid user ID or amount" },
        { status: 400 }
      );
    }

    if (
      !depositType ||
      (depositType !== "balance" && depositType !== "crypto")
    ) {
      return NextResponse.json(
        { error: "Invalid deposit type. Must be 'balance' or 'crypto'" },
        { status: 400 }
      );
    }

    if (depositType === "crypto" && !cryptoAsset) {
      return NextResponse.json(
        { error: "Crypto asset is required for crypto deposits" },
        { status: 400 }
      );
    }

    // Find user with portfolio
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { portfolio: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create portfolio if it doesn't exist
    let portfolio = user.portfolio;
    if (!portfolio) {
      portfolio = await prisma.portfolio.create({
        data: {
          userId: userId,
          balance: 0, // Don't credit yet - wait for confirmations
          assets: [],
        },
      });
    }

    // For admin manual payments, DO NOT credit immediately
    // Create PENDING transaction and let confirmation system handle it
    // For admin manual payments, DO NOT credit immediately
    // Create PENDING transaction and let confirmation system handle it

    // Generate realistic transaction hash (64-character hex)
    const generateTxHash = () => {
      const chars = "0123456789abcdef";
      let hash = "";
      for (let i = 0; i < 64; i++) {
        hash += chars[Math.floor(Math.random() * chars.length)];
      }
      return hash;
    };

    // Extract or generate hash and fee
    const txHash = paymentDetails?.transactionHash || generateTxHash();
    const fee = paymentDetails?.networkFee || 0;

    // Create deposit transaction record as PENDING
    const deposit = await prisma.deposit.create({
      data: {
        portfolioId: portfolio.id,
        userId: user.id,
        amount: amount,
        currency: depositType === "crypto" ? cryptoAsset : "USD",
        status: "PENDING", // Start as PENDING for confirmation simulation
        method: paymentMethod || "ADMIN_MANUAL",
        type:
          depositType === "crypto" ? `CRYPTO_${cryptoAsset}` : "ADMIN_BALANCE",
        transactionId: `ADMIN-${Date.now()}`,
        transactionHash: txHash,
        fee: fee,
        confirmations: 0,
        targetAsset: depositType === "crypto" ? cryptoAsset : null,
        metadata: {
          paymentDetails: paymentDetails || {},
          adminNote: adminNote || `Manual top-up by ${processedBy}`,
          processedBy: processedBy || session.user.email,
          processedAt: new Date().toISOString(),
          depositType,
          isAdminManual: true,
          confirmationStartTime: new Date().toISOString(),
        },
      },
    });

    // Create in-app notification for PENDING deposit (incoming)
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: "DEPOSIT",
        title: `Incoming ${
          depositType === "crypto" ? cryptoAsset : "USD"
        } Deposit`,
        message: `Your deposit of ${
          depositType === "crypto" ? `${amount} ${cryptoAsset}` : `$${amount}`
        } is being processed. Confirmations: 0/6 (≈20 minutes)`,
        amount: amount,
        asset: depositType === "crypto" ? cryptoAsset : "USD",
        metadata: {
          depositId: deposit.id,
          transactionId: deposit.transactionId,
          transactionHash: txHash,
          method: deposit.method,
          confirmations: 0,
          targetConfirmations: 6,
          fee: fee,
          status: "PENDING",
        },
      },
    });

    // Send email notification to user
    if (user.email && user.isEmailVerified) {
      try {
        await sendEmail({
          to: user.email,
          subject: `Incoming ${
            depositType === "crypto" ? cryptoAsset : "USD"
          } Deposit`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #f97316;">Incoming Deposit Detected</h2>
              <p>Hello ${user.name || "User"},</p>
              <p>We've detected an incoming deposit to your account.</p>
              <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Amount:</strong> ${
                  depositType === "crypto"
                    ? `${amount} ${cryptoAsset}`
                    : `$${amount}`
                }</p>
                <p style="margin: 5px 0;"><strong>Type:</strong> ${
                  depositType === "crypto"
                    ? `Cryptocurrency (${cryptoAsset})`
                    : "Available Balance"
                }</p>
                <p style="margin: 5px 0;"><strong>Status:</strong> Pending (0/6 confirmations)</p>
                <p style="margin: 5px 0;"><strong>Transaction Hash:</strong> <code style="font-size: 11px;">${txHash}</code></p>
                <p style="margin: 5px 0;"><strong>Network Fee:</strong> ${
                  depositType === "crypto" ? `${fee} BTC` : `$${fee.toFixed(2)}`
                }</p>
                <p style="margin: 5px 0;"><strong>Transaction ID:</strong> ${
                  deposit.transactionId
                }</p>
                <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date().toLocaleString()}</p>
              </div>
              <p style="background-color: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0;">
                <strong>⏳ Please wait:</strong> Your deposit will be credited after 6 network confirmations. This typically takes 15-20 minutes.
              </p>
              ${adminNote ? `<p><strong>Note:</strong> ${adminNote}</p>` : ""}
              <p>You'll receive another notification when your deposit is confirmed and credited.</p>
              <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
                This is an automated message. Please do not reply to this email.
              </p>
            </div>
          `,
        });
      } catch (emailError) {
        console.error("Failed to send email notification:", emailError);
        // Continue even if email fails
      }
    }

    // Trigger confirmation simulation (completes in ~20 mins)
    // This runs in the background
    startConfirmationSimulation(deposit.id, user.id, depositType, cryptoAsset, amount, portfolio.id);

    return NextResponse.json({
      message: "Deposit initiated successfully. Confirmations in progress.",
      deposit: {
        id: deposit.id,
        amount: deposit.amount,
        currency: deposit.currency,
        transactionId: deposit.transactionId,
        transactionHash: txHash,
        fee: fee,
        confirmations: 0,
        targetConfirmations: 6,
        status: deposit.status,
        createdAt: deposit.createdAt,
        depositType,
        targetAsset: depositType === "crypto" ? cryptoAsset : null,
      },
    });
  } catch (error) {
    console.error("Error processing deposit:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Background function to simulate confirmations over 20 minutes
async function startConfirmationSimulation(
  depositId: string,
  userId: string,
  depositType: string,
  cryptoAsset: string | null,
  amount: number,
  portfolioId: string
) {
  // Don't await this - let it run in background
  setTimeout(async () => {
    try {
      // Confirmation intervals: 6 confirmations over 20 minutes = ~3.33 minutes each
      const intervals = [3.33, 6.66, 10, 13.33, 16.66, 20]; // minutes
      
      for (let i = 1; i <= 6; i++) {
        // Wait for the interval
        await new Promise(resolve => setTimeout(resolve, (intervals[i-1] - (i > 1 ? intervals[i-2] : 0)) * 60 * 1000));
        
        // Update confirmation count
        await prisma.deposit.update({
          where: { id: depositId },
          data: { confirmations: i },
        });

        // Send notification for progress
        if (i < 6) {
          await prisma.notification.create({
            data: {
              userId: userId,
              type: "DEPOSIT",
              title: "Deposit Confirmation Progress",
              message: `Your deposit confirmation is in progress: ${i}/6 confirmations received.`,
              amount: amount,
              asset: depositType === "crypto" ? cryptoAsset! : "USD",
              metadata: {
                depositId,
                confirmations: i,
                targetConfirmations: 6,
              },
            },
          });
        }
      }

      // After 6 confirmations, complete the deposit
      await completeDeposit(depositId, userId, depositType, cryptoAsset, amount, portfolioId);
    } catch (error) {
      console.error("Confirmation simulation error:", error);
    }
  }, 0);
}

// Complete the deposit after confirmations
async function completeDeposit(
  depositId: string,
  userId: string,
  depositType: string,
  cryptoAsset: string | null,
  amount: number,
  portfolioId: string
) {
  try {
    // Update deposit status
    await prisma.deposit.update({
      where: { id: depositId },
      data: { 
        status: "COMPLETED",
        confirmations: 6,
      },
    });

    // Credit the account
    const portfolio = await prisma.portfolio.findUnique({
      where: { id: portfolioId },
    });

    if (!portfolio) return;

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
        asset.amount = (asset.amount || 0) + parseFloat(amount.toString());
      } else {
        assets.push({
          symbol: cryptoAsset,
          amount: parseFloat(amount.toString()),
        });
      }

      await prisma.portfolio.update({
        where: { id: portfolioId },
        data: { assets },
      });
    }

    // Send completion notification
    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    await prisma.notification.create({
      data: {
        userId: userId,
        type: "DEPOSIT",
        title: "Deposit Completed!",
        message: `Your deposit of ${
          depositType === "crypto" ? `${amount} ${cryptoAsset}` : `$${amount}`
        } has been confirmed and credited to your account.`,
        amount: amount,
        asset: depositType === "crypto" ? cryptoAsset! : "USD",
        metadata: {
          depositId,
          confirmations: 6,
          status: "COMPLETED",
        },
      },
    });

    // Send completion email
    if (user?.email && user.isEmailVerified) {
      await sendEmail({
        to: user.email,
        subject: "Deposit Confirmed & Credited",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #10b981;">✅ Deposit Successfully Completed!</h2>
            <p>Hello ${user.name || "User"},</p>
            <p>Great news! Your deposit has been fully confirmed and credited to your account.</p>
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Amount:</strong> ${
                depositType === "crypto"
                  ? `${amount} ${cryptoAsset}`
                  : `$${amount}`
              }</p>
              <p style="margin: 5px 0;"><strong>Confirmations:</strong> 6/6 ✅</p>
              <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: #10b981;">COMPLETED</span></p>
              <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date().toLocaleString()}</p>
            </div>
            <p style="background-color: #d1fae5; padding: 15px; border-left: 4px solid #10b981; margin: 20px 0;">
              <strong>✅ Your funds are now available!</strong> You can start trading immediately.
            </p>
            <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
              This is an automated message. Please do not reply to this email.
            </p>
          </div>
        `,
      });
    }
  } catch (error) {
    console.error("Error completing deposit:", error);
  }
}

