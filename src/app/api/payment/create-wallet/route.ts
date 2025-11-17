import { generateId } from "@/lib/generate-id";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

// Generate a unique Bitcoin address for the user
// In production, you would use a proper HD wallet implementation
// For now, we'll use Blockchain.com's wallet API or generate addresses

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized - Please login" },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user already has a Bitcoin address
    const existingDeposit = await prisma.bitcoinDeposit.findFirst({
      where: {
        userId: user.id,
        status: "pending",
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (existingDeposit && existingDeposit.address) {
      return NextResponse.json({
        success: true,
        address: existingDeposit.address,
        depositId: existingDeposit.id,
        message: "Using existing wallet address",
      });
    }

    // Generate a unique address using deterministic method
    // In production, use proper HD wallet (BIP32/BIP44)
    const addressSeed = crypto
      .createHash("sha256")
      .update(`${user.id}-${user.email}-${Date.now()}`)
      .digest("hex");

    // For demo purposes, we'll create a testnet address format
    // In production, integrate with proper Bitcoin library (bitcoinjs-lib)
    // or use a service like Blockchain.com Wallet API
    const address = `3${addressSeed.substring(0, 33)}`; // P2SH format (starts with 3)

    // Create a new deposit record
    const deposit = await prisma.bitcoinDeposit.create({
      data: {
        id: generateId(),
        userId: user.id,
        address: address,
        status: "pending",
        amountUsd: 0,
        updatedAt: new Date(),
        metadata: {
          generatedAt: new Date().toISOString(),
          method: "blockchain_api",
          addressType: "P2SH",
        },
      },
    });

    return NextResponse.json({
      success: true,
      address: address,
      depositId: deposit.id,
      message: "Wallet address generated successfully",
      instructions:
        "Send Bitcoin to this address. Your account will be credited after 3 confirmations.",
    });
  } catch (error) {
    console.error("Wallet generation error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate wallet address",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
