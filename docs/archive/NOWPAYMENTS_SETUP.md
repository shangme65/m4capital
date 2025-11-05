# NOWPayments Bitcoin Integration Setup Guide

This guide explains how to set up Bitcoin deposits using NOWPayments API.

## What's Been Created

### 1. NOWPayments Client Library (`src/lib/nowpayments.ts`)

- Wrapper for NOWPayments API
- Methods for creating payments, checking status, estimating prices
- IPN signature verification

### 2. API Endpoints

#### Create Bitcoin Payment (`/api/payment/create-bitcoin`)

- **Method**: POST
- **Auth**: Required
- **Body**:
  ```json
  {
    "amount": 100,
    "currency": "USD"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "deposit": {
      "id": "deposit_id",
      "paymentId": "nowpayments_id",
      "paymentAddress": "bitcoin_address",
      "cryptoAmount": 0.0024,
      "status": "waiting"
    }
  }
  ```

#### Payment Webhook (`/api/payment/webhook`)

- **Method**: POST
- **Purpose**: Receives payment status updates from NOWPayments
- **Automatically**: Credits user balance when payment confirmed

### 3. Database Schema Updates

Added to `Deposit` model:

- `paymentId`: NOWPayments payment ID
- `paymentAddress`: Bitcoin address for payment
- `paymentAmount`: Amount in BTC
- `paymentStatus`: Current payment status
- `cryptoAmount`: Estimated crypto amount
- `cryptoCurrency`: "BTC"
- `method`: Payment method ("NOWPAYMENTS_BTC")
- `userId`: Direct link to user (in addition to portfolio)

## Setup Steps

### 1. Get NOWPayments API Credentials

1. Go to [https://nowpayments.io/](https://nowpayments.io/)
2. Sign up for an account
3. Go to Settings → API Keys
4. Copy your API Key
5. Copy your IPN Secret (for webhooks)

### 2. Configure Environment Variables

Update your `.env` file:

```env
# NOWPayments API Configuration
NOWPAYMENTS_API_KEY="your-api-key-here"
NOWPAYMENTS_IPN_SECRET="your-ipn-secret-here"
NOWPAYMENTS_SANDBOX=true  # Set to false for production
```

### 3. Run Database Migration

**IMPORTANT**: Restart your dev server first to unlock Prisma:

```bash
# Stop dev server (Ctrl+C)
# Then run:
npx prisma migrate dev --name add_nowpayments_fields

# Start dev server again:
npm run dev
```

### 4. Configure NOWPayments IPN Webhook

In your NOWPayments dashboard:

1. Go to Settings → IPN/Callbacks
2. Set IPN Callback URL to: `https://your-domain.com/api/payment/webhook`
3. For local testing, use ngrok:
   ```bash
   ngrok http 3000
   # Use the HTTPS URL: https://xxxxx.ngrok.io/api/payment/webhook
   ```

### 5. Test the Integration

#### Test Payment Creation

```bash
curl -X POST http://localhost:3000/api/payment/create-bitcoin \
  -H "Content-Type: application/json" \
  -d '{"amount": 10, "currency": "USD"}' \
  -H "Cookie: next-auth.session-token=your-session-token"
```

#### Test Webhook Endpoint

```bash
curl http://localhost:3000/api/payment/webhook
```

## How It Works

### Payment Flow

1. **User Initiates Deposit**

   - User clicks "Deposit" → Selects Bitcoin
   - Enters amount in USD (or other fiat)

2. **Payment Creation**

   - Frontend calls `/api/payment/create-bitcoin`
   - Backend creates deposit record in database
   - NOWPayments API creates payment and returns Bitcoin address
   - User sees QR code and address to send Bitcoin to

3. **User Sends Bitcoin**

   - User sends exact BTC amount to provided address
   - Payment status: `waiting` → `confirming` → `confirmed`

4. **Webhook Processing**

   - NOWPayments sends webhook to `/api/payment/webhook`
   - Server verifies webhook signature
   - Updates deposit status in database
   - When status is `confirmed` or `finished`: Credits user's portfolio balance

5. **User Balance Updated**
   - User sees updated balance in dashboard
   - Deposit appears in recent transactions

## Payment Statuses

- `waiting`: Waiting for user to send Bitcoin
- `confirming`: Bitcoin transaction detected, waiting for confirmations
- `confirmed`: Transaction confirmed, funds credited
- `finished`: Payment complete
- `failed`: Payment failed
- `refunded`: Payment refunded
- `expired`: Payment expired (user didn't send in time)
- `partially_paid`: User sent less than required amount

## Security Features

1. **IPN Signature Verification**: All webhooks are verified using HMAC-SHA512
2. **Authentication Required**: Only authenticated users can create payments
3. **Order ID Validation**: Webhooks must reference valid deposit IDs
4. **Idempotency**: Multiple webhooks with same status don't duplicate credits

## Next Steps

### Create UI Components

You'll need to create:

1. **Bitcoin Deposit Modal**

   - Shows payment address and QR code
   - Displays amount to send in BTC
   - Real-time status updates
   - Countdown timer for expiration

2. **Payment Status Checker**

   - Poll `/api/payment/status/{depositId}` endpoint
   - Update UI based on payment status
   - Show confirmation when complete

3. **Deposit History**
   - List all deposits with status
   - Filter by payment method
   - Show transaction details

### Example UI Integration

```typescript
// In your deposit modal component
const handleBitcoinDeposit = async (amount: number) => {
  try {
    const response = await fetch("/api/payment/create-bitcoin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, currency: "USD" }),
    });

    const data = await response.json();

    // Show QR code and payment details
    setPaymentAddress(data.deposit.paymentAddress);
    setPaymentAmount(data.deposit.cryptoAmount);
    setPaymentId(data.deposit.paymentId);

    // Start polling for status updates
    pollPaymentStatus(data.deposit.id);
  } catch (error) {
    console.error("Payment creation failed:", error);
  }
};
```

## Testing with Sandbox

NOWPayments provides a sandbox environment:

- Set `NOWPAYMENTS_SANDBOX=true` in `.env`
- Use sandbox API keys
- Payments are simulated (no real crypto needed)
- Test all payment statuses

## Production Checklist

Before going live:

- [ ] Set `NOWPAYMENTS_SANDBOX=false`
- [ ] Use production API keys
- [ ] Configure production IPN webhook URL
- [ ] Test with small real payment
- [ ] Set up monitoring/alerts for failed webhooks
- [ ] Configure email notifications for deposits
- [ ] Add deposit limits and validation
- [ ] Implement fraud detection

## Support

- NOWPayments Documentation: https://documenter.getpostman.com/view/7907941/S1a32n38
- NOWPayments Support: support@nowpayments.io
- API Status: https://status.nowpayments.io/

## Troubleshooting

### Webhook Not Received

- Check IPN URL is correct
- Verify webhook signature validation
- Check server logs for errors
- Use ngrok for local testing

### Payment Not Credited

- Check webhook logs
- Verify payment status in NOWPayments dashboard
- Check database deposit status
- Ensure IPN secret is correct

### Minimum Amount Issues

- Check NOWPayments minimum for BTC
- Add UI validation for minimum amounts
- Display clear error messages
