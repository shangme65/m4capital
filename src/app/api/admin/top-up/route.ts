import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    // Find the user to update
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update user balance
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        balance: {
          increment: amount,
        },
      },
    });

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

    return NextResponse.json({
      message: "Balance updated successfully",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        balance: updatedUser.balance,
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
