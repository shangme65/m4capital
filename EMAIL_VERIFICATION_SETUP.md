# Email Verification Setup Guide

This guide will help you set up email verification for the m4capital application using NextAuth.js.

## Overview

The application now includes:
- ✅ Email verification flow during user registration
- ✅ Email service integration placeholders
- ✅ Verification token management
- ✅ User-friendly success/error messages
- ✅ Improved UI for authentication pages

## Current Implementation Status

### ✅ Completed Features
1. **Email Verification Infrastructure**
   - Email service abstraction in `src/lib/email.ts`
   - Verification API endpoint at `/api/auth/verify-email`
   - Updated signup flow with email verification
   - Enhanced login page with verification messages

2. **UI Improvements**
   - Modern landing page with multiple sections
   - Enhanced dashboard with better cards and analytics
   - Improved authentication forms with better UX
   - Success/error message handling
   - Responsive design improvements

3. **Authentication Library Identification**
   - ✅ **NextAuth.js v4** with Prisma adapter
   - JWT session strategy
   - Credentials provider for email/password auth
   - User roles (USER, ADMIN) support

## Email Service Setup

### Step 1: Choose an Email Provider

We recommend **Resend** for its simplicity and reliability:

#### Option A: Resend (Recommended)
```bash
npm install resend
```

#### Option B: SendGrid
```bash
npm install @sendgrid/mail
```

### Step 2: Environment Configuration

1. Copy `.env.example` to `.env.local`
2. Configure your chosen email provider:

```env
# For Resend
EMAIL_API_KEY="re_your_api_key_here"
EMAIL_PROVIDER="resend"

# For SendGrid
EMAIL_API_KEY="SG.your_sendgrid_api_key_here"
EMAIL_PROVIDER="sendgrid"

# Common settings
FROM_EMAIL="noreply@yourdomain.com"
FROM_NAME="m4capital"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
```

### Step 3: Enable Email Sending

Uncomment and configure the email sending code in `src/lib/email.ts`:

```typescript
// For Resend
if (emailConfig.provider === 'resend') {
  const { Resend } = require('resend');
  const resend = new Resend(emailConfig.apiKey);
  
  await resend.emails.send({
    from: `${emailConfig.fromName} <${emailConfig.fromEmail}>`,
    to: data.to,
    subject: 'Verify your m4capital account',
    html: getVerificationEmailTemplate(data.userName, data.verificationUrl),
  });
}
```

### Step 4: Database Setup

When Prisma is properly configured, the verification system will use these models:

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime? // This field enables email verification
  // ... other fields
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime
  @@unique([identifier, token])
}
```

### Step 5: Update Authentication Logic

Update `src/lib/auth.ts` to check email verification:

```typescript
async authorize(credentials) {
  // ... existing validation
  
  // Check if email is verified (optional - depends on your requirements)
  if (!user.emailVerified) {
    throw new Error("Please verify your email before logging in");
  }
  
  return user;
}
```

## Testing the Email Verification Flow

### Development Testing

1. **Sign up with a new account**
   - Navigate to `/signup`
   - Fill in the form and submit
   - Check console logs for verification URL

2. **Simulate email verification**
   - Copy the verification URL from console logs
   - Visit the URL in your browser
   - Should redirect to login with success message

3. **Test login flow**
   - Try logging in before verification (should show message)
   - Try logging in after verification (should succeed)

### Production Testing

1. **Set up your email provider**
2. **Configure DNS records** (SPF, DKIM, DMARC)
3. **Test email delivery**
4. **Monitor email deliverability**

## Troubleshooting

### Common Issues

1. **Emails not sending**
   - Check API key configuration
   - Verify FROM_EMAIL domain ownership
   - Check email provider logs

2. **Verification links not working**
   - Ensure NEXTAUTH_URL is correctly set
   - Check token expiration (24 hours default)
   - Verify database connectivity

3. **Database errors**
   - Run `npx prisma generate`
   - Check DATABASE_URL configuration
   - Run database migrations

### Development Mode

Currently, the application runs in development mode with:
- Mock data for dashboard
- Simulated email sending (console logs)
- Disabled authentication guards

To enable full functionality:
1. Set up PostgreSQL database
2. Configure Prisma
3. Run `npx prisma generate`
4. Run `npx prisma db push`

## Security Considerations

1. **Token Security**
   - Verification tokens expire after 24 hours
   - Tokens are single-use only
   - Use cryptographically secure random generation

2. **Email Security**
   - Use proper SPF/DKIM/DMARC records
   - Monitor for email abuse
   - Implement rate limiting for email sending

3. **Database Security**
   - Store only hashed passwords
   - Use parameterized queries
   - Implement proper access controls

## Next Steps

1. **Set up email provider account**
2. **Configure environment variables**
3. **Test email delivery**
4. **Set up monitoring and logging**
5. **Implement rate limiting**
6. **Add email template customization**

## Support

For additional help:
- Check NextAuth.js documentation: https://next-auth.js.org/
- Email provider documentation (Resend, SendGrid)
- Review console logs for detailed error messages