import { generateId } from "@/lib/generate-id";
import { getCurrencySymbol } from "@/lib/currencies";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { depositConfirmedTemplate } from "@/lib/email-templates";

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
        const userCurrency = deposit.Portfolio.User.preferredCurrency || "USD";
        const cryptoAmount = Number(deposit.amount);
        let displayAmount = cryptoAmount;

        // For crypto deposits, convert to fiat value for notification display
        if (metadata.depositType === "crypto" && metadata.cryptoAsset) {
          try {
            // Get crypto price in USD from Binance
            const symbol = metadata.cryptoAsset.toUpperCase();
            const priceResponse = await fetch(
              `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}USDT`
            );
            if (priceResponse.ok) {
              const priceData = await priceResponse.json();
              const usdPrice = parseFloat(priceData.price);
              const usdValue = cryptoAmount * usdPrice;

              // Convert USD to user's preferred currency
              displayAmount = usdValue;
              if (userCurrency !== "USD") {
                const ratesResponse = await fetch(
                  "https://api.frankfurter.app/latest?from=USD"
                );
                if (ratesResponse.ok) {
                  const ratesData = await ratesResponse.json();
                  const rate = ratesData.rates[userCurrency] || 1;
                  displayAmount = usdValue * rate;
                }
              }
            }
          } catch (err) {
            console.error("Error fetching crypto price for notification:", err);
          }
        }

        await prisma.notification.create({
          data: {
            id: generateId(),
            userId: deposit.Portfolio.User.id,
            type: "DEPOSIT",
            title: "Deposit Confirmation Progress",
            message: `Your deposit confirmation is in progress: 1/6 confirmations received.`,
            amount: Math.round(displayAmount * 100) / 100,
            asset: userCurrency, // Always use user's currency for proper display
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
      const userCurrency = user.preferredCurrency || "USD";
      let displayAmount = amount;
      const currencySymbol = getCurrencySymbol(userCurrency);

      // For crypto deposits, convert to fiat value for notification display
      if (depositType === "crypto" && cryptoAsset) {
        try {
          // Get crypto price in USD from Binance
          const symbol = cryptoAsset.toUpperCase();
          const priceResponse = await fetch(
            `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}USDT`
          );
          if (priceResponse.ok) {
            const priceData = await priceResponse.json();
            const usdPrice = parseFloat(priceData.price);
            const usdValue = amount * usdPrice;

            // Convert USD to user's preferred currency
            displayAmount = usdValue;
            if (userCurrency !== "USD") {
              const ratesResponse = await fetch(
                "https://api.frankfurter.app/latest?from=USD"
              );
              if (ratesResponse.ok) {
                const ratesData = await ratesResponse.json();
                const rate = ratesData.rates[userCurrency] || 1;
                displayAmount = usdValue * rate;
              }
            }
          }
        } catch (err) {
          console.error("Error fetching crypto price for notification:", err);
        }
      }

      await prisma.notification.create({
        data: {
          id: generateId(),
          userId: user.id,
          type: "DEPOSIT",
          title: `${
            depositType === "crypto" ? cryptoAsset : userCurrency
          } Deposit Completed!`,
          message: `Your deposit of ${
            depositType === "crypto"
              ? `${amount.toFixed(8)} ${cryptoAsset}`
              : `${currencySymbol}${amount}`
          } has been confirmed and credited to your account.`,
          amount: Math.round(displayAmount * 100) / 100, // Store pre-converted fiat amount
          asset: userCurrency, // Always use user's currency for proper display
          metadata: {
            depositId: deposit.id,
            confirmations: 6,
            status: "COMPLETED",
          },
        },
      });

      // Send completion email
      if (user.email && user.isEmailVerified) {
        const displayAmount = depositType === "crypto"
          ? amount.toFixed(8)
          : amount.toString();
        const displayAsset = depositType === "crypto" ? cryptoAsset : userCurrency;
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
      }
    }

    console.log(`🎉 Deposit ${deposit.id} completed successfully`);
  } catch (error) {
    console.error("Error completing deposit:", error);
  }
}
