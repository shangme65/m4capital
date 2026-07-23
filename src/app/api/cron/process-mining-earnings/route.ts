import { NextRequest, NextResponse } from "next/server";
import {
  createErrorResponse,
  createSuccessResponse,
} from "@/lib/middleware/errorHandler";
import { prisma } from "@/lib/prisma";
import { generateId } from "@/lib/generate-id";

export const dynamic = "force-dynamic";

// Daily BTC profit per plan (mirrors MINING_PLANS in purchase/route.ts)
const DAILY_PROFIT_BTC: Record<string, number> = {
  Starter: 0.03856,
  Basic: 0.04241,
  Standard: 0.04665,
  Professional: 0.05132,
  Advanced: 0.05645,
  Enterprise: 0.07903,
};

// Approximate USD value per BTC for notification display
const BTC_USD_APPROX = 60000;

/**
 * GET /api/cron/process-mining-earnings
 *
 * Runs once per day. For every ACTIVE mining contract it:
 *  1. Skips if today's earning has already been recorded (idempotent).
 *  2. Creates a MiningEarning record.
 *  3. Increments totalEarned on the contract.
 *  4. Sends a notification to the user.
 *  5. Expires contracts whose endDate has passed.
 *
 * Secure with CRON_SECRET bearer token.
 */
export async function GET(request: NextRequest) {
  // ── Auth ────────────────────────────────────────────────────────────────
  // Accept either:
  //  • Vercel's internal cron header (set when cron is defined in vercel.json)
  //  • Bearer CRON_SECRET (GitHub Actions / external cron services)

  const isVercelCron = request.headers.get("x-vercel-cron") === "1";
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  const expectedSecret = process.env.CRON_SECRET;

  if (!isVercelCron) {
    if (!expectedSecret) {
      console.error("❌ [Mining Cron] CRON_SECRET not configured");
      return createErrorResponse(
        "Configuration error",
        "CRON_SECRET not configured",
        undefined,
        500,
      );
    }

    if (token !== expectedSecret) {
      console.error("❌ [Mining Cron] Invalid cron secret");
      return createErrorResponse(
        "Unauthorized",
        "Invalid cron secret",
        undefined,
        401,
      );
    }
  }

  console.log("⛏️  [Mining Cron] Starting daily earnings processing...");

  const now = new Date();

  // ── 1. Expire contracts whose endDate has passed ─────────────────────────

  const expired = await prisma.miningContract.updateMany({
    where: {
      status: "ACTIVE",
      endDate: { lt: now },
    },
    data: { status: "EXPIRED" },
  });

  if (expired.count > 0) {
    console.log(`📛 [Mining Cron] Expired ${expired.count} contracts`);
  }

  // ── 2. Find all currently ACTIVE contracts ───────────────────────────────

  const activeContracts = await prisma.miningContract.findMany({
    where: { status: "ACTIVE" },
    include: { User: { select: { id: true, email: true } } },
  });

  console.log(
    `📋 [Mining Cron] Processing ${activeContracts.length} active contracts`,
  );

  // Build the start/end window for "today" (UTC calendar day)
  const todayStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

  let credited = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const contract of activeContracts) {
    try {
      // ── Idempotency: skip if today's earning already exists ─────────────
      const alreadyRecorded = await prisma.miningEarning.findFirst({
        where: {
          contractId: contract.id,
          date: { gte: todayStart, lt: todayEnd },
        },
      });

      if (alreadyRecorded) {
        skipped++;
        continue;
      }

      // ── Resolve daily profit amount ──────────────────────────────────────
      const dailyBtc = DAILY_PROFIT_BTC[contract.planName];
      if (!dailyBtc) {
        // Unknown plan name – try to parse from contract.hashrate field
        console.warn(
          `⚠️  [Mining Cron] Unknown plan "${contract.planName}" for contract ${contract.id}, skipping`,
        );
        errors.push(`Unknown plan: ${contract.planName} (${contract.id})`);
        continue;
      }

      const approxUsd = dailyBtc * BTC_USD_APPROX;

      // ── Create earning + update totalEarned atomically ───────────────────
      await prisma.$transaction([
        prisma.miningEarning.create({
          data: {
            id: generateId(),
            userId: contract.userId,
            contractId: contract.id,
            amount: dailyBtc,
            currency: "BTC",
            amountUsd: approxUsd,
            hashrateAvg: contract.hashrateValue,
            date: now,
            status: "PAID",
          },
        }),
        prisma.miningContract.update({
          where: { id: contract.id },
          data: { totalEarned: { increment: dailyBtc } },
        }),
      ]);

      // ── Notification ─────────────────────────────────────────────────────
      await prisma.notification.create({
        data: {
          id: generateId(),
          userId: contract.userId,
          type: "SUCCESS",
          title: "Mining Earnings Credited",
          message: `You earned ${dailyBtc.toFixed(5)} BTC (~$${approxUsd.toLocaleString("en-US", { maximumFractionDigits: 0 })}) from your ${contract.planName} mining contract today.`,
          amount: approxUsd,
          asset: "USD",
        },
      });

      credited++;
      console.log(
        `✅ [Mining Cron] Credited ${dailyBtc} BTC to user ${contract.userId} (contract ${contract.id})`,
      );
    } catch (err: any) {
      console.error(
        `❌ [Mining Cron] Error processing contract ${contract.id}:`,
        err,
      );
      errors.push(`${contract.id}: ${err?.message ?? "unknown error"}`);
    }
  }

  console.log(
    `⛏️  [Mining Cron] Done — credited: ${credited}, skipped (already run): ${skipped}, errors: ${errors.length}, expired: ${expired.count}`,
  );

  return createSuccessResponse({
    credited,
    skipped,
    expired: expired.count,
    errors,
    processedAt: now.toISOString(),
  });
}
