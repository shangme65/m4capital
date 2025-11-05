# M4Capital - Complete Setup Guide

This is the comprehensive guide for setting up M4Capital trading platform from scratch.

## 📋 Table of Contents

1. [Initial Setup](#initial-setup)
2. [Email Configuration](#email-configuration)
3. [Telegram Bot Setup](#telegram-bot-setup)
4. [Payment Gateway](#payment-gateway)
5. [OAuth Providers](#oauth-providers)
6. [Database Management](#database-management)

---

## 1. Initial Setup

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database (Neon recommended)
- Git installed

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd m4capital

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
```

### Environment Variables

Edit `.env` and configure:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/database"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# Admin Account
ORIGIN_ADMIN_EMAIL="admin@yourdomain.com"
ORIGIN_ADMIN_PASSWORD="SecurePassword123!"
ORIGIN_ADMIN_NAME="Super Admin"
```

### Database Setup

```bash
# Run migrations
npx prisma migrate dev

# Seed database
npm run seed

# Initialize admin user
curl http://localhost:3000/api/init-admin
```

### Run Development Server

```bash
npm run dev
# Open http://localhost:3000
```

---

## 2. Email Configuration

M4Capital uses Nodemailer for email notifications (KYC, password reset, etc.)

### Gmail Setup (Recommended for Development)

1. **Enable 2-Factor Authentication**:

   - Visit https://myaccount.google.com/security
   - Enable 2-Step Verification

2. **Create App Password**:

   - Visit https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Copy the 16-character password

3. **Configure `.env`**:
   ```env
   EMAIL_FROM="M4Capital <noreply@m4capital.com>"
   EMAIL_HOST="smtp.gmail.com"
   EMAIL_PORT="587"
   EMAIL_SECURE="false"
   EMAIL_USER="your-email@gmail.com"
   EMAIL_PASSWORD="your-16-char-app-password"
   ```

### Production Email (SendGrid/AWS SES)

For production, use a professional email service:

**SendGrid**:

```env
EMAIL_HOST="smtp.sendgrid.net"
EMAIL_PORT="587"
EMAIL_USER="apikey"
EMAIL_PASSWORD="your-sendgrid-api-key"
```

**AWS SES**:

```env
EMAIL_HOST="email-smtp.us-east-1.amazonaws.com"
EMAIL_PORT="587"
EMAIL_USER="your-ses-smtp-username"
EMAIL_PASSWORD="your-ses-smtp-password"
```

### Test Email Setup

```bash
# Send test email
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

---

## 3. Telegram Bot Setup

AI-powered Telegram bot with GPT-4, image generation, and crypto prices.

### Create Bot

1. **Open Telegram** → Search for [@BotFather](https://t.me/botfather)
2. Send `/newbot` command
3. Choose name: `M4Capital Trading Bot`
4. Choose username: `m4capital_bot` (must end with `_bot`)
5. **Copy the bot token**

### Get OpenAI API Key

1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create new API key
3. Copy and save securely

### Configure Environment

```env
TELEGRAM_BOT_TOKEN="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
OPENAI_API_KEY="sk-proj-..."
```

### Set Webhook

```bash
# After deploying to production
bash scripts/set_webhook.sh
```

Or manually:

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://your-domain.com/api/telegram"}'
```

### Features

- **AI Chat**: Natural conversations with GPT-4o-mini
- **Crypto Prices**: Real-time prices from CoinGecko/Binance
- **Image Generation**: DALL-E 3 powered `/imagine` command
- **Group Moderation**: AI-powered spam/scam detection
- **Admin Commands**: `/ban`, `/warn`, `/modstatus`

---

## 4. Payment Gateway (NOWPayments)

Accept crypto payments for deposits.

### Setup NOWPayments

1. **Create Account**: https://nowpayments.io/
2. **Get API Key**:

   - Dashboard → Settings → API Keys
   - Copy API Key and IPN Secret

3. **Configure `.env`**:
   ```env
   NOWPAYMENTS_API_KEY="your-api-key"
   NOWPAYMENTS_IPN_SECRET="your-ipn-secret"
   NOWPAYMENTS_WEBHOOK_URL="https://your-domain.com/api/payment/webhook"
   ```

### Test Payment

```bash
curl -X POST http://localhost:3000/api/payment/test-nowpayments
```

### Webhook Setup

Configure IPN callback URL in NOWPayments dashboard:

```
https://your-domain.com/api/payment/webhook
```

---

## 5. OAuth Providers (Optional)

### Google OAuth

1. **Google Cloud Console**: https://console.cloud.google.com/
2. Create new project or select existing
3. **APIs & Services** → **Credentials** → **Create OAuth 2.0 Client ID**
4. Configure:

   - Application type: Web application
   - Authorized redirect URIs: `https://your-domain.com/api/auth/callback/google`

5. **Add to `.env`**:
   ```env
   GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
   GOOGLE_CLIENT_SECRET="your-client-secret"
   ```

### Facebook OAuth

1. **Facebook Developers**: https://developers.facebook.com/
2. Create new app → Consumer
3. **Add Facebook Login** product
4. Configure:

   - Valid OAuth Redirect URIs: `https://your-domain.com/api/auth/callback/facebook`

5. **Add to `.env`**:
   ```env
   FACEBOOK_CLIENT_ID="your-app-id"
   FACEBOOK_CLIENT_SECRET="your-app-secret"
   ```

---

## 6. Database Management

### Sync Database (Neon)

Use the sync script to backup/restore between environments:

```bash
# Backup production to local
bash scripts/sync-database.sh backup

# Restore backup to local
bash scripts/sync-database.sh restore

# Export data only (no schema)
bash scripts/sync-database.sh export
```

### Manual Database Operations

```bash
# Create migration
npx prisma migrate dev --name your_migration_name

# Apply migrations
npx prisma migrate deploy

# Reset database (DEV ONLY!)
npx prisma migrate reset

# Open Prisma Studio
npx prisma studio
```

### Database Backup

```bash
# Export schema + data
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Import backup
psql $DATABASE_URL < backup_20250105.sql
```

---

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables
vercel env add DATABASE_URL
vercel env add NEXTAUTH_SECRET
# ... add all required env vars
```

### Docker

```bash
# Build image
docker build -t m4capital .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL="..." \
  -e NEXTAUTH_SECRET="..." \
  m4capital
```

---

## 📚 Additional Resources

- **Email Templates**: See `/docs/features/EMAIL_FEATURES.md`
- **Telegram Commands**: See `/docs/features/TELEGRAM_FEATURES.md`
- **API Documentation**: See `/docs/api/API_REFERENCE.md`
- **Database Schema**: See `prisma/schema.prisma`

---

## 🔒 Security Checklist

Before going to production:

- [ ] Change all default passwords
- [ ] Use strong `NEXTAUTH_SECRET` (32+ characters)
- [ ] Enable HTTPS only
- [ ] Set up proper CORS
- [ ] Configure rate limiting
- [ ] Enable database SSL
- [ ] Set up monitoring/logging
- [ ] Configure backup strategy
- [ ] Test email deliverability
- [ ] Test payment webhooks
- [ ] Review admin permissions

---

## 🆘 Troubleshooting

### Email not sending

- Check SMTP credentials
- Verify port and security settings
- Check spam folder
- Test with `curl -X POST /api/test-email`

### Telegram bot not responding

- Verify webhook is set correctly
- Check bot token
- Review logs for errors
- Test with `/start` command

### Database connection issues

- Verify DATABASE_URL format
- Check network connectivity
- Ensure database is accepting connections
- Try running `npx prisma db push`

---

**Need Help?** Check the individual feature documentation in `/docs/features/` or create an issue.
