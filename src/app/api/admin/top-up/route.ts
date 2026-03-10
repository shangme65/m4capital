import { generateId } from "@/lib/generate-id";
import { getCurrencySymbol } from "@/lib/currencies";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { sendPushNotification } from "@/lib/push-notifications";
import { depositConfirmedTemplate } from "@/lib/email-templates";

// Force dynamic for API routes that use headers
export const dynamic = "force-dynamic";

// Promo constants
const PROMO_DURATION_DAYS = 7;
const PROMO_BONUS_PERCENT = 50;

/**
 * Check if the deposit bonus promo is active for a user
 * Promo lasts 7 days from user signup
 */
function isPromoBonusActive(userCreatedAt: Date): boolean {
  const promoEndDate = new Date(userCreatedAt);
  promoEndDate.setDate(promoEndDate.getDate() + PROMO_DURATION_DAYS);
  return promoEndDate.getTime() > Date.now();
}

/**
 * Calculate bonus amount (50% of deposit)
 */
function calculateBonusAmount(amount: number): number {
  return amount * (PROMO_BONUS_PERCENT / 100);
}

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
      fiatAmountUserCurrency, // For crypto deposits: the value in user's preferred currency
      cryptoAmount,
      cryptoPrice, // Price per unit at time of deposit (USD)
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
      // @ts-ignore - preferredCurrency exists on User model
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Use user's preferred currency from database, fallback to request param, then default
    const userPreferredCurrency =
      user.preferredCurrency || preferredCurrency || "USD";

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

    // For fiat deposits, calculate USD value for proper currency conversion
    let usdValue = fiatAmount || amount;
    if (depositType === "fiat" && userPreferredCurrency !== "USD") {
      try {
        // Fetch current exchange rate from Frankfurter API
        const rateResponse = await fetch(
          `https://api.frankfurter.app/latest?from=${userPreferredCurrency}&to=USD`
        );
        if (rateResponse.ok) {
          const rateData = await rateResponse.json();
          const exchangeRate = rateData.rates?.USD || 1;
          usdValue = (fiatAmount || amount) * exchangeRate;
          console.log(
            `💱 Converted ${fiatAmount || amount} ${userPreferredCurrency} to ${usdValue.toFixed(2)} USD (rate: ${exchangeRate})`
          );
        } else {
          console.warn(
            `⚠️ Failed to fetch exchange rate for ${userPreferredCurrency}, using original amount`
          );
        }
      } catch (error) {
        console.error("Error fetching exchange rate:", error);
        // Fallback: use original amount if exchange rate fetch fails
      }
    }

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
          depositType === "crypto" ? cryptoAsset : userPreferredCurrency,
        // Store crypto-specific fields for crypto deposits
        cryptoAmount:
          depositType === "crypto" ? cryptoAmount || amount : undefined,
        cryptoCurrency: depositType === "crypto" ? cryptoAsset : undefined,
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
          fiatAmountUserCurrency: fiatAmountUserCurrency, // Store value in user's preferred currency
          fiatCurrency: userPreferredCurrency, // Store the user's preferred currency
          usdValue: depositType === "fiat" ? usdValue : undefined, // CRITICAL: Store USD value for proper currency conversion
          cryptoAmount: cryptoAmount,
          cryptoPrice: cryptoPrice, // Store price per unit at time of deposit (USD)
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
      // Round to 2 decimal places for fiat currencies
      const depositCurrency = userPreferredCurrency;
      const roundedFiatAmount = Math.round((fiatAmount || amount) * 100) / 100;
      
      // Check if promo bonus applies
      let bonusAmount = 0;
      let totalCredit = roundedFiatAmount;
      const promoActive = isPromoBonusActive(user.createdAt);
      
      if (promoActive) {
        bonusAmount = calculateBonusAmount(roundedFiatAmount);
        bonusAmount = Math.round(bonusAmount * 100) / 100; // Round to 2 decimal places
        totalCredit = roundedFiatAmount + bonusAmount;
        console.log(`🎁 Promo bonus active! Adding ${PROMO_BONUS_PERCENT}% bonus: ${bonusAmount} ${depositCurrency}`);
      }

      await prisma.portfolio.update({
        where: { id: portfolio.id },
        data: {
          balance: {
            increment: totalCredit,
          },
          balanceCurrency: depositCurrency,
        },
      });

      console.log(
        `✅ Credited ${getCurrencySymbol(
          depositCurrency
        )}${totalCredit.toFixed(2)} to user ${
          user.email
        } (currency: ${depositCurrency})${bonusAmount > 0 ? ` (includes ${bonusAmount} bonus)` : ''}`
      );
    }

    // Track bonus for notifications
    const promoActive = isPromoBonusActive(user.createdAt);
    const fiatBonusAmount = depositType === "fiat" && promoActive 
      ? Math.round(calculateBonusAmount((fiatAmount || amount)) * 100) / 100 
      : 0;

    // Create in-app notification for COMPLETED deposit
    // Round fiat amounts to 2 decimal places for display
    const roundedFiatAmountForNotification =
      depositType === "fiat"
        ? Math.round((fiatAmount || amount) * 100) / 100
        : amount;
    const totalFiatWithBonus = roundedFiatAmountForNotification + fiatBonusAmount;
    const displayFiatAmount = roundedFiatAmountForNotification.toFixed(2);

    // For crypto notifications, format the cryptoAmount to 8 decimal places
    const formattedCryptoAmount =
      depositType === "crypto" && cryptoAmount
        ? parseFloat(cryptoAmount.toString()).toFixed(8)
        : amount;

    // For crypto deposits, calculate the fiat value for the notification badge
    // Use fiatAmountUserCurrency if provided, otherwise fallback to fiatAmount
    const cryptoFiatValueForNotification =
      depositType === "crypto"
        ? Math.round((fiatAmountUserCurrency || fiatAmount || 0) * 100) / 100
        : 0;

    const bonusMessage = fiatBonusAmount > 0 && depositType === "fiat"
      ? ` Plus ${PROMO_BONUS_PERCENT}% bonus: ${getCurrencySymbol(userPreferredCurrency)}${fiatBonusAmount.toFixed(2)}!`
      : '';

    await prisma.notification.create({
      data: {
        id: generateId(),
        userId: user.id,
        type: "SUCCESS",
        title: fiatBonusAmount > 0 && depositType === "fiat"
          ? `${userPreferredCurrency} Deposit + Bonus!`
          : `${depositType === "crypto" ? cryptoAsset : userPreferredCurrency} Deposit Completed`,
        message: `Your deposit of ${
          depositType === "crypto"
            ? `${formattedCryptoAmount} ${cryptoAsset}`
            : `${getCurrencySymbol(userPreferredCurrency)}${displayFiatAmount}`
        } has been confirmed and credited to your account.${bonusMessage}`,
        // For crypto deposits, store the fiat value in user's currency for the badge display
        // For fiat deposits, use the total amount including bonus
        amount:
          depositType === "crypto"
            ? cryptoFiatValueForNotification
            : totalFiatWithBonus,
        // For crypto deposits, use user's preferred currency so badge shows fiat value (e.g., R$4,000.00)
        // For fiat deposits, use the user's preferred currency
        asset: userPreferredCurrency,
        metadata: {
          depositId: deposit.id,
          transactionId: deposit.transactionId,
          transactionHash: txHash,
          method: deposit.method,
          confirmations: 6,
          targetConfirmations: 6,
          fee: fee,
          status: "COMPLETED",
          bonusAmount: fiatBonusAmount > 0 ? fiatBonusAmount : undefined,
          bonusPercent: fiatBonusAmount > 0 ? PROMO_BONUS_PERCENT : undefined,
        },
      },
    });

    // Send email notification to user
    if (user.email && user.isEmailVerified) {
      try {
        const displayAmount = depositType === "crypto"
          ? parseFloat((cryptoAmount || amount).toString()).toFixed(8)
          : (Math.round((fiatAmount || amount) * 100) / 100).toFixed(2);
        
        const displayAsset = depositType === "crypto" ? cryptoAsset : userPreferredCurrency;
        const currSymbol = depositType === "crypto" ? "" : getCurrencySymbol(userPreferredCurrency);
        
        await sendEmail({
          to: user.email,
          subject: `✅ ${displayAsset} Deposit Completed - M4 Capital`,
          html: depositConfirmedTemplate(
            user.name || "User",
            displayAmount,
            displayAsset,
            currSymbol,
            txHash,
            depositType === "crypto"
          ),
        });
      } catch (emailError) {
        console.error("Failed to send email notification:", emailError);
        // Continue even if email fails
      }
    }

    // Send web push notification
    try {
      const pushTitle =
        depositType === "crypto"
          ? `${cryptoAsset} Deposit Completed!`
          : `${userPreferredCurrency} Deposit Completed!`;
      const pushMessage =
        depositType === "crypto"
          ? `Your deposit of ${(cryptoAmount || amount).toFixed(
              8
            )} ${cryptoAsset} has been credited to your account.`
          : `Your deposit of ${getCurrencySymbol(userPreferredCurrency)}${(
              Math.round((fiatAmount || amount) * 100) / 100
            ).toFixed(2)} has been credited to your account.`;

      await sendPushNotification(userId, pushTitle, pushMessage, {
        type: "deposit",
        amount:
          depositType === "crypto"
            ? cryptoAmount || amount
            : fiatAmount || amount,
        asset: depositType === "crypto" ? cryptoAsset : userPreferredCurrency,
        url: "/dashboard",
      });
    } catch (pushError) {
      console.error("Failed to send push notification:", pushError);
      // Continue even if push fails
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
    const userCurrency = user?.preferredCurrency || "USD";
    await prisma.notification.create({
      data: {
        id: generateId(),
        userId: userId,
        type: "DEPOSIT",
        title: `${
          depositType === "crypto" ? cryptoAsset : userCurrency
        } Deposit Completed!`,
        message: `Your deposit of ${
          depositType === "crypto"
            ? `${amount} ${cryptoAsset}`
            : `${getCurrencySymbol(userCurrency)}${amount}`
        } has been confirmed and credited to your account.`,
        amount: amount,
        asset: depositType === "crypto" ? cryptoAsset! : userCurrency,
        metadata: {
          depositId,
          confirmations: 6,
          status: "COMPLETED",
        },
      },
    });

    // Send completion email
    if (user?.email && user.isEmailVerified) {
      const displayAmount = depositType === "crypto"
        ? Number(amount).toFixed(8)
        : amount.toString();
      const displayAsset = depositType === "crypto" ? cryptoAsset! : userCurrency;
      const currSymbol = depositType === "crypto" ? "" : getCurrencySymbol(userCurrency);
      
      await sendEmail({
        to: user.email,
        subject: `✅ ${displayAsset} Deposit Confirmed - M4 Capital`,
        html: depositConfirmedTemplate(
          user.name || "User",
          displayAmount,
          displayAsset,
          currSymbol,
          undefined,
          depositType === "crypto"
        ),
      });

      // Send web push notification
      try {
        const pushTitle =
          depositType === "crypto"
            ? `${cryptoAsset} Deposit Completed!`
            : `${userCurrency} Deposit Completed!`;
        const pushMessage =
          depositType === "crypto"
            ? `Your deposit of ${amount.toFixed(
                8
              )} ${cryptoAsset} has been credited to your account.`
            : `Your deposit of ${getCurrencySymbol(
                userCurrency
              )}${amount} has been credited to your account.`;

        await sendPushNotification(userId, pushTitle, pushMessage, {
          type: "deposit",
          amount,
          asset: depositType === "crypto" ? cryptoAsset : userCurrency,
          url: "/dashboard",
        });
      } catch (pushError) {
        console.error("Failed to send push notification:", pushError);
      }
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
    const userCurr = user?.preferredCurrency || "USD";

    await prisma.notification.create({
      data: {
        id: generateId(),
        userId: userId,
        type: "DEPOSIT",
        title: `${
          depositType === "crypto" ? cryptoAsset : userCurr
        } Deposit Completed!`,
        message: `Your deposit of ${
          depositType === "crypto"
            ? `${amount} ${cryptoAsset}`
            : `${getCurrencySymbol(userCurr)}${amount}`
        } has been confirmed and credited to your account.`,
        amount: amount,
        asset: depositType === "crypto" ? cryptoAsset! : userCurr,
        metadata: {
          depositId,
          confirmations: 6,
          status: "COMPLETED",
        },
      },
    });

    // Send completion email
    if (user?.email && user.isEmailVerified) {
      const displayAmount = depositType === "crypto"
        ? Number(amount).toFixed(8)
        : amount.toString();
      const displayAsset = depositType === "crypto" ? cryptoAsset! : userCurr;
      const currSymbol = depositType === "crypto" ? "" : getCurrencySymbol(userCurr);
      
      await sendEmail({
        to: user.email,
        subject: `✅ ${displayAsset} Deposit Confirmed - M4 Capital`,
        html: depositConfirmedTemplate(
          user.name || "User",
          displayAmount,
          displayAsset,
          currSymbol,
          undefined,
          depositType === "crypto"
        ),
      });

      // Send web push notification
      try {
        const pushTitle =
          depositType === "crypto"
            ? `${cryptoAsset} Deposit Completed!`
            : `${userCurr} Deposit Completed!`;
        const pushMessage =
          depositType === "crypto"
            ? `Your deposit of ${amount.toFixed(
                8
              )} ${cryptoAsset} has been credited to your account.`
            : `Your deposit of ${getCurrencySymbol(
                userCurr
              )}${amount} has been credited to your account.`;

        await sendPushNotification(userId, pushTitle, pushMessage, {
          type: "deposit",
          amount,
          asset:
            depositType === "crypto" ? cryptoAsset || "BTC" : userCurr || "USD",
          url: "/dashboard",
        });
      } catch (pushError) {
        console.error("Failed to send push notification:", pushError);
      }
    }
  } catch (error) {
    console.error("Error completing deposit:", error);
  }
}
