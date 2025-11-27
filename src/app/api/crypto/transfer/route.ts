import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";

export const dynamic = "force-dynamic";

interface TransferCryptoRequest {
  asset: string; // e.g., "BTC", "ETH", "USD"
  amount: number; // Amount to transfer
  destination: string; // Wallet address or account number
  memo?: string; // Optional memo/note
}

interface Asset {
  symbol: string;
  amount: number;
  name?: string;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body: TransferCryptoRequest = await request.json();
    const { asset, amount, destination, memo } = body;

    // Validate required fields
    if (!asset || !amount || !destination) {
      return NextResponse.json(
        { error: "Missing required fields: asset, amount, destination" },
        { status: 400 }
      );
    }

    // Dynamic network fees based on asset type (in USD equivalent)
    const getNetworkFee = (symbol: string): number => {
      const networkFees: { [key: string]: number } = {
        BTC: 2.5, // Bitcoin average fee
        ETH: 3.0, // Ethereum gas fee
        LTC: 0.05, // Litecoin low fee
        BCH: 0.01, // Bitcoin Cash low fee
        XRP: 0.001, // Ripple very low
        TRX: 0.001, // Tron very low
        TON: 0.01, // Toncoin low
        SOL: 0.001, // Solana very low
        DOGE: 0.5, // Dogecoin
        ADA: 0.2, // Cardano
        DOT: 0.1, // Polkadot
        USDT: 1.0, // Tether (depends on network)
        USDC: 1.0, // USD Coin
        ETC: 0.1, // Ethereum Classic
        USD: 0.5, // Fiat transfer fee
      };
      return networkFees[symbol] || 0.5; // Default $0.50
    };

    const transferFee = getNetworkFee(asset);
    const totalDeducted = amount + transferFee;

    // Find user with portfolio
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { Portfolio: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.Portfolio) {
      return NextResponse.json(
        { error: "Portfolio not found" },
        { status: 404 }
      );
    }

    const portfolio = user.Portfolio;

    // Handle USD transfers (deduct from balance)
    if (asset === "USD") {
      const currentBalance = parseFloat(portfolio.balance.toString());

      if (currentBalance < totalDeducted) {
        return NextResponse.json(
          {
            error: `Insufficient balance. You have $${currentBalance} but need $${totalDeducted} (including $${transferFee} fee)`,
          },
          { status: 400 }
        );
      }

      // Deduct from balance
      const newBalance = new Decimal(portfolio.balance).minus(totalDeducted);

      await prisma.portfolio.update({
        where: { id: portfolio.id },
        data: {
          balance: newBalance,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Successfully transferred $${amount} USD`,
        asset,
        amount,
        fee: transferFee,
        totalDeducted,
        destination,
        memo,
        newBalance: parseFloat(newBalance.toString()),
      });
    }

    // Handle crypto transfers (deduct from assets)
    const currentAssets: Asset[] = Array.isArray(portfolio.assets)
      ? (portfolio.assets as unknown as Asset[])
      : [];

    // Find the asset
    const assetIndex = currentAssets.findIndex((a) => a.symbol === asset);

    if (assetIndex === -1) {
      return NextResponse.json(
        { error: `You don't own any ${asset}` },
        { status: 400 }
      );
    }

    const currentAsset: Asset = currentAssets[assetIndex];

    // Check if user has enough (including fee)
    if (currentAsset.amount < totalDeducted) {
      return NextResponse.json(
        {
          error: `Insufficient ${asset}. You have ${currentAsset.amount} but need ${totalDeducted} (including ${transferFee} fee)`,
        },
        { status: 400 }
      );
    }

    // Update assets array
    let updatedAssets: Asset[];
    if (currentAsset.amount === totalDeducted) {
      // Remove asset completely if transferring all
      updatedAssets = currentAssets.filter((a) => a.symbol !== asset);
    } else {
      // Reduce amount
      updatedAssets = currentAssets.map((a) =>
        a.symbol === asset ? { ...a, amount: a.amount - totalDeducted } : a
      );
    }

    // Update portfolio
    await prisma.portfolio.update({
      where: { id: portfolio.id },
      data: {
        assets: updatedAssets as any,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Successfully transferred ${amount} ${asset}`,
      asset,
      amount,
      fee: transferFee,
      totalDeducted,
      destination,
      memo,
    });
  } catch (error) {
    console.error("Error transferring crypto:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
