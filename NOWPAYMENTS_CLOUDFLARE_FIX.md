# NOWPayments Setup Guide - Fix Cloudflare Block

## Problem

Your Bitcoin payment is failing with a Cloudflare block: "You are unable to access nowpayments.io"

## Root Causes

1. **Payment Tool Not Created** - NOWPayments requires you to create a payment link/widget in their dashboard first
2. **Domain Not Whitelisted** - Your domain (m4capital.online) may not be whitelisted in NOWPayments
3. **Missing IPN Callback Configuration** - Webhook URL not configured in NOWPayments dashboard

## Solution Steps

### Step 1: Create Payment Tool in NOWPayments Dashboard

1. **Login to NOWPayments**

   - Go to: https://account.nowpayments.io/
   - Login with your credentials (shangme65@gmail.com or your account)

2. **Navigate to Payment Tools**

   - Click on **Payment Solutions** → **Payments** (left sidebar)
   - You should see the screen from your Image 2

3. **Create Payment Link**

   - Click **"Create payment link"** button
   - OR click **"With Widget and Button"** for embedded widget

4. **Configure Payment Settings**

   ```
   Company Name: M4Capital
   Success URL: https://m4capital.online/dashboard
   Cancel URL: https://m4capital.online/finance
   Partially Paid URL: https://m4capital.online/finance?status=partial
   ```

5. **Select Cryptocurrencies**

   - ✅ Bitcoin (BTC)
   - ✅ Ethereum (ETH)
   - ✅ USDT (TRC20)
   - ✅ USDT (ERC20)
   - ✅ Litecoin (LTC)
   - Add any other currencies you want to accept

6. **Configure IPN (Instant Payment Notification)**

   ```
   IPN Callback URL: https://m4capital.online/api/payment/webhook
   ```

7. **Save and Get Payment ID**
   - After creating, you'll receive a **Payment ID** or **Payment Link ID**
   - Copy this ID (you may need it)

### Step 2: Whitelist Your Domain

1. **Go to Settings**

   - In NOWPayments dashboard: **Settings** → **API Settings**

2. **Add Allowed Domains**

   ```
   https://m4capital.online
   http://localhost:3000
   https://m4capital.vercel.app
   ```

3. **Add IPN Callback URL**

   - Confirm your webhook URL is added:

   ```
   https://m4capital.online/api/payment/webhook
   ```

4. **Verify API Key**
   - Make sure your API key matches what's in your `.env`:
   ```
   Q31N32W-1XFMDYM-N1BJBPB-1F7G7WT
   ```

### Step 3: Update Environment Variables (If Needed)

If you get a new API key or IPN secret, update your `.env`:

```env
# NOWPayments API Configuration
NOWPAYMENTS_API_KEY="Q31N32W-1XFMDYM-N1BJBPB-1F7G7WT"
NOWPAYMENTS_IPN_SECRET="wLsFwNdB4ImHMZGbRekRr9WxhCXOln77"
NOWPAYMENTS_SANDBOX=false

# Add callback URL for reference
NEXTAUTH_URL="https://m4capital.online"
```

### Step 4: Test API Connection

After configuring NOWPayments dashboard, test the connection:

1. **Test Endpoint**

   ```bash
   curl -X GET "https://m4capital.online/api/payment/test-nowpayments"
   ```

2. **Expected Response**
   ```json
   {
     "success": true,
     "message": "NOWPayments API is working correctly",
     "config": {
       "sandbox": false,
       "baseUrl": "https://api.nowpayments.io/v1"
     },
     "tests": {
       "status": { "message": "OK" },
       "availableCurrencies": ["btc", "eth", "usdttrc20", ...],
       "totalCurrencies": 252,
       "btcMinAmount": {
         "currency_from": "btc",
         "currency_to": "btc",
         "min_amount": 0.0002
       }
     }
   }
   ```

### Step 5: Verify Webhook Configuration

1. **Check Webhook Endpoint**

   - Your webhook: `https://m4capital.online/api/payment/webhook`
   - Must be accessible publicly (not localhost)

2. **Test Webhook Locally** (For Development)
   - Use ngrok to expose localhost:
   ```bash
   ngrok http 3000
   ```
   - Use ngrok URL in NOWPayments dashboard for testing:
   ```
   https://your-ngrok-url.ngrok.io/api/payment/webhook
   ```

### Step 6: Alternative - Direct Payment API (If Payment Tool Doesn't Work)

If creating a payment tool doesn't resolve the issue, you can use NOWPayments **Invoice API** instead:

1. **Update Create Payment Route**

   - Change from `/payment` endpoint to `/invoice`
   - Invoices work without needing a payment tool setup

2. **Modify API Call**
   ```typescript
   // Instead of createPayment, use createInvoice
   const invoice = await nowPayments.createInvoice({
     price_amount: parseFloat(amount),
     price_currency: currency.toLowerCase(),
     pay_currency: "btc",
     order_id: deposit.id,
     order_description: `Deposit for user ${user.email}`,
     ipn_callback_url: callbackUrl,
     success_url: `${process.env.NEXTAUTH_URL}/dashboard?payment=success`,
     cancel_url: `${process.env.NEXTAUTH_URL}/finance?payment=cancelled`,
   });
   ```

## Troubleshooting

### Issue: Still Getting Cloudflare Block

**Possible Causes:**

1. Your IP is blocked by NOWPayments
2. Too many requests in short time (rate limiting)
3. Missing or incorrect API headers

**Solutions:**

1. **Wait 5-10 minutes** - Cloudflare blocks are temporary
2. **Contact NOWPayments Support**

   - Email: support@nowpayments.io
   - Tell them your domain is being blocked
   - Provide your API key and domain: m4capital.online

3. **Use Different Server**
   - Deploy to Vercel (different IP)
   - Vercel IPs are usually whitelisted

### Issue: "Invalid API Key" Error

**Solutions:**

1. Check API key in NOWPayments dashboard
2. Make sure you're using **production** API key (not sandbox)
3. Verify `.env` file has correct key:
   ```env
   NOWPAYMENTS_API_KEY="Q31N32W-1XFMDYM-N1BJBPB-1F7G7WT"
   ```

### Issue: Payment Created But No Address Returned

**Solutions:**

1. Check NOWPayments dashboard for the payment
2. Verify webhook URL is correct
3. Look for payment in **Payments History** in NOWPayments dashboard

### Issue: Webhook Not Receiving Callbacks

**Solutions:**

1. **For Production:**

   - Make sure `https://m4capital.online/api/payment/webhook` is accessible
   - Check Vercel logs for incoming webhook requests

2. **For Local Development:**
   - Use ngrok: `ngrok http 3000`
   - Update NOWPayments IPN URL to ngrok URL
   - Check ngrok web interface: http://localhost:4040

## Testing Checklist

After completing setup:

- [ ] Payment tool created in NOWPayments dashboard
- [ ] Domain whitelisted (m4capital.online)
- [ ] IPN callback URL configured
- [ ] API key verified in `.env`
- [ ] Test endpoint returns success
- [ ] Can create test payment
- [ ] Webhook receives payment updates
- [ ] Payment address displayed to user
- [ ] Payment completes successfully

## Expected Flow (After Setup)

1. User clicks "Deposit" → Selects "Cryptocurrency" → Chooses Bitcoin
2. Your backend calls NOWPayments API to create payment
3. NOWPayments returns Bitcoin address and amount
4. User sends Bitcoin to the address
5. NOWPayments detects payment and sends webhook to your server
6. Your server updates deposit status and credits user balance
7. User sees confirmation

## Quick Fix for Immediate Testing

If you need to test immediately without waiting for NOWPayments setup:

1. **Use Invoice API** (doesn't require payment tool setup)
2. **Use Test Credentials** (create a new test account on NOWPayments)
3. **Mock the Payment** (temporary - for UI testing only):

```typescript
// Temporary mock for testing UI only
const mockPayment = {
  payment_id: `mock_${Date.now()}`,
  pay_address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
  pay_amount: 0.00096,
  payment_status: "waiting",
  expiration_estimate_date: new Date(Date.now() + 30 * 60000).toISOString(),
};
```

## Contact NOWPayments Support

If issues persist:

**Email:** support@nowpayments.io
**Subject:** "Cloudflare Block on API Requests - m4capital.online"
**Message Template:**

```
Hello,

I'm experiencing Cloudflare blocking when trying to access the NOWPayments API
from my domain m4capital.online.

Account Email: shangme65@gmail.com
API Key: Q31N32W-1XFMDYM-N1BJBPB-1F7G7WT
Domain: m4capital.online
Issue: Getting Cloudflare block when making API requests

Error: "You are unable to access nowpayments.io"

Could you please whitelist my domain and help resolve this issue?

Thank you!
```

## Additional Resources

- NOWPayments API Docs: https://documenter.getpostman.com/view/7907941/S1a32n38
- NOWPayments Dashboard: https://account.nowpayments.io/
- NOWPayments Status: https://status.nowpayments.io/
- Support Email: support@nowpayments.io
- Integration Guide: https://nowpayments.io/blog/accept-crypto-payments-on-website
