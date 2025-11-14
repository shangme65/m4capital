# 💵 Balance Display - Quick Reference

## Where Users See Their Balance

### 1. **Main Dashboard** (`/dashboard`)

```tsx
// Location: src/app/(dashboard)/dashboard/page.tsx

const { portfolio } = usePortfolio();
const balance = portfolio?.portfolio.balance || 0;

// Displays as:
<div className="balance-card">
  <h3>Available Balance</h3>
  <p className="text-3xl font-bold">
    $
    {balance.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}
  </p>
</div>;
```

**Output:** `$150.00`

---

### 2. **Finance Page** (`/finance`)

```tsx
// Location: src/app/(dashboard)/finance/page.tsx

// Shows total balance + deposits + withdrawals
const totalBalance = portfolio?.balance || 0;
const totalDeposits = deposits.reduce((sum, d) => sum + d.amount, 0);
const totalWithdrawals = withdrawals.reduce((sum, w) => sum + w.amount, 0);
```

**Shows:**

- Total Balance: `$150.00`
- Total Deposits: `$150.00`
- Total Withdrawals: `$0.00`
- Net Balance: `$150.00`

---

### 3. **Trading Interface**

```tsx
// Location: src/components/client/BuyModal.tsx

const availableBalance = portfolio?.portfolio?.balance || 0;

// Used for:
// - Buy crypto validation
// - Sell crypto validation
// - Trade execution checks
```

**Prevents:**

- ❌ Buying more than available balance
- ❌ Opening trades without funds
- ❌ Overdraft situations

---

## How Balance Updates Work

### Automatic Refresh

```typescript
// Frontend polls every 30 seconds
useEffect(() => {
  const interval = setInterval(() => {
    refetch(); // Calls /api/portfolio
  }, 30000);

  return () => clearInterval(interval);
}, []);
```

### Manual Refresh

```typescript
// User can click "Refresh" button
<button onClick={() => refetch()}>
  <RefreshIcon /> Refresh Balance
</button>
```

### Real-Time Updates

```typescript
// After successful actions:
- Deposit completed → refetch()
- Trade executed → refetch()
- Withdrawal processed → refetch()
```

---

## API Endpoints

### Get Portfolio Balance

```
GET /api/portfolio
Authorization: Bearer <session-token>

Response:
{
  "portfolio": {
    "id": "clxxx",
    "balance": 150.00,
    "assets": [],
    "deposits": [...],
    "withdrawals": [...]
  }
}
```

### Get User Balance (Alternative)

```
GET /api/user/balance
Authorization: Bearer <session-token>

Response:
{
  "realBalance": 150.00,
  "practiceBalance": 100000.00
}
```

---

## Database Queries

### Direct Balance Check (PostgreSQL)

```sql
-- Check specific user's balance
SELECT
  u.email,
  p.balance,
  p.updated_at
FROM "User" u
JOIN "Portfolio" p ON p."userId" = u.id
WHERE u.email = 'user@example.com';
```

### Balance with Deposits

```sql
-- See balance + all deposits
SELECT
  u.email,
  p.balance,
  d.amount AS deposit_amount,
  d.status,
  d."createdAt"
FROM "User" u
JOIN "Portfolio" p ON p."userId" = u.id
LEFT JOIN "Deposit" d ON d."portfolioId" = p.id
WHERE u.email = 'user@example.com'
ORDER BY d."createdAt" DESC;
```

---

## Testing Balance Updates

### Test Script

```bash
# Create a test deposit and credit it
node scripts/test-payment-quick.js
```

**What happens:**

1. Finds latest PENDING deposit
2. Sends webhook to mark it COMPLETED
3. Credits balance automatically
4. Logs new balance

### Manual Testing

```bash
# 1. Check current balance
npx prisma studio
# Go to Portfolio table → Check balance

# 2. Create deposit in app
# Dashboard → Deposit → Bitcoin → $50

# 3. Complete deposit
node scripts/test-payment-quick.js

# 4. Verify new balance
npx prisma studio
# Should show: original + 50
```

---

## Balance Calculation Logic

### Simple Deposit

```typescript
currentBalance = 100.0;
depositAmount = 50.0;
newBalance = currentBalance + depositAmount;
// Result: 150.00
```

### Multiple Deposits

```typescript
initialBalance = 0.00
+ deposit1 = 50.00  → Balance: 50.00
+ deposit2 = 100.00 → Balance: 150.00
+ deposit3 = 25.00  → Balance: 175.00
```

### With Withdrawals

```typescript
balance = 150.00
- withdrawal = 30.00
newBalance = 150.00 - 30.00
// Result: 120.00
```

### With Trades

```typescript
balance = 150.00
buyOrder = 50.00 (buying crypto)
newBalance = 150.00 - 50.00
// Result: 100.00

(Crypto asset added to portfolio.assets)
```

---

## Common Patterns

### Check if User Can Afford Purchase

```typescript
function canAfford(amount: number) {
  const balance = portfolio?.portfolio.balance || 0;
  return balance >= amount;
}

// Usage
if (canAfford(50)) {
  // Allow purchase
} else {
  // Show "Insufficient funds"
}
```

### Format Balance for Display

```typescript
function formatBalance(balance: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(balance);
}

// Usage
formatBalance(150); // "$150.00"
formatBalance(1500.5); // "$1,500.50"
```

### Calculate Available Balance After Trade

```typescript
function calculateAvailableAfterTrade(
  currentBalance: number,
  tradeAmount: number,
  fee: number = 0
) {
  return currentBalance - tradeAmount - fee;
}

// Usage
const available = calculateAvailableAfterTrade(150, 50, 2);
// Result: 98 (150 - 50 - 2)
```

---

## Security Considerations

### ✅ Safe Operations

- Reading balance (GET requests)
- Displaying balance in UI
- Calculating potential trades
- Showing transaction history

### 🔒 Protected Operations

- Updating balance (requires webhook signature)
- Creating deposits (requires authentication)
- Processing withdrawals (requires admin approval)
- Crediting funds (webhook only)

### ❌ Never Do This

```typescript
// ❌ WRONG: Allow users to set their own balance
function updateBalance(userId: string, newBalance: number) {
  await prisma.portfolio.update({
    where: { userId },
    data: { balance: newBalance }, // Dangerous!
  });
}

// ✅ CORRECT: Only update via verified webhook
if (webhookSignatureValid && paymentStatus === "finished") {
  // Safe to credit balance
}
```

---

## Troubleshooting

### Balance not showing?

1. Check if user has portfolio:

   ```sql
   SELECT * FROM "Portfolio" WHERE "userId" = 'user-id';
   ```

2. If no portfolio exists:
   ```typescript
   // Create one via API or seed
   await prisma.portfolio.create({
     data: { userId: user.id, balance: 0, assets: [] },
   });
   ```

### Balance not updating after deposit?

1. Check deposit status:

   ```bash
   node scripts/show-deposits.js
   ```

2. Check webhook logs:

   ```bash
   tail -f logs/webhook.log
   ```

3. Manually trigger webhook:
   ```bash
   node scripts/test-payment-quick.js
   ```

### Balance showing wrong amount?

1. Verify database:

   ```sql
   SELECT balance FROM "Portfolio" WHERE "userId" = 'user-id';
   ```

2. Check for pending deposits:

   ```sql
   SELECT SUM(amount) FROM "Deposit"
   WHERE "userId" = 'user-id' AND status = 'COMPLETED';
   ```

3. Compare calculated vs actual:

   ```typescript
   const deposits = await prisma.deposit.findMany({
     where: { userId, status: "COMPLETED" },
   });
   const totalDeposits = deposits.reduce((sum, d) => sum + d.amount, 0);
   const currentBalance = portfolio.balance;

   // Should match (if no withdrawals/trades)
   console.log({ totalDeposits, currentBalance });
   ```

---

## Quick Commands

```bash
# View all balances
npx prisma studio

# Check specific user
psql $DATABASE_URL -c "SELECT u.email, p.balance FROM \"User\" u JOIN \"Portfolio\" p ON p.\"userId\" = u.id;"

# Test deposit flow
node scripts/test-payment-quick.js

# View recent deposits
node scripts/show-deposits.js

# Seed admin with empty balance
npm run seed
```

---

**Last Updated:** November 14, 2025
**Related:** [DEPOSIT_FLOW_EXPLAINED.md](./DEPOSIT_FLOW_EXPLAINED.md)
