import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/p2p-transfer/history
 * Get user's transfer history (sent and received) with proper currency handling
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // 'sent', 'received', or 'all'
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let whereClause: any = {};

    if (type === "sent") {
      whereClause.senderId = user.id;
    } else if (type === "received") {
      whereClause.receiverId = user.id;
    } else {
      whereClause.OR = [{ senderId: user.id }, { receiverId: user.id }];
    }

    const [transfers, total] = await Promise.all([
      prisma.p2PTransfer.findMany({
        where: whereClause,
        include: {
          Sender: {
            select: {
              id: true,
              name: true,
              email: true,
              accountNumber: true,
            },
          },
          Receiver: {
            select: {
              id: true,
              name: true,
              email: true,
              accountNumber: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.p2PTransfer.count({ where: whereClause }),
    ]);

    const formattedTransfers = transfers.map((transfer) => {
      const isSender = transfer.senderId === user.id;

      // Parse metadata from description for cross-currency transfers
      let displayAmount = Number(transfer.amount);
      let displayCurrency = transfer.currency;

      try {
        const metadata = JSON.parse(transfer.description || "{}");
        if (metadata.senderAmount && metadata.receiverAmount) {
          // Cross-currency transfer with conversion metadata
          if (isSender) {
            displayAmount = Number(metadata.senderAmount);
            displayCurrency = metadata.senderCurrency || transfer.currency;
          } else {
            displayAmount = Number(metadata.receiverAmount);
            displayCurrency = metadata.receiverCurrency || transfer.currency;
          }
        }
      } catch {
        // Old format without metadata - use stored values
        // For old transfers, the amount/currency represents sender's values
        // This is a best-effort fallback
      }

      return {
        id: transfer.id,
        amount: displayAmount,
        currency: displayCurrency,
        // Also provide original values for reference
        originalAmount: Number(transfer.amount),
        originalCurrency: transfer.currency,
        status: transfer.status,
        description: transfer.description,
        transactionReference: transfer.transactionReference,
        type: isSender ? "sent" : "received",
        sender: {
          name: transfer.Sender.name,
          email: transfer.Sender.email,
          accountNumber: transfer.Sender.accountNumber,
        },
        receiver: {
          name: transfer.Receiver.name,
          email: transfer.Receiver.email,
          accountNumber: transfer.Receiver.accountNumber,
        },
        createdAt: transfer.createdAt,
        processedAt: transfer.processedAt,
        failureReason: transfer.failureReason,
      };
    });

    return NextResponse.json({
      success: true,
      transfers: formattedTransfers,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error("Error fetching transfer history:", error);
    return NextResponse.json(
      { error: "Failed to fetch transfer history" },
      { status: 500 }
    );
  }
}
