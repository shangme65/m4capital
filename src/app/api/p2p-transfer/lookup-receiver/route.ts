import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

/**
 * GET /api/p2p-transfer/lookup-receiver
 * Look up receiver by email or account number
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const identifier = searchParams.get("identifier"); // email or account number

    if (!identifier) {
      return NextResponse.json(
        { error: "Email or account number is required" },
        { status: 400 }
      );
    }

    // Look up user by email or account number
    const receiver = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { accountNumber: identifier }],
        isDeleted: false,
        id: { not: session.user.id }, // Cannot send to self
      },
      select: {
        id: true,
        name: true,
        email: true,
        accountNumber: true,
      },
    });

    if (!receiver) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!receiver.accountNumber) {
      return NextResponse.json(
        { error: "Receiver account is not fully set up" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      receiver: {
        id: receiver.id,
        name: receiver.name,
        email: receiver.email,
        accountNumber: receiver.accountNumber,
      },
    });
  } catch (error) {
    console.error("Error looking up receiver:", error);
    return NextResponse.json(
      { error: "Failed to look up receiver" },
      { status: 500 }
    );
  }
}
