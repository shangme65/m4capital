# Deposit Recovery Guide - April 1, 2026

## Problem Summary

Your Bitcoin deposit of **0.00036223 BTC** was successfully received by NowPayments and marked as **"Finished"** ✅, but your platform still shows it as **FAILED** ❌.

## Root Cause

1. **Frontend polls payment status every 10 seconds** to check if payment completed
2. **Payment expired locally after 30 minutes** (before blockchain confirmations finished)
3. **Status check endpoint marked deposit as FAILED** when local timer expired
4. **Webhook arrived AFTER deposit was marked as FAILED** (payment took 17 minutes: 04:52 PM → 05:09 PM)
5. **Webhook either:**
   - Never ran (NowPayments didn't send it)
   - Ran but encountered error during credit process
   - Signature verification failed

## Fixes Applied (for future deposits)

✅ **Extended grace period**: Added 15-minute buffer before marking deposits as FAILED
✅ **Reduced polling frequency**: Changed from 10s to 30s to reduce premature expiration
✅ **Better error logging**: Added detailed error tracking in webhook credit process
✅ **Recovery detection**: Webhook now explicitly logs when recovering FAILED deposits

## How to Recover Your Deposit NOW

### Option 1: Using Browser Console (Easiest)

1. **Login to admin account** at https://m4capital.online/admin

2. **Open browser console** (Press F12, click "Console" tab)

3. **Load recovery script**:

   ```javascript
   // Copy entire content from scripts/recover-april1-deposit.js
   // Then paste into console
   ```

4. **Run recovery**:

   ```javascript
   await fullRecovery();
   ```

5. **Check output** - Should show:
   - ✅ Deposit ID found
   - ✅ Balance credited
   - ✅ User notified

### Option 2: Manual API Call

If you know the deposit ID from database:

```javascript
fetch("/api/admin/recover-deposit", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    depositId: "YOUR_DEPOSIT_ID_HERE",
    paymentId: "727a796c0fa9...aadc013130a2",
  }),
})
  .then((r) => r.json())
  .then(console.log);
```

### Option 3: Find Deposit ID from Database

If you have database access:

```sql
-- Find deposit from April 1, 2026
SELECT
  id,
  "userId",
  amount,
  currency,
  status,
  "paymentId",
  "paymentStatus",
  method,
  "createdAt",
  "updatedAt"
FROM "Deposit"
WHERE "createdAt" >= '2026-04-01 16:40:00'  -- 04:40 PM UTC
  AND "createdAt" <= '2026-04-01 17:10:00'  -- 05:10 PM UTC
  AND status = 'FAILED'
  AND method LIKE '%NOWPAYMENTS%'
ORDER BY "createdAt" DESC
LIMIT 5;
```

Expected results:

- Amount: ~0.00036223 (if stored in BTC) or ~$30-40 (if stored in USD equivalent)
- Created: 2026-04-01 around 16:52:00 UTC
- Status: FAILED
- Method: NOWPAYMENTS_CRYPTO or similar

Copy the `id` field and use in Option 2 above.

## Verification Steps

After recovery, verify:

1. **Check user balance**:

   ```javascript
   fetch("/api/portfolio")
     .then((r) => r.json())
     .then(console.log);
   ```

2. **Check notifications**:
   - User should receive notification about deposit completion
   - Check Telegram if linked
   - Check email if verified

3. **Check deposit status**:
   ```javascript
   fetch(`/api/payment/status/${depositId}`)
     .then((r) => r.json())
     .then(console.log);
   ```

   - Status should be: `COMPLETED`

## Troubleshooting Webhook Delivery

### Check Vercel Logs

1. Go to https://vercel.com
2. Select your project: **m4capital**
3. Click **Logs** tab
4. Set time filter: **April 1, 2026, 04:50 PM - 05:15 PM**

5. Search for any of these:
   - `📥 ========== WEBHOOK RECEIVED ==========`
   - `727a796c0fa9` (payment hash)
   - `RECOVERY CASE`
   - `WEBHOOK PROCESSING ERROR`

### Possible Log Outputs:

#### If webhook NEVER arrived:

```
(No logs found)
```

**Solution**: Manual recovery required (see options above)

#### If webhook arrived but signature failed:

```
📥 ========== WEBHOOK RECEIVED ==========
❌ Invalid signature
```

**Cause**: IPN secret mismatch or body parsing issue
**Solution**: Verify NOWPAYMENTS_IPN_SECRET in Vercel env vars matches NowPayments dashboard

#### If webhook arrived but credit failed:

```
📥 ========== WEBHOOK RECEIVED ==========
✅ Deposit found
🔄 RECOVERY CASE: Deposit was FAILED but NowPayments confirms payment!
❌❌❌ CRITICAL ERROR IN CREDIT PROCESS:
[error details]
```

**Cause**: Database error, portfolio not found, or conversion failure
**Solution**: Check error details, fix root cause, then run manual recovery

#### If webhook succeeded:

```
📥 ========== WEBHOOK RECEIVED ==========
✅ Deposit found
🔄 RECOVERY CASE: Deposit was FAILED but NowPayments confirms payment!
✅✅✅ CREDIT PROCESS COMPLETED SUCCESSFULLY!
```

**Result**: Balance should already be credited - check user dashboard

## If Recovery Still Fails

Contact support with:

- Deposit ID (from database query)
- User email
- Payment hash: `727a796c0fa9...aadc013130a2`
- Error message from recovery attempt
- Vercel logs screenshot

## Preventing Future Occurrences

Changes already made:

1. ✅ Extended expiration grace period (15 minutes)
2. ✅ Reduced status polling frequency (30 seconds)
3. ✅ Improved webhook error handling
4. ✅ Better recovery detection and logging

Additional recommendations:

- Monitor Vercel logs for webhook errors
- Set up alerts for failed deposits
- Consider increasing default expiration time to 60 minutes for crypto payments
- Add retry mechanism for failed webhook processing

## Files Modified

- `src/app/api/payment/status/[depositId]/route.ts` - Extended grace period
- `src/components/client/CryptoWallet.tsx` - Reduced polling frequency
- `src/app/api/payment/webhook/route.ts` - Better error handling
- `scripts/recover-april1-deposit.js` - Recovery script
- `WEBHOOK_DEBUG.md` - Technical analysis

---

**Need help?** The recovery process is safe to run multiple times (idempotent).
