import { generateId } from "@/lib/generate-id";
import { getCurrencySymbol } from "@/lib/currencies";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { nowPayments } from "@/lib/nowpayments";
import { sendEmail } from "@/lib/email";
import { sendPushNotification } from "@/lib/push-notifications";
import { depositConfirmedTemplate } from "@/lib/email-templates";

export const dynamic = "force-dynamic";

// Promo constants
const PROMO_BONUS_PERCENT = 50;

/**
 * Check if the deposit bonus promo is active for a user
 * Only applies to first deposit if user hasn't claimed it yet
 */
function isPromoBonusActive(hasClaimedFirstDepositBonus: boolean): boolean {
  return !hasClaimedFirstDepositBonus;
}

/**
 * Calculate bonus amount (50% of deposit)
 */
function calculateBonusAmount(amount: number): number {
  return amount * (PROMO_BONUS_PERCENT / 100);
}

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
    
    // Determine confirmations based on payment status
    let confirmations = deposit.confirmations;
    if (payment_status === "confirmed" || payment_status === "finished") {
      confirmations = 6; // Set to final confirmation count when payment is complete
      console.log("  - Setting confirmations to 6 (payment finished)");
    } else if (payment_status === "confirming") {
      confirmations = Math.min(deposit.confirmations + 1, 5); // Increment but don't exceed 5
      console.log("  - Incrementing confirmations to", confirmations);
    }
    
    // Update deposit
    await prisma.deposit.update({
      where: { id: deposit.id },
      data: {
        status: newStatus,
        paymentStatus: payment_status,
        confirmations: confirmations,
      },
    });
    
    console.log("✅ Deposit updated successfully");
    console.log("  - Status:", newStatus);
    console.log("  - Confirmations:", confirmations);

    // If payment is completed, credit user's portfolio
    // IMPORTANT: Also recover deposits that were incorrectly marked as FAILED due to local expiration
    console.log("🔍 Checking if should credit user...");
    console.log("  - New status:", newStatus);
    console.log("  - Previous status:", deposit.status);
    const shouldCredit = newStatus === "COMPLETED" && deposit.status !== "COMPLETED";
    console.log("  - Should credit?", shouldCredit);
    
    // Also check if this is a recovery case - deposit was FAILED but NowPayments says finished
    const isRecovery = newStatus === "COMPLETED" && deposit.status === "FAILED";
    if (isRecovery) {
      console.log("🔄 RECOVERY CASE: Deposit was FAILED but NowPayments confirms payment!");
      console.log("  - This payment was marked as FAILED locally but NowPayments shows it succeeded!");
    }
    
    if (shouldCredit || isRecovery) {
      try {
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
      let depositAmount = parseFloat(deposit.amount.toString());
      const userPreferredCurrency = deposit.User.preferredCurrency || "USD";
      
      console.log("💵 Deposit details:");
      console.log("  - Amount:", depositAmount);
      console.log("  - Currency:", depositCurrency);
      console.log("  - User's preferred currency:", userPreferredCurrency);
      console.log("  - Target:", deposit.targetAsset || "REGULAR");

      // Convert deposit amount to user's preferred currency if different
      if (depositCurrency !== userPreferredCurrency) {
        console.log(`💱 Converting from ${depositCurrency} to ${userPreferredCurrency}...`);
        try {
          const ratesResponse = await fetch(
            `https://api.frankfurter.app/latest?from=${depositCurrency}&to=${userPreferredCurrency}`
          );
          if (ratesResponse.ok) {
            const ratesData = await ratesResponse.json();
            const rate = ratesData.rates[userPreferredCurrency];
            if (rate) {
              const originalAmount = depositAmount;
              depositAmount = depositAmount * rate;
              console.log(`  - Exchange rate: 1 ${depositCurrency} = ${rate} ${userPreferredCurrency}`);
              console.log(`  - Original amount: ${originalAmount} ${depositCurrency}`);
              console.log(`  - Converted amount: ${depositAmount} ${userPreferredCurrency}`);
            } else {
              console.error(`❌ Exchange rate not found for ${userPreferredCurrency}`);
            }
          } else {
            console.error(`❌ Failed to fetch exchange rates: ${ratesResponse.status}`);
          }
        } catch (conversionError) {
          console.error("❌ Error converting currency:", conversionError);
          console.log("⚠️ Proceeding with original amount (no conversion)");
        }
      } else {
        console.log(`✓ Deposit currency matches user's preferred currency - no conversion needed`);
      }

      // Check if this is a traderoom deposit
      if (deposit.targetAsset === "TRADEROOM") {
        console.log("🎮 Processing TRADEROOM deposit...");
        
        // Check if promo bonus applies (first deposit only)
        let bonusAmount = 0;
        let totalCredit = depositAmount;
        const promoActive = isPromoBonusActive(deposit.User.hasClaimedFirstDepositBonus);
        
        if (promoActive) {
          bonusAmount = calculateBonusAmount(depositAmount);
          totalCredit = depositAmount + bonusAmount;
          console.log(`🎁 First deposit bonus! Adding ${PROMO_BONUS_PERCENT}% bonus: ${bonusAmount} ${depositCurrency}`);
          // Mark user as having claimed the first deposit bonus
          await prisma.user.update({
            where: { id: deposit.User.id },
            data: { hasClaimedFirstDepositBonus: true },
          });
          console.log(`✅ Marked user ${deposit.User.email} as having claimed first deposit bonus`);
        }
        
        // Credit to traderoom balance (including bonus if applicable)
        const currentTraderoomBalance = parseFloat(
          (portfolio.traderoomBalance || 0).toString()
        );
        const newTraderoomBalance = currentTraderoomBalance + totalCredit;

        console.log("  - Current traderoom balance:", currentTraderoomBalance);
        console.log("  - Deposit amount:", depositAmount);
        if (bonusAmount > 0) {
          console.log("  - Bonus amount:", bonusAmount);
        }
        console.log("  - Total credit:", totalCredit);
        console.log("  - New traderoom balance:", newTraderoomBalance);

        await prisma.portfolio.update({
          where: { id: portfolio.id },
          data: {
            traderoomBalance: newTraderoomBalance,
          },
        });

        console.log(
          `✅ Credited ${totalCredit} ${userPreferredCurrency} to TRADEROOM balance for user ${deposit.User.email}${bonusAmount > 0 ? ` (includes ${bonusAmount} bonus)` : ''}`
        );
        console.log(
          `New traderoom balance: ${newTraderoomBalance} ${userPreferredCurrency}`
        );

        const userCurrency = userPreferredCurrency;
        const bonusMessage = bonusAmount > 0 
          ? ` Plus ${PROMO_BONUS_PERCENT}% bonus: ${getCurrencySymbol(userCurrency)}${bonusAmount.toFixed(2)}!`
          : '';

        console.log("📧 Creating TRADEROOM deposit notification...");
        // Create notification for successful traderoom deposit
        await prisma.notification.create({
          data: {
            id: generateId(),
            userId: deposit.User.id,
            type: "DEPOSIT",
            title: bonusAmount > 0 ? `${userCurrency} Traderoom Deposit + Bonus!` : `${userCurrency} Traderoom Deposit Completed`,
            message: `Your deposit of ${getCurrencySymbol(userCurrency)}${
              depositAmount.toFixed(2)
            } has been successfully credited to your Traderoom balance.${bonusMessage}`,
            amount: totalCredit, // Include bonus in the displayed amount
            asset: userCurrency,
            metadata: {
              depositId: deposit.id,
              transactionId: payment_id,
              method: deposit.method,
              target: "TRADEROOM",
              bonusAmount: bonusAmount > 0 ? bonusAmount : undefined,
              bonusPercent: bonusAmount > 0 ? PROMO_BONUS_PERCENT : undefined,
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
              subject: `✅ ${userPreferredCurrency} Traderoom Deposit Completed - M4 Capital`,
              html: depositConfirmedTemplate(
                deposit.User.name || "User",
                displayAmount,
                userPreferredCurrency,
                getCurrencySymbol(userPreferredCurrency),
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
          const pushBonusText = bonusAmount > 0 ? ` (includes ${PROMO_BONUS_PERCENT}% bonus!)` : '';
          await sendPushNotification(
            deposit.User.id,
            bonusAmount > 0 ? `${userCurrency} Traderoom Deposit + Bonus!` : `${userCurrency} Traderoom Deposit Completed!`,
            `Your deposit of ${getCurrencySymbol(userCurrency)}${depositAmount.toFixed(2)} has been credited to your Traderoom balance.${pushBonusText}`,
            {
              type: "deposit",
              amount: totalCredit,
              asset: userPreferredCurrency,
              url: "/dashboard",
            }
          );
          console.log("✅ Web push notification sent");
        } catch (pushError) {
          console.error("❌ Failed to send push notification:", pushError);
        }
      } else {
        console.log("💰 Processing REGULAR deposit...");
        
        // Check if promo bonus applies (first deposit only)
        let bonusAmount = 0;
        let totalCredit = depositAmount;
        const promoActive = isPromoBonusActive(deposit.User.hasClaimedFirstDepositBonus);
        
        if (promoActive) {
          bonusAmount = calculateBonusAmount(depositAmount);
          totalCredit = depositAmount + bonusAmount;
          console.log(`🎁 First deposit bonus! Adding ${PROMO_BONUS_PERCENT}% bonus: ${bonusAmount} ${userPreferredCurrency}`);
          
          // Mark user as having claimed the first deposit bonus
          await prisma.user.update({
            where: { id: deposit.User.id },
            data: { hasClaimedFirstDepositBonus: true },
          });
          console.log(`✅ Marked user ${deposit.User.email} as having claimed first deposit bonus`);
        }
        
        // Credit to regular fiat balance (including bonus if applicable)
        const newBalance =
          parseFloat(portfolio.balance.toString()) + totalCredit;

        console.log("  - Current balance:", parseFloat(portfolio.balance.toString()));
        console.log("  - Deposit amount:", depositAmount);
        if (bonusAmount > 0) {
          console.log("  - Bonus amount:", bonusAmount);
        }
        console.log("  - Total credit:", totalCredit);
        console.log("  - New balance:", newBalance);

        await prisma.portfolio.update({
          where: { id: portfolio.id },
          data: {
            balance: newBalance,
            balanceCurrency: userPreferredCurrency,
          },
        });

        console.log(
          `✅ Credited ${totalCredit} ${userPreferredCurrency} to user ${deposit.User.email}${bonusAmount > 0 ? ` (includes ${bonusAmount} bonus)` : ''}`
        );
        console.log(`New balance: ${newBalance} ${userPreferredCurrency}`);

        console.log("📧 Creating deposit notification...");
        // Create notification for successful deposit
        const userCurrency2 = userPreferredCurrency;
        const bonusMessage = bonusAmount > 0 
          ? ` Plus ${PROMO_BONUS_PERCENT}% bonus: ${getCurrencySymbol(userCurrency2)}${bonusAmount.toFixed(2)}!`
          : '';
        await prisma.notification.create({
          data: {
            id: generateId(),
            userId: deposit.User.id,
            type: "DEPOSIT",
            title: bonusAmount > 0 ? `${userCurrency2} Deposit + Bonus!` : `${userCurrency2} Deposit Completed`,
            message: `Your deposit of ${getCurrencySymbol(userCurrency2)}${
              depositAmount.toFixed(2)
            } has been successfully credited to your account.${bonusMessage}`,
            amount: totalCredit, // Include bonus in the displayed amount
            asset: userCurrency2,
            metadata: {
              depositId: deposit.id,
              transactionId: payment_id,
              method: deposit.method,
              bonusAmount: bonusAmount > 0 ? bonusAmount : undefined,
              bonusPercent: bonusAmount > 0 ? PROMO_BONUS_PERCENT : undefined,
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
              subject: `✅ ${userPreferredCurrency} Deposit Completed - M4 Capital`,
              html: depositConfirmedTemplate(
                deposit.User.name || "User",
                displayAmount,
                userPreferredCurrency,
                getCurrencySymbol(userPreferredCurrency),
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
          const pushBonusText = bonusAmount > 0 ? ` (includes ${PROMO_BONUS_PERCENT}% bonus!)` : '';
          await sendPushNotification(
            deposit.User.id,
            bonusAmount > 0 ? `${userCurrency2} Deposit + Bonus!` : `${userCurrency2} Deposit Completed!`,
            `Your deposit of ${getCurrencySymbol(userCurrency2)}${depositAmount.toFixed(2)} has been credited to your account.${pushBonusText}`,
            {
              type: "deposit",
              amount: totalCredit,
              asset: userPreferredCurrency,
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
      } catch (creditError) {
        console.error("❌❌❌ CRITICAL ERROR IN CREDIT PROCESS:");
        console.error("Error type:", creditError instanceof Error ? creditError.name : typeof creditError);
        console.error("Error message:", creditError instanceof Error ? creditError.message : String(creditError));
        console.error("Stack trace:", creditError instanceof Error ? creditError.stack : "No stack trace");
        console.error("Deposit ID:", deposit.id);
        console.error("User ID:", deposit.User?.id);
        console.error("Amount:", deposit.amount, deposit.currency);
        
        // Don't throw - respond success to NowPayments so they don't retry
        // We'll need to manually recover this deposit
        console.error("⚠️ Responding with success to prevent retry loop - MANUAL RECOVERY REQUIRED!");
        console.error("Run recovery: POST /api/admin/recover-deposit with depositId:", deposit.id);
      }
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
