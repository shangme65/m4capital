# Webhook Processing Issue - Diagnosis

## Payment Details from Screenshot

- **Status**: Finished ✅
- **Type**: crypto2crypto
- **Amount**: 0.00036223 BTC
- **Created**: 01 Apr 2026, 04:52 pm
- **Updated**: 01 Apr 2026, 05:09 pm
- **Payment Hash**: 727a796c0fa9...aadc013130a2
- **Webhook URL**: https://m4capital.online/api/payment/webhook ✅

## The Bug: Status Check Prematurely Marks as FAILED

### What Happens:

1. User creates crypto deposit → `expiresAt` is set to ~30 minutes
2. Frontend polls `/api/payment/status/[depositId]` **every 10 seconds**
3. If local `expiresAt` passes BEFORE webhook arrives → Deposit marked as FAILED
4. When webhook finally arrives (even if payment finished) → Should trigger recovery logic

### The Code Flow:

**File**: `src/app/api/payment/status/[depositId]/route.ts` (Line 43-66)

```typescript
// Check if deposit has expired locally
if (
  deposit.status === "PENDING" &&
  deposit.expiresAt &&
  deposit.expiresAt < now
) {
  console.log(
    `⏰ Deposit ${depositId} has expired locally, checking NowPayments...`,
  );

  // CRITICAL: This check only runs for certain methods!
  if (deposit.paymentId && deposit.method !== "NOWPAYMENTS_INVOICE_BTC") {
    nowPaymentsStatus = await nowPayments.getPaymentStatus(deposit.paymentId);

    // If payment is still valid, extend expiration
    if (nowPaymentsStatus.payment_status === "finished") {
      // Extend expiration
    }
  }

  // If not caught by above check → Marks as FAILED!
  await prisma.deposit.update({
    where: { id: depositId },
    data: { status: "FAILED", paymentStatus: "expired" },
  });
}
```

###Bug Analysis:

**Deposit Method Check**:

- Line 52: `if (deposit.paymentId && deposit.method !== "NOWPAYMENTS_INVOICE_BTC")`
- This means direct crypto payments ARE checked
- But there might be timing issues or API failures

**Possible Issues**:

1. ❌ NowPayments API call times out or fails (Line 54-55)
2. ❌ Error is caught but deposit still marked as FAILED (catch block at Line 92)
3. ❌ Status polling happens faster than webhook delivery
4. ❌ Webhook arrives but fails during signature verification
5. ❌ Webhook arrives but database transaction fails

### Recovery Logic in Webhook:

**File**: `src/app/api/payment/webhook/route.ts` (Line 272-273)

```typescript
const shouldCredit =
  newStatus === "COMPLETED" && deposit.status !== "COMPLETED";
const isRecovery = newStatus === "COMPLETED" && deposit.status === "FAILED";

if (shouldCredit || isRecovery) {
  // Credits user balance
}
```

**This SHOULD work** - but only if webhook runs successfully!

## Next Steps to Diagnose:

### 1. Check Vercel Logs

Go to: https://vercel.com → Project → Logs

Search for:

- `📥 ========== WEBHOOK RECEIVED ==========`
- Payment hash: `727a796c0fa9...aadc013130a2`
- Deposit ID from database
- Time: April 1, 2026, 04:52 PM - 05:09 PM UTC

**Look for:**

- ✅ Webhook was received
- ❌ Signature verification failed
- ❌ Database error during credit process
- ❌ No webhook logs at all (NowPayments never sent it)

### 2. Check Database Directly

Run this query to see deposit status and payment ID:

```sql
SELECT id, "userId", amount, currency, status, method, "paymentId", "paymentStatus",
       "createdAt", "expiresAt", "updatedAt"
FROM "Deposit"
WHERE "createdAt" >= '2026-04-01 16:00:00'
  AND amount >= 0.0003
ORDER BY "createdAt" DESC
LIMIT 5;
```

### 3. Potential Fixes:

#### Fix #1: Remove Early FAILED Marking

**Problem**: Status check marks deposit as FAILED before webhook arrives

**Solution**: Make expiration check more lenient for crypto payments

```typescript
// In src/app/api/payment/status/[depositId]/route.ts
// Instead of marking as FAILED immediately, give more time for crypto payments

if (
  deposit.method === "NOWPAYMENTS_CRYPTO" ||
  deposit.method === "NOWPAYMENTS_INVOICE_BTC"
) {
  // For crypto: Check NowPayments BEFORE marking as failed
  // Don't auto-fail - let webhook handle it
}
```

#### Fix #2: Improve Webhook Error Handling

**Problem**: Webhook might fail silently due to unhandled errors

**Solution**: Add better error logging and recovery

```typescript
// In src/app/api/payment/webhook/route.ts
// Wrap critical sections in try-catch with detailed logging
```

#### Fix #3: Manual Recovery Script

**Problem**: Deposit is already FAILED, need to recover now

**Solution**: Use the admin recovery endpoint already created

## How to Recover THIS Deposit:

1. **Find the deposit ID** from your database
2. **Login as admin** to https://m4capital.online/admin
3. **Run in browser console**:

```javascript
fetch("/api/admin/recover-deposit", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    depositId: "YOUR_DEPOSIT_ID",
    paymentId: "727a796c0fa9...aadc013130a2",
  }),
})
  .then((r) => r.json())
  .then(console.log);
```

---

## Recommended Fix for Future Deposits:

**Change status polling behavior** to be less aggressive:

```typescript
// In src/components/client/CryptoWallet.tsx
// Line 142-144

// OLD: Poll every 10 seconds
const statusInterval = setInterval(async () => {
  await checkPaymentStatus();
}, 10000);

// NEW: Poll every 30 seconds + trust webhook more
const statusInterval = setInterval(async () => {
  await checkPaymentStatus();
}, 30000); // 30 seconds instead of 10
```

**Extend default expiration time** for crypto deposits:

```typescript
// When creating crypto deposit
expiresAt: new Date(Date.now() + 60 * 60 * 1000); // 60 minutes instead of 30
```
