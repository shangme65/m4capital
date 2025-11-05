# Email Verification System

## Overview

The M4 Capital platform now requires all new users to verify their email addresses before accessing the platform. This security feature ensures that users provide valid email addresses and helps prevent spam accounts.

## How It Works

### 1. User Registration Flow

1. User fills out the signup form with their information
2. System creates the account but sets `isEmailVerified` to `false`
3. A 6-digit verification code is generated and saved to the database
4. Verification code is sent to the user's email address
5. User is redirected to the verification page

### 2. Email Verification

- Users receive an email with a 6-digit verification code
- Codes expire after 15 minutes
- Users can request a new code if needed
- Once verified, users can log in normally

### 3. Login Protection

- Users attempting to log in with unverified emails receive a helpful message
- They are automatically redirected to the verification page
- OAuth users (Google, Facebook) are automatically verified

## Database Schema

The `User` model includes three new fields:

```prisma
model User {
  // ... existing fields
  isEmailVerified          Boolean   @default(false)
  emailVerificationCode    String?
  emailVerificationExpires DateTime?
}
```

## API Endpoints

### POST /api/auth/signup

Creates a new user account and sends verification email.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword",
  "accountType": "INVESTOR",
  "country": "United States"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Account created successfully. Please check your email for the verification code.",
  "email": "john@example.com",
  "requiresVerification": true
}
```

### POST /api/auth/verify-email

Verifies a user's email with the provided code.

**Request Body:**
```json
{
  "email": "john@example.com",
  "code": "123456"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Email verified successfully! You can now sign in."
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Invalid verification code"
}
```

### POST /api/auth/resend-verification

Resends a verification code to the user's email.

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Verification code sent successfully. Please check your email."
}
```

## Frontend Components

### Verification Page (`/verify-email`)

A dedicated page where users can:
- Enter their 6-digit verification code
- Resend the code if needed
- See success/error messages
- Return to the login page

Features:
- Responsive design matching M4 Capital branding
- Real-time code validation (must be 6 digits)
- Loading states for all actions
- Auto-redirect to login after successful verification

### Updated Components

**EmailSignupModal:**
- Now redirects to `/verify-email` instead of auto-logging in
- Passes email as URL parameter for convenience

**LoginModal:**
- Detects unverified email attempts
- Shows helpful error message
- Auto-redirects to verification page after 2 seconds

## Email Templates

The verification email includes:
- Professional M4 Capital branding
- Large, easy-to-read 6-digit code
- Expiration notice (15 minutes)
- Security tips
- Responsive design for all devices

## Security Features

1. **Code Expiration:** Verification codes expire after 15 minutes
2. **Format Validation:** Only 6-digit numeric codes are accepted
3. **One-Time Use:** Codes are cleared after successful verification
4. **OAuth Auto-Verification:** Google and Facebook users are automatically verified
5. **Secure Storage:** Codes are stored in the database, not in JWTs or URLs

## Testing

### Manual Testing Steps

1. **Sign Up Flow:**
   - Navigate to signup
   - Fill out registration form
   - Check email for verification code
   - Enter code on verification page
   - Verify successful login

2. **Code Expiration:**
   - Sign up for an account
   - Wait more than 15 minutes
   - Try to verify with the code
   - Should see expiration error

3. **Resend Code:**
   - Sign up for an account
   - Click "Resend Code"
   - Check for new email
   - Verify with new code

4. **Login Protection:**
   - Sign up but don't verify
   - Try to log in
   - Should see verification required message
   - Should be redirected to verification page

## Environment Variables

Make sure these are set in your `.env` file:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM_NAME=M4 Capital
EMAIL_FROM_ADDRESS=noreply@m4capital.com
```

## Migration

The email verification feature requires a database migration:

```bash
npx prisma migrate deploy
```

**Migration:** `20251101065031_add_email_verification_code`

## User Experience

### Success Path
1. User signs up → receives email immediately
2. Enters 6-digit code → verified successfully
3. Redirected to login → can access dashboard

### Common Issues & Solutions

**"I didn't receive the email"**
- Use the "Resend Code" button
- Check spam folder
- Verify email address is correct

**"My code expired"**
- Request a new code using "Resend Code"
- New codes are valid for 15 minutes

**"I already verified but can't log in"**
- Database may not be updated
- Check `isEmailVerified` field in database
- Try signing up again with different email

## Future Enhancements

Potential improvements for the future:

1. **Email Verification Link:** Alternative to codes
2. **SMS Verification:** Two-factor authentication option
3. **Remember Device:** Skip verification on trusted devices
4. **Verification Badges:** Visual indicator on user profiles
5. **Analytics:** Track verification conversion rates
6. **Customizable Templates:** Allow admins to edit email design

## Support

For issues or questions:
- Check the verification page for helpful error messages
- Use the "Resend Code" feature if code doesn't arrive
- Contact support if unable to verify after multiple attempts
