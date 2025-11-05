# Dynamic Balances & Admin Protection Update

## Overview

This update implements three major improvements to the M4Capital platform:

1. **Super Admin Protection**: Prevents deletion or role changes for the super admin account
2. **Email Notifications & Transaction History**: Sends notifications when admin manually updates user balances
3. **Dynamic Crypto Balances**: Removes all hardcoded balances and uses real-time portfolio data

## Changes Made

### 1. Super Admin Protection

**File**: `src/app/(dashboard)/admin/page.tsx`

Protected the super admin account (admin@m4capital.com) from:

- Settings changes via UI
- Account deletion via UI

**Implementation**:

```typescript
{
  user.email !== "admin@m4capital.com" && (
    <>
      <button onClick={() => handleEditUser(user)}>
        <Settings className="h-4 w-4" />
      </button>
      <button onClick={() => handleDeleteUser(user.id)}>
        <Trash2 className="h-4 w-4" />
      </button>
    </>
  );
}
```

### 2. Email Notifications for Manual Balance Updates

**File**: `src/app/api/admin/top-up/route.ts`

When an admin manually updates a user's balance:

- Creates a `Deposit` record in the database with transaction details
- Sends an email notification to the user (if email is verified)
- Returns transaction details in the API response

**Features**:

- Transaction ID: Auto-generated with format `ADMIN-{timestamp}`
- Email includes: amount, new balance, payment method, transaction ID, date
- Admin notes included in email if provided
- Transaction metadata stores: admin email, timestamp, payment details

### 3. Dynamic Crypto Balances

All modal components now fetch real-time balances from the user's portfolio instead of using hardcoded values.

**Modified Files**:

1. `src/components/client/WithdrawModal.tsx`
2. `src/components/client/TransferModal.tsx`
3. `src/components/client/SellModal.tsx`
4. `src/components/client/ConvertModal.tsx`
5. `src/components/client/BuyModal.tsx`

**Implementation Pattern**:

```typescript
import { usePortfolio } from "@/lib/usePortfolio";

const { portfolio } = usePortfolio();

// For crypto assets (BTC, ETH, etc.)
const availableBalances =
  portfolio?.portfolio?.assets?.reduce((acc: any, asset: any) => {
    acc[asset.symbol] = asset.amount || 0;
    return acc;
  }, {} as Record<string, number>) || {};

// For USD balance (BuyModal)
const availableBalance = portfolio?.portfolio?.balance
  ? parseFloat(portfolio.portfolio.balance.toString())
  : 0;
```

## Database Schema

The portfolio system already supports dynamic balances:

```prisma
model Portfolio {
  id      String  @id @default(cuid())
  userId  String  @unique
  balance Decimal @default(0.00)
  assets  Json    @default("[]") // Dynamic array of crypto assets

  deposits    Deposit[]
  withdrawals Withdrawal[]
}
```

## How It Works

### Portfolio Creation

When a new user signs up, their portfolio is created with:

- `balance: 0.00` (USD balance starts at zero)
- `assets: []` (empty array of crypto assets)

### Balance Updates

1. **Deposits**: Admin can manually add funds via `/api/admin/top-up`

   - Creates Deposit record
   - Increments portfolio balance
   - Sends email notification

2. **Trading**: Users buy/sell crypto (updates assets array)

3. **Withdrawals**: Users withdraw funds (decrements balance)

### Frontend Display

All modals now dynamically display:

- Current USD balance from `portfolio.balance`
- Current crypto balances from `portfolio.assets` array
- Real-time updates when portfolio changes

## Benefits

1. **Security**: Super admin cannot be accidentally deleted or demoted
2. **Transparency**: Users receive email notifications for all manual balance changes
3. **Accuracy**: Balances reflect actual database state, not mock data
4. **Auditability**: All manual balance updates are recorded in Deposit table
5. **Scalability**: No need to update hardcoded values as platform grows

## Testing Checklist

- [ ] Verify super admin buttons are hidden in admin UI
- [ ] Test manual balance top-up creates Deposit record
- [ ] Confirm email notifications are sent to users
- [ ] Check that modals show actual portfolio balances
- [ ] Verify new users start with 0 balances
- [ ] Test buy/sell/transfer modals with real balances

## Environment Variables

Ensure these are set in `.env`:

```
ORIGIN_ADMIN_EMAIL="admin@m4capital.com"
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your_sendgrid_api_key
EMAIL_FROM=noreply@m4capital.com
```

## Notes

- Transaction records use type: "ADMIN_TOPUP" for manual updates
- Email notifications only sent if user's email is verified
- Portfolio assets are stored as JSON: `[{ "symbol": "BTC", "amount": 0.5 }]`
- All balances default to 0 for new users (no hardcoded starting amounts)
