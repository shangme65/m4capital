import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        Portfolio: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent admin users from deleting their accounts
    if (user.role === "ADMIN") {
      return NextResponse.json(
        { error: "Admin accounts cannot be deleted through this method" },
        { status: 403 }
      );
    }

    // Check if user has active balance
    if (user.Portfolio && Number(user.Portfolio.balance) > 0) {
      return NextResponse.json(
        {
          error:
            "Please withdraw all funds before deleting your account. Current balance must be zero.",
        },
        { status: 400 }
      );
    }

    // Check if user has crypto assets
    if (
      user.Portfolio &&
      user.Portfolio.assets &&
      (user.Portfolio.assets as any).length > 0
    ) {
      return NextResponse.json(
        {
          error:
            "Please sell all crypto assets before deleting your account. Portfolio must be empty.",
        },
        { status: 400 }
      );
    }

    // Delete user and all related data (cascade delete)
    await prisma.$transaction(async (tx) => {
      // Delete in order to respect foreign key constraints

      // Delete notifications
      await tx.notification.deleteMany({
        where: { userId: user.id },
      });

      // Delete sessions
      await tx.session.deleteMany({
        where: { userId: user.id },
      });

      // Delete telegram link code
      await tx.telegramLinkCode.deleteMany({
        where: { userId: user.id },
      });

      // Delete KYC data
      await tx.kycVerification.deleteMany({
        where: { userId: user.id },
      });

      // Delete deposits
      await tx.deposit.deleteMany({
        where: { userId: user.id },
      });

      // Delete P2P transfers sent
      await tx.p2PTransfer.deleteMany({
        where: { senderId: user.id },
      });

      // Delete P2P transfers received
      await tx.p2PTransfer.deleteMany({
        where: { receiverId: user.id },
      });

      if (user.Portfolio) {
        // Delete trades
        await tx.trade.deleteMany({
          where: { userId: user.id },
        });

        // Delete portfolio
        await tx.portfolio.delete({
          where: { id: user.Portfolio.id },
        });
      }

      // Finally, delete the user
      await tx.user.delete({
        where: { id: user.id },
      });
    });

    return NextResponse.json(
      {
        message:
          "Account successfully deleted. You will be logged out shortly.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting user account:", error);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  }
}
