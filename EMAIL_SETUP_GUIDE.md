# Quick Setup Guide - Email Notifications

## Step 1: Install Dependencies (Already Done ✅)

```bash
npm install nodemailer @types/nodemailer
```

## Step 2: Apply Database Migration (Already Done ✅)

```bash
npx prisma migrate dev --name add_email_notification_preferences
npx prisma generate
```

## Step 3: Configure SMTP Settings

### Option A: Gmail (Recommended for Testing)

1. **Enable 2-Factor Authentication**:

   - Go to https://myaccount.google.com/security
   - Enable 2-Step Verification

2. **Create App Password**:

   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Copy the generated password

3. **Update .env file**:
   ```bash
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT="587"
   SMTP_SECURE="false"
   SMTP_USER="your-email@gmail.com"
   SMTP_PASSWORD="paste-app-password-here"
   EMAIL_FROM_NAME="M4 Capital"
   EMAIL_FROM_ADDRESS="your-email@gmail.com"
   ```

### Option B: SendGrid (Recommended for Production)

1. Sign up at https://sendgrid.com
2. Create an API key
3. Update .env:
   ```bash
   SMTP_HOST="smtp.sendgrid.net"
   SMTP_PORT="587"
   SMTP_USER="apikey"
   SMTP_PASSWORD="your-sendgrid-api-key"
   EMAIL_FROM_NAME="M4 Capital"
   EMAIL_FROM_ADDRESS="noreply@m4capital.com"
   ```

### Option C: AWS SES (For High Volume)

1. Set up AWS SES account
2. Verify your domain
3. Get SMTP credentials
4. Update .env:
   ```bash
   SMTP_HOST="email-smtp.us-east-1.amazonaws.com"
   SMTP_PORT="587"
   SMTP_USER="your-ses-smtp-username"
   SMTP_PASSWORD="your-ses-smtp-password"
   EMAIL_FROM_NAME="M4 Capital"
   EMAIL_FROM_ADDRESS="noreply@m4capital.com"
   ```

## Step 4: Test the System

### 1. Start Development Server

```bash
npm run dev
```

### 2. Test Email Preferences UI

- Navigate to Settings → Email Notifications
- Toggle switches should save preferences immediately
- Verify UI shows loading state during save

### 3. Test KYC Submission Email

- As a regular user, submit a KYC application
- You should receive a confirmation email
- All admin users should receive a notification

### 4. Test KYC Review Emails

- As an admin, approve or reject a KYC submission
- The user should receive an approval or rejection email

### 5. Test Preference Enforcement

- Turn off "KYC Notifications" in Settings
- Submit a new KYC application
- Verify NO email is sent to you
- Admin notification should still work

## Troubleshooting

### Gmail: "Less secure app access"

- **Solution**: Use App Password instead of account password
- Do NOT enable "Less secure app access" (deprecated)

### Emails not sending

1. Check console logs for error messages
2. Verify SMTP credentials in .env
3. Test connection:
   ```bash
   node -e "require('./src/lib/email').verifyEmailConnection()"
   ```

### Emails going to spam

- Use a verified email service (SendGrid, AWS SES)
- Set up SPF and DKIM records for your domain
- Avoid spam trigger words

### TypeScript errors

```bash
npx prisma generate
# Restart VS Code TypeScript server: Ctrl+Shift+P → "TypeScript: Restart TS Server"
```

## Verification Checklist

- [ ] Environment variables configured in `.env`
- [ ] SMTP credentials tested and working
- [ ] Email preferences UI loads without errors
- [ ] Can toggle email preferences and save successfully
- [ ] KYC submission sends emails to user and admins
- [ ] KYC approval sends email to user
- [ ] KYC rejection sends email with reason
- [ ] Turning off email preferences prevents emails
- [ ] No TypeScript errors in email-related files

## Common Issues & Solutions

| Issue                                       | Solution                                |
| ------------------------------------------- | --------------------------------------- |
| "Module not found: nodemailer"              | Run `npm install`                       |
| "Property 'kycVerification' does not exist" | Run `npx prisma generate`               |
| "SMTP connection failed"                    | Check SMTP credentials and firewall     |
| "Emails not received"                       | Check spam folder, verify SMTP settings |
| "TypeScript errors"                         | Restart TypeScript server in VS Code    |

## Production Deployment

Before deploying to production:

1. **Use a dedicated email service** (SendGrid, AWS SES)
2. **Set up email queue** (optional but recommended)
3. **Configure SPF/DKIM records** for your domain
4. **Test with real email addresses**
5. **Monitor email delivery rates**
6. **Set up error alerting** for failed emails

## Support

For detailed documentation, see:

- `EMAIL_NOTIFICATIONS.md` - Complete email system documentation
- `EMAIL_IMPLEMENTATION_SUMMARY.md` - Implementation details

## Next Feature to Implement

Once email notifications are working, you can proceed to:

1. KYC-Gated Features (restrict features based on verification)
2. Trading System Integration
3. Security Enhancements (rate limiting, audit logs)
4. User Dashboard Improvements
5. Telegram Bot Integration
