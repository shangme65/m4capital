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
          balance: depositType === "balance" ? amount : 0,
          assets:
            depositType === "crypto"
              ? [{ symbol: cryptoAsset, amount: parseFloat(amount.toString()) }]
              : [],
        },
      });
    } else {
      // Update portfolio based on deposit type
      if (depositType === "balance") {
        // Update USD balance
        portfolio = await prisma.portfolio.update({
          where: { userId: userId },
          data: {
            balance: {
              increment: amount,
            },
          },
        });
      } else if (depositType === "crypto") {
        // Update crypto asset
        const assets = Array.isArray(portfolio.assets) ? portfolio.assets : [];
        const existingAssetIndex = assets.findIndex(
          (a: any) => a.symbol === cryptoAsset
        );

        if (existingAssetIndex >= 0 && assets[existingAssetIndex]) {
          // Update existing asset
          const asset = assets[existingAssetIndex] as any;
          asset.amount += parseFloat(amount.toString());
        } else {
          // Add new asset
          assets.push({
            symbol: cryptoAsset,
            amount: parseFloat(amount.toString()),
          });
        }

        portfolio = await prisma.portfolio.update({
          where: { userId: userId },
          data: { assets },
        });
      }
    }

    // Generate realistic transaction hash
    const generateTxHash = () => {
      const chars = "0123456789abcdef";
      let hash = "";
      for (let i = 0; i < 64; i++) {
        hash += chars[Math.floor(Math.random() * chars.length)];
      }
      return hash;
    };

    // Calculate realistic fee (0.1-0.5% for manual, ~$2-5 for BTC)

    // Calculate realistic fee (0.1-0.5% for manual, ~$2-5 for BTC)
    const calculateFee = () => {
      if (depositType === "crypto") {
        // Fixed BTC network fee between $2-5
        return parseFloat((2 + Math.random() * 3).toFixed(2));
      } else {
        // 0.1-0.5% for balance deposits
        return parseFloat(
          (amount * (0.001 + Math.random() * 0.004)).toFixed(2)
        );
      }
    };

    const txHash = generateTxHash();
    const fee = calculateFee();

    // Create deposit transaction record
    const deposit = await prisma.deposit.create({
      data: {
        portfolioId: portfolio.id,
        userId: user.id,
        amount: amount,
        currency: depositType === "crypto" ? cryptoAsset : "USD",
        status: "PENDING", // Start as PENDING for confirmation simulation
        method: paymentMethod || "ADMIN_TOPUP",
        type:
          depositType === "crypto" ? `CRYPTO_${cryptoAsset}` : "ADMIN_TOPUP",
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
        } is being processed. Confirmations: 0/6`,
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
                <p style="margin: 5px 0;"><strong>Network Fee:</strong> $${fee.toFixed(
                  2
                )}</p>
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

    // Start confirmation simulation in the background (completes in ~20 mins)
    // This will be handled by a separate cron job or background task
    // For now, we'll return the deposit details

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
