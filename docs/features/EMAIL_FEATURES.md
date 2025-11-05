# M4Capital - Email Features Documentation

## Overview

M4Capital includes a comprehensive email notification system built with Nodemailer for professional email communications.

---

## 📧 Email Features

### 1. KYC Notifications

**Submission Confirmation**

- Sent immediately after user submits KYC documents
- Confirms receipt and provides timeline
- Includes submission reference number

**Approval Notification**

- Celebrates successful KYC approval
- Lists unlocked benefits and features
- Encourages user engagement

**Rejection Notification**

- Provides specific rejection reasons
- Offers guidance for resubmission
- Maintains professional tone

**Admin Alerts**

- Notifies admins of new KYC submissions
- Includes direct review links
- Summary of submitted information

### 2. Authentication Emails

**Email Verification**

- 6-digit verification code
- 15-minute expiration
- Professional branded template

**Password Reset**

- Secure reset link with token
- 1-hour expiration
- Clear instructions

**Account Security**

- Suspicious login alerts
- Password change confirmations
- Two-factor authentication codes

### 3. Transaction Notifications

**Deposit Confirmations**

- Payment received
- Amount and currency
- Transaction ID

**Withdrawal Alerts**

- Withdrawal request confirmation
- Processing status updates
- Completion notifications

**Trade Confirmations**

- Trade execution details
- Profit/Loss summary
- Portfolio impact

---

## 🎨 Email Templates

All emails use professional HTML templates with:

- **M4 Capital Branding**: Gradient headers, logo placement
- **Responsive Design**: Mobile-friendly layouts
- **Clear CTAs**: Prominent action buttons
- **Text Fallbacks**: Plain text versions for all emails
- **Security Headers**: SPF, DKIM support

### Template Structure

```typescript
{
  subject: "Email Subject",
  html: `<styled HTML content>`,
  text: `Plain text fallback`
}
```

---

## ⚙️ Configuration

### Environment Variables

```env
# Email Service
EMAIL_FROM="M4Capital <noreply@m4capital.com>"
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_SECURE="false"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASSWORD="your-app-password"
```

### Supported Providers

| Provider    | Setup Guide                      |
| ----------- | -------------------------------- |
| Gmail       | Use App Passwords (2FA required) |
| SendGrid    | SMTP relay with API key          |
| AWS SES     | Verified domain required         |
| Mailgun     | API or SMTP                      |
| Custom SMTP | Any SMTP server                  |

---

## 🔧 Implementation Details

### Email Service (`src/lib/email.ts`)

```typescript
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function sendEmail({ to, subject, html, text }: EmailOptions) {
  // Implementation
}
```

### Template Library (`src/lib/email-templates.ts`)

Centralized template functions:

- `kycSubmissionTemplate()`
- `kycApprovedTemplate()`
- `kycRejectedTemplate()`
- `emailVerificationTemplate()`
- `passwordResetTemplate()`

### KYC Email Functions (`src/lib/kyc-emails.ts`)

High-level functions:

- `sendKycSubmissionEmail(user, kycData)`
- `sendKycApprovedEmail(user)`
- `sendKycRejectedEmail(user, reason)`
- `sendAdminKycNotification(user, kycData)`

---

## 📊 User Preferences

Users can control email notifications via `/settings/notifications`:

```typescript
interface EmailPreferences {
  marketing: boolean; // Promotional emails
  trading: boolean; // Trade confirmations
  security: boolean; // Security alerts (always true)
  deposits: boolean; // Deposit notifications
  kyc: boolean; // KYC status updates
}
```

**API Endpoint**: `PUT /api/user/email-preferences`

---

## 🧪 Testing

### Test Email Functionality

```bash
# Test SMTP connection
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

### Development Tips

1. **Use Mailtrap**: Catch all emails in development

   ```env
   EMAIL_HOST="smtp.mailtrap.io"
   EMAIL_PORT="2525"
   EMAIL_USER="your-mailtrap-username"
   EMAIL_PASSWORD="your-mailtrap-password"
   ```

2. **Gmail Testing**: Create dedicated test account with App Password

3. **Preview Templates**: Use browser to view HTML templates before sending

---

## 🔒 Security Best Practices

1. **Never Expose Credentials**: Use environment variables
2. **App Passwords**: Use app-specific passwords, not account passwords
3. **TLS/SSL**: Always use encrypted connections
4. **Rate Limiting**: Implement email rate limits to prevent abuse
5. **Verified Senders**: Use verified domain for production
6. **Unsubscribe Links**: Include in marketing emails (legal requirement)

---

## 📈 Email Analytics

Track email performance:

- Delivery rates
- Open rates (if using email service with tracking)
- Click-through rates
- Bounce rates
- User preferences trends

---

## 🚨 Troubleshooting

### Common Issues

**Emails not sending**

- ✅ Check SMTP credentials
- ✅ Verify network/firewall settings
- ✅ Test with simple email client
- ✅ Check spam folder

**Gmail "Less secure app" error**

- ✅ Use App Password, not account password
- ✅ Enable 2FA first
- ✅ Generate app-specific password

**Emails marked as spam**

- ✅ Set up SPF records
- ✅ Configure DKIM signing
- ✅ Use verified sender domain
- ✅ Avoid spam trigger words

**Template rendering issues**

- ✅ Test HTML in multiple email clients
- ✅ Use inline CSS (many clients strip `<style>`)
- ✅ Always provide text fallback
- ✅ Test on mobile devices

---

## 📚 Additional Resources

- **Nodemailer Docs**: https://nodemailer.com/
- **Email Templates**: Browse `src/lib/email-templates.ts`
- **Email Testing Tools**: Mailtrap, Litmus, Email on Acid
- **Deliverability**: https://www.mail-tester.com/

---

## 🔄 Future Enhancements

Planned features:

- [ ] Email templates editor in admin panel
- [ ] A/B testing for email campaigns
- [ ] Advanced analytics dashboard
- [ ] Scheduled email campaigns
- [ ] Multi-language email support
- [ ] SMS notifications integration
- [ ] Push notification system
