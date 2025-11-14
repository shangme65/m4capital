# 💳 NowPayments Deposit - One Page Reference

## 🎯 The Basics

**Question:** How does money get into user accounts?  
**Answer:** NowPayments → Webhook → Database → User sees balance

---

## 📊 Visual Flow (Simple)

```
┌──────────────┐
│ User deposits│
│    $50       │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Sends Bitcoin│
│  0.00085 BTC │
└──────┬───────┘
       │
       ▼ (20 min)
┌──────────────┐
│  NowPayments │
│   confirms   │
└──────┬───────┘
       │
       ▼ (webhook)
┌──────────────┐
│ Your Server  │
│ +$50 balance │
└──────┬───────┘
       │
       ▼ (30s)
┌──────────────┐
│ Dashboard    │
│ Shows $150   │
└──────────────┘
```

---

## 🔢 The Math

```
Before:
Portfolio.balance = $100.00

Deposit:
deposit.amount = $50.00

After:
Portfolio.balance = $100.00 + $50.00 = $150.00
```

---

## 📁 Key Files

```
Webhook Handler (THE IMPORTANT ONE!)
→ src/app/api/payment/webhook/route.ts

Deposit Creation
→ src/app/api/payment/create-bitcoin-invoice/route.ts

Balance Display
→ src/app/(dashboard)/dashboard/page.tsx

Database
→ prisma/schema.prisma (Deposit + Portfolio models)
```

---

## 🔐 Security

✅ **Webhook Signature Verified**

- NowPayments signs every webhook
- Your server verifies signature
- Fake webhooks rejected

✅ **No Double-Crediting**

- Checks if already completed
- Only credits once per deposit

✅ **Environment Variables**

- No hardcoded credentials
- Secrets in `.env` file

---

## 🧪 Quick Test

```bash
# Start server
npm run dev

# Create deposit in dashboard
# (Dashboard → Deposit → Bitcoin → $50)

# Test it
node scripts/test-payment-quick.js

# Check balance
# (Dashboard → Should show +$50)
```

---

## 📊 Database Tables

### Deposit

```
id          → Unique ID
amount      → $50.00
status      → PENDING → COMPLETED
paymentId   → NowPayments ID
userId      → Who deposited
portfolioId → Where to credit
```

### Portfolio

```
id      → Unique ID
userId  → Owner
balance → $150.00 (updated!)
assets  → Crypto holdings
```

---

## 🎯 What Happens When

```
T+0:00  User creates deposit
T+0:05  QR code shows
T+1:00  User sends Bitcoin
T+10:00 1st confirmation
T+20:00 2nd confirmation ✅
T+20:05 Webhook sent
T+20:06 Balance credited ✅
T+20:30 Dashboard updates ✅
```

---

## 💡 Key Concepts

1. **Webhook = Notification**

   - NowPayments says "payment received"
   - Your server processes it

2. **Balance = Database**

   - Stored in Portfolio table
   - Updated by webhook handler

3. **Display = API Call**

   - Frontend fetches from database
   - Shows in dashboard

4. **Automatic = No Manual Work**
   - Everything happens automatically
   - No admin intervention needed

---

## ✅ Checklist

### For Development

- [ ] `.env` has NowPayments keys
- [ ] Database schema up to date
- [ ] Server running
- [ ] Test script works

### For Production

- [ ] Production keys in `.env`
- [ ] Webhook URL configured
- [ ] HTTPS enabled
- [ ] Tested with real Bitcoin

---

## 🐛 Quick Debug

**Balance not updating?**

1. Check webhook received (console logs)
2. Check signature valid
3. Check deposit found in database
4. Check portfolio updated

**Webhook not received?**

1. Check server running
2. Check URL correct in NowPayments
3. Check firewall allows webhooks
4. Check HTTPS working

**Test not working?**

1. Create deposit first
2. Check deposit is PENDING
3. Run test script
4. Wait 30s for frontend refresh

---

## 📚 Full Documentation

- **Summary:** [NOWPAYMENTS_SUMMARY.md](./NOWPAYMENTS_SUMMARY.md)
- **Detailed:** [DEPOSIT_FLOW_EXPLAINED.md](./DEPOSIT_FLOW_EXPLAINED.md)
- **Visual:** [VISUAL_DEPOSIT_FLOW.md](./VISUAL_DEPOSIT_FLOW.md)
- **Balance:** [BALANCE_DISPLAY_GUIDE.md](./BALANCE_DISPLAY_GUIDE.md)
- **Testing:** [TEST_DEPOSIT_FLOW.md](../testing/TEST_DEPOSIT_FLOW.md)

---

## 🎓 Remember

**The webhook is the key!**

Without webhook:

- ❌ No balance update
- ❌ Deposit stays pending
- ❌ User doesn't get money

With webhook:

- ✅ Balance updates automatically
- ✅ Deposit completes
- ✅ User gets money

**File:** `src/app/api/payment/webhook/route.ts`  
**This is where the magic happens!**

---

## 🚀 You're Ready!

Your NowPayments integration is complete and working. Users can now:

1. Deposit Bitcoin ✅
2. See their balance ✅
3. Use it for trading ✅
4. Track their transactions ✅

Everything is **automatic**, **secure**, and **production-ready**!

---

**Last Updated:** November 14, 2025
