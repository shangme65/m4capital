import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Force dynamic for API routes that use headers
export const dynamic = 'force-dynamic';

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
    } = await req.json();

    if (!userId || !amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid user ID or amount" },
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
    if (!user.portfolio) {
      await prisma.portfolio.create({
        data: {
          userId: userId,
          balance: amount,
        },
      });
    } else {
      // Update portfolio balance
      await prisma.portfolio.update({
        where: { userId: userId },
        data: {
          balance: {
            increment: amount,
          },
        },
      });
    }

    // Create a transaction record (you may want to create a Transaction model)
    // For now, we'll log the transaction details
    const transactionRecord = {
      userId: userId,
      amount: amount,
      type: "ADMIN_TOPUP",
      paymentMethod: paymentMethod || "Manual",
      paymentDetails: paymentDetails || {},
      adminNote: adminNote || `Manual top-up by ${processedBy}`,
      processedBy: processedBy || session.user.email,
      processedAt: new Date(),
      status: "COMPLETED",
    };

    console.log("Transaction processed:", transactionRecord);

    // In a real application, you would save this to a transactions table:
    // await prisma.transaction.create({ data: transactionRecord });

    // Get updated user with portfolio
    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { portfolio: true },
    });

    return NextResponse.json({
      message: "Balance updated successfully",
      user: {
        id: updatedUser!.id,
        email: updatedUser!.email,
        balance: updatedUser!.portfolio?.balance || 0,
      },
      transaction: transactionRecord,
    });
  } catch (error) {
    console.error("Error updating balance:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
