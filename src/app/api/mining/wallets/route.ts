import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - list saved wallet addresses
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const wallets = await prisma.miningWalletAddress.findMany({
      where: { userId: session.user.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ wallets });
  } catch (error) {
    console.error("[mining/wallets GET] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST - add or update wallet address
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { label, address, currency, isDefault = false } = body;

    if (!label?.trim() || !address?.trim() || !currency?.trim()) {
      return NextResponse.json(
        { error: "Label, address and currency are required" },
        { status: 400 },
      );
    }
    if (address.trim().length < 10) {
      return NextResponse.json(
        { error: "Invalid wallet address" },
        { status: 400 },
      );
    }

    // If setting as default, unset other defaults for same currency
    if (isDefault) {
      await prisma.miningWalletAddress.updateMany({
        where: { userId: session.user.id, currency, isDefault: true },
        data: { isDefault: false },
      });
    }

    const wallet = await prisma.miningWalletAddress.upsert({
      where: {
        userId_address_currency: {
          userId: session.user.id,
          address: address.trim(),
          currency,
        },
      },
      update: { label: label.trim(), isDefault },
      create: {
        userId: session.user.id,
        label: label.trim(),
        address: address.trim(),
        currency,
        isDefault,
      },
    });

    return NextResponse.json({ wallet, success: true });
  } catch (error) {
    console.error("[mining/wallets POST] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE - remove wallet address
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "Wallet id required" },
        { status: 400 },
      );
    }

    await prisma.miningWalletAddress.deleteMany({
      where: { id, userId: session.user.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[mining/wallets DELETE] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
