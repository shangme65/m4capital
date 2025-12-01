import { generateId } from "@/lib/generate-id";
import { getCurrencySymbol } from "@/lib/currencies";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { nowPayments } from "@/lib/nowpayments";

export const dynamic = "force-dynamic";

/**
 * POST /api/payment/webhook
 * Webhook endpoint for NOWPayments IPN callbacks
 */
export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get("x-nowpayments-sig");
    const body = await request.text();

    console.log("📥 Webhook received from NOWPayments");
    console.log("Signature:", signature);

    // Verify signature
    if (!signature) {
      console.error("❌ Missing signature");
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    const ipnSecret = process.env.NOWPAYMENTS_IPN_SECRET!;
    const isValid = nowPayments.verifyIPNSignature(body, signature, ipnSecret);

    if (!isValid) {
      console.error("❌ Invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }

    const data = JSON.parse(body);
    console.log("✅ Webhook data:", data);

    const {
      payment_id,
      payment_status,
      order_id,
      pay_amount,
      price_amount,
      actually_paid,
      outcome_amount,
    } = data;

    if (!order_id) {
      console.error("❌ Missing order_id");
      return NextResponse.json({ error: "Missing order_id" }, { status: 400 });
    }

    // Find deposit by ID
    const deposit = await prisma.deposit.findUnique({
      where: { id: order_id },
      include: { User: { include: { Portfolio: true } } },
    });

    if (!deposit) {
      console.error("❌ Deposit not found:", order_id);
      return NextResponse.json({ error: "Deposit not found" }, { status: 404 });
    }

    console.log(
      "💰 Processing deposit:",
      deposit.id,
      "Status:",
      payment_status
    );

    // Update deposit status based on payment status
    let newStatus = deposit.status;

    switch (payment_status) {
      case "waiting":
        newStatus = "PENDING";
        // Create initial notification when payment is detected
        if (deposit.status !== "PENDING" && deposit.User) {
          const userCurr = deposit.User.preferredCurrency || "USD";
          const currSym = getCurrencySymbol(userCurr);
          await prisma.notification.create({
            data: {
              id: generateId(),
              userId: deposit.User.id,
              type: "DEPOSIT",
              title: `Incoming ${deposit.cryptoCurrency || "BTC"} Deposit`,
              message: `Your deposit of ${actually_paid || pay_amount} ${
                deposit.cryptoCurrency || "BTC"
              } (${currSym}${price_amount}) has been detected and is awaiting confirmations.`,
              amount: price_amount,
              asset: deposit.cryptoCurrency || "BTC",
              metadata: {
                depositId: deposit.id,
                paymentId: payment_id,
                status: "waiting",
                confirmations: 0,
              },
            },
          });
        }
        break;
      case "confirming":
        newStatus = "PROCESSING";
        // Update notification
        if (deposit.User) {
          const existingNotif = await prisma.notification.findFirst({
            where: {
              userId: deposit.User.id,
              metadata: {
                path: ["depositId"],
                equals: deposit.id,
              },
            },
            orderBy: { createdAt: "desc" },
          });
          if (existingNotif) {
            await prisma.notification.update({
              where: { id: existingNotif.id },
              data: {
                message: `Your deposit is being confirmed on the blockchain. Almost there!`,
                metadata: {
                  ...((existingNotif.metadata as any) || {}),
                  status: "confirming",
                },
              },
            });
          }
        }
        break;
      case "confirmed":
      case "finished":
        newStatus = "COMPLETED";
        break;
      case "failed":
      case "refunded":
      case "expired":
        newStatus = "FAILED";
        break;
      case "partially_paid":
        newStatus = "PROCESSING";
        break;
      default:
        newStatus = "PENDING";
    }

    // Update deposit
    await prisma.deposit.update({
      where: { id: deposit.id },
      data: {
        status: newStatus,
        paymentStatus: payment_status,
      },
    });

    // If payment is completed, credit user's portfolio
    if (newStatus === "COMPLETED" && deposit.status !== "COMPLETED") {
      console.log("✅ Payment completed! Crediting user portfolio...");

      // Check if user exists
      if (!deposit.User) {
        console.error("❌ Deposit has no associated user!");
        return NextResponse.json(
          { success: false, error: "User not found" },
          { status: 400 }
        );
      }

      // Get or create portfolio
      let portfolio = deposit.User.Portfolio;
      if (!portfolio) {
        portfolio = await prisma.portfolio.create({
          data: {
            id: generateId(),
            userId: deposit.User.id,
            balance: 0,
            traderoomBalance: 0,
            assets: [],
          },
        });
      }

      const depositCurrency = deposit.currency || "USD";
      const depositAmount = parseFloat(deposit.amount.toString());

      // Check if this is a traderoom deposit
      if (deposit.targetAsset === "TRADEROOM") {
        // Credit to traderoom balance
        const currentTraderoomBalance = parseFloat(
          (portfolio.traderoomBalance || 0).toString()
        );
        const newTraderoomBalance = currentTraderoomBalance + depositAmount;

        await prisma.portfolio.update({
          where: { id: portfolio.id },
          data: {
            traderoomBalance: newTraderoomBalance,
          },
        });

        console.log(
          `💵 Credited ${deposit.amount} ${depositCurrency} to TRADEROOM balance for user ${deposit.User.email}`
        );
        console.log(
          `New traderoom balance: ${newTraderoomBalance} ${depositCurrency}`
        );

        const userCurrency = deposit.User.preferredCurrency || depositCurrency;

        // Create notification for successful traderoom deposit
        await prisma.notification.create({
          data: {
            id: generateId(),
            userId: deposit.User.id,
            type: "DEPOSIT",
            title: `${userCurrency} Traderoom Deposit Completed`,
            message: `Your deposit of ${getCurrencySymbol(userCurrency)}${
              deposit.amount
            } has been successfully credited to your Traderoom balance.`,
            amount: deposit.amount,
            asset: userCurrency,
            metadata: {
              depositId: deposit.id,
              transactionId: payment_id,
              method: deposit.method,
              target: "TRADEROOM",
            },
          },
        });
      } else {
        // Credit to regular fiat balance
        const newBalance =
          parseFloat(portfolio.balance.toString()) + depositAmount;

        await prisma.portfolio.update({
          where: { id: portfolio.id },
          data: {
            balance: newBalance,
            balanceCurrency: depositCurrency,
          },
        });

        console.log(
          `💵 Credited ${deposit.amount} ${depositCurrency} to user ${deposit.User.email}`
        );
        console.log(`New balance: ${newBalance} ${depositCurrency}`);

        // Create notification for successful deposit
        const userCurrency2 = deposit.User.preferredCurrency || depositCurrency;
        await prisma.notification.create({
          data: {
            id: generateId(),
            userId: deposit.User.id,
            type: "DEPOSIT",
            title: `${userCurrency2} Deposit Completed`,
            message: `Your deposit of ${getCurrencySymbol(userCurrency2)}${
              deposit.amount
            } has been successfully credited to your account.`,
            amount: deposit.amount,
            asset: userCurrency2,
            metadata: {
              depositId: deposit.id,
              transactionId: payment_id,
              method: deposit.method,
            },
          },
        });
      }

      console.log("✅ Notification created for deposit");

      // TODO: Send email notification to user
      // TODO: Send Telegram notification if enabled
    }

    return NextResponse.json({
      success: true,
      message: "Webhook processed successfully",
    });
  } catch (error) {
    console.error("❌ Webhook processing error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Webhook processing failed",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/payment/webhook
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    message: "NOWPayments webhook endpoint is active",
    timestamp: new Date().toISOString(),
  });
}
