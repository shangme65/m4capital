import { generateId } from "@/lib/generate-id";
import { getCurrencySymbol } from "@/lib/currencies";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { nowPayments } from "@/lib/nowpayments";
import { sendEmail } from "@/lib/email";
import { sendPushNotification } from "@/lib/push-notifications";
import { depositConfirmedTemplate } from "@/lib/email-templates";

export const dynamic = "force-dynamic";

/**
 * POST /api/payment/webhook
 * Webhook endpoint for NOWPayments IPN callbacks
 */
export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get("x-nowpayments-sig");
    const body = await request.text();

    console.log("📥 ========== WEBHOOK RECEIVED ==========");
    console.log("📥 Timestamp:", new Date().toISOString());
    console.log("📥 Signature:", signature);
    console.log("📥 Body:", body);
    console.log("📥 Headers:", Object.fromEntries(request.headers.entries()));

    // Parse data first for logging
    let data;
    try {
      data = JSON.parse(body);
      console.log("📥 Parsed data:", JSON.stringify(data, null, 2));
    } catch (parseError) {
      console.error("❌ Failed to parse webhook body:", parseError);
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    // Verify signature
    if (!signature) {
      console.error("❌ Missing signature");
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    const ipnSecret = process.env.NOWPAYMENTS_IPN_SECRET;
    
    console.log("🔑 IPN Secret configured:", !!ipnSecret);
    
    if (!ipnSecret) {
      console.error("❌ NOWPAYMENTS_IPN_SECRET not configured!");
      console.log("⚠️ Proceeding without signature verification (INSECURE - FIX IN PRODUCTION)");
      // Don't fail - just log warning and continue
    } else {
      const isValid = nowPayments.verifyIPNSignature(body, signature, ipnSecret);
      console.log("🔐 Signature valid:", isValid);

      if (!isValid) {
        console.error("❌ Invalid signature");
        console.error("Expected signature calculated from body");
        console.error("Received signature:", signature);
        return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
      }
    }

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
      console.error("❌ Missing order_id in webhook data");
      console.error("Data received:", data);
      return NextResponse.json({ error: "Missing order_id" }, { status: 400 });
    }

    console.log("🔍 Looking for deposit with order_id:", order_id);

    // Find deposit by ID
    const deposit = await prisma.deposit.findUnique({
      where: { id: order_id },
      include: { User: { include: { Portfolio: true } } },
    });

    if (!deposit) {
      console.error("❌ Deposit not found for order_id:", order_id);
      console.error("Searching all deposits to debug...");
      
      // Debug: List recent deposits
      const recentDeposits = await prisma.deposit.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: { id: true, paymentId: true, status: true, createdAt: true }
      });
      console.log("Recent deposits:", recentDeposits);
      
      return NextResponse.json({ error: "Deposit not found" }, { status: 404 });
    }

    console.log("✅ Deposit found:");
    console.log("  - ID:", deposit.id);
    console.log("  - User:", deposit.User?.email);
    console.log("  - Current Status:", deposit.status);
    console.log("  - Amount:", deposit.amount, deposit.currency);
    console.log("  - Payment ID:", deposit.paymentId);

    console.log(
      "💰 Processing deposit:",
      deposit.id,
      "Payment Status:",
      payment_status
    );

    // Update deposit status based on payment status
    let newStatus = deposit.status;
    
    console.log("📊 Payment status mapping:");
    console.log("  - Received status:", payment_status);
    console.log("  - Current deposit status:", deposit.status);

    switch (payment_status) {
      case "waiting":
        newStatus = "PENDING";
        console.log("  - New status: PENDING (waiting for payment)");
        // Create initial notification when payment is detected
        if (deposit.status !== "PENDING" && deposit.User) {
          const userCurr = deposit.User.preferredCurrency || "USD";
          const currSym = getCurrencySymbol(userCurr);
          
          // Convert price_amount (likely in USD) to user's currency
          let displayAmount = price_amount;
          if (userCurr !== "USD") {
            try {
              const ratesResponse = await fetch(
                "https://api.frankfurter.app/latest?from=USD"
              );
              if (ratesResponse.ok) {
                const ratesData = await ratesResponse.json();
                const rate = ratesData.rates[userCurr] || 1;
                displayAmount = price_amount * rate;
              }
            } catch (err) {
              console.error("Error fetching exchange rate:", err);
            }
          }
          
          await prisma.notification.create({
            data: {
              id: generateId(),
              userId: deposit.User.id,
              type: "DEPOSIT",
              title: `Incoming ${deposit.cryptoCurrency || "BTC"} Deposit`,
              message: `Your deposit of ${actually_paid || pay_amount} ${
                deposit.cryptoCurrency || "BTC"
              } (${currSym}${displayAmount.toFixed(2)}) has been detected and is awaiting confirmations.`,
              amount: Math.round(displayAmount * 100) / 100, // Store pre-converted fiat amount
              asset: userCurr, // Use user's currency for proper display
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
        console.log("  - New status: PROCESSING (confirming on blockchain)");
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
        console.log("  - New status: COMPLETED (payment confirmed!)");
        break;
      case "failed":
      case "refunded":
      case "expired":
        newStatus = "FAILED";
        console.log("  - New status: FAILED");
        break;
      case "partially_paid":
        newStatus = "PROCESSING";
        console.log("  - New status: PROCESSING (partially paid)");
        break;
      default:
        newStatus = "PENDING";
        console.log("  - New status: PENDING (unknown status:", payment_status, ")");
    }

    console.log("💾 Updating deposit in database...");
    
    // Update deposit
    await prisma.deposit.update({
      where: { id: deposit.id },
      data: {
        status: newStatus,
        paymentStatus: payment_status,
      },
    });
    
    console.log("✅ Deposit updated successfully");

    // If payment is completed, credit user's portfolio
    console.log("🔍 Checking if should credit user...");
    console.log("  - New status:", newStatus);
    console.log("  - Previous status:", deposit.status);
    console.log("  - Should credit?", newStatus === "COMPLETED" && deposit.status !== "COMPLETED");
    
    if (newStatus === "COMPLETED" && deposit.status !== "COMPLETED") {
      console.log("💰💰💰 PAYMENT COMPLETED! Starting credit process...");

      // Check if user exists
      if (!deposit.User) {
        console.error("❌ Deposit has no associated user!");
        return NextResponse.json(
          { success: false, error: "User not found" },
          { status: 400 }
        );
      }
      
      console.log("✅ User found:", deposit.User.email);

      // Get or create portfolio
      let portfolio = deposit.User.Portfolio;
      if (!portfolio) {
        console.log("📁 Creating new portfolio for user...");
        portfolio = await prisma.portfolio.create({
          data: {
            id: generateId(),
            userId: deposit.User.id,
            balance: 0,
            traderoomBalance: 0,
            assets: [],
          },
        });
        console.log("✅ Portfolio created");
      } else {
        console.log("✅ Portfolio exists - ID:", portfolio.id);
      }

      const depositCurrency = deposit.currency || "USD";
      const depositAmount = parseFloat(deposit.amount.toString());
      
      console.log("💵 Deposit details:");
      console.log("  - Amount:", depositAmount);
      console.log("  - Currency:", depositCurrency);
      console.log("  - Target:", deposit.targetAsset || "REGULAR");

      // Check if this is a traderoom deposit
      if (deposit.targetAsset === "TRADEROOM") {
        console.log("🎮 Processing TRADEROOM deposit...");
        // Credit to traderoom balance
        const currentTraderoomBalance = parseFloat(
          (portfolio.traderoomBalance || 0).toString()
        );
        const newTraderoomBalance = currentTraderoomBalance + depositAmount;

        console.log("  - Current traderoom balance:", currentTraderoomBalance);
        console.log("  - Adding:", depositAmount);
        console.log("  - New traderoom balance:", newTraderoomBalance);

        await prisma.portfolio.update({
          where: { id: portfolio.id },
          data: {
            traderoomBalance: newTraderoomBalance,
          },
        });

        console.log(
          `✅ Credited ${deposit.amount} ${depositCurrency} to TRADEROOM balance for user ${deposit.User.email}`
        );
        console.log(
          `New traderoom balance: ${newTraderoomBalance} ${depositCurrency}`
        );

        const userCurrency = deposit.User.preferredCurrency || depositCurrency;

        console.log("📧 Creating TRADEROOM deposit notification...");
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
        console.log("✅ TRADEROOM notification created");

        // Send email notification
        if (deposit.User.email && deposit.User.isEmailVerified) {
          try {
            const displayAmount = (Math.round(depositAmount * 100) / 100).toFixed(2);
            await sendEmail({
              to: deposit.User.email,
              subject: `✅ ${depositCurrency} Traderoom Deposit Completed - M4 Capital`,
              html: depositConfirmedTemplate(
                deposit.User.name || "User",
                displayAmount,
                depositCurrency,
                getCurrencySymbol(depositCurrency),
                payment_id,
                false
              ),
            });
            console.log("✅ Email notification sent");
          } catch (emailError) {
            console.error("❌ Failed to send email notification:", emailError);
          }
        }

        // Send web push notification
        try {
          await sendPushNotification(
            deposit.User.id,
            `${userCurrency} Traderoom Deposit Completed!`,
            `Your deposit of ${getCurrencySymbol(userCurrency)}${depositAmount.toFixed(2)} has been credited to your Traderoom balance.`,
            {
              type: "deposit",
              amount: depositAmount,
              asset: depositCurrency,
              url: "/dashboard",
            }
          );
          console.log("✅ Web push notification sent");
        } catch (pushError) {
          console.error("❌ Failed to send push notification:", pushError);
        }
      } else {
        console.log("💰 Processing REGULAR deposit...");
        // Credit to regular fiat balance
        const newBalance =
          parseFloat(portfolio.balance.toString()) + depositAmount;

        console.log("  - Current balance:", parseFloat(portfolio.balance.toString()));
        console.log("  - Adding:", depositAmount);
        console.log("  - New balance:", newBalance);

        await prisma.portfolio.update({
          where: { id: portfolio.id },
          data: {
            balance: newBalance,
            balanceCurrency: depositCurrency,
          },
        });

        console.log(
          `✅ Credited ${deposit.amount} ${depositCurrency} to user ${deposit.User.email}`
        );
        console.log(`New balance: ${newBalance} ${depositCurrency}`);

        console.log("📧 Creating deposit notification...");
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
        console.log("✅ Deposit notification created");

        // Send email notification
        if (deposit.User.email && deposit.User.isEmailVerified) {
          try {
            const displayAmount = (Math.round(depositAmount * 100) / 100).toFixed(2);
            await sendEmail({
              to: deposit.User.email,
              subject: `✅ ${depositCurrency} Deposit Completed - M4 Capital`,
              html: depositConfirmedTemplate(
                deposit.User.name || "User",
                displayAmount,
                depositCurrency,
                getCurrencySymbol(depositCurrency),
                payment_id,
                false
              ),
            });
            console.log("✅ Email notification sent");
          } catch (emailError) {
            console.error("❌ Failed to send email notification:", emailError);
          }
        }

        // Send web push notification
        try {
          await sendPushNotification(
            deposit.User.id,
            `${userCurrency2} Deposit Completed!`,
            `Your deposit of ${getCurrencySymbol(userCurrency2)}${depositAmount.toFixed(2)} has been credited to your account.`,
            {
              type: "deposit",
              amount: depositAmount,
              asset: depositCurrency,
              url: "/dashboard",
            }
          );
          console.log("✅ Web push notification sent");
        } catch (pushError) {
          console.error("❌ Failed to send push notification:", pushError);
        }
      }

      console.log("✅✅✅ CREDIT PROCESS COMPLETED SUCCESSFULLY!");

      // TODO: Send email notification to user
      // TODO: Send Telegram notification if enabled
    } else {
      console.log("⏭️ Skipping credit process (not completed or already credited)");
    }

    console.log("📤 Sending success response to NowPayments");
    return NextResponse.json({
      success: true,
      message: "Webhook processed successfully",
    });
  } catch (error) {
    console.error("❌❌❌ WEBHOOK PROCESSING ERROR:");
    console.error(error);

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
