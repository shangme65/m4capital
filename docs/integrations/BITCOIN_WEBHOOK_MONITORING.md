# Monitoring Bitcoin Payment Webhooks

## Overview
Your Bitcoin payment integration with NowPayments is already working. This guide explains how to monitor webhook logs for Bitcoin payments.

## Webhook Endpoint
- **URL**: `https://yourdomain.com/api/payment/webhook`
- **Method**: POST
- **Purpose**: Receives payment status updates from NowPayments

## Monitoring Methods

### 1. Check Vercel Logs (Recommended)
1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Select your M4Capital project
3. Click on the "Logs" tab
4. Filter by:
   - **Function**: `/api/payment/webhook`
   - **Time Range**: Select your desired range
5. Look for webhook events with statuses like:
   - `waiting` - Payment created, waiting for user to send BTC
   - `confirming` - Transaction detected, waiting for confirmations
   - `confirmed` - Payment confirmed
   - `finished` - Payment completed and credited
   - `failed` - Payment failed

### 2. Check Database Records
View deposits in your database to see payment status:

```sql
SELECT 
  id,
  amount,
  currency,
  status,
  method,
  "paymentId",
  "paymentStatus",
  "cryptoAmount",
  "cryptoCurrency",
  "createdAt",
  "updatedAt"
FROM "Deposit"
WHERE method = 'NOWPAYMENTS_BTC'
ORDER BY "createdAt" DESC;
```

### 3. NowPayments Dashboard
- Login to: https://nowpayments.io/dashboard
- Go to **Payments** section
- View all transactions with real-time status updates
- See detailed information about each payment

## Payment Status Flow

```
1. User initiates deposit via Telegram bot or web dashboard
   ↓
2. System calls NowPayments API to create invoice
   Status: PENDING
   ↓
3. NowPayments creates Bitcoin address and sends webhook
   Status: waiting
   ↓
4. User sends Bitcoin to provided address
   ↓
5. Transaction detected on blockchain
   Webhook received with status: confirming
   ↓
6. Confirmations accumulate (usually 2-6 required)
   Webhook updates with status: confirmed
   ↓
7. Payment fully confirmed
   Webhook received with status: finished
   Database updated: Status -> COMPLETED
   User balance credited
```

## Webhook Payload Example

```json
{
  "payment_id": "12345678",
  "payment_status": "finished",
  "pay_address": "bc1q...",
  "price_amount": 100.00,
  "price_currency": "usd",
  "pay_amount": 0.00245,
  "pay_currency": "btc",
  "order_id": "deposit_1234567890",
  "order_description": "M4Capital Deposit",
  "purchase_id": "dep_abc123",
  "outcome_amount": 0.00245,
  "outcome_currency": "btc"
}
```

## Troubleshooting

### Webhook Not Received
1. **Check Vercel logs** for any errors in `/api/payment/webhook`
2. **Verify NowPayments IPN URL** in their dashboard settings
3. **Check database** to see if deposit record exists but status not updated

### Payment Stuck in "waiting"
- User hasn't sent Bitcoin yet
- Check the payment address provided to user
- Verify the payment hasn't expired (usually 15-30 min timeout)

### Payment Showing "confirming" for Long Time
- Bitcoin network congestion
- Low transaction fee paid by user
- Normally takes 10-60 minutes for 2 confirmations

## Testing Payments

### Test Mode (Sandbox)
1. Get NowPayments sandbox API key
2. Set in environment: `NOWPAYMENTS_API_KEY_SANDBOX`
3. Use sandbox endpoint: `https://api-sandbox.nowpayments.io`

### Production Testing
1. Create small test deposit ($1-5)
2. Send actual Bitcoin to test address
3. Monitor webhooks in Vercel logs
4. Verify balance credited after confirmation

## Environment Variables

Required in Vercel:
```bash
NOWPAYMENTS_API_KEY=your_production_key_here
NEXTAUTH_URL=https://yourdomain.com
DATABASE_URL=postgresql://...
```

## Quick Debug Commands

### View recent deposits:
```bash
# In Vercel CLI or database client
SELECT * FROM "Deposit" 
WHERE "createdAt" > NOW() - INTERVAL '24 hours'
ORDER BY "createdAt" DESC;
```

### Count deposits by status:
```bash
SELECT status, "paymentStatus", COUNT(*) 
FROM "Deposit" 
WHERE method = 'NOWPAYMENTS_BTC'
GROUP BY status, "paymentStatus";
```

## Support

- **NowPayments Support**: https://nowpayments.io/help
- **Documentation**: https://documenter.getpostman.com/view/7907941/S1a32n38
- **Status Page**: https://status.nowpayments.io
