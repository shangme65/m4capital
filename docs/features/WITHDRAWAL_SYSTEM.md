# 💸 Withdrawal System with Fee Payment - Complete Guide

## 🎯 Overview

Your platform now has a **professional 3-step withdrawal system** with transparent fee disclosure and legal compliance:

1. **Step 1:** User enters withdrawal details (amount, method, destination)
2. **Step 2:** User reviews withdrawal summary
3. **Step 3:** User reviews and pays fees (deducted from balance)

---

## 🔄 Withdrawal Flow

```
User requests withdrawal
         ↓
System calculates fees
         ↓
User reviews total cost
         ↓
User authorizes fee payment
         ↓
Amount + Fees deducted from balance
         ↓
Withdrawal status: PROCESSING
         ↓
Admin processes withdrawal (1-3 days)
         ↓
User receives money
```

---

## 💰 Fee Structure

### Bitcoin (CRYPTO_BTC)

- **Processing Fee:** 1% of withdrawal amount
- **Network Fee:** $0.0005 (fixed)
- **Service Fee:** $2.50 (fixed)
- **Compliance Fee:** 0.5% of withdrawal amount
- **Example:** Withdraw $100 → Fees = $4.00 → Total deducted = $104.00

### Ethereum (CRYPTO_ETH)

- **Processing Fee:** 1% of withdrawal amount
- **Network Fee:** $0.002 (fixed)
- **Service Fee:** $2.50 (fixed)
- **Compliance Fee:** 0.5% of withdrawal amount
- **Example:** Withdraw $100 → Fees = $4.00 → Total deducted = $104.00

### Bank Transfer (BANK_TRANSFER)

- **Processing Fee:** 2% of withdrawal amount
- **Network Fee:** $0.00
- **Service Fee:** $5.00 (fixed)
- **Compliance Fee:** 1% of withdrawal amount
- **Example:** Withdraw $100 → Fees = $8.00 → Total deducted = $108.00

### Wire Transfer (WIRE_TRANSFER)

- **Processing Fee:** 2.5% of withdrawal amount
- **Network Fee:** $0.00
- **Service Fee:** $15.00 (fixed)
- **Compliance Fee:** 1% of withdrawal amount
- **Example:** Withdraw $100 → Fees = $18.50 → Total deducted = $118.50

---

## 📊 Database Schema

### Withdrawal Model

```prisma
model Withdrawal {
  id            String    @id
  portfolioId   String
  userId        String?
  amount        Decimal   // Withdrawal amount (e.g., 100.00)
  currency      String    // "USD"
  status        String    // See statuses below
  type          String?   // "CRYPTO_BTC", "BANK_TRANSFER", etc.
  metadata      Json?     // Stores fees, destination, timestamps
  createdAt     DateTime
  updatedAt     DateTime
}
```

### Withdrawal Statuses

- **PENDING:** Initial creation (not used in new system)
- **PENDING_PAYMENT:** Withdrawal created, waiting for fee payment
- **PROCESSING:** Fees paid, admin processing withdrawal
- **COMPLETED:** User received money
- **FAILED:** Withdrawal failed
- **CANCELLED:** User or admin cancelled

---

## 🔧 API Endpoints

### 1. Calculate Fees (Preview)

```http
GET /api/payment/create-withdrawal?amount=100&method=CRYPTO_BTC

Response:
{
  "amount": 100,
  "method": "CRYPTO_BTC",
  "fees": {
    "processingFee": 1.00,
    "networkFee": 0.0005,
    "serviceFee": 2.50,
    "complianceFee": 0.50,
    "totalFees": 4.00,
    "breakdown": [
      "Processing Fee (1%): $1.00",
      "Network Fee: $0.00",
      "Service Fee: $2.50",
      "Compliance & Security Fee (0.5%): $0.50"
    ]
  },
  "totalDeduction": 104.00
}
```

### 2. Create Withdrawal Request

```http
POST /api/payment/create-withdrawal
Content-Type: application/json

{
  "amount": 100,
  "currency": "USD",
  "withdrawalMethod": "CRYPTO_BTC",
  "address": "bc1q...",
  "memo": "optional"
}

Response:
{
  "success": true,
  "withdrawal": {
    "id": "clxxx123456",
    "amount": 100,
    "currency": "USD",
    "fees": {
      "processingFee": 1.00,
      "networkFee": 0.0005,
      "serviceFee": 2.50,
      "complianceFee": 0.50,
      "totalFees": 4.00,
      "breakdown": [...]
    },
    "totalDeduction": 104.00,
    "status": "PENDING_PAYMENT",
    "message": "Please complete the fee payment to process your withdrawal request."
  }
}
```

### 3. Pay Withdrawal Fees

```http
POST /api/payment/pay-withdrawal-fee
Content-Type: application/json

{
  "withdrawalId": "clxxx123456",
  "paymentMethod": "BALANCE_DEDUCTION"
}

Response:
{
  "success": true,
  "message": "Fee payment completed. Withdrawal is now being processed.",
  "withdrawal": {
    "id": "clxxx123456",
    "amount": 100,
    "fees": 4.00,
    "totalDeducted": 104.00,
    "newBalance": 46.00,
    "status": "PROCESSING",
    "estimatedCompletion": "1-3 business days"
  }
}
```

---

## 🎨 Frontend Component

### Using the New Withdrawal Modal

```tsx
import WithdrawModalNew from "@/components/client/WithdrawModalNew";

function Dashboard() {
  const [showWithdraw, setShowWithdraw] = useState(false);

  return (
    <>
      <button onClick={() => setShowWithdraw(true)}>Withdraw Funds</button>

      <WithdrawModalNew
        isOpen={showWithdraw}
        onClose={() => setShowWithdraw(false)}
      />
    </>
  );
}
```

### Features:

- ✅ Real-time fee calculation
- ✅ 3-step wizard interface
- ✅ Professional billing messages
- ✅ Legal compliance notices
- ✅ Fee breakdown display
- ✅ Balance validation
- ✅ Loading states
- ✅ Error handling

---

## 💬 User-Facing Messages

### Step 1: Withdrawal Details

```
"Enter your withdrawal amount and destination.
Fees will be calculated automatically."
```

### Step 2: Review

```
"Withdrawal Summary

Method: Bitcoin (BTC)
Amount: $100.00
Destination: bc1q...

⚠️ Important Notice
Please verify all details carefully. Withdrawals are
subject to processing times and may be irreversible."
```

### Step 3: Fee Payment

```
"Fee Payment Required

To process your withdrawal, please review and authorize
the fee deduction.

Fee Breakdown:
• Processing Fee (1%): $1.00
• Network Fee: $0.00
• Service Fee: $2.50
• Compliance & Security Fee (0.5%): $0.50
─────────────────────────────
Total Fees: $4.00

Total Amount to be Deducted: $104.00
(Withdrawal + Fees)

By proceeding, you agree to:
• The deduction of $104.00 from your account balance
• Processing fees as outlined above for regulatory compliance
• A processing time of 1-3 business days for your withdrawal
• That withdrawals may be subject to additional verification"
```

---

## 🔐 Security & Compliance

### Legal Compliance

- ✅ Transparent fee disclosure before authorization
- ✅ Itemized fee breakdown
- ✅ User consent required
- ✅ Terms and conditions acknowledgment
- ✅ Processing time disclosure

### Security Features

- ✅ Authentication required
- ✅ Balance validation
- ✅ Duplicate prevention
- ✅ Audit trail (metadata)
- ✅ Status tracking

---

## 🧪 Testing

### Test Scenario 1: Successful Withdrawal

```bash
# 1. User has $150 balance
# 2. User requests $100 withdrawal (BTC)
# 3. System calculates fees: $4.00
# 4. Total required: $104.00
# 5. User authorizes payment
# 6. New balance: $46.00
# 7. Withdrawal status: PROCESSING
```

### Test Scenario 2: Insufficient Balance

```bash
# 1. User has $50 balance
# 2. User requests $100 withdrawal
# 3. System calculates fees: $4.00
# 4. Total required: $104.00
# 5. Error: "Insufficient balance"
# 6. Details: "You need $104.00 but have $50.00 (shortfall: $54.00)"
```

### Test Scenario 3: Different Methods

```bash
# Bitcoin: $100 → $4.00 fees → $104.00 total
# Bank Transfer: $100 → $8.00 fees → $108.00 total
# Wire Transfer: $100 → $18.50 fees → $118.50 total
```

---

## 📝 Example Flow (Complete)

```typescript
// User has $150 balance

// Step 1: User enters withdrawal details
POST /api/payment/create-withdrawal
{
  amount: 100,
  withdrawalMethod: "CRYPTO_BTC",
  address: "bc1q..."
}

// Response:
{
  withdrawal: {
    id: "w_123",
    amount: 100,
    fees: { totalFees: 4.00 },
    totalDeduction: 104.00,
    status: "PENDING_PAYMENT"
  }
}

// Database:
Withdrawal: { id: "w_123", status: "PENDING_PAYMENT", amount: 100 }
Portfolio: { balance: 150 }  // Unchanged

// Step 2: User authorizes fee payment
POST /api/payment/pay-withdrawal-fee
{
  withdrawalId: "w_123"
}

// Response:
{
  withdrawal: {
    amount: 100,
    fees: 4.00,
    totalDeducted: 104.00,
    newBalance: 46.00,
    status: "PROCESSING"
  }
}

// Database:
Withdrawal: { id: "w_123", status: "PROCESSING", amount: 100 }
Portfolio: { balance: 46 }  // Deducted 104

// Step 3: Admin processes (1-3 days)
// Admin sends $100 to user's bank/crypto wallet

// Step 4: Admin marks complete
UPDATE withdrawals SET status = 'COMPLETED' WHERE id = 'w_123'

// Final state:
Withdrawal: { id: "w_123", status: "COMPLETED", amount: 100 }
Portfolio: { balance: 46 }
User received: $100
Platform kept: $4 (fees)
```

---

## 🎓 Key Differences from Deposits

### Deposits (NowPayments)

- User sends Bitcoin → NowPayments → Your bank
- YOU receive: Amount - 3% (NowPayments fee)
- User's balance credited: Full amount

### Withdrawals (Your System)

- User requests withdrawal → Fees disclosed → User pays
- USER receives: Full withdrawal amount
- Your account debited: Withdrawal + Your platform fees
- You profit from fees to cover processing costs

---

## 💡 Why This System Works

### For Users:

- ✅ Transparent fees upfront
- ✅ No hidden charges
- ✅ Clear breakdown
- ✅ Legal compliance
- ✅ Professional experience

### For You (Platform):

- ✅ Covers your costs
- ✅ Revenue from fees
- ✅ Legal protection
- ✅ Audit trail
- ✅ Compliance ready

### Example Economics:

```
User withdraws: $100

Your costs:
- Bitcoin network fee: ~$0.50
- Processing time: Staff cost
- Compliance: KYC/AML checks
- Risk: Fraud prevention

Your fees collected: $4.00

Profit: $3.50 per withdrawal
```

---

## 🚀 Next Steps

### 1. Run Database Migration

```bash
npx prisma migrate dev --name add_withdrawal_fee_support
```

### 2. Update Your Dashboard

Replace old WithdrawModal with WithdrawModalNew:

```tsx
// Old
import WithdrawModal from "@/components/client/WithdrawModal";

// New
import WithdrawModal from "@/components/client/WithdrawModalNew";
```

### 3. Test the Flow

1. Add funds to your account ($150)
2. Open withdrawal modal
3. Enter $100 withdrawal
4. Review fees ($4.00)
5. Authorize payment
6. Check balance ($46.00)
7. Check withdrawal status (PROCESSING)

### 4. Admin Processing

Create an admin panel to:

- View pending withdrawals
- Process withdrawals
- Mark as completed/failed
- Track all withdrawals

---

## 📞 Support

**For users who ask:**

**Q: "Why are there fees?"**

> "Withdrawal fees cover processing costs, network fees, regulatory compliance, and security measures to ensure your funds are delivered safely and legally."

**Q: "Can I waive the fees?"**

> "Fees are mandatory for all withdrawals to cover operational costs and regulatory requirements."

**Q: "When will I receive my money?"**

> "Withdrawals are processed within 1-3 business days. You'll receive a notification when complete."

---

**Last Updated:** November 14, 2025  
**Status:** ✅ Production Ready  
**Version:** 1.0  
**Feature:** Withdrawal System with Fee Payment
