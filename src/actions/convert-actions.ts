"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Decimal } from "@prisma/client/runtime/library";
import { generateId } from "@/lib/generate-id";

interface ConvertActionResult {
  success: boolean;
  error?: string;
  data?: {
    fromAsset: string;
    toAsset: string;
    fromAmount: number;
    toAmount: number;
    rate: number;
    fromValueUSD: number;
    toValueUSD: number;
  };
}

export async function convertCryptoAction(
  fromAsset: string,
  toAsset: string,
  amount: number,
  rate: number,
  fromPriceUSD: number,
  toPriceUSD: number
): Promise<ConvertActionResult> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return { success: false, error: "Authentication required" };
    }

    // Validate inputs
    if (!fromAsset || !toAsset || amount <= 0 || rate <= 0) {
      return { success: false, error: "Invalid conversion parameters" };
    }

    if (fromAsset === toAsset) {
      return { success: false, error: "Cannot convert to the same asset" };
    }

    // Get user with portfolio
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { Portfolio: true },
    });

    if (!user || !user.Portfolio) {
      return { success: false, error: "Portfolio not found" };
    }

    const portfolio = user.Portfolio;
    const assets = (portfolio.assets as any[]) || [];

    // Find the source asset
    const fromAssetIndex = assets.findIndex(
      (a) => a.symbol.toUpperCase() === fromAsset.toUpperCase()
    );

    if (fromAssetIndex === -1) {
      return { success: false, error: `You don't have any ${fromAsset}` };
    }

    const fromAssetData = assets[fromAssetIndex];
    const currentFromBalance = parseFloat(fromAssetData.amount.toString());

    if (currentFromBalance < amount) {
      return { success: false, error: `Insufficient ${fromAsset} balance` };
    }

    // Calculate the amount of destination asset to receive
    const toAmount = amount * rate;
    const fromValueUSD = amount * fromPriceUSD;
    const toValueUSD = toAmount * toPriceUSD;

    // Update portfolio within a transaction
    await prisma.$transaction(async (tx) => {
      // Update source asset (subtract)
      const newFromBalance = currentFromBalance - amount;
      if (newFromBalance <= 0.00000001) {
        // Remove asset if balance is essentially zero
        assets.splice(fromAssetIndex, 1);
      } else {
        assets[fromAssetIndex].amount = newFromBalance;
      }

      // Update destination asset (add)
      const toAssetIndex = assets.findIndex(
        (a) => a.symbol.toUpperCase() === toAsset.toUpperCase()
      );

      if (toAssetIndex >= 0) {
        // Add to existing asset
        const currentToBalance = parseFloat(
          assets[toAssetIndex].amount.toString()
        );
        assets[toAssetIndex].amount = currentToBalance + toAmount;
        // Update average price
        const existingValue =
          currentToBalance *
          parseFloat(assets[toAssetIndex].averagePrice?.toString() || "0");
        const newValue = toAmount * toPriceUSD;
        const totalAmount = currentToBalance + toAmount;
        assets[toAssetIndex].averagePrice =
          (existingValue + newValue) / totalAmount;
      } else {
        // Add new asset
        assets.push({
          symbol: toAsset.toUpperCase(),
          amount: toAmount,
          averagePrice: toPriceUSD,
        });
      }

      // Update portfolio
      await tx.portfolio.update({
        where: { id: portfolio.id },
        data: { assets: assets },
      });

      // Create trade record for the sell side
      await tx.trade.create({
        data: {
          id: generateId(),
          userId: user.id,
          symbol: fromAsset.toUpperCase(),
          side: "SELL",
          entryPrice: new Decimal(fromPriceUSD),
          quantity: new Decimal(amount),
          status: "CLOSED",
          exitPrice: new Decimal(fromPriceUSD),
          closedAt: new Date(),
          updatedAt: new Date(),
        },
      });

      // Create trade record for the buy side
      await tx.trade.create({
        data: {
          id: generateId(),
          userId: user.id,
          symbol: toAsset.toUpperCase(),
          side: "BUY",
          entryPrice: new Decimal(toPriceUSD),
          quantity: new Decimal(toAmount),
          status: "OPEN",
          updatedAt: new Date(),
        },
      });

      // Create notification
      await tx.notification.create({
        data: {
          id: generateId(),
          userId: user.id,
          type: "TRANSACTION",
          title: "Swap Completed",
          message: `Swapped ${amount.toFixed(
            8
          )} ${fromAsset} to ${toAmount.toFixed(8)} ${toAsset}`,
          amount: fromValueUSD,
          asset: "USD",
        },
      });
    });

    revalidatePath("/dashboard");
    revalidatePath("/finance");
    revalidatePath("/traderoom");

    return {
      success: true,
      data: {
        fromAsset,
        toAsset,
        fromAmount: amount,
        toAmount,
        rate,
        fromValueUSD,
        toValueUSD,
      },
    };
  } catch (error) {
    console.error("Convert action error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Conversion failed",
    };
  }
}
