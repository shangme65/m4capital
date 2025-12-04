import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrencySymbol } from "@/lib/currencies";
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

// Helper function to send email notification
async function sendTransferEmail(
  recipientEmail: string,
  senderName: string,
  amount: number,
  asset: string,
  memo?: string,
  currencySymbol?: string
) {
  try {
    const currSym = currencySymbol || (asset === "USD" ? "$" : "");
    const response = await fetch(
      `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/send-email`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: recipientEmail,
          subject: `You received ${
            asset === "USD"
              ? `${currSym}${amount.toFixed(2)}`
              : `${amount} ${asset}`
          } from ${senderName}`,
          template: "transfer-received",
          data: {
            senderName,
            amount,
            asset,
            memo,
            currencySymbol: currSym,
          },
        }),
      }
    );
    if (!response.ok) {
      console.error("Failed to send transfer email");
    }
  } catch (error) {
    console.error("Error sending transfer email:", error);
  }
}

// Helper function to send push notification
async function sendPushNotification(
  userId: string,
  title: string,
  message: string
) {
  try {
    const response = await fetch(
      `${
        process.env.NEXTAUTH_URL || "http://localhost:3000"
      }/api/notifications/push`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          title,
          message,
        }),
      }
    );
    if (!response.ok) {
      console.error("Failed to send push notification");
    }
  } catch (error) {
    console.error("Error sending push notification:", error);
  }
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

    // Normalize asset - treat FIAT as balance transfer
    const normalizedAsset = asset === "FIAT" ? "BALANCE" : asset;
    const isFiatTransfer = normalizedAsset === "BALANCE";

    // Dynamic network fees based on asset type (in USD equivalent)
    // For fiat/balance transfers, fee is minimal
    // For crypto, fee is in USD and will be converted to crypto equivalent
    const getNetworkFeeUSD = (symbol: string): number => {
      const networkFees: { [key: string]: number } = {
        BTC: 2.5, // Bitcoin average fee in USD
        ETH: 3.0, // Ethereum gas fee in USD
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
        USD: 0.0001, // Minimal fiat transfer fee
        BALANCE: 0.0001, // Minimal balance transfer fee
      };
      return networkFees[symbol] || 0.5; // Default $0.50
    };

    // Get the USD fee amount
    const feeInUSD = getNetworkFeeUSD(normalizedAsset);

    // Find sender with portfolio
    const sender = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { Portfolio: true },
    });

    if (!sender) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!sender.Portfolio) {
      return NextResponse.json(
        { error: "Portfolio not found" },
        { status: 404 }
      );
    }

    // Get user's preferred currency
    const userCurrency = sender.preferredCurrency || "USD";
    const currSymbol = getCurrencySymbol(userCurrency);

    // Find recipient by email or account number
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(destination);
    const recipient = await prisma.user.findFirst({
      where: isEmail ? { email: destination } : { accountNumber: destination },
      include: { Portfolio: true },
    });

    if (!recipient) {
      return NextResponse.json(
        { error: "Recipient not found" },
        { status: 404 }
      );
    }

    // Get recipient's preferred currency
    const recipientCurrency = recipient.preferredCurrency || "USD";
    const recipientCurrSymbol = getCurrencySymbol(recipientCurrency);

    // Fetch exchange rates for currency conversion
    let exchangeRates: { [key: string]: number } = { USD: 1 };
    try {
      const ratesRes = await fetch(
        `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/forex/rates`
      );
      if (ratesRes.ok) {
        const ratesData = await ratesRes.json();
        exchangeRates = ratesData.rates || { USD: 1 };
      }
    } catch (e) {
      console.error("Error fetching exchange rates:", e);
    }

    // Helper function to convert between currencies
    const convertCurrency = (
      amount: number,
      fromCurrency: string,
      toCurrency: string
    ): number => {
      if (fromCurrency === toCurrency) return amount;
      // Convert to USD first, then to target currency
      const fromRate = exchangeRates[fromCurrency] || 1;
      const toRate = exchangeRates[toCurrency] || 1;
      const usdAmount = amount / fromRate;
      return usdAmount * toRate;
    };

    if (!recipient.Portfolio) {
      return NextResponse.json(
        { error: "Recipient portfolio not found" },
        { status: 404 }
      );
    }

    const senderPortfolio = sender.Portfolio;
    const recipientPortfolio = recipient.Portfolio;

    // Generate transaction ID
    const transactionId = `TXN${Date.now()}${Math.random()
      .toString(36)
      .substring(2, 9)
      .toUpperCase()}`;

    // Handle fiat/balance transfers (deduct from balance)
    if (isFiatTransfer) {
      const currentBalance = parseFloat(senderPortfolio.balance.toString());
      const totalDeducted = amount + feeInUSD;

      if (currentBalance < totalDeducted) {
        return NextResponse.json(
          {
            error: `Insufficient balance. You have ${currSymbol}${currentBalance.toFixed(
              2
            )} but need ${currSymbol}${totalDeducted.toFixed(
              2
            )} (including ${currSymbol}${feeInUSD.toFixed(4)} fee)`,
          },
          { status: 400 }
        );
      }

      // Convert amount from sender's currency to recipient's currency
      const convertedAmount = convertCurrency(
        amount,
        userCurrency,
        recipientCurrency
      );

      // Deduct from sender's balance (in sender's currency)
      const newSenderBalance = new Decimal(senderPortfolio.balance).minus(
        totalDeducted
      );

      // Add converted amount to recipient's balance (in recipient's currency)
      const newRecipientBalance = new Decimal(recipientPortfolio.balance).plus(
        convertedAmount
      );

      // Update both portfolios and create P2PTransfer record in a transaction
      await prisma.$transaction([
        prisma.portfolio.update({
          where: { id: senderPortfolio.id },
          data: { balance: newSenderBalance },
        }),
        prisma.portfolio.update({
          where: { id: recipientPortfolio.id },
          data: {
            balance: newRecipientBalance,
            balanceCurrency: recipientCurrency, // Ensure recipient's currency is set
          },
        }),
        // Record the transfer - store original amount in sender's currency
        // The description field contains JSON metadata for cross-currency transfers
        prisma.p2PTransfer.create({
          data: {
            id: transactionId,
            senderId: sender.id,
            receiverId: recipient.id,
            amount: new Decimal(amount), // Store original sender amount
            currency: userCurrency, // Store in sender's currency
            status: "COMPLETED",
            // Store conversion metadata in description for receiver's history
            description: JSON.stringify({
              memo: memo || "P2P Transfer",
              senderAmount: amount,
              senderCurrency: userCurrency,
              receiverAmount: convertedAmount,
              receiverCurrency: recipientCurrency,
            }),
            senderAccountNumber: sender.accountNumber || sender.id,
            receiverAccountNumber: recipient.accountNumber || recipient.id,
            receiverEmail: recipient.email || "",
            receiverName: recipient.name || "User",
            transactionReference: transactionId,
            processedAt: new Date(),
            updatedAt: new Date(),
          },
        }),
      ]);

      // Send email notification to recipient with converted amount
      if (recipient.email) {
        sendTransferEmail(
          recipient.email,
          sender.name || sender.email || "Someone",
          convertedAmount, // Use converted amount
          recipientCurrency, // Use recipient's currency
          memo,
          recipientCurrSymbol
        );
      }

      // Send push notification to recipient with converted amount
      sendPushNotification(
        recipient.id,
        "Transfer Received!",
        `You received ${recipientCurrSymbol}${convertedAmount.toFixed(
          2
        )} from ${sender.name || sender.email}`
      );

      return NextResponse.json({
        success: true,
        message: `Successfully transferred ${currSymbol}${amount.toFixed(
          2
        )} ${userCurrency} to ${recipient.name || destination}`,
        transactionId,
        asset: userCurrency, // Return sender's currency
        amount,
        convertedAmount,
        recipientCurrency,
        fee: feeInUSD,
        totalDeducted,
        destination,
        recipientName: recipient.name,
        memo,
        newBalance: parseFloat(newSenderBalance.toString()),
      });
    }

    // Handle crypto transfers (deduct from assets)
    const senderAssets: Asset[] = Array.isArray(senderPortfolio.assets)
      ? (senderPortfolio.assets as unknown as Asset[])
      : [];

    // Find the asset in sender's portfolio
    const assetIndex = senderAssets.findIndex((a) => a.symbol === asset);

    if (assetIndex === -1) {
      return NextResponse.json(
        { error: `You don't own any ${asset}` },
        { status: 400 }
      );
    }

    const senderAsset: Asset = senderAssets[assetIndex];

    // Get current crypto price to convert USD fee to crypto
    let cryptoPrice = 1;
    try {
      const priceRes = await fetch(
        `${
          process.env.NEXTAUTH_URL || "http://localhost:3000"
        }/api/crypto/prices?symbols=${asset}`
      );
      const priceData = await priceRes.json();
      if (priceData.prices && priceData.prices[0]) {
        cryptoPrice = priceData.prices[0].price;
      }
    } catch (e) {
      console.error("Error fetching crypto price for fee calculation:", e);
    }

    // Convert USD fee to crypto equivalent
    const feeInCrypto = cryptoPrice > 0 ? feeInUSD / cryptoPrice : 0;
    const totalDeducted = amount + feeInCrypto;

    // Check if sender has enough (including fee converted to crypto)
    if (senderAsset.amount < totalDeducted) {
      return NextResponse.json(
        {
          error: `Insufficient ${asset}. You have ${senderAsset.amount.toFixed(
            8
          )} but need ${totalDeducted.toFixed(
            8
          )} (including ~$${feeInUSD.toFixed(2)} fee)`,
        },
        { status: 400 }
      );
    }

    // Update sender's assets array
    let updatedSenderAssets: Asset[];
    if (senderAsset.amount === totalDeducted) {
      updatedSenderAssets = senderAssets.filter((a) => a.symbol !== asset);
    } else {
      updatedSenderAssets = senderAssets.map((a) =>
        a.symbol === asset ? { ...a, amount: a.amount - totalDeducted } : a
      );
    }

    // Update recipient's assets array
    const recipientAssets: Asset[] = Array.isArray(recipientPortfolio.assets)
      ? (recipientPortfolio.assets as unknown as Asset[])
      : [];

    const recipientAssetIndex = recipientAssets.findIndex(
      (a) => a.symbol === asset
    );
    let updatedRecipientAssets: Asset[];

    if (recipientAssetIndex === -1) {
      // Recipient doesn't have this asset, add it
      updatedRecipientAssets = [
        ...recipientAssets,
        { symbol: asset, amount: amount },
      ];
    } else {
      // Recipient has this asset, add to it
      updatedRecipientAssets = recipientAssets.map((a) =>
        a.symbol === asset ? { ...a, amount: a.amount + amount } : a
      );
    }

    // Calculate USD value using the price we already fetched
    const usdValue = amount * cryptoPrice;

    // Update both portfolios and create P2PTransfer record in a transaction
    await prisma.$transaction([
      prisma.portfolio.update({
        where: { id: senderPortfolio.id },
        data: { assets: updatedSenderAssets as any },
      }),
      prisma.portfolio.update({
        where: { id: recipientPortfolio.id },
        data: { assets: updatedRecipientAssets as any },
      }),
      // Record the transfer
      prisma.p2PTransfer.create({
        data: {
          id: transactionId,
          senderId: sender.id,
          receiverId: recipient.id,
          amount: new Decimal(usdValue),
          currency: asset,
          status: "COMPLETED",
          description: memo || `P2P Transfer of ${amount} ${asset}`,
          senderAccountNumber: sender.accountNumber || sender.id,
          receiverAccountNumber: recipient.accountNumber || recipient.id,
          receiverEmail: recipient.email || "",
          receiverName: recipient.name || "User",
          transactionReference: transactionId,
          processedAt: new Date(),
          updatedAt: new Date(),
        },
      }),
    ]);

    // Send email notification to recipient
    if (recipient.email) {
      sendTransferEmail(
        recipient.email,
        sender.name || sender.email || "Someone",
        amount,
        asset,
        memo
      );
    }

    // Send push notification to recipient
    sendPushNotification(
      recipient.id,
      "Transfer Received!",
      `You received ${amount.toFixed(8)} ${asset} from ${
        sender.name || sender.email
      }`
    );

    return NextResponse.json({
      success: true,
      message: `Successfully transferred ${amount.toFixed(8)} ${asset} to ${
        recipient.name || destination
      }`,
      transactionId,
      asset,
      amount,
      fee: feeInCrypto,
      feeUSD: feeInUSD,
      totalDeducted,
      destination,
      recipientName: recipient.name,
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
