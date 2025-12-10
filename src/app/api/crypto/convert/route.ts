import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";
import { generateId } from "@/lib/generate-id";
import { sendEmail } from "@/lib/email";
import { sendPushNotification } from "@/lib/push-notifications";
import { getCurrencySymbol } from "@/lib/currencies";

export const dynamic = "force-dynamic";

interface ConvertCryptoRequest {
  fromAsset: string; // e.g., "BTC"
  toAsset: string; // e.g., "ETH"
  amount: number; // Amount of fromAsset to convert
  rate: number; // Conversion rate (1 fromAsset = X toAsset)
  fromPriceUSD?: number; // USD price of fromAsset
  toPriceUSD?: number; // USD price of toAsset
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

    const body: ConvertCryptoRequest = await request.json();
    const { fromAsset, toAsset, amount, rate } = body;

    // Validate required fields
    if (!fromAsset || !toAsset || !amount || !rate) {
      return NextResponse.json(
        { error: "Missing required fields: fromAsset, toAsset, amount, rate" },
        { status: 400 }
      );
    }

    if (fromAsset === toAsset) {
      return NextResponse.json(
        { error: "Cannot convert asset to itself" },
        { status: 400 }
      );
    }

    // Calculate conversion
    const conversionFee = 0.5; // 0.5% fee
    const feeAmount = amount * rate * (conversionFee / 100);
    const receiveAmount = amount * rate - feeAmount;

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

    // Parse current assets with proper typing
    const currentAssets: Asset[] = Array.isArray(portfolio.assets)
      ? (portfolio.assets as unknown as Asset[])
      : [];

    // Find the fromAsset
    const fromAssetIndex = currentAssets.findIndex(
      (a) => a.symbol === fromAsset
    );

    if (fromAssetIndex === -1) {
      return NextResponse.json(
        { error: `You don't own any ${fromAsset}` },
        { status: 400 }
      );
    }

    const currentFromAsset: Asset = currentAssets[fromAssetIndex];

    // Check if user has enough
    if (currentFromAsset.amount < amount) {
      return NextResponse.json(
        {
          error: `Insufficient ${fromAsset}. You have ${currentFromAsset.amount} but tried to convert ${amount}`,
        },
        { status: 400 }
      );
    }

    // Update assets array - remove fromAsset
    let updatedAssets: Asset[];
    if (currentFromAsset.amount === amount) {
      // Remove fromAsset completely if converting all
      updatedAssets = currentAssets.filter((a) => a.symbol !== fromAsset);
    } else {
      // Reduce fromAsset amount
      updatedAssets = currentAssets.map((a) =>
        a.symbol === fromAsset ? { ...a, amount: a.amount - amount } : a
      );
    }

    // Add toAsset
    const toAssetIndex = updatedAssets.findIndex((a) => a.symbol === toAsset);
    if (toAssetIndex === -1) {
      // Add new asset
      updatedAssets.push({
        symbol: toAsset,
        amount: receiveAmount,
        name: toAsset,
      });
    } else {
      // Increase existing asset
      updatedAssets = updatedAssets.map((a) =>
        a.symbol === toAsset ? { ...a, amount: a.amount + receiveAmount } : a
      );
    }

    // Update portfolio
    await prisma.portfolio.update({
      where: { id: portfolio.id },
      data: {
        assets: updatedAssets as any,
      },
    });

    // Calculate USD values for proper history display
    const fromPriceUSD = body.fromPriceUSD || 0;
    const toPriceUSD = body.toPriceUSD || 0;
    const fromValueUSD = amount * fromPriceUSD;
    const toValueUSD = receiveAmount * toPriceUSD;

    // Create a trade record for the swap transaction (for history tracking)
    // Using BUY side with metadata to indicate it's a swap
    await prisma.trade.create({
      data: {
        id: generateId(),
        userId: user.id,
        symbol: `${fromAsset}/${toAsset}`,
        side: "BUY", // Using BUY as placeholder, metadata indicates swap
        entryPrice: new Decimal(rate),
        quantity: new Decimal(amount),
        commission: new Decimal(feeAmount),
        status: "CLOSED",
        closedAt: new Date(),
        updatedAt: new Date(),
        metadata: {
          type: "SWAP",
          fromAsset,
          toAsset,
          fromAmount: amount,
          toAmount: receiveAmount,
          fromPriceUSD,
          toPriceUSD,
          fromValueUSD,
          toValueUSD,
          rate,
          fee: feeAmount,
          feePercentage: conversionFee,
        },
      },
    });

    // Send email notification
    try {
      if (user.email && user.emailNotifications !== false) {
        const userCurrency = user.preferredCurrency || "USD";
        const currencySymbol = getCurrencySymbol(userCurrency);

        // Convert USD values to user's currency
        let displayFromValue = fromValueUSD;
        let displayToValue = toValueUSD;

        if (userCurrency !== "USD") {
          const ratesResponse = await fetch(
            "https://api.frankfurter.app/latest?from=USD"
          );
          if (ratesResponse.ok) {
            const ratesData = await ratesResponse.json();
            const rate = ratesData.rates[userCurrency] || 1;
            displayFromValue = fromValueUSD * rate;
            displayToValue = toValueUSD * rate;
          }
        }

        await sendEmail({
          to: user.email,
          subject: `🔄 Swap Completed: ${fromAsset} → ${toAsset} - M4Capital`,
          html: `
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
                      <!-- Header -->
                      <tr>
                        <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #06b6d420 0%, transparent 100%);">
                          <div style="display: inline-block; width: 80px; height: 80px; background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); border-radius: 50%; margin-bottom: 20px; line-height: 80px; font-size: 36px;">
                            🔄
                          </div>
                          <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 700;">Swap Completed!</h1>
                          <p style="margin: 10px 0 0; color: #9ca3af; font-size: 16px;">${fromAsset} → ${toAsset}</p>
                        </td>
                      </tr>
                      <!-- Content -->
                      <tr>
                        <td style="padding: 30px 40px;">
                          <table width="100%" cellpadding="0" cellspacing="0" style="background: rgba(0,0,0,0.3); border-radius: 16px; padding: 20px;">
                            <tr>
                              <td style="padding: 12px 0; color: #ef4444; font-size: 14px; font-weight: 600;">FROM</td>
                              <td align="right" style="padding: 12px 0;">
                                <div style="color: white; font-size: 18px; font-weight: 700;">${amount.toFixed(
                                  8
                                )} ${fromAsset}</div>
                                <div style="color: #9ca3af; font-size: 14px;">≈ ${currencySymbol}${displayFromValue.toFixed(
            2
          )}</div>
                              </td>
                            </tr>
                            <tr>
                              <td colspan="2" style="padding: 8px 0; text-align: center;">
                                <div style="display: inline-block; width: 40px; height: 40px; background: #06b6d420; border-radius: 50%; line-height: 40px; font-size: 20px;">↓</div>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 12px 0; color: #22c55e; font-size: 14px; font-weight: 600;">TO</td>
                              <td align="right" style="padding: 12px 0;">
                                <div style="color: white; font-size: 18px; font-weight: 700;">${receiveAmount.toFixed(
                                  8
                                )} ${toAsset}</div>
                                <div style="color: #9ca3af; font-size: 14px;">≈ ${currencySymbol}${displayToValue.toFixed(
            2
          )}</div>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 12px 0; color: #9ca3af; font-size: 14px;">Exchange Rate</td>
                              <td align="right" style="padding: 12px 0; color: white; font-size: 14px;">1 ${fromAsset} = ${rate.toFixed(
            8
          )} ${toAsset}</td>
                            </tr>
                            <tr>
                              <td style="padding: 12px 0; color: #9ca3af; font-size: 14px;">Fee (${conversionFee}%)</td>
                              <td align="right" style="padding: 12px 0; color: white; font-size: 14px;">${feeAmount.toFixed(
                                8
                              )} ${toAsset}</td>
                            </tr>
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
          `,
          text: `Swap Completed! You swapped ${amount.toFixed(
            8
          )} ${fromAsset} for ${receiveAmount.toFixed(
            8
          )} ${toAsset}. Exchange Rate: 1 ${fromAsset} = ${rate.toFixed(
            8
          )} ${toAsset}. Fee: ${feeAmount.toFixed(
            8
          )} ${toAsset}. Thank you for using M4Capital!`,
        });
        console.log(`📧 Swap email sent to ${user.email}`);
      }
    } catch (emailError) {
      console.error("❌ Failed to send swap email:", emailError);
    }

    // Send push notification
    try {
      const userCurrency = user.preferredCurrency || "USD";
      const currencySymbol = getCurrencySymbol(userCurrency);

      // Convert USD value to user's currency for display
      let displayValue = fromValueUSD;
      if (userCurrency !== "USD") {
        const ratesResponse = await fetch(
          "https://api.frankfurter.app/latest?from=USD"
        );
        if (ratesResponse.ok) {
          const ratesData = await ratesResponse.json();
          const rate = ratesData.rates[userCurrency] || 1;
          displayValue = fromValueUSD * rate;
        }
      }

      await sendPushNotification(
        user.id,
        `Swap Completed`,
        `Swapped ${amount.toFixed(8)} ${fromAsset} to ${receiveAmount.toFixed(
          8
        )} ${toAsset}`,
        {
          type: "swap",
          amount: Math.round(displayValue * 100) / 100,
          asset: userCurrency,
          url: "/dashboard",
        }
      );
      console.log(`🔔 Swap push notification sent to user ${user.id}`);
    } catch (notifError) {
      console.error("❌ Failed to send swap push notification:", notifError);
    }

    return NextResponse.json({
      success: true,
      message: `Successfully converted ${amount} ${fromAsset} to ${receiveAmount.toFixed(
        8
      )} ${toAsset}`,
      fromAsset,
      toAsset,
      fromAmount: amount,
      receiveAmount,
      fee: feeAmount,
      rate,
    });
  } catch (error) {
    console.error("Error converting crypto:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
