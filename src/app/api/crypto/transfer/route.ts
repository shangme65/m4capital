import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrencySymbol } from "@/lib/currencies";
import { Decimal } from "@prisma/client/runtime/library";
import { sendEmail } from "@/lib/email";
import { sendPushNotification as sendPushNotificationLib } from "@/lib/push-notifications";

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

// Helper function to generate transfer email HTML
function generateTransferEmailHtml(
  recipientName: string,
  senderName: string,
  amount: number,
  asset: string,
  direction: "sent" | "received",
  memo?: string,
  currencySymbol?: string
) {
  const currSym = currencySymbol || (asset === "USD" ? "$" : "");
  const isCrypto = !["USD", "BRL", "EUR", "GBP", "INR", "NGN"].includes(asset);
  const amountDisplay = isCrypto
    ? `${amount.toFixed(8)} ${asset}`
    : `${currSym}${amount.toFixed(2)}`;

  const titleText =
    direction === "received"
      ? `You received ${amountDisplay}`
      : `Transfer Sent Successfully`;
  const subtitleText =
    direction === "received"
      ? `from ${senderName}`
      : `${amountDisplay} to ${recipientName}`;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background: linear-gradient(145deg, #1e293b 0%, #0f172a 100%); border-radius: 24px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
              <!-- Logo Header -->
              <tr>
                <td style="text-align: center; padding: 24px 20px; background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%); border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
                  <img src="https://www.m4capital.online/m4capitallogo1.png" alt="M4Capital" width="140" style="display: inline-block; max-width: 140px; height: auto;" />
                </td>
              </tr>
              <!-- Header -->
              <tr>
                <td style="padding: 30px 40px 20px; text-align: center; background: linear-gradient(135deg, ${
                  direction === "received" ? "#22c55e20" : "#3b82f620"
                } 0%, transparent 100%);">
                  <div style="display: inline-block; width: 80px; height: 80px; background: linear-gradient(135deg, ${
                    direction === "received" ? "#22c55e" : "#3b82f6"
                  } 0%, ${
    direction === "received" ? "#16a34a" : "#2563eb"
  } 100%); border-radius: 50%; margin-bottom: 20px; line-height: 80px; font-size: 36px;">
                    ${direction === "received" ? "📥" : "📤"}
                  </div>
                  <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 700;">${titleText}</h1>
                  <p style="margin: 10px 0 0; color: #9ca3af; font-size: 16px;">${subtitleText}</p>
                </td>
              </tr>
              <!-- Content -->
              <tr>
                <td style="padding: 30px 40px;">
                  <table width="100%" cellpadding="0" cellspacing="0" style="background: rgba(0,0,0,0.3); border-radius: 16px; padding: 20px;">
                    <tr>
                      <td style="padding: 12px 0; color: #9ca3af; font-size: 14px;">Amount</td>
                      <td align="right" style="padding: 12px 0; color: white; font-size: 18px; font-weight: 700;">${amountDisplay}</td>
                    </tr>
                    <tr>
                      <td style="padding: 12px 0; color: #9ca3af; font-size: 14px;">${
                        direction === "received" ? "From" : "To"
                      }</td>
                      <td align="right" style="padding: 12px 0; color: white; font-size: 16px;">${
                        direction === "received" ? senderName : recipientName
                      }</td>
                    </tr>
                    ${
                      memo
                        ? `
                    <tr>
                      <td style="padding: 12px 0; color: #9ca3af; font-size: 14px;">Memo</td>
                      <td align="right" style="padding: 12px 0; color: white; font-size: 16px;">${memo}</td>
                    </tr>
                    `
                        : ""
                    }
                    <tr>
                      <td style="padding: 12px 0; color: #9ca3af; font-size: 14px;">Status</td>
                      <td align="right" style="padding: 12px 0;">
                        <span style="display: inline-block; background: #22c55e20; color: #22c55e; padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: 600;">Completed</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="padding: 20px 40px 40px; text-align: center;">
                  <p style="margin: 0; color: #6b7280; font-size: 13px;">This is an automated notification from M4Capital.</p>
                  <p style="margin: 10px 0 0; color: #6b7280; font-size: 12px;">© ${new Date().getFullYear()} M4Capital. All rights reserved.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

// Helper function to send email notification to recipient
async function sendTransferReceivedEmail(
  recipientEmail: string,
  recipientName: string,
  senderName: string,
  amount: number,
  asset: string,
  memo?: string,
  currencySymbol?: string
) {
  try {
    const currSym = currencySymbol || (asset === "USD" ? "$" : "");
    const isCrypto = !["USD", "BRL", "EUR", "GBP", "INR", "NGN"].includes(
      asset
    );
    const amountDisplay = isCrypto
      ? `${amount.toFixed(8)} ${asset}`
      : `${currSym}${amount.toFixed(2)}`;

    await sendEmail({
      to: recipientEmail,
      subject: `📥 You received ${amountDisplay} from ${senderName} - M4Capital`,
      html: generateTransferEmailHtml(
        recipientName,
        senderName,
        amount,
        asset,
        "received",
        memo,
        currencySymbol
      ),
      text: `You received ${amountDisplay} from ${senderName}${
        memo ? `. Memo: ${memo}` : ""
      }. Thank you for using M4Capital!`,
    });
    console.log(`📧 Transfer received email sent to ${recipientEmail}`);
  } catch (error) {
    console.error("Error sending transfer received email:", error);
  }
}

// Helper function to send email notification to sender
async function sendTransferSentEmail(
  senderEmail: string,
  senderName: string,
  recipientName: string,
  amount: number,
  asset: string,
  memo?: string,
  currencySymbol?: string
) {
  try {
    const currSym = currencySymbol || (asset === "USD" ? "$" : "");
    const isCrypto = !["USD", "BRL", "EUR", "GBP", "INR", "NGN"].includes(
      asset
    );
    const amountDisplay = isCrypto
      ? `${amount.toFixed(8)} ${asset}`
      : `${currSym}${amount.toFixed(2)}`;

    await sendEmail({
      to: senderEmail,
      subject: `📤 Transfer Sent: ${amountDisplay} to ${recipientName} - M4Capital`,
      html: generateTransferEmailHtml(
        recipientName,
        senderName,
        amount,
        asset,
        "sent",
        memo,
        currencySymbol
      ),
      text: `You sent ${amountDisplay} to ${recipientName}${
        memo ? `. Memo: ${memo}` : ""
      }. Thank you for using M4Capital!`,
    });
    console.log(`📧 Transfer sent email sent to ${senderEmail}`);
  } catch (error) {
    console.error("Error sending transfer sent email:", error);
  }
}

// Helper function to send push notification using the library
async function sendTransferPushNotification(
  userId: string,
  title: string,
  message: string,
  amount: number,
  asset: string
) {
  try {
    await sendPushNotificationLib(userId, title, message, {
      type: "transfer",
      amount,
      asset,
      url: "/dashboard",
    });
    console.log(`🔔 Push notification sent to user ${userId}`);
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

    // Get user's currencies - IMPORTANT DISTINCTION:
    // - preferredCurrency: what the user sees in the UI (can be changed)
    // - balanceCurrency: what the balance is actually stored in (set at deposit time)
    const userPreferredCurrency = sender.preferredCurrency || "USD";
    const userBalanceCurrency =
      sender.Portfolio.balanceCurrency || userPreferredCurrency;
    const currSymbol = getCurrencySymbol(userPreferredCurrency);

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

    // Get recipient's currencies
    const recipientPreferredCurrency = recipient.preferredCurrency || "USD";
    const recipientBalanceCurrency =
      recipient.Portfolio?.balanceCurrency || recipientPreferredCurrency;
    const recipientCurrSymbol = getCurrencySymbol(recipientPreferredCurrency);

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

      // Step 1: Convert user's input from preferredCurrency to balanceCurrency
      // User enters "100 EUR" but balance might be stored in BRL
      const amountInSenderBalanceCurrency = convertCurrency(
        amount,
        userPreferredCurrency,
        userBalanceCurrency
      );

      // Fee is in USD, convert to sender's balance currency
      const feeInBalanceCurrency = convertCurrency(
        feeInUSD,
        "USD",
        userBalanceCurrency
      );
      const totalDeducted =
        amountInSenderBalanceCurrency + feeInBalanceCurrency;

      if (currentBalance < totalDeducted) {
        // Show error in user's preferred currency for clarity
        const balanceInPreferred = convertCurrency(
          currentBalance,
          userBalanceCurrency,
          userPreferredCurrency
        );
        const neededInPreferred = convertCurrency(
          totalDeducted,
          userBalanceCurrency,
          userPreferredCurrency
        );
        return NextResponse.json(
          {
            error: `Insufficient balance. You have ${currSymbol}${balanceInPreferred.toFixed(
              2
            )} but need ${currSymbol}${neededInPreferred.toFixed(
              2
            )} (including fee)`,
          },
          { status: 400 }
        );
      }

      // Step 2: Convert from sender's balance currency to recipient's balance currency
      const amountInRecipientBalanceCurrency = convertCurrency(
        amountInSenderBalanceCurrency,
        userBalanceCurrency,
        recipientBalanceCurrency
      );

      // Deduct from sender's balance (in sender's BALANCE currency)
      const newSenderBalance = new Decimal(senderPortfolio.balance).minus(
        totalDeducted
      );

      // Add to recipient's balance (in recipient's BALANCE currency)
      const newRecipientBalance = new Decimal(recipientPortfolio.balance).plus(
        amountInRecipientBalanceCurrency
      );

      // Calculate display amounts in preferred currencies for history/notifications
      const recipientDisplayAmount = convertCurrency(
        amountInRecipientBalanceCurrency,
        recipientBalanceCurrency,
        recipientPreferredCurrency
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
            // Don't change balanceCurrency - keep recipient's existing storage currency
          },
        }),
        // Record the transfer with comprehensive metadata
        prisma.p2PTransfer.create({
          data: {
            id: transactionId,
            senderId: sender.id,
            receiverId: recipient.id,
            amount: new Decimal(amountInSenderBalanceCurrency), // Store actual deducted amount
            currency: userBalanceCurrency, // Store sender's balance currency
            status: "COMPLETED",
            // Store complete conversion metadata for proper history display
            description: JSON.stringify({
              memo: memo || "P2P Transfer",
              // Sender's perspective
              senderInputAmount: amount,
              senderInputCurrency: userPreferredCurrency,
              senderDeductedAmount: amountInSenderBalanceCurrency,
              senderBalanceCurrency: userBalanceCurrency,
              // Receiver's perspective
              receiverCreditedAmount: amountInRecipientBalanceCurrency,
              receiverBalanceCurrency: recipientBalanceCurrency,
              receiverDisplayAmount: recipientDisplayAmount,
              receiverDisplayCurrency: recipientPreferredCurrency,
              // Legacy fields for backward compatibility
              senderAmount: amount,
              senderCurrency: userPreferredCurrency,
              receiverAmount: recipientDisplayAmount,
              receiverCurrency: recipientPreferredCurrency,
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

      // Send email notification to recipient in their preferred currency
      if (recipient.email && recipient.emailNotifications !== false) {
        sendTransferReceivedEmail(
          recipient.email,
          recipient.name || "User",
          sender.name || sender.email || "Someone",
          recipientDisplayAmount,
          recipientPreferredCurrency,
          memo,
          recipientCurrSymbol
        );
      }

      // Send email notification to sender in their preferred currency
      if (sender.email && sender.emailNotifications !== false) {
        sendTransferSentEmail(
          sender.email,
          sender.name || "User",
          recipient.name || destination,
          amount,
          userPreferredCurrency,
          memo,
          currSymbol
        );
      }

      // Send push notification to recipient in their preferred currency
      sendTransferPushNotification(
        recipient.id,
        "Transfer Received",
        `You received ${recipientCurrSymbol}${recipientDisplayAmount.toFixed(
          2
        )} from ${sender.name || sender.email}`,
        recipientDisplayAmount,
        recipientPreferredCurrency
      );

      // Send push notification to sender in their preferred currency
      sendTransferPushNotification(
        sender.id,
        "Transfer Sent",
        `You sent ${currSymbol}${amount.toFixed(2)} to ${
          recipient.name || destination
        }`,
        amount,
        userPreferredCurrency
      );

      return NextResponse.json({
        success: true,
        message: `Successfully transferred ${currSymbol}${amount.toFixed(
          2
        )} ${userPreferredCurrency} to ${recipient.name || destination}`,
        transactionId,
        asset: userPreferredCurrency, // Return sender's preferred currency
        amount,
        deductedAmount: amountInSenderBalanceCurrency,
        deductedCurrency: userBalanceCurrency,
        creditedAmount: amountInRecipientBalanceCurrency,
        creditedCurrency: recipientBalanceCurrency,
        recipientDisplayAmount,
        recipientDisplayCurrency: recipientPreferredCurrency,
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
      // Record the transfer with crypto amount and price in JSON metadata
      prisma.p2PTransfer.create({
        data: {
          id: transactionId,
          senderId: sender.id,
          receiverId: recipient.id,
          amount: new Decimal(usdValue), // Store USD value in amount field
          currency: asset, // Store crypto symbol
          status: "COMPLETED",
          // Store all details in JSON for proper display
          description: JSON.stringify({
            type: "crypto",
            memo: memo || "P2P Transfer",
            cryptoAmount: amount, // Actual crypto amount transferred
            cryptoPrice: cryptoPrice, // Price at time of transfer
            usdValue: usdValue, // Total USD value
            feeInCrypto: feeInCrypto, // Fee in crypto
            feeInUSD: feeInUSD, // Fee in USD
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

    // Send email notification to recipient
    if (recipient.email && recipient.emailNotifications !== false) {
      sendTransferReceivedEmail(
        recipient.email,
        recipient.name || "User",
        sender.name || sender.email || "Someone",
        amount,
        asset,
        memo
      );
    }

    // Send email notification to sender
    if (sender.email && sender.emailNotifications !== false) {
      sendTransferSentEmail(
        sender.email,
        sender.name || "User",
        recipient.name || destination,
        amount,
        asset,
        memo
      );
    }

    // Send push notification to recipient
    sendTransferPushNotification(
      recipient.id,
      "Transfer Received",
      `You received ${amount.toFixed(8)} ${asset} from ${
        sender.name || sender.email
      }`,
      amount,
      asset
    );

    // Send push notification to sender
    sendTransferPushNotification(
      sender.id,
      "Transfer Sent",
      `You sent ${amount.toFixed(8)} ${asset} to ${
        recipient.name || destination
      }`,
      amount,
      asset
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
