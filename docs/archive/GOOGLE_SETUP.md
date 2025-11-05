# Google OAuth Setup Guide for M4Capital

This guide will help you set up Google OAuth authentication for the M4Capital application.

## Prerequisites

- A Google account
- Access to Google Cloud Console
- M4Capital application running locally or deployed

## Step 1: Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top of the page
3. Click "New Project"
4. Enter your project name (e.g., "M4Capital Auth")
5. Click "Create"

## Step 2: Enable Google+ API

1. In your Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Google+ API"
3. Click on it and then click "Enable"
4. Alternatively, search for "Google Identity" and enable relevant identity services

## Step 3: Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type (unless you have Google Workspace)
3. Click "Create"
4. Fill in the required information:
   - **App name**: M4Capital
   - **User support email**: Your email
   - **Developer contact information**: Your email
5. Add your app domain if deployed (e.g., `https://yourdomain.com`)
6. Click "Save and Continue"
7. On the "Scopes" page, you can skip adding scopes for now
8. On the "Test users" page, add your email for testing
9. Click "Save and Continue"

## Step 4: Create OAuth Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "+ Create Credentials" > "OAuth client ID"
3. Choose "Web application" as the application type
4. Name your OAuth client (e.g., "M4Capital Web Client")
5. Add authorized JavaScript origins:
   - For local development: `http://localhost:3000`
   - For production: `https://yourdomain.com`
6. Add authorized redirect URIs:
   - For local development: `http://localhost:3000/api/auth/callback/google`
   - For production: `https://yourdomain.com/api/auth/callback/google`
7. Click "Create"

## Step 5: Configure Environment Variables

1. Copy the Client ID and Client Secret from the credentials you just created
2. Add them to your `.env.local` file (create if it doesn't exist):

```bash
# Google OAuth
GOOGLE_CLIENT_ID="your-google-oauth-client-id-here"
GOOGLE_CLIENT_SECRET="your-google-oauth-client-secret-here"
```

3. Make sure your `.env.local` file also has:

```bash
# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"  # or your production URL

# Database
DATABASE_URL="your-database-url-here"
```

## Step 6: Test the Integration

1. Restart your Next.js application:

   ```bash
   npm run dev
   ```

2. Go to your login page
3. Click the "Continue with Google" button
4. You should be redirected to Google's OAuth flow
5. After authorizing, you should be redirected back to your application

## Production Deployment Notes

### For Vercel:

1. In your Vercel dashboard, go to your project settings
2. Add the environment variables:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `NEXTAUTH_URL` (your production URL)
   - `NEXTAUTH_SECRET`

### For other platforms:

- Set the same environment variables in your hosting platform's configuration
- Update the authorized redirect URIs in Google Cloud Console to match your production domain

## Troubleshooting

### Common Issues:

1. **"redirect_uri_mismatch" error**:

   - Check that your redirect URI in Google Cloud Console exactly matches what NextAuth expects
   - The redirect URI should be: `https://yourdomain.com/api/auth/callback/google`

2. **"access_denied" error**:

   - Make sure you've added your email as a test user if the app is still in testing mode
   - Check that the OAuth consent screen is properly configured

3. **User creation issues**:

   - Ensure your database is running and the `DATABASE_URL` is correct
   - Check that the user table schema includes all required fields

4. **Environment variable issues**:
   - Verify that all required environment variables are set
   - Restart your application after adding new environment variables

## Security Best Practices

1. **Keep credentials secure**: Never commit your `.env.local` file to version control
2. **Use HTTPS in production**: Google OAuth requires HTTPS for production applications
3. **Regularly rotate secrets**: Update your client secret periodically
4. **Limit redirect URIs**: Only add the redirect URIs you actually need

## Testing Checklist

- [ ] Google OAuth button appears on login page
- [ ] Clicking the button redirects to Google
- [ ] Google login flow completes successfully
- [ ] User is redirected back to the application
- [ ] User account is created in the database
- [ ] User can access protected routes after login
- [ ] User profile information is correctly populated

## Next Steps

After setting up Google OAuth:

1. Consider adding more OAuth providers (GitHub, Microsoft, etc.)
2. Implement user profile management
3. Add role-based access controls
4. Set up email verification for manual signups
5. Implement account linking for users with multiple login methods

## Support

If you encounter issues:

1. Check the browser console for error messages
2. Review the Next.js application logs
3. Verify Google Cloud Console configuration
4. Ensure all environment variables are correctly set

For more information, refer to:

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
