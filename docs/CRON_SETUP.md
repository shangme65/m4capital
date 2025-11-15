# External Cron Setup for Bitcoin Confirmations

Since Vercel Hobby plan only allows daily cron jobs, we use external free cron services to trigger the confirmation processing endpoint every 3 minutes.

## Setup Options

### Option 1: cron-job.org (Recommended)

**Free Features:**
- Up to 3 cron jobs
- Minimum interval: 1 minute
- Email notifications on failures
- Execution history

**Setup Steps:**

1. Go to https://cron-job.org/en/
2. Sign up for a free account
3. Create New Cron Job:
   - **Title:** M4Capital - Process Bitcoin Confirmations
   - **URL:** `https://your-domain.vercel.app/api/cron/process-confirmations`
   - **Schedule:** Every 3 minutes (`*/3 * * * *`)
   - **Request Method:** GET
   - **Request Headers:** Add custom header:
     ```
     Authorization: Bearer YOUR_CRON_SECRET
     ```
     (Use the CRON_SECRET from your .env file)
   
4. Save and enable the job

### Option 2: EasyCron

**Free Features:**
- Up to 10 cron jobs
- Minimum interval: Every hour (free tier)
- For every 3 minutes, requires paid plan ($3.99/month)

**Setup:**
1. Go to https://www.easycron.com/
2. Sign up and create a cron job with your API endpoint

### Option 3: GitHub Actions (Free, Unlimited)

Create `.github/workflows/cron-confirmations.yml`:

```yaml
name: Process Bitcoin Confirmations

on:
  schedule:
    # Runs every 3 minutes
    - cron: '*/3 * * * *'
  workflow_dispatch: # Allows manual trigger

jobs:
  trigger-cron:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Confirmation Processing
        run: |
          curl -X GET \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            https://your-domain.vercel.app/api/cron/process-confirmations
```

**Setup:**
1. Add the above file to your repository
2. Go to GitHub repository Settings > Secrets and variables > Actions
3. Add secret: `CRON_SECRET` with value from your .env
4. Replace `your-domain.vercel.app` with your actual Vercel domain
5. Commit and push - workflow will run automatically

### Option 4: UptimeRobot (Monitoring + Cron)

**Free Features:**
- 50 monitors
- Check interval: Every 5 minutes minimum
- Email alerts

**Setup:**
1. Go to https://uptimerobot.com/
2. Sign up and create HTTP(s) monitor
3. Set interval to 5 minutes
4. Add custom HTTP header for authentication

## Security Considerations

**IMPORTANT:** Your `/api/cron/process-confirmations` endpoint MUST verify the `CRON_SECRET`:

```typescript
// In your API route
const authHeader = request.headers.get('authorization');
const token = authHeader?.replace('Bearer ', '');

if (token !== process.env.CRON_SECRET) {
  return new Response('Unauthorized', { status: 401 });
}
```

This is already implemented in your cron route.

## Recommended Solution

For every 3 minutes processing:
1. **Best for free:** GitHub Actions (unlimited, reliable)
2. **Best for simplicity:** cron-job.org (easy setup, 3 jobs free)
3. **Best for monitoring:** UptimeRobot (5min minimum, includes uptime monitoring)

## Current Configuration

- **Endpoint:** `/api/cron/process-confirmations`
- **Required Frequency:** Every 3 minutes (for Bitcoin confirmations)
- **Authentication:** Bearer token using `CRON_SECRET` environment variable
- **Method:** GET request

## Testing

Test your cron endpoint manually:

```bash
curl -X GET \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://your-domain.vercel.app/api/cron/process-confirmations
```

Expected response: `{ "message": "Processing completed", "processed": X }`
