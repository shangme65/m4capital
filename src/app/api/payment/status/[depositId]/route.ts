import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { nowPayments } from "@/lib/nowpayments";

export const dynamic = "force-dynamic";

/**
 * GET /api/payment/status/[depositId]
 * Get payment status for a deposit
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ depositId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { depositId } = await params;

    // Find deposit
    const deposit = await prisma.deposit.findUnique({
      where: { id: depositId },
      include: { User: true },
    });

    if (!deposit) {
      return NextResponse.json({ error: "Deposit not found" }, { status: 404 });
    }

    // Verify user owns this deposit
    if (deposit.User?.email !== session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Check if deposit has expired locally
    const now = new Date();
    // Give crypto payments MORE time - add 15 minute grace period before marking as failed
    const graceMinutes = 15;
    const expiryWithGrace = deposit.expiresAt 
      ? new Date(deposit.expiresAt.getTime() + graceMinutes * 60 * 1000)
      : null;
    
    if (
      deposit.status === "PENDING" &&
      expiryWithGrace &&
      expiryWithGrace < now
    ) {
      console.log(`⏰ Deposit ${depositId} has expired locally (with ${graceMinutes}min grace), checking NowPayments...`);
      
      // IMPORTANT: Before marking as expired, check NowPayments to see if payment was received
      let nowPaymentsStatus = null;
      if (deposit.paymentId && deposit.method !== "NOWPAYMENTS_INVOICE_BTC") {
        try {
          nowPaymentsStatus = await nowPayments.getPaymentStatus(deposit.paymentId);
          console.log(`📡 NowPayments status for expired deposit: ${nowPaymentsStatus.payment_status}`);
          
          // If payment is confirmed/finished in NowPayments, don't mark as failed!
          if (nowPaymentsStatus.payment_status === "confirmed" || 
              nowPaymentsStatus.payment_status === "finished" ||
              nowPaymentsStatus.payment_status === "confirming" ||
              nowPaymentsStatus.payment_status === "waiting" ||
              nowPaymentsStatus.payment_status === "partially_paid") {
            console.log(`✅ Payment is still valid in NowPayments (${nowPaymentsStatus.payment_status}), NOT marking as failed`);
            
            // Update the payment status from NowPayments
            await prisma.deposit.update({
              where: { id: depositId },
              data: {
                paymentStatus: nowPaymentsStatus.payment_status,
                // Extend expiration if payment is in progress
                expiresAt: new Date(Date.now() + 50 * 60 * 1000), // Extend by 50 minutes
                updatedAt: now,
              },
            });
            
            // Return current status without marking as failed
            return NextResponse.json({
              success: true,
              deposit: {
                id: deposit.id,
                amount: parseFloat(deposit.amount.toString()),
                currency: deposit.currency,
                status: deposit.status,
                method: deposit.method,
                createdAt: deposit.createdAt,
                paymentId: deposit.paymentId,
                paymentAddress: deposit.paymentAddress,
                paymentAmount: deposit.paymentAmount
                  ? parseFloat(deposit.paymentAmount.toString())
                  : null,
                paymentStatus: nowPaymentsStatus.payment_status,
                cryptoCurrency: deposit.cryptoCurrency,
              },
              nowPaymentsData: nowPaymentsStatus,
            });
          }
        } catch (npError) {
          console.error("Failed to check NowPayments status:", npError);
          // If we can't check NowPayments, don't auto-fail - just return current status
          return NextResponse.json({
            success: true,
            deposit: {
              id: deposit.id,
              amount: parseFloat(deposit.amount.toString()),
              currency: deposit.currency,
              status: deposit.status,
              method: deposit.method,
              createdAt: deposit.createdAt,
              paymentId: deposit.paymentId,
              paymentAddress: deposit.paymentAddress,
              paymentAmount: deposit.paymentAmount
                ? parseFloat(deposit.paymentAmount.toString())
                : null,
              paymentStatus: deposit.paymentStatus || "unknown",
              cryptoCurrency: deposit.cryptoCurrency,
            },
          });
        }
      }
      
      // Only if NowPayments confirms it's truly expired/failed
      console.log(`❌ Deposit ${depositId} confirmed as expired, marking as FAILED`);
      
      // Update to FAILED status
      await prisma.deposit.update({
        where: { id: depositId },
        data: {
          status: "FAILED",
          paymentStatus: "expired",
          updatedAt: now,
        },
      });

      // Return failed status
      return NextResponse.json({
        success: true,
        deposit: {
          id: deposit.id,
          amount: parseFloat(deposit.amount.toString()),
          currency: deposit.currency,
          status: "FAILED",
          method: deposit.method,
          createdAt: deposit.createdAt,
          paymentId: deposit.paymentId,
          paymentAddress: deposit.paymentAddress,
          paymentAmount: deposit.paymentAmount
            ? parseFloat(deposit.paymentAmount.toString())
            : null,
          paymentStatus: "expired",
          cryptoCurrency: deposit.cryptoCurrency,
        },
      });
    }

    // If payment has a NOWPayments ID, fetch latest status
    // Note: For invoices, we rely on webhook callbacks instead of polling
    // because NOWPayments doesn't provide a direct invoice status endpoint
    let nowPaymentsStatus = null;
    let finalStatus = deposit.status;
    
    if (deposit.paymentId && deposit.method !== "NOWPAYMENTS_INVOICE_BTC") {
      try {
        nowPaymentsStatus = await nowPayments.getPaymentStatus(
          deposit.paymentId
        );
        
        console.log(`📡 NowPayments status check for ${depositId}: ${nowPaymentsStatus.payment_status}`);

        // CRITICAL: If NowPayments says finished/confirmed but local status isn't COMPLETED,
        // we need to complete the payment (webhook may have failed)
        const isNowPaymentsComplete = 
          nowPaymentsStatus.payment_status === "finished" || 
          nowPaymentsStatus.payment_status === "confirmed";
        
        if (isNowPaymentsComplete && deposit.status !== "COMPLETED") {
          console.log(`🔄 RECOVERY: NowPayments says ${nowPaymentsStatus.payment_status} but local status is ${deposit.status}`);
          console.log(`💰 Processing payment completion via status check...`);
          
          // Check if deposit has a userId
          if (!deposit.userId) {
            console.error("Deposit has no userId, cannot credit");
          } else {
            // Get user with portfolio
            const user = await prisma.user.findUnique({
              where: { id: deposit.userId },
              include: { Portfolio: true },
            });
          
          if (user) {
            const depositCurrency = deposit.currency || "USD";
            let depositAmount = parseFloat(deposit.amount.toString());
            const userPreferredCurrency = user.preferredCurrency || "USD";
            
            // Convert deposit amount to user's preferred currency if different
            if (depositCurrency !== userPreferredCurrency) {
              try {
                const ratesResponse = await fetch(
                  `https://api.frankfurter.app/latest?from=${depositCurrency}&to=${userPreferredCurrency}`
                );
                if (ratesResponse.ok) {
                  const ratesData = await ratesResponse.json();
                  const rate = ratesData.rates[userPreferredCurrency];
                  if (rate) {
                    depositAmount = depositAmount * rate;
                    console.log(`💱 Converted ${deposit.amount} ${depositCurrency} to ${depositAmount.toFixed(2)} ${userPreferredCurrency}`);
                  }
                }
              } catch (conversionError) {
                console.error("Currency conversion error:", conversionError);
              }
            }
            
            // Ensure portfolio exists
            let portfolio = user.Portfolio;
            if (!portfolio) {
              const { generateId } = await import("@/lib/generate-id");
              portfolio = await prisma.portfolio.create({
                data: {
                  id: generateId(),
                  userId: user.id,
                  balance: 0,
                  traderoomBalance: 0,
                  assets: [],
                },
              });
            }
            
            // Credit based on target asset type
            if (deposit.targetAsset === "TRADEROOM") {
              await prisma.portfolio.update({
                where: { id: portfolio.id },
                data: {
                  traderoomBalance: {
                    increment: depositAmount,
                  },
                },
              });
              console.log(`✅ Credited ${depositAmount} to traderoom balance`);
            } else {
              await prisma.portfolio.update({
                where: { id: portfolio.id },
                data: {
                  balance: {
                    increment: depositAmount,
                  },
                  balanceCurrency: userPreferredCurrency,
                },
              });
              console.log(`✅ Credited ${depositAmount} to main balance`);
            }
            
            // Update deposit status
            await prisma.deposit.update({
              where: { id: depositId },
              data: {
                status: "COMPLETED",
                paymentStatus: nowPaymentsStatus.payment_status,
                confirmations: 6,
              },
            });
            
            // Create notification
            const { generateId } = await import("@/lib/generate-id");
            const { getCurrencySymbol } = await import("@/lib/currencies");
            const currSym = getCurrencySymbol(userPreferredCurrency);
            
            await prisma.notification.create({
              data: {
                id: generateId(),
                userId: user.id,
                type: "DEPOSIT",
                title: `${deposit.cryptoCurrency || "BTC"} Deposit Confirmed!`,
                message: `Your deposit of ${currSym}${depositAmount.toFixed(2)} has been confirmed and credited to your ${deposit.targetAsset === "TRADEROOM" ? "traderoom" : ""} account.`,
                amount: Math.round(depositAmount * 100) / 100,
                asset: userPreferredCurrency,
                read: false,
              },
            });
            
            finalStatus = "COMPLETED";
            console.log(`✅ Payment completion recovered successfully!`);
          }
          } // Close the else block for deposit.userId check
        } else {
          // Just update the payment status if different
          if (nowPaymentsStatus.payment_status !== deposit.paymentStatus) {
            await prisma.deposit.update({
              where: { id: depositId },
              data: {
                paymentStatus: nowPaymentsStatus.payment_status,
              },
            });
          }
        }
      } catch (error) {
        console.error("Failed to fetch NOWPayments status:", error);
        // Don't throw - just log and continue with database status
      }
    }

    return NextResponse.json({
      success: true,
      deposit: {
        id: deposit.id,
        amount: parseFloat(deposit.amount.toString()),
        currency: deposit.currency,
        status: finalStatus,
        method: deposit.method,
        createdAt: deposit.createdAt,
        paymentId: deposit.paymentId,
        paymentAddress: deposit.paymentAddress,
        paymentAmount: deposit.paymentAmount
          ? parseFloat(deposit.paymentAmount.toString())
          : null,
        paymentStatus:
          nowPaymentsStatus?.payment_status ||
          deposit.paymentStatus ||
          "waiting",
        cryptoCurrency: deposit.cryptoCurrency,
      },
      nowPaymentsData: nowPaymentsStatus,
    });
  } catch (error) {
    console.error("Get payment status error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to get payment status",
      },
      { status: 500 }
    );
  }
}
