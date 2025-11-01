# Email Notification System

This document describes the email notification system implemented for M4 Capital's KYC verification process.

## Overview

The email notification system sends automated emails to users and admins at key points in the KYC verification workflow. Users receive updates about their submission status, while admins are notified of new submissions requiring review.

## Features

### 1. User Notifications

- **Submission Confirmation**: Sent when a user submits KYC documents
- **Approval Notification**: Sent when KYC is approved by an admin
- **Rejection Notification**: Sent when KYC is rejected with reason

### 2. Admin Notifications

- **New Submission Alert**: Sent to all admins when a new KYC is submitted

### 3. Email Preferences

Users can control their email notifications through Settings:

- Master toggle for all email notifications
- KYC-specific notifications toggle
- Trading & transactions notifications toggle
- Security alerts toggle

## Setup

### 1. Environment Variables

Add the following to your `.env` file:

```bash
# Email Configuration (SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"  # true for port 465, false for other ports
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-specific-password"
EMAIL_FROM_NAME="M4 Capital"
EMAIL_FROM_ADDRESS="noreply@m4capital.com"
```

### 2. Gmail Setup (Recommended)

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable 2-Factor Authentication
3. Go to [App Passwords](https://myaccount.google.com/apppasswords)
4. Create a new app password for "Mail"
5. Use this password in `SMTP_PASSWORD`

### 3. Other Email Providers

#### Outlook/Office 365

```bash
SMTP_HOST="smtp.office365.com"
SMTP_PORT="587"
SMTP_SECURE="false"
```

#### SendGrid

```bash
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_USER="apikey"
SMTP_PASSWORD="your-sendgrid-api-key"
```

#### AWS SES

```bash
SMTP_HOST="email-smtp.us-east-1.amazonaws.com"
SMTP_PORT="587"
SMTP_USER="your-ses-smtp-username"
SMTP_PASSWORD="your-ses-smtp-password"
```

## Architecture

### Email Service (`src/lib/email.ts`)

Core email sending functionality using Nodemailer:

- `transporter`: Configured SMTP transporter
- `verifyEmailConnection()`: Test SMTP connection
- `sendEmail()`: Send email with HTML and text versions

### Email Templates (`src/lib/email-templates.ts`)

Reusable HTML email templates:

- `kycSubmissionTemplate()`: User submission confirmation
- `kycApprovedTemplate()`: Approval notification
- `kycRejectedTemplate()`: Rejection notification with reason
- `kycAdminNotificationTemplate()`: Admin alert for new submission

All templates include:

- Responsive design
- Text fallback for email clients without HTML support
- M4 Capital branding
- Clear call-to-action buttons

### KYC Email Functions (`src/lib/kyc-emails.ts`)

High-level functions that respect user preferences:

- `sendKycSubmissionEmail()`: Checks preferences before sending
- `sendKycApprovedEmail()`: Checks preferences before sending
- `sendKycRejectedEmail()`: Checks preferences before sending
- `sendKycAdminNotification()`: Sends to all admin users
- `sendKycStatusUpdateEmail()`: Wrapper for approval/rejection

### API Integration

#### KYC Submission (`src/app/api/kyc/submit/route.ts`)

Sends emails asynchronously after successful submission:

```typescript
Promise.all([
  sendKycSubmissionEmail(user.email, user.name),
  sendKycAdminNotification(user.name, user.email, user.id, kycId),
]).catch(console.error);
```

#### KYC Review (`src/app/api/admin/kyc/review/route.ts`)

Sends status update email after admin review:

```typescript
if (status === "APPROVED" || status === "REJECTED") {
  sendKycStatusUpdateEmail(
    user.email,
    user.name,
    status,
    rejectionReason
  ).catch(console.error);
}
```

#### Email Preferences (`src/app/api/user/email-preferences/route.ts`)

- GET: Fetch user's email notification preferences
- PUT: Update email notification preferences

## Database Schema

### User Model Additions

```prisma
model User {
  // ... existing fields

  // Email notification preferences
  emailNotifications      Boolean @default(true)
  kycNotifications        Boolean @default(true)
  tradingNotifications    Boolean @default(true)
  securityNotifications   Boolean @default(true)
}
```

## User Interface

### Settings Page (`src/app/(dashboard)/settings/page.tsx`)

Email Notifications section includes:

- Master toggle for all emails
- Individual toggles for:
  - KYC Verification updates
  - Trading & Transaction alerts
  - Security notifications
- Real-time saving with optimistic UI updates
- Disabled state for sub-toggles when master is off

## Testing

### 1. Test SMTP Connection

```bash
node -e "require('./src/lib/email').verifyEmailConnection()"
```

### 2. Test KYC Submission Email

1. Submit a KYC application as a user
2. Check your email for submission confirmation
3. Check admin emails for new submission alert

### 3. Test Approval/Rejection

1. As admin, approve or reject a KYC submission
2. Check user email for status update

### 4. Test Email Preferences

1. Go to Settings → Email Notifications
2. Toggle preferences on/off
3. Submit a KYC to verify preferences are respected

## Best Practices

### 1. Asynchronous Sending

Emails are sent asynchronously to avoid blocking API responses:

```typescript
sendEmail(...).catch(console.error); // Don't await
```

### 2. Error Handling

Email failures don't fail the request:

```typescript
Promise.all([...emails]).catch((error) => {
  console.error("Email error:", error);
  // Don't fail the request
});
```

### 3. User Preferences

Always check user preferences before sending:

```typescript
const user = await prisma.user.findUnique({
  select: { emailNotifications: true, kycNotifications: true },
});

if (!user?.emailNotifications || !user?.kycNotifications) {
  return; // Skip sending
}
```

### 4. Rate Limiting

For production, consider:

- Using a queue system (Bull, BullMQ)
- Rate limiting SMTP requests
- Using a dedicated email service (SendGrid, AWS SES)

## Security Considerations

1. **Environment Variables**: Never commit SMTP credentials
2. **App Passwords**: Use app-specific passwords, not account passwords
3. **TLS/SSL**: Always use secure connections (STARTTLS or SSL)
4. **Content Sanitization**: Email templates use template literals, be careful with user input
5. **Admin Emails**: Only send to verified admin users

## Troubleshooting

### Emails Not Sending

1. Check environment variables are set correctly
2. Verify SMTP credentials
3. Check firewall/network settings
4. Review console logs for error messages
5. Test SMTP connection with verification function

### Gmail "Less Secure Apps" Error

Use App Passwords instead:

1. Enable 2FA on your Google account
2. Generate an App Password
3. Use the app password in `SMTP_PASSWORD`

### Emails Going to Spam

1. Set up SPF records for your domain
2. Configure DKIM signing
3. Use a verified email service provider
4. Avoid spam trigger words in templates

## Future Enhancements

1. **Email Queue**: Implement Bull/BullMQ for reliable delivery
2. **Email Templates**: Add more event types (deposits, withdrawals, etc.)
3. **Email Analytics**: Track open rates and click-through rates
4. **Digest Emails**: Daily/weekly summary emails
5. **Multi-language Support**: Localized email templates
6. **Email Verification**: Verify email addresses before sending

## API Endpoints

### GET /api/user/email-preferences

Fetch user's email notification preferences.

**Response:**

```json
{
  "emailNotifications": true,
  "kycNotifications": true,
  "tradingNotifications": true,
  "securityNotifications": true
}
```

### PUT /api/user/email-preferences

Update email notification preferences.

**Request:**

```json
{
  "emailNotifications": false,
  "kycNotifications": false
}
```

**Response:**

```json
{
  "success": true,
  "message": "Email preferences updated successfully",
  "preferences": {
    "emailNotifications": false,
    "kycNotifications": false,
    "tradingNotifications": false,
    "securityNotifications": false
  }
}
```

## Related Files

- `src/lib/email.ts`: Core email service
- `src/lib/email-templates.ts`: HTML email templates
- `src/lib/kyc-emails.ts`: KYC-specific email functions
- `src/app/api/kyc/submit/route.ts`: KYC submission with emails
- `src/app/api/admin/kyc/review/route.ts`: Admin review with emails
- `src/app/api/user/email-preferences/route.ts`: Email preferences API
- `src/app/(dashboard)/settings/page.tsx`: Settings UI
- `prisma/schema.prisma`: Database schema
