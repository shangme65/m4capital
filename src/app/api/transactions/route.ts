import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/transactions
 * Fetch all user transactions (deposits, withdrawals, trades)
 * Returns combined transaction history with confirmation status
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's portfolio ID
    const portfolio = await prisma.portfolio.findUnique({
      where: { userId: session.user.id },
    });

    if (!portfolio) {
      return NextResponse.json(
        { error: "Portfolio not found" },
        { status: 404 }
      );
    }

    // Fetch deposits (including pending ones with confirmation tracking)
    const deposits = await prisma.deposit.findMany({
      where: { portfolioId: portfolio.id },
      orderBy: { createdAt: "desc" },
      take: 50, // Last 50 transactions
    });

    // Fetch withdrawals
    const withdrawals = await prisma.withdrawal.findMany({
      where: { portfolioId: portfolio.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    // Fetch trades
    const trades = await prisma.trade.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    // Fetch P2P transfers (both sent and received)
    const sentTransfers = await prisma.p2PTransfer.findMany({
      where: { senderId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { Receiver: { select: { name: true, email: true } } },
    });

    const receivedTransfers = await prisma.p2PTransfer.findMany({
      where: { receiverId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { Sender: { select: { name: true, email: true } } },
    });

    // Transform deposits into transaction format
    const depositTransactions = deposits.map((d) => {
      // Determine if this is a crypto deposit
      const isCryptoDeposit = d.targetAsset || d.cryptoCurrency;
      // Get fiat value from metadata if available, otherwise use amount
      const metadata = d.metadata as { fiatAmount?: number } | null;
      const fiatValue = metadata?.fiatAmount || Number(d.amount);

      return {
        id: d.id,
        type: "deposit" as const,
        asset: d.targetAsset || d.cryptoCurrency || d.currency || "USD",
        // For crypto deposits, use cryptoAmount; for fiat, use amount
        amount: isCryptoDeposit
          ? Number(d.cryptoAmount || d.amount)
          : Number(d.amount),
        // For crypto deposits, use fiatAmount from metadata (USD value at time of deposit)
        // For fiat deposits, the amount is already in user's currency
        value: isCryptoDeposit ? fiatValue : Number(d.amount),
        timestamp: d.createdAt.toISOString(),
        status:
          d.status === "COMPLETED"
            ? ("completed" as const)
            : d.status === "PENDING"
            ? ("pending" as const)
            : ("failed" as const),
        fee: d.fee ? Number(d.fee) : undefined,
        method: d.method || "Manual",
        description: d.cryptoCurrency
          ? `Deposit ${d.cryptoCurrency}`
          : d.targetAsset
          ? `${d.targetAsset} Deposit to your portfolio`
          : "Balance Deposit to your account",
        date: d.createdAt,
        confirmations: d.confirmations,
        maxConfirmations: 6,
        hash: d.transactionHash || undefined,
        network:
          d.cryptoCurrency || d.targetAsset
            ? `${d.cryptoCurrency || d.targetAsset} Network`
            : undefined,
      };
    });

    // Transform withdrawals into transaction format
    const withdrawalTransactions = withdrawals.map((w) => ({
      id: w.id,
      type: "withdraw" as const,
      asset: w.currency || "USD",
      amount: Number(w.amount),
      value: Number(w.amount),
      timestamp: w.createdAt.toISOString(),
      status:
        w.status === "COMPLETED"
          ? ("completed" as const)
          : w.status === "PENDING"
          ? ("pending" as const)
          : ("failed" as const),
      fee: w.fee ? Number(w.fee) : undefined,
      method: w.method || "Bank Transfer",
      description: "Withdrawal from your account",
      date: w.createdAt,
    }));

    // Transform trades into transaction format
    const tradeTransactions = trades.map((t) => {
      // Check if this is a swap transaction from metadata
      const metadata = t.metadata as {
        type?: string;
        fromAsset?: string;
        toAsset?: string;
        fromAmount?: number;
        toAmount?: number;
        fromPriceUSD?: number;
        toPriceUSD?: number;
        fromValueUSD?: number;
        toValueUSD?: number;
        rate?: number;
      } | null;
      const isSwap = metadata?.type === "SWAP";

      if (isSwap) {
        // Swap transaction - use stored USD value, or calculate from amount * price
        const fromValueUSD =
          metadata?.fromValueUSD ||
          (metadata?.fromAmount || 0) * (metadata?.fromPriceUSD || 0);
        const toValueUSD =
          metadata?.toValueUSD ||
          (metadata?.toAmount || 0) * (metadata?.toPriceUSD || 0);

        return {
          id: t.id,
          type: "convert" as const,
          asset: t.symbol, // e.g., "BTC/ETH"
          amount: metadata?.fromAmount || Number(t.quantity),
          value: fromValueUSD, // USD value of from amount (for display in user's currency)
          timestamp: t.createdAt.toISOString(),
          status: "completed" as const,
          fee: t.commission ? Number(t.commission) : undefined,
          description: `Swapped ${
            metadata?.fromAmount?.toFixed(8) || t.quantity
          } ${metadata?.fromAsset || ""} to ${
            metadata?.toAmount?.toFixed(8) || ""
          } ${metadata?.toAsset || ""}`,
          date: t.createdAt,
          fromAsset: metadata?.fromAsset,
          toAsset: metadata?.toAsset,
          fromAmount: metadata?.fromAmount,
          toAmount: metadata?.toAmount,
          fromPriceUSD: metadata?.fromPriceUSD,
          toPriceUSD: metadata?.toPriceUSD,
          fromValueUSD,
          toValueUSD,
          rate: metadata?.rate,
        };
      }

      // Regular buy/sell transaction
      return {
        id: t.id,
        type: t.side === "BUY" ? ("buy" as const) : ("sell" as const),
        asset: t.symbol,
        amount: Number(t.quantity),
        value: Number(t.entryPrice) * Number(t.quantity),
        timestamp: t.createdAt.toISOString(),
        status: "completed" as const,
        fee: t.commission ? Number(t.commission) : undefined,
        description: `${t.side} ${t.quantity} ${t.symbol} at $${t.entryPrice}`,
        date: t.createdAt,
      };
    });

    // Transform sent transfers into transaction format
    // For sent transfers, show in sender's currency (from metadata if available, fallback to stored values)
    const sentTransferTransactions = sentTransfers.map((t) => {
      // Parse description for memo and crypto details (description may contain JSON metadata)
      let displayMemo = "P2P Transfer";
      let isCryptoTransfer = false;
      let cryptoAmount = 0;
      let cryptoPrice = 0;
      let usdValue = Number(t.amount);
      let senderAmount = Number(t.amount);
      let senderCurrency = t.currency || "USD";

      try {
        const metadata = JSON.parse(t.description || "{}");
        displayMemo = metadata.memo || "P2P Transfer";

        // Check for cross-currency fiat transfer metadata
        if (metadata.senderAmount && metadata.senderCurrency) {
          senderAmount = Number(metadata.senderAmount);
          senderCurrency = metadata.senderCurrency;
        }

        if (metadata.type === "crypto" && metadata.cryptoAmount) {
          isCryptoTransfer = true;
          cryptoAmount = metadata.cryptoAmount;
          cryptoPrice = metadata.cryptoPrice || 0;
          usdValue = metadata.usdValue || Number(t.amount);
        }
      } catch {
        // Old format: "P2P Transfer of X BTC" or plain memo
        const descMatch = t.description?.match(
          /P2P Transfer of ([\d.]+) ([A-Z]+)/
        );
        if (descMatch) {
          isCryptoTransfer = true;
          cryptoAmount = parseFloat(descMatch[1]);
        }
        displayMemo = t.description || "P2P Transfer";
      }

      // Check if this is a crypto transfer (currency is a crypto symbol, not fiat)
      const FIAT_CURRENCIES = [
        "USD",
        "EUR",
        "GBP",
        "BRL",
        "JPY",
        "CAD",
        "AUD",
        "CHF",
        "INR",
        "CNY",
        "KRW",
        "NGN",
      ];
      const isFiatCurrency = FIAT_CURRENCIES.includes(senderCurrency);

      if (!isFiatCurrency && !isCryptoTransfer) {
        // It's a crypto currency but no metadata - treat amount as USD value
        isCryptoTransfer = true;
      }

      return {
        id: t.id,
        type: "transfer" as const,
        asset: senderCurrency,
        // For crypto transfers, show the crypto amount; for fiat, show the fiat amount
        amount:
          isCryptoTransfer && cryptoAmount > 0 ? cryptoAmount : senderAmount,
        // Value is USD value for crypto, or fiat amount for fiat transfers
        value: isCryptoTransfer ? usdValue : senderAmount,
        timestamp: t.createdAt.toISOString(),
        status:
          t.status === "COMPLETED"
            ? ("completed" as const)
            : t.status === "PENDING"
            ? ("pending" as const)
            : ("failed" as const),
        fee: 0.0001,
        method: "P2P Transfer",
        description: `Transfer to ${
          t.Receiver?.name || t.receiverName || t.receiverEmail
        }`,
        date: t.createdAt,
        hash: t.transactionReference,
        // Include crypto-specific data for proper display
        isCrypto: isCryptoTransfer && !isFiatCurrency,
        cryptoPrice: cryptoPrice,
      };
    });

    // Transform received transfers into transaction format
    // For received transfers, show in receiver's currency (from metadata if available)
    const receivedTransferTransactions = receivedTransfers.map((t) => {
      // Parse description for receiver's amount and currency
      let receiverAmount = Number(t.amount);
      let receiverCurrency = t.currency || "USD";
      let displayMemo = "P2P Transfer";
      let isCryptoTransfer = false;
      let cryptoAmount = 0;
      let cryptoPrice = 0;
      let usdValue = Number(t.amount);

      try {
        const metadata = JSON.parse(t.description || "{}");
        displayMemo = metadata.memo || "P2P Transfer";

        // Check if it's a crypto transfer
        if (metadata.type === "crypto" && metadata.cryptoAmount) {
          isCryptoTransfer = true;
          cryptoAmount = metadata.cryptoAmount;
          cryptoPrice = metadata.cryptoPrice || 0;
          usdValue = metadata.usdValue || Number(t.amount);
          receiverAmount = cryptoAmount;
        } else if (metadata.receiverAmount && metadata.receiverCurrency) {
          // Fiat cross-currency transfer
          receiverAmount = Number(metadata.receiverAmount);
          receiverCurrency = metadata.receiverCurrency;
        }
      } catch {
        // Old format: "P2P Transfer of X BTC"
        const descMatch = t.description?.match(
          /P2P Transfer of ([\d.]+) ([A-Z]+)/
        );
        if (descMatch) {
          isCryptoTransfer = true;
          cryptoAmount = parseFloat(descMatch[1]);
          receiverAmount = cryptoAmount;
        }
        displayMemo = t.description || "P2P Transfer";
      }

      // Check if currency is crypto (not fiat)
      const FIAT_CURRENCIES = [
        "USD",
        "EUR",
        "GBP",
        "BRL",
        "JPY",
        "CAD",
        "AUD",
        "CHF",
        "INR",
        "CNY",
        "KRW",
        "NGN",
      ];
      const isFiatCurrency = FIAT_CURRENCIES.includes(receiverCurrency);

      return {
        id: t.id,
        type: "deposit" as const, // Show received transfers as deposits
        asset: receiverCurrency, // Receiver's currency or crypto symbol
        amount: receiverAmount,
        value: isCryptoTransfer ? usdValue : receiverAmount,
        timestamp: t.createdAt.toISOString(),
        status:
          t.status === "COMPLETED"
            ? ("completed" as const)
            : t.status === "PENDING"
            ? ("pending" as const)
            : ("failed" as const),
        fee: 0,
        method: "P2P Transfer",
        description: `Transfer from ${
          t.Sender?.name || t.Sender?.email || "User"
        }`,
        date: t.createdAt,
        hash: t.transactionReference,
        isCrypto: isCryptoTransfer && !isFiatCurrency,
        cryptoPrice: cryptoPrice,
      };
    });

    // Combine and sort all transactions by date
    const allTransactions = [
      ...depositTransactions,
      ...withdrawalTransactions,
      ...tradeTransactions,
      ...sentTransferTransactions,
      ...receivedTransferTransactions,
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({
      transactions: allTransactions.slice(0, 50), // Return last 50
      count: allTransactions.length,
    });
  } catch (error) {
    console.error("❌ Failed to fetch transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}
