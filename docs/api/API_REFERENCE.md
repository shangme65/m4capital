# M4Capital API Reference

Complete API documentation for M4Capital trading platform.

---

## 🔐 Authentication

All authenticated endpoints require a valid session cookie from NextAuth.js.

### Login

```http
POST /api/auth/signin
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Signup

```http
POST /api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "SecurePass123!",
  "accountType": "INVESTOR"
}
```

---

## 👤 User Management

### Get Email Preferences

```http
GET /api/user/email-preferences
Authorization: Required (Session)

Response:
{
  "preferences": {
    "marketing": true,
    "trading": true,
    "security": true,
    "deposits": true,
    "kyc": true
  }
}
```

### Update Email Preferences

```http
PUT /api/user/email-preferences
Authorization: Required (Session)
Content-Type: application/json

{
  "marketing": false,
  "trading": true,
  "security": true
}

Response:
{
  "success": true,
  "preferences": { ... }
}
```

---

## 📊 Portfolio

### Get Portfolio

```http
GET /api/portfolio
Authorization: Required (Session)

Response:
{
  "portfolio": {
    "id": "clx...",
    "balance": 10000.50,
    "assets": [
      {
        "symbol": "BTC",
        "amount": 0.5,
        "avgBuyPrice": 50000,
        "currentValue": 25000
      }
    ],
    "totalValue": 35000.50,
    "totalProfitLoss": 5000.25,
    "totalProfitLossPercentage": 16.67
  }
}
```

---

## 💱 Trading

### Record Trade

```http
POST /api/trades/record
Authorization: Required (Session)
Content-Type: application/json

{
  "asset": "BTC",
  "type": "BUY",
  "amount": 0.1,
  "price": 50000,
  "total": 5000,
  "leverage": 1,
  "timestamp": "2025-11-05T10:30:00Z"
}

Response:
{
  "success": true,
  "trade": {
    "id": "trade_id",
    "asset": "BTC",
    "type": "BUY",
    "amount": 0.1,
    "entryPrice": 50000,
    "status": "OPEN"
  },
  "portfolio": { ... }
}
```

---

## 💰 Payments

### Create Bitcoin Payment

```http
POST /api/payment/create-bitcoin
Authorization: Required (Session)
Content-Type: application/json

{
  "amount": 100,
  "currency": "USD"
}

Response:
{
  "success": true,
  "payment": {
    "payment_id": "123456",
    "payment_status": "waiting",
    "pay_address": "bc1q...",
    "pay_amount": 0.00197,
    "pay_currency": "BTC",
    "price_amount": 100,
    "price_currency": "USD"
  },
  "deposit": {
    "id": "deposit_id",
    "amount": 100,
    "status": "PENDING"
  }
}
```

### Check Payment Status

```http
GET /api/payment/status/[depositId]
Authorization: Required (Session)

Response:
{
  "deposit": {
    "id": "deposit_id",
    "amount": 100,
    "status": "COMPLETED",
    "currency": "USD",
    "paymentId": "123456"
  },
  "payment": {
    "payment_status": "finished",
    "actually_paid": 0.00197
  }
}
```

### Payment Webhook (NOWPayments IPN)

```http
POST /api/payment/webhook
Content-Type: application/json
X-IPN-Secret: your-ipn-secret

{
  "payment_id": 123456,
  "payment_status": "finished",
  "pay_amount": 0.00197,
  "actually_paid": 0.00197,
  "price_amount": 100,
  "price_currency": "USD",
  "order_id": "deposit_id"
}
```

---

## 📄 KYC (Know Your Customer)

### Submit KYC

```http
POST /api/kyc/submit
Authorization: Required (Session)
Content-Type: multipart/form-data

FormData:
- fullName: "John Doe"
- dateOfBirth: "1990-01-01"
- nationality: "US"
- address: "123 Main St"
- city: "New York"
- country: "United States"
- postalCode: "10001"
- idType: "PASSPORT"
- idNumber: "P123456"
- idFront: [File]
- idBack: [File]
- selfie: [File]

Response:
{
  "success": true,
  "message": "KYC submitted successfully",
  "kyc": {
    "id": "kyc_id",
    "status": "PENDING",
    "submittedAt": "2025-11-05T10:30:00Z"
  }
}
```

### Get KYC Status

```http
GET /api/kyc/status
Authorization: Required (Session)

Response:
{
  "kyc": {
    "id": "kyc_id",
    "status": "APPROVED",
    "fullName": "John Doe",
    "submittedAt": "2025-11-05T10:30:00Z",
    "reviewedAt": "2025-11-06T14:00:00Z"
  }
}
```

---

## 👨‍💼 Admin Endpoints

### List All Users

```http
GET /api/admin/users/list
Authorization: Required (Admin)

Response:
{
  "users": [
    {
      "id": "user_id",
      "name": "John Doe",
      "email": "user@example.com",
      "role": "USER",
      "accountType": "INVESTOR",
      "isDeleted": false,
      "portfolio": {
        "balance": 10000,
        "totalValue": 15000
      }
    }
  ],
  "total": 150
}
```

### Update User

```http
POST /api/admin/update-user
Authorization: Required (Admin)
Content-Type: application/json

{
  "userId": "user_id",
  "name": "Updated Name",
  "role": "ADMIN",
  "accountType": "INVESTOR"
}

Response:
{
  "success": true,
  "user": { ... }
}
```

### Top Up User Balance

```http
POST /api/admin/top-up
Authorization: Required (Admin)
Content-Type: application/json

{
  "userId": "user_id",
  "amount": 1000,
  "reason": "Promotional bonus"
}

Response:
{
  "success": true,
  "portfolio": {
    "balance": 11000,
    "previousBalance": 10000
  }
}
```

### Delete User (Soft Delete)

```http
DELETE /api/admin/users/delete/[userId]
Authorization: Required (Admin)

Response:
{
  "success": true,
  "message": "User moved to recycle bin"
}
```

### Restore Deleted User

```http
POST /api/admin/users/restore/[userId]
Authorization: Required (Admin)

Response:
{
  "success": true,
  "user": { ... }
}
```

### Permanently Delete User

```http
DELETE /api/admin/users/permanent-delete/[userId]
Authorization: Required (Admin)

Response:
{
  "success": true,
  "message": "User permanently deleted"
}
```

### List Deleted Users (Recycle Bin)

```http
GET /api/admin/users/bin
Authorization: Required (Admin)

Response:
{
  "deletedUsers": [
    {
      "id": "user_id",
      "name": "Deleted User",
      "email": "deleted@example.com",
      "deletedAt": "2025-11-05T10:30:00Z"
    }
  ]
}
```

### Review KYC Submission

```http
POST /api/admin/kyc/review
Authorization: Required (Admin)
Content-Type: application/json

{
  "kycId": "kyc_id",
  "status": "APPROVED",
  "reviewNotes": "All documents verified"
}

Response:
{
  "success": true,
  "kyc": {
    "id": "kyc_id",
    "status": "APPROVED",
    "reviewedAt": "2025-11-06T14:00:00Z"
  }
}
```

### List KYC Submissions

```http
GET /api/admin/kyc/list
Authorization: Required (Admin)

Response:
{
  "submissions": [
    {
      "id": "kyc_id",
      "userId": "user_id",
      "user": {
        "name": "John Doe",
        "email": "user@example.com"
      },
      "status": "PENDING",
      "submittedAt": "2025-11-05T10:30:00Z"
    }
  ]
}
```

### Send Notification

```http
POST /api/admin/send-notification
Authorization: Required (Admin)
Content-Type: application/json

{
  "userId": "user_id",
  "title": "Important Update",
  "message": "Your account has been verified",
  "type": "SUCCESS"
}

Response:
{
  "success": true,
  "notification": { ... }
}
```

### Initialize Admin User

```http
GET /api/init-admin
No Authorization Required (Uses env vars)

Response:
{
  "success": true,
  "message": "Origin admin created/updated",
  "admin": {
    "id": "admin_id",
    "email": "admin@m4capital.com",
    "role": "ADMIN"
  },
  "tempPassword": "..." // Only for this endpoint
}
```

---

## 💱 Crypto Prices

### Get Crypto Prices

```http
GET /api/crypto/prices?symbols=BTC,ETH,ADA
No Authorization Required

Response:
{
  "prices": {
    "BTC": {
      "usd": 101241,
      "usd_24h_change": -5.42,
      "usd_market_cap": 2020337511290,
      "usd_24h_vol": 118232523452
    },
    "ETH": {
      "usd": 3272.56,
      "usd_24h_change": -10.16,
      "usd_market_cap": 395227014283,
      "usd_24h_vol": 75667766917
    }
  },
  "timestamp": "2025-11-05T10:30:00Z",
  "source": "coingecko"
}
```

---

## 🤖 Telegram Bot

### Webhook Endpoint

```http
POST /api/telegram
Content-Type: application/json

{
  "message": {
    "chat": {
      "id": 123456789
    },
    "from": {
      "id": 987654321,
      "first_name": "John",
      "username": "johndoe"
    },
    "text": "/price BTC"
  }
}

Response: 200 OK (Bot responds via Telegram API)
```

### Setup Telegram Bot

```http
POST /api/telegram/setup
Content-Type: application/json

{
  "webhookUrl": "https://yourdomain.com/api/telegram"
}

Response:
{
  "success": true,
  "webhook": {
    "url": "https://yourdomain.com/api/telegram",
    "has_custom_certificate": false,
    "pending_update_count": 0
  }
}
```

---

## 🔄 Deposit Management

### Create Deposit

```http
POST /api/deposit
Authorization: Required (Session)
Content-Type: application/json

{
  "amount": 100,
  "currency": "USD",
  "method": "CRYPTO"
}

Response:
{
  "success": true,
  "deposit": {
    "id": "deposit_id",
    "amount": 100,
    "currency": "USD",
    "status": "PENDING"
  }
}
```

---

## 📝 Response Status Codes

| Code | Meaning                              |
| ---- | ------------------------------------ |
| 200  | Success                              |
| 201  | Created                              |
| 400  | Bad Request (Invalid input)          |
| 401  | Unauthorized (Not logged in)         |
| 403  | Forbidden (Insufficient permissions) |
| 404  | Not Found                            |
| 500  | Internal Server Error                |

---

## 🔒 Security Notes

1. **Session-Based Auth**: All authenticated routes use NextAuth.js sessions
2. **HTTPS Only**: Production endpoints must use HTTPS
3. **Rate Limiting**: Implement rate limiting on public endpoints
4. **CORS**: Configure allowed origins in production
5. **API Keys**: Never expose API keys in client-side code

---

## 🧪 Testing

### Using cURL

```bash
# Login
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Get Portfolio (with session cookie)
curl http://localhost:3000/api/portfolio \
  -H "Cookie: next-auth.session-token=..."

# Get Crypto Prices (no auth)
curl "http://localhost:3000/api/crypto/prices?symbols=BTC,ETH"
```

### Using Postman/Thunder Client

1. Create collection for M4Capital
2. Set base URL variable: `{{baseUrl}}`
3. Add auth token to collection variables
4. Import endpoints from this documentation

---

## 📊 API Analytics

Recommended monitoring:

- Request count per endpoint
- Response times
- Error rates
- Authentication failures
- Rate limit hits

---

## 🔄 Deprecation Policy

When deprecating endpoints:

1. Mark as deprecated in docs
2. Add deprecation header to response
3. Provide migration guide
4. Maintain for 3 months minimum
5. Remove only after usage drops to zero

---

## 📚 Additional Resources

- **NextAuth.js Docs**: https://next-auth.js.org/
- **Prisma Client**: https://www.prisma.io/docs/
- **NOWPayments API**: https://documenter.getpostman.com/view/7907941/S1a32n38
- **CoinGecko API**: https://www.coingecko.com/api/documentation

---

## ❓ Need Help?

- Check error messages in response body
- Review server logs for detailed errors
- Test with simplified requests first
- Verify authentication tokens are valid
- Check database connection status
