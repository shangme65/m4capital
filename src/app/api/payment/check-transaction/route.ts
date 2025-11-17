import { generateId } from "@/lib/generate-id";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Check Bitcoin transaction status using Blockchain.com API
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized - Please login" },
        { status: 401 }
      );
    }

    const { address } = await request.json();

    if (!address) {
      return NextResponse.json(
        { error: "Bitcoin address is required" },
        { status: 400 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Find the deposit record
    const deposit = await prisma.bitcoinDeposit.findFirst({
      where: {
        userId: user.id,
        address: address,
      },
    });

    if (!deposit) {
      return NextResponse.json(
        { error: "Deposit record not found" },
        { status: 404 }
      );
    }

    // Query Blockchain.com API for address balance and transactions
    try {
      const response = await fetch(
        `https://blockchain.info/rawaddr/${address}?limit=10`,
        {
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch address data from Blockchain.com");
      }

      const data = await response.json();

      // Check if there are any transactions
      if (data.txs && data.txs.length > 0) {
        // Get the latest transaction
        const latestTx = data.txs[0];
        const confirmations = latestTx.block_height
          ? data.n_tx - latestTx.block_height + 1
          : 0;

        // Calculate total received amount (in satoshis)
        let totalReceived = 0;
        for (const output of latestTx.out) {
          if (output.addr === address) {
            totalReceived += output.value;
          }
        }

        const amountBTC = totalReceived / 100000000; // Convert satoshis to BTC

        // Get current BTC price in USD
        const priceResponse = await fetch("https://blockchain.info/ticker");
        const priceData = await priceResponse.json();
        const btcPriceUSD = priceData.USD.last;
        const amountUSD = amountBTC * btcPriceUSD;

        // Check if transaction is confirmed (minimum 3 confirmations)
        if (confirmations >= 3 && deposit.status === "pending") {
          // Update deposit status and credit user account
          await prisma.$transaction(async (tx) => {
            // Update deposit record
            await tx.bitcoinDeposit.update({
              where: { id: deposit.id },
              data: {
                status: "completed",
                amountBtc: amountBTC,
                amountUsd: amountUSD,
                confirmedAt: new Date(),
                confirmations: confirmations,
                txHash: latestTx.hash,
                metadata: {
                  ...((deposit.metadata as any) || {}),
                  completedAt: new Date().toISOString(),
                  blockHeight: latestTx.block_height,
                },
              },
            });

            // Get user's portfolio
            const portfolio = await tx.portfolio.findUnique({
              where: { userId: user.id },
            });

            if (portfolio) {
              // Update user's balance
              await tx.portfolio.update({
                where: { id: portfolio.id },
                data: {
                  balance: {
                    increment: amountUSD,
                  },
                },
              });

              // Create deposit record in portfolio
              await tx.deposit.create({
                data: {
                  id: generateId(),
                  portfolioId: portfolio.id,
                  userId: user.id,
                  amount: amountUSD,
                  currency: "USD",
                  status: "COMPLETED",
                  method: "BITCOIN_WALLET",
                  transactionHash: latestTx.hash,
                  confirmations: confirmations,
                  updatedAt: new Date(),
                  metadata: {
                    btcAmount: amountBTC,
                    btcPrice: btcPriceUSD,
                    address: address,
                    txHash: latestTx.hash,
                    confirmations: confirmations,
                    blockHeight: latestTx.block_height,
                  },
                },
              });
            }
          });

          return NextResponse.json({
            success: true,
            confirmed: true,
            amountBTC,
            amountUSD,
            confirmations,
            txHash: latestTx.hash,
            message: "Payment confirmed and credited to your account!",
          });
        }

        return NextResponse.json({
          success: true,
          confirmed: false,
          amountBTC,
          amountUSD,
          confirmations,
          txHash: latestTx.hash,
          message: `Transaction found! ${confirmations}/3 confirmations`,
        });
      }

      return NextResponse.json({
        success: true,
        confirmed: false,
        message:
          "No transactions found yet. Please send Bitcoin to this address.",
      });
    } catch (apiError) {
      console.error("Blockchain.com API error:", apiError);
      return NextResponse.json(
        {
          error: "Failed to check transaction status",
          details: apiError instanceof Error ? apiError.message : "API error",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Transaction check error:", error);
    return NextResponse.json(
      {
        error: "Failed to check transaction",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
