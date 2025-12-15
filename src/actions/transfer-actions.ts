"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Decimal } from "@prisma/client/runtime/library";
import { generateId } from "@/lib/generate-id";

interface TransferActionResult {
  success: boolean;
  error?: string;
  data?: {
    asset: string;
    amount: number;
    recipient: string;
    recipientName?: string;
  };
}

export async function transferCryptoAction(
  asset: string,
  amount: number,
  destination: string,
  memo?: string
): Promise<TransferActionResult> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return { success: false, error: "Authentication required" };
    }

    // Validate inputs
    if (!asset || amount <= 0 || !destination) {
      return { success: false, error: "Invalid transfer parameters" };
    }

    const dest = destination.trim();
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dest);
    const isAccountNumber = /^\d{8,}$/.test(dest);

    if (!isEmail && !isAccountNumber) {
      return { success: false, error: "Invalid recipient identifier" };
    }

    // Get sender with portfolio
    const sender = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { Portfolio: true },
    });

    if (!sender || !sender.Portfolio) {
      return { success: false, error: "Sender portfolio not found" };
    }

    // Find recipient
    const recipient = await prisma.user.findFirst({
      where: isEmail ? { email: dest } : { accountNumber: dest },
      include: { Portfolio: true },
    });

    if (!recipient) {
      return { success: false, error: "Recipient not found" };
    }

    if (recipient.id === sender.id) {
      return { success: false, error: "Cannot transfer to yourself" };
    }

    if (!recipient.Portfolio) {
      return { success: false, error: "Recipient portfolio not found" };
    }

    const senderPortfolio = sender.Portfolio;
    const recipientPortfolio = recipient.Portfolio;
    const senderAssets = (senderPortfolio.assets as any[]) || [];
    const recipientAssets = (recipientPortfolio.assets as any[]) || [];

    // Check if transferring FIAT or crypto
    const isFiat = asset === "FIAT" || asset === "USD";

    if (isFiat) {
      // Transfer from fiat balance
      const senderBalance = parseFloat(senderPortfolio.balance.toString());
      if (senderBalance < amount) {
        return { success: false, error: "Insufficient balance" };
      }

      await prisma.$transaction(async (tx) => {
        // Deduct from sender
        await tx.portfolio.update({
          where: { id: senderPortfolio.id },
          data: { balance: new Decimal(senderBalance - amount) },
        });

        // Add to recipient
        const recipientBalance = parseFloat(
          recipientPortfolio.balance.toString()
        );
        await tx.portfolio.update({
          where: { id: recipientPortfolio.id },
          data: { balance: new Decimal(recipientBalance + amount) },
        });

        // Create notifications for both parties
        await tx.notification.create({
          data: {
            id: generateId(),
            userId: sender.id,
            type: "TRANSACTION",
            title: "Transfer Sent",
            message: `Sent $${amount.toFixed(2)} to ${
              recipient.name || recipient.email
            }`,
            amount: amount,
            asset: "USD",
          },
        });

        await tx.notification.create({
          data: {
            id: generateId(),
            userId: recipient.id,
            type: "TRANSACTION",
            title: "Transfer Received",
            message: `Received $${amount.toFixed(2)} from ${
              sender.name || sender.email
            }`,
            amount: amount,
            asset: "USD",
          },
        });
      });
    } else {
      // Transfer crypto asset
      const senderAssetIndex = senderAssets.findIndex(
        (a) => a.symbol.toUpperCase() === asset.toUpperCase()
      );

      if (senderAssetIndex === -1) {
        return { success: false, error: `You don't have any ${asset}` };
      }

      const senderAssetData = senderAssets[senderAssetIndex];
      const senderAssetBalance = parseFloat(senderAssetData.amount.toString());

      if (senderAssetBalance < amount) {
        return { success: false, error: `Insufficient ${asset} balance` };
      }

      await prisma.$transaction(async (tx) => {
        // Deduct from sender
        const newSenderBalance = senderAssetBalance - amount;
        if (newSenderBalance <= 0.00000001) {
          senderAssets.splice(senderAssetIndex, 1);
        } else {
          senderAssets[senderAssetIndex].amount = newSenderBalance;
        }

        await tx.portfolio.update({
          where: { id: senderPortfolio.id },
          data: { assets: senderAssets },
        });

        // Add to recipient
        const recipientAssetIndex = recipientAssets.findIndex(
          (a) => a.symbol.toUpperCase() === asset.toUpperCase()
        );

        if (recipientAssetIndex >= 0) {
          const currentRecipientBalance = parseFloat(
            recipientAssets[recipientAssetIndex].amount.toString()
          );
          recipientAssets[recipientAssetIndex].amount =
            currentRecipientBalance + amount;
        } else {
          recipientAssets.push({
            symbol: asset.toUpperCase(),
            amount: amount,
            averagePrice: senderAssetData.averagePrice || 0,
          });
        }

        await tx.portfolio.update({
          where: { id: recipientPortfolio.id },
          data: { assets: recipientAssets },
        });

        // Create notifications
        await tx.notification.create({
          data: {
            id: generateId(),
            userId: sender.id,
            type: "TRANSACTION",
            title: "Transfer Sent",
            message: `Sent ${amount.toFixed(8)} ${asset} to ${
              recipient.name || recipient.email
            }`,
            amount: amount,
            asset: asset,
          },
        });

        await tx.notification.create({
          data: {
            id: generateId(),
            userId: recipient.id,
            type: "TRANSACTION",
            title: "Transfer Received",
            message: `Received ${amount.toFixed(8)} ${asset} from ${
              sender.name || sender.email
            }`,
            amount: amount,
            asset: asset,
          },
        });
      });
    }

    revalidatePath("/dashboard");
    revalidatePath("/finance");

    return {
      success: true,
      data: {
        asset,
        amount,
        recipient: dest,
        recipientName: recipient.name || undefined,
      },
    };
  } catch (error) {
    console.error("Transfer action error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Transfer failed",
    };
  }
}
