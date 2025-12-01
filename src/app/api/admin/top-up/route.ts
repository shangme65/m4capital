import { generateId } from "@/lib/generate-id";
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
      fiatAmount,
      cryptoAmount,
      paymentMethod,
      paymentDetails,
      adminNote,
      processedBy,
      depositType, // "fiat" or "crypto"
      cryptoAsset, // e.g., "BTC", "ETH"
      isAdminManual, // Flag to indicate admin manual payment
      preferredCurrency,
    } = await req.json();

    if (!userId || !amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid user ID or amount" },
        { status: 400 }
      );
    }

    if (!depositType || (depositType !== "fiat" && depositType !== "crypto")) {
      return NextResponse.json(
        { error: "Invalid deposit type. Must be 'fiat' or 'crypto'" },
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
      include: { Portfolio: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create portfolio if it doesn't exist
    let portfolio = user.Portfolio;
    if (!portfolio) {
      portfolio = await prisma.portfolio.create({
        data: {
          id: generateId(),
          userId: userId,
          balance: 0, // Don't credit yet - wait for confirmations
          assets: [],
        },
      });
    }

    // For admin manual payments, credit immediately since these are trusted actions
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

    // Helper function for currency symbol
    const getCurrencySymbol = (currency: string): string => {
      const symbols: { [key: string]: string } = {
        USD: "$",
        EUR: "€",
        GBP: "£",
        NGN: "₦",
        ZAR: "R",
        KES: "KSh",
        GHS: "₵",
      };
      return symbols[currency] || "$";
    };

    // Create deposit transaction record as COMPLETED (admin manual = instant)
    const deposit = await prisma.deposit.create({
      data: {
        id: generateId(),
        portfolioId: portfolio.id,
        userId: user.id,
        amount:
          depositType === "crypto"
            ? cryptoAmount || amount
            : fiatAmount || amount,
        currency:
          depositType === "crypto" ? cryptoAsset : preferredCurrency || "USD",
        status: "COMPLETED", // Admin manual deposits complete immediately
        method: paymentMethod || "ADMIN_MANUAL",
        type:
          depositType === "crypto" ? `CRYPTO_${cryptoAsset}` : "ADMIN_BALANCE",
        transactionId: `ADMIN-${Date.now()}`,
        transactionHash: txHash,
        fee: fee,
        confirmations: 6, // Instantly confirmed for admin deposits
        targetAsset: depositType === "crypto" ? cryptoAsset : null,
        updatedAt: new Date(),
        metadata: {
          paymentDetails: paymentDetails || {},
          adminNote: adminNote || `Manual top-up by ${processedBy}`,
          processedBy: processedBy || session.user.email,
          processedAt: new Date().toISOString(),
          depositType,
          isAdminManual: true,
          fiatAmount: fiatAmount || amount,
          cryptoAmount: cryptoAmount,
        },
      },
    });

    // Immediately credit the portfolio for admin manual deposits
    if (depositType === "crypto" && cryptoAsset) {
      // Credit crypto asset
      const assets = Array.isArray(portfolio.assets) ? portfolio.assets : [];
      const existingAssetIndex = assets.findIndex(
        (a: any) => a.symbol === cryptoAsset
      );

      if (existingAssetIndex >= 0 && assets[existingAssetIndex]) {
        const asset = assets[existingAssetIndex] as any;
        asset.amount =
          (asset.amount || 0) + parseFloat((cryptoAmount || amount).toString());
      } else {
        // Get crypto name from mapping
        const CRYPTO_NAMES: { [key: string]: string } = {
          BTC: "Bitcoin",
          ETH: "Ethereum",
          USDT: "Tether",
          BNB: "Binance Coin",
          SOL: "Solana",
          USDC: "USD Coin",
          XRP: "Ripple",
          ADA: "Cardano",
          DOGE: "Dogecoin",
          TRX: "TRON",
          TON: "Toncoin",
          LINK: "Chainlink",
          MATIC: "Polygon",
          DOT: "Polkadot",
          DAI: "Dai",
          SHIB: "Shiba Inu",
          LTC: "Litecoin",
          BCH: "Bitcoin Cash",
          AVAX: "Avalanche",
          UNI: "Uniswap",
        };

        assets.push({
          symbol: cryptoAsset,
          name: CRYPTO_NAMES[cryptoAsset] || cryptoAsset,
          amount: parseFloat((cryptoAmount || amount).toString()),
        });
      }

      await prisma.portfolio.update({
        where: { id: portfolio.id },
        data: { assets },
      });

      console.log(
        `✅ Credited ${cryptoAmount || amount} ${cryptoAsset} to user ${
          user.email
        }`
      );
    } else {
      // Credit fiat balance in user's preferred currency
      // The balance is stored in the user's original currency (not converted)
      const depositCurrency = preferredCurrency || "USD";

      await prisma.portfolio.update({
        where: { id: portfolio.id },
        data: {
          balance: {
            increment: fiatAmount || amount,
          },
          balanceCurrency: depositCurrency,
        },
      });

      console.log(
        `✅ Credited ${getCurrencySymbol(depositCurrency)}${
          fiatAmount || amount
        } to user ${user.email} (currency: ${depositCurrency})`
      );
    }

    // Create in-app notification for COMPLETED deposit
    await prisma.notification.create({
      data: {
        id: generateId(),
        userId: user.id,
        type: "SUCCESS",
        title: `${
          depositType === "crypto" ? cryptoAsset : preferredCurrency || "USD"
        } Deposit Completed`,
        message: `Your deposit of ${
          depositType === "crypto"
            ? `${cryptoAmount || amount} ${cryptoAsset}`
            : `${getCurrencySymbol(preferredCurrency || "USD")}${
                fiatAmount || amount
              }`
        } has been confirmed and credited to your account.`,
        amount: amount,
        asset:
          depositType === "crypto" ? cryptoAsset : preferredCurrency || "USD",
        metadata: {
          depositId: deposit.id,
          transactionId: deposit.transactionId,
          transactionHash: txHash,
          method: deposit.method,
          confirmations: 6,
          targetConfirmations: 6,
          fee: fee,
          status: "COMPLETED",
        },
      },
    });

    // Send email notification to user
    if (user.email && user.isEmailVerified) {
      try {
        await sendEmail({
          to: user.email,
          subject: `${
            depositType === "crypto" ? cryptoAsset : preferredCurrency || "USD"
          } Deposit Completed`,
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
                        ? `${cryptoAmount || amount} ${cryptoAsset}`
                        : `${getCurrencySymbol(preferredCurrency || "USD")}${
                            fiatAmount || amount
                          }`
                    }</p>
                    <p style="margin: 5px 0;"><strong>Type:</strong> ${
                      depositType === "crypto"
                        ? `Cryptocurrency (${cryptoAsset})`
                        : `${preferredCurrency || "USD"} Balance`
                    }</p>
                    <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: #10b981;">COMPLETED ✅</span></p>
                    <p style="margin: 5px 0;"><strong>Transaction Hash:</strong> <code style="font-size: 11px;">${txHash}</code></p>
                    <p style="margin: 5px 0;"><strong>Network Fee:</strong> ${
                      depositType === "crypto"
                        ? `${fee.toFixed(2)} ${cryptoAsset}`
                        : `${getCurrencySymbol(
                            preferredCurrency || "USD"
                          )}${fee.toFixed(2)}`
                    }</p>
                    <p style="margin: 5px 0;"><strong>Transaction ID:</strong> ${(
                      deposit.transactionId || ""
                    ).replace("ADMIN-", "")}</p>
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
      } catch (emailError) {
        console.error("Failed to send email notification:", emailError);
        // Continue even if email fails
      }
    }

    return NextResponse.json({
      message: "Deposit completed successfully and credited to user account.",
      deposit: {
        id: deposit.id,
        amount: deposit.amount,
        currency: deposit.currency,
        transactionId: deposit.transactionId,
        transactionHash: txHash,
        fee: fee,
        confirmations: 6,
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

// Complete deposit immediately for admin manual deposits
async function completeDepositImmediately(
  depositId: string,
  userId: string,
  depositType: string,
  cryptoAsset: string | null,
  amount: number,
  portfolioId: string,
  user: any
) {
  try {
    // Update deposit status to completed with all confirmations
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

    if (!portfolio) {
      console.error("Portfolio not found for immediate completion");
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
    await prisma.notification.create({
      data: {
        id: generateId(),
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
            <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
              This is an automated message. Please do not reply to this email.
            </p>
          </div>
        `,
      });
    }

    console.log(`✅ Deposit ${depositId} completed successfully`);
  } catch (error) {
    console.error("Error completing deposit immediately:", error);
  }
}

// Background function to simulate confirmations over a short period
// NOTE: This function is deprecated in favor of immediate completion
// Kept for reference but not used in current implementation
async function startConfirmationSimulation(
  depositId: string,
  userId: string,
  depositType: string,
  cryptoAsset: string | null,
  amount: number,
  portfolioId: string
) {
  // Use setImmediate or process.nextTick to run asynchronously without blocking
  // For serverless environments, we'll complete confirmations quickly
  (async () => {
    try {
      // Shorter intervals for serverless: 6 confirmations over 60 seconds
      const intervals = [10, 20, 30, 40, 50, 60]; // seconds

      // Note: Confirmations are now handled by /api/admin/process-single-deposit
      // which sends only ONE progress notification at 1/6

      // After 6 confirmations, complete the deposit
      await completeDeposit(
        depositId,
        userId,
        depositType,
        cryptoAsset,
        amount,
        portfolioId
      );

      console.log(`🎉 Deposit ${depositId} completed successfully`);
    } catch (error) {
      console.error("Confirmation simulation error:", error);
    }
  })();
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
        id: generateId(),
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
