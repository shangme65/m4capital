# Facebook OAuth Setup Guide

This guide will help you set up Facebook OAuth authentication for the M4Capital application.

## 1. Create a Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click on "My Apps" in the top menu
3. Click "Create App"
4. Select "Consumer" as the app type
5. Fill in the app details:
   - **App Name**: M4Capital
   - **App Contact Email**: Your email
   - **App Purpose**: Choose appropriate purpose

## 2. Configure Facebook Login

1. In your app dashboard, find "Facebook Login" in the left sidebar
2. Click "Set up" under Facebook Login
3. Choose "Web" as the platform
4. Enter your Site URL:
   - **Development**: `http://localhost:3000`
   - **Production**: `https://your-domain.com`

## 3. Configure OAuth Settings

1. Go to "Facebook Login" > "Settings" in the left sidebar
2. Configure the following:
   - **Valid OAuth Redirect URIs**:
     - Development: `http://localhost:3000/api/auth/callback/facebook`
     - Production: `https://your-domain.com/api/auth/callback/facebook`
   - **Deauthorize Callback URL**: `https://your-domain.com/api/auth/callback/facebook`
   - **Data Deletion Request URL**: `https://your-domain.com/api/auth/callback/facebook`

## 4. Get App Credentials

1. Go to "Settings" > "Basic" in the left sidebar
2. Copy the **App ID** and **App Secret**
3. Add these to your `.env` file:

```bash
FACEBOOK_CLIENT_ID="your-app-id-here"
FACEBOOK_CLIENT_SECRET="your-app-secret-here"
```

## 5. App Review and Permissions

### Development Mode

- Your app starts in Development mode
- Only you and other app developers can log in
- No review required for basic login

### Production Mode

1. Go to "App Review" > "Permissions and Features"
2. Request permission for:
   - `email` (usually approved automatically)
   - `public_profile` (usually approved automatically)
3. Complete the App Review process if needed

## 6. Domain Verification (Production)

1. Go to "Settings" > "Basic"
2. Add your production domain to "App Domains"
3. Verify domain ownership if required

## 7. Environment Variables

Add these to your `.env` file:

```bash
# Facebook OAuth
FACEBOOK_CLIENT_ID="your-facebook-app-id"
FACEBOOK_CLIENT_SECRET="your-facebook-app-secret"

# Make sure these are also set
NEXTAUTH_URL="http://localhost:3000"  # or your production URL
NEXTAUTH_SECRET="your-nextauth-secret"
```

## 8. Testing

1. Start your development server: `npm run dev`
2. Go to the login modal
3. Click the Facebook button
4. You should be redirected to Facebook for authentication
5. After approval, you'll be redirected back to your app

## Troubleshooting

### Common Issues:

1. **"App Not Available"**: Make sure your app is in Development mode and you're logged in as a developer
2. **Invalid Redirect URI**: Check that your OAuth redirect URI matches exactly
3. **App Secret Reset**: If you reset your app secret, update your `.env` file
4. **Email Permission**: Make sure your app requests email permission

### Development vs Production:

- **Development**: Only app developers can log in
- **Production**: All users can log in after app review approval

## Security Best Practices

1. Never commit your `.env` file to version control
2. Use different Facebook apps for development and production
3. Regularly rotate your app secret
4. Monitor your app's usage in Facebook Analytics
5. Keep your app's permissions minimal (only request what you need)

## Next Steps

After setting up Facebook OAuth:

1. Test the login flow thoroughly
2. Handle edge cases (user denies permission, etc.)
3. Add Google OAuth if desired
4. Implement proper error handling
5. Add user profile management features
