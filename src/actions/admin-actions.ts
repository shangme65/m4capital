"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { generateId } from "@/lib/generate-id";
import { getCurrencySymbol } from "@/lib/currencies";
import { Decimal } from "@prisma/client/runtime/library";

interface ActionResult {
  success: boolean;
  error?: string;
  data?: any;
}

/**
 * Admin top-up action - Credits user's fiat balance or crypto assets
 */
export async function adminTopUpAction(params: {
  userId: string;
  amount: number;
  depositType: "fiat" | "crypto";
  cryptoAsset?: string;
  cryptoAmount?: number;
  cryptoPrice?: number;
  fiatAmount?: number;
  paymentMethod?: string;
  adminNote?: string;
}): Promise<ActionResult> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return { success: false, error: "Authentication required" };
    }

    // Verify admin role
    const admin = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true, email: true },
    });

    if (!admin || admin.role !== "ADMIN") {
      return { success: false, error: "Admin access required" };
    }

    const {
      userId,
      amount,
      depositType,
      cryptoAsset,
      cryptoAmount,
      cryptoPrice,
      fiatAmount,
      paymentMethod,
      adminNote,
    } = params;

    if (!userId || !amount || amount <= 0) {
      return { success: false, error: "Invalid user ID or amount" };
    }

    if (depositType === "crypto" && !cryptoAsset) {
      return {
        success: false,
        error: "Crypto asset is required for crypto deposits",
      };
    }

    // Find user with portfolio
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { Portfolio: true },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    const userPreferredCurrency = user.preferredCurrency || "USD";

    // Create portfolio if needed
    let portfolio = user.Portfolio;
    if (!portfolio) {
      portfolio = await prisma.portfolio.create({
        data: {
          id: generateId(),
          userId: userId,
          balance: 0,
          assets: [],
        },
      });
    }

    // Generate transaction hash
    const generateTxHash = () => {
      const chars = "0123456789abcdef";
      let hash = "";
      for (let i = 0; i < 64; i++) {
        hash += chars[Math.floor(Math.random() * chars.length)];
      }
      return hash;
    };

    const txHash = generateTxHash();

    // Create deposit record
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
          depositType === "crypto" ? cryptoAsset! : userPreferredCurrency,
        cryptoAmount:
          depositType === "crypto" ? cryptoAmount || amount : undefined,
        cryptoCurrency: depositType === "crypto" ? cryptoAsset : undefined,
        status: "COMPLETED",
        method: paymentMethod || "ADMIN_MANUAL",
        type:
          depositType === "crypto" ? `CRYPTO_${cryptoAsset}` : "ADMIN_BALANCE",
        transactionId: `ADMIN-${Date.now()}`,
        transactionHash: txHash,
        confirmations: 6,
        targetAsset: depositType === "crypto" ? cryptoAsset : null,
        updatedAt: new Date(),
        metadata: {
          adminNote: adminNote || `Manual top-up by ${admin.email}`,
          processedBy: admin.email,
          processedAt: new Date().toISOString(),
          depositType,
          isAdminManual: true,
          fiatAmount: fiatAmount || amount,
          cryptoAmount,
          cryptoPrice,
        },
      },
    });

    // Credit the portfolio
    if (depositType === "crypto" && cryptoAsset) {
      const assets = Array.isArray(portfolio.assets) ? portfolio.assets : [];
      const existingAssetIndex = assets.findIndex(
        (a: any) => a.symbol === cryptoAsset
      );

      if (existingAssetIndex >= 0) {
        const existingAsset = assets[existingAssetIndex] as any;
        const existingAmount = parseFloat(
          existingAsset.amount?.toString() || "0"
        );
        const newAmount = existingAmount + (cryptoAmount || amount);

        // Update average price
        const existingAvgPrice = parseFloat(
          existingAsset.averagePrice?.toString() || "0"
        );
        const existingValue = existingAmount * existingAvgPrice;
        const newValue = (cryptoAmount || amount) * (cryptoPrice || 0);
        const newAvgPrice =
          newAmount > 0
            ? (existingValue + newValue) / newAmount
            : cryptoPrice || 0;

        assets[existingAssetIndex] = {
          ...existingAsset,
          amount: newAmount,
          averagePrice: newAvgPrice,
        };
      } else {
        assets.push({
          symbol: cryptoAsset,
          name: cryptoAsset,
          amount: cryptoAmount || amount,
          averagePrice: cryptoPrice || 0,
        });
      }

      await prisma.portfolio.update({
        where: { id: portfolio.id },
        data: { assets },
      });
    } else {
      // Credit fiat balance
      const currentBalance = parseFloat(portfolio.balance.toString());
      await prisma.portfolio.update({
        where: { id: portfolio.id },
        data: {
          balance: new Decimal(currentBalance + (fiatAmount || amount)),
          balanceCurrency: userPreferredCurrency,
        },
      });
    }

    // Create notification
    const currSymbol = getCurrencySymbol(userPreferredCurrency);
    await prisma.notification.create({
      data: {
        id: generateId(),
        userId: user.id,
        type: "DEPOSIT",
        title:
          depositType === "crypto"
            ? "Crypto Deposit Confirmed"
            : "Account Credited",
        message:
          depositType === "crypto"
            ? `${
                cryptoAmount || amount
              } ${cryptoAsset} has been added to your portfolio`
            : `${currSymbol}${(
                fiatAmount || amount
              ).toLocaleString()} has been credited to your account`,
        amount: fiatAmount || amount,
        asset: depositType === "crypto" ? cryptoAsset : userPreferredCurrency,
      },
    });

    revalidatePath("/admin");
    revalidatePath("/dashboard");

    return {
      success: true,
      data: {
        depositId: deposit.id,
        amount: depositType === "crypto" ? cryptoAmount : fiatAmount,
        currency:
          depositType === "crypto" ? cryptoAsset : userPreferredCurrency,
      },
    };
  } catch (error) {
    console.error("Admin top-up action error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to process top-up",
    };
  }
}

/**
 * Staff admin top-up action - For staff admins to credit assigned users
 */
export async function staffTopUpAction(params: {
  userId: string;
  amount: number;
  currency?: string;
  description?: string;
}): Promise<ActionResult> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return { success: false, error: "Authentication required" };
    }

    const staffAdmin = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true },
    });

    if (!staffAdmin || staffAdmin.role !== "STAFF_ADMIN") {
      return { success: false, error: "Staff admin access required" };
    }

    const { userId, amount, currency = "USD", description } = params;

    if (!userId || !amount || amount <= 0) {
      return { success: false, error: "Valid user ID and amount are required" };
    }

    // Verify user is assigned to this staff admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        assignedStaffId: true,
        Portfolio: { select: { id: true, balance: true } },
      },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    if (user.assignedStaffId !== staffAdmin.id) {
      return {
        success: false,
        error: "You can only top up users assigned to you",
      };
    }

    // Ensure user has a portfolio
    let portfolioId = user.Portfolio?.id;
    if (!portfolioId) {
      const newPortfolio = await prisma.portfolio.create({
        data: {
          id: generateId(),
          userId: user.id,
          balance: 0,
          assets: [],
        },
      });
      portfolioId = newPortfolio.id;
    }

    // Create deposit record
    const deposit = await prisma.deposit.create({
      data: {
        id: generateId(),
        portfolioId: portfolioId,
        userId: user.id,
        amount: parseFloat(amount.toString()),
        currency,
        status: "COMPLETED",
        method: "STAFF_MANUAL_TOPUP",
        updatedAt: new Date(),
        metadata: {
          staffAdminId: staffAdmin.id,
          description: description || "Manual top-up by staff admin",
          timestamp: new Date().toISOString(),
        },
      },
    });

    // Update portfolio balance
    const currentBalance = user.Portfolio?.balance || 0;
    const newBalance =
      parseFloat(currentBalance.toString()) + parseFloat(amount.toString());

    await prisma.portfolio.update({
      where: { id: portfolioId },
      data: {
        balance: newBalance,
        balanceCurrency: currency,
      },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        id: generateId(),
        userId: user.id,
        type: "DEPOSIT",
        title: "Account Credited",
        message: `Your account has been credited with ${currency} ${amount.toLocaleString()}.`,
        amount: parseFloat(amount.toString()),
        metadata: {
          staffAdminId: staffAdmin.id,
          depositId: deposit.id,
          currency,
        },
      },
    });

    revalidatePath("/staff-admin");
    revalidatePath("/dashboard");

    return {
      success: true,
      data: {
        depositId: deposit.id,
        newBalance,
        userName: user.name || user.email,
      },
    };
  } catch (error) {
    console.error("Staff top-up action error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to process top-up",
    };
  }
}

/**
 * Admin send notification action
 */
export async function adminSendNotificationAction(params: {
  userId: string;
  title: string;
  message: string;
  type?: string;
}): Promise<ActionResult> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return { success: false, error: "Authentication required" };
    }

    const admin = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    });

    if (!admin || (admin.role !== "ADMIN" && admin.role !== "STAFF_ADMIN")) {
      return { success: false, error: "Admin access required" };
    }

    const { userId, title, message, type = "INFO" } = params;

    if (!userId || !title || !message) {
      return {
        success: false,
        error: "User ID, title, and message are required",
      };
    }

    const notification = await prisma.notification.create({
      data: {
        id: generateId(),
        userId,
        type: type as any,
        title,
        message,
      },
    });

    revalidatePath("/admin");

    return {
      success: true,
      data: { notificationId: notification.id },
    };
  } catch (error) {
    console.error("Send notification action error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to send notification",
    };
  }
}

/**
 * Admin verify user action
 */
export async function adminVerifyUserAction(
  userId: string
): Promise<ActionResult> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return { success: false, error: "Authentication required" };
    }

    const admin = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    });

    if (!admin || admin.role !== "ADMIN") {
      return { success: false, error: "Admin access required" };
    }

    await prisma.user.update({
      where: { id: userId },
      data: { emailVerified: new Date() },
    });

    await prisma.notification.create({
      data: {
        id: generateId(),
        userId,
        type: "SUCCESS",
        title: "Account Verified",
        message: "Your account has been verified by an administrator.",
      },
    });

    revalidatePath("/admin");

    return { success: true };
  } catch (error) {
    console.error("Verify user action error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to verify user",
    };
  }
}

/**
 * Admin assign staff action
 */
export async function adminAssignStaffAction(params: {
  userId: string;
  staffId: string | null;
}): Promise<ActionResult> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return { success: false, error: "Authentication required" };
    }

    const admin = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    });

    if (!admin || admin.role !== "ADMIN") {
      return { success: false, error: "Admin access required" };
    }

    const { userId, staffId } = params;

    await prisma.user.update({
      where: { id: userId },
      data: { assignedStaffId: staffId },
    });

    revalidatePath("/admin");

    return { success: true };
  } catch (error) {
    console.error("Assign staff action error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to assign staff",
    };
  }
}
