# 🧪 Test Your Deposit Flow - Quick Guide

## ⚡ Fastest Way to Test (30 seconds)

### Step 1: Start Your Server

```bash
npm run dev
```

### Step 2: Create a Deposit

1. Open http://localhost:3000/dashboard
2. Click "Deposit Funds"
3. Select "Bitcoin (BTC)"
4. Enter amount: `50`
5. Click "Continue"
6. Wait for QR code to appear ✅

### Step 3: Complete the Deposit

```bash
# In a new terminal:
node scripts/test-payment-quick.js
```

### Step 4: Verify Balance Updated

- Go back to dashboard
- Wait 10-30 seconds (frontend auto-refreshes)
- Balance should show: **+$50.00** 🎉

---

## 📊 Understanding What Just Happened

### Before Test:

```
Database State:
├── User: you@example.com
├── Portfolio Balance: $100.00
└── Deposits: None

Frontend Display:
Available Balance: $100.00
```

### During Test:

```
1. You created deposit request
   ├── Creates Deposit record (PENDING)
   ├── NowPayments invoice created
   └── QR code displayed

2. Test script simulated webhook
   ├── Sent POST to /api/payment/webhook
   ├── Included valid signature
   ├── Payload: payment_status = "finished"
   └── Server processed request
```

### After Test:

```
Database State:
├── User: you@example.com
├── Portfolio Balance: $150.00 ← Updated!
└── Deposits:
    └── $50.00 (COMPLETED) ← New!

Frontend Display:
Available Balance: $150.00 ← Updated!
Recent Activity: Deposit +$50.00
```

---

## 🔍 Verify Each Step

### 1. Check Deposit Was Created

```bash
node scripts/show-deposits.js
```

**Expected output:**

```
Recent Deposits:
┌─────────────────────────────────────────────────┐
│ Amount: $50.00                                  │
│ Status: PENDING                                 │
│ Method: NOWPAYMENTS_BTC                         │
│ Payment ID: 5891871234                          │
│ Address: bc1q...                                │
│ Created: 2 minutes ago                          │
└─────────────────────────────────────────────────┘
```

### 2. Check Balance Before Test

```bash
npx prisma studio
# Navigate to Portfolio table
# Find your user's portfolio
# Note the current balance
```

### 3. Run Test Script

```bash
node scripts/test-payment-quick.js
```

**Expected output:**

```
🧪 Testing NowPayments Webhook...

📍 Finding latest pending deposit...
✅ Found deposit: clxxx123456
   Amount: $50.00
   Status: PENDING
   User: you@example.com

🔐 Generating webhook signature...
✅ Signature generated

📤 Sending webhook to: http://localhost:3000/api/payment/webhook
✅ Webhook sent successfully!

📊 Response:
{
  "success": true,
  "message": "Webhook processed successfully"
}

✅ Test completed!
💰 Check your dashboard - balance should be updated!
```

### 4. Check Balance After Test

```bash
npx prisma studio
# Refresh Portfolio table
# Balance should be increased by $50
```

### 5. Verify in Dashboard

```
1. Open http://localhost:3000/dashboard
2. Look at "Available Balance"
3. Should show increased amount
4. Check "Recent Activity"
5. Should show completed deposit
```

---

## 🎯 What to Look For

### ✅ Success Indicators:

1. **Deposit Created**

   - Shows in "Recent Activity"
   - Status: PENDING
   - Has Bitcoin address

2. **Webhook Processed**

   - Console shows: "✅ Payment completed!"
   - Console shows: "💵 Credited $X to user..."
   - Console shows: "New balance: $X"

3. **Balance Updated**

   - Database: Portfolio.balance increased
   - Frontend: Shows new balance
   - Deposit status: COMPLETED

4. **UI Updates**
   - Balance number changes
   - Transaction appears in history
   - Status badge turns green
   - Notification appears

### ❌ Failure Indicators:

1. **Webhook Failed**

   ```
   ❌ Missing signature
   ❌ Invalid signature
   ❌ Deposit not found
   ```

2. **Balance Not Updated**

   - Dashboard shows old balance
   - No transaction in history
   - Deposit still PENDING

3. **Database Issues**
   - Portfolio not found
   - User not associated
   - Transaction error

---

## 🐛 Troubleshooting

### Issue: "Deposit not found"

```bash
# Check if deposits exist
node scripts/show-deposits.js

# If no deposits, create one first:
# 1. Go to dashboard
# 2. Create a deposit
# 3. Then run test script
```

### Issue: "Invalid signature"

```bash
# Check your .env file
cat .env | grep NOWPAYMENTS_IPN_SECRET

# Make sure it's set:
NOWPAYMENTS_IPN_SECRET=your-secret-here
```

### Issue: Balance not updating

```bash
# Check webhook logs
npm run dev
# Look for console output starting with:
# "📥 Webhook received from NOWPayments"

# If no logs, webhook didn't reach server
# If logs show errors, check error message
```

### Issue: Frontend not refreshing

```bash
# Hard refresh browser
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)

# Or wait 30 seconds for auto-refresh
```

---

## 📝 Step-by-Step Test Checklist

Copy this and check off as you go:

```
[ ] Server is running (npm run dev)
[ ] Logged into dashboard
[ ] Created a deposit request
[ ] QR code displayed successfully
[ ] Ran test script (node scripts/test-payment-quick.js)
[ ] Script completed without errors
[ ] Checked database (balance increased)
[ ] Verified in dashboard (UI updated)
[ ] Checked transaction history (deposit shows)
[ ] Status changed from PENDING → COMPLETED
```

---

## 🔬 Advanced Testing

### Test Multiple Deposits

```bash
# Create 3 deposits in dashboard
# Then run:
for i in {1..3}; do
  node scripts/test-payment-quick.js
  echo "Waiting 5 seconds..."
  sleep 5
done

# Should credit all 3 deposits
```

### Test with Different Amounts

```bash
# Create deposits with:
# - $10
# - $50
# - $100
# - $500

# Run script for each
# Verify each amount is credited correctly
```

### Test Idempotency (No Double-Crediting)

```bash
# Create 1 deposit
node scripts/test-payment-quick.js

# Run again with same deposit
node scripts/test-payment-quick.js

# Balance should only increase ONCE
# Second run should skip already-completed deposit
```

---

## 📊 Expected Database Changes

### Deposit Table

```sql
-- Before test
SELECT * FROM "Deposit" WHERE status = 'PENDING';
-- Shows: 1 row, status = 'PENDING'

-- After test
SELECT * FROM "Deposit" WHERE status = 'COMPLETED';
-- Shows: 1 row, status = 'COMPLETED', updatedAt changed
```

### Portfolio Table

```sql
-- Before test
SELECT balance FROM "Portfolio" WHERE "userId" = 'your-user-id';
-- Shows: 100.00

-- After test
SELECT balance FROM "Portfolio" WHERE "userId" = 'your-user-id';
-- Shows: 150.00 (increased by 50)
```

---

## 🎓 Understanding the Test Script

The test script does 3 things:

1. **Finds Pending Deposit**

   ```typescript
   const deposit = await prisma.deposit.findFirst({
     where: { status: "PENDING" },
     orderBy: { createdAt: "desc" },
   });
   ```

2. **Creates Valid Webhook Payload**

   ```typescript
   const payload = {
     payment_id: deposit.paymentId,
     payment_status: "finished",
     order_id: deposit.id,
     price_amount: deposit.amount.toString(),
   };
   ```

3. **Sends Webhook with Signature**
   ```typescript
   const signature = createHmacSignature(payload, ipnSecret);
   await fetch("http://localhost:3000/api/payment/webhook", {
     method: "POST",
     headers: {
       "x-nowpayments-sig": signature,
       "Content-Type": "application/json",
     },
     body: JSON.stringify(payload),
   });
   ```

This simulates EXACTLY what NowPayments does in production!

---

## 🚀 Production Testing

### With Real Bitcoin (Small Amount)

1. **Create Deposit**

   - Dashboard → Deposit → Bitcoin
   - Amount: $10 (minimum)

2. **Send Bitcoin**

   - Use your wallet
   - Send to displayed address
   - Send exact BTC amount shown

3. **Wait for Confirmations**

   - 0 confirmations: ~0-10 minutes
   - 1 confirmation: ~10 minutes
   - 2 confirmations: ~20 minutes ✅

4. **Automatic Update**
   - NowPayments detects confirmation
   - Sends webhook to your server
   - Balance updates automatically
   - You see new balance in dashboard

**Timeline:**

```
00:00 - Create deposit
00:30 - Send Bitcoin
10:30 - 1st confirmation
20:30 - 2nd confirmation
20:35 - Webhook received
20:36 - Balance updated ✅
```

---

## 📈 Monitoring in Production

### Check Webhook Logs

```bash
# If using PM2:
pm2 logs app-name | grep "Webhook"

# If using systemd:
journalctl -u app-name -f | grep "Webhook"

# Look for:
# "📥 Webhook received from NOWPayments"
# "✅ Payment completed!"
# "💵 Credited $X to user..."
```

### Database Monitoring

```sql
-- Check recent completed deposits
SELECT
  d.id,
  u.email,
  d.amount,
  d.status,
  d."createdAt",
  d."updatedAt"
FROM "Deposit" d
JOIN "User" u ON d."userId" = u.id
WHERE d.status = 'COMPLETED'
ORDER BY d."updatedAt" DESC
LIMIT 10;

-- Check balance changes
SELECT
  u.email,
  p.balance,
  p."updatedAt"
FROM "Portfolio" p
JOIN "User" u ON p."userId" = u.id
ORDER BY p."updatedAt" DESC
LIMIT 10;
```

---

## ✅ Final Verification

After running all tests, you should have:

- [x] Multiple completed deposits in database
- [x] Portfolio balance correctly increased
- [x] Dashboard showing correct balance
- [x] Transaction history showing all deposits
- [x] All deposit statuses showing "COMPLETED"
- [x] Console logs showing successful processing
- [x] No errors in logs
- [x] Frontend auto-refreshing correctly

---

## 🎉 Success Criteria

You'll know everything works when:

1. ✅ You can create deposits in UI
2. ✅ Test script completes without errors
3. ✅ Balance increases in database
4. ✅ Balance shows correctly in dashboard
5. ✅ Deposits show in transaction history
6. ✅ Multiple deposits work correctly
7. ✅ No double-crediting happens
8. ✅ Webhook signature verification works

---

## 📚 Next Steps

Once testing is successful:

1. **Deploy to Production**

   - Set production environment variables
   - Configure NowPayments webhook URL
   - Test with small real deposit

2. **Add Notifications** (Optional)

   - Email on deposit complete
   - Telegram notification
   - SMS alerts

3. **Add Monitoring** (Optional)

   - Track deposit success rate
   - Monitor webhook failures
   - Alert on issues

4. **Enhance UI** (Optional)
   - Show confirmation count
   - Add deposit history filters
   - Export transaction receipts

---

**Need Help?**

Check these docs:

- [DEPOSIT_FLOW_EXPLAINED.md](./DEPOSIT_FLOW_EXPLAINED.md) - Detailed flow
- [VISUAL_DEPOSIT_FLOW.md](./VISUAL_DEPOSIT_FLOW.md) - Visual diagrams
- [BALANCE_DISPLAY_GUIDE.md](./BALANCE_DISPLAY_GUIDE.md) - Balance handling

Or run:

```bash
node scripts/show-deposits.js
```

**Last Updated:** November 14, 2025
