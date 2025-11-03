import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";

/**
 * DELETE ALL USERS API (POST)
 * Admin-only endpoint to permanently delete all user data.
 * Requires admin authentication via NextAuth session.
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    // Order matters for FK constraints. Remove dependent records first.
    const deposits = await prisma.deposit.deleteMany();
    const withdrawals = await prisma.withdrawal.deleteMany();
    const portfolios = await prisma.portfolio.deleteMany();

    // NextAuth and account/session related
    const accounts = await prisma.account.deleteMany();
    const sessions = await prisma.session.deleteMany();
    const verificationTokens = await prisma.verificationToken.deleteMany();

    // Delete web users
    const users = await prisma.user.deleteMany();

    return NextResponse.json({
      success: true,
      counts: {
        deposits: deposits.count,
        withdrawals: withdrawals.count,
        portfolios: portfolios.count,
        accounts: accounts.count,
        sessions: sessions.count,
        verificationTokens: verificationTokens.count,
        users: users.count,
      },
    });
  } catch (err) {
    console.error("Error deleting all users:", err);
    return NextResponse.json(
      { success: false, error: String(err) },
      { status: 500 }
    );
  }
}
