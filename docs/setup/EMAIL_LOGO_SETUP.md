# Email Logo Setup Guide - M4 Capital

## How to Display Your Logo Instead of "M" in Gmail

The "M" avatar that appears in Gmail is automatically generated based on your sender name "M4 Capital". To replace it with your actual logo, you can use **SendGrid's Sender Identity** feature or set up **Google Workspace**.

---

## Option 1: SendGrid Sender Identity (Easiest - You're Already Using It!)

### What You Need:

- SendGrid account (you already have this)
- Verified domain
- Your logo file (m4capitallogo2.png)

### Steps to Upload Logo in SendGrid:

#### 1. Log in to SendGrid Dashboard

- Go to: https://app.sendgrid.com/
- Log in with your credentials

#### 2. Navigate to Sender Authentication

1. Click **Settings** in left sidebar
2. Click **Sender Authentication**
3. Under **Domain Authentication**, verify your domain is authenticated
   - If not, click **Authenticate Your Domain** and follow the steps
   - Add the CNAME records to your DNS (m4capital.com)

#### 3. Set Up Sender Identity with Logo

**Method A - Marketing Campaigns (Has Logo Upload):**

1. Go to **Marketing → Sender Management**
2. Click **Create New Sender**
3. Fill in details:
   - **From Name:** M4 Capital
   - **From Email:** noreply@m4capital.com
   - **Reply To:** support@m4capital.com
   - **Company Address:** [Your address]
4. **Upload Logo:** Click "Upload Logo" button
   - Select `m4capitallogo2.png`
   - Recommended: 200x200px to 600x600px
   - Max size: 5MB
5. Click **Save**

**Method B - Branded Templates:**

1. Go to **Email API → Dynamic Templates**
2. Click **Create a Dynamic Template**
3. In template editor, add your logo at the top
4. Use this template for all transactional emails

#### 4. Update Your Application to Use SendGrid

**Current Setup Check:**

```bash
# Check if you're using SendGrid in your .env
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587" or "465"
SMTP_USER="apikey"
SMTP_PASSWORD="SG.xxxxxxxxxxxxx"  # Your SendGrid API key
```

**If not yet using SendGrid, update your .env:**

```bash
# SendGrid Configuration
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="apikey"
SMTP_PASSWORD="SG.your-api-key-here"
SMTP_FROM_NAME="M4 Capital"
SMTP_FROM="noreply@m4capital.com"  # Must match verified sender
```

#### 5. Generate SendGrid API Key

1. Go to **Settings → API Keys**
2. Click **Create API Key**
3. Name it: "M4 Capital Production"
4. Choose **Full Access** or **Mail Send** permission
5. Copy the API key (starts with `SG.`)
6. Use this as your `SMTP_PASSWORD`

#### 6. Verify Sender Email

1. Go to **Settings → Sender Authentication → Single Sender Verification**
2. Click **Create New Sender**
3. Enter: `noreply@m4capital.com`
4. SendGrid will send verification email
5. Click the link in email to verify

---

## SendGrid BIMI Setup (For Gmail Avatar Logo)

SendGrid supports **BIMI** which displays your logo in Gmail:

### Steps:

#### 1. Domain Authentication (Required First)

- Already done if you verified your domain in SendGrid
- DNS records must be added: CNAME, TXT for DKIM

#### 2. Set Up DMARC Policy

Add this DNS record to your domain:

```
Type: TXT
Name: _dmarc.m4capital.com
Value: v=DMARC1; p=quarantine; rua=mailto:dmarc@m4capital.com
```

#### 3. Prepare Your Logo

- Convert `m4capitallogo2.png` to SVG format
- Use SVG Tiny Portable/Secure (Tiny PS) format
- Upload to public URL: `https://m4capital.com/bimi-logo.svg`

#### 4. Add BIMI DNS Record

```
Type: TXT
Name: default._bimi.m4capital.com
Value: v=BIMI1; l=https://m4capital.com/bimi-logo.svg
```

#### 5. SendGrid Will Handle the Rest

- SendGrid automatically includes BIMI headers in emails
- Gmail will fetch and display your logo
- May take 24-48 hours to propagate

**Note:** For maximum Gmail trust, you may need a Verified Mark Certificate (VMC) - costs $1,500/year. Not required for basic BIMI.

---

## Option 2: Google Workspace (Alternative - Professional Solution)

### What You Get:

- Custom logo as email sender avatar
- Professional email addresses (@m4capital.com)
- Enhanced credibility and trust
- Better deliverability rates
- Brand consistency across all emails

### Steps to Set Up:

#### 1. Sign Up for Google Workspace

- Go to: https://workspace.google.com/
- Choose a plan (Business Starter is ~$6/user/month)
- Verify your domain (m4capital.com or m4capital.online)

#### 2. Set Up Your Custom Domain Email

- Create email addresses like:
  - `noreply@m4capital.com`
  - `support@m4capital.com`
  - `admin@m4capital.com`

#### 3. Upload Your Company Logo

**Method A - Via Google Admin Console:**

1. Go to: https://admin.google.com/
2. Navigate to: **Account → Account settings → Profile**
3. Click **"Add organization logo"**
4. Upload your logo: `m4capitallogo2.png`
   - Recommended size: 320x132 pixels
   - Max size: 1MB
   - Formats: PNG, JPG, or GIF

**Method B - Via Gmail Settings:**

1. Go to Gmail settings (gear icon)
2. Click **"See all settings"**
3. Navigate to **"General"** tab
4. Scroll to **"My picture"** or **"Profile picture"**
5. Upload `m4capitallogo2.png`

#### 4. Update Your Email Configuration (.env)

```bash
# Update these in your production .env file
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="noreply@m4capital.com"  # Your Google Workspace email
SMTP_PASSWORD="your-app-specific-password"  # Generate in Google Workspace
EMAIL_FROM_NAME="M4 Capital"
EMAIL_FROM_ADDRESS="noreply@m4capital.com"
```

#### 5. Generate App Password for SMTP

1. Go to: https://myaccount.google.com/apppasswords
2. Select **"Mail"** and **"Other (Custom name)"**
3. Enter: "M4 Capital Production Server"
4. Copy the generated 16-character password
5. Use this as your `SMTP_PASSWORD` in .env

---

## Option 2: BIMI (Brand Indicators for Message Identification)

### Requirements:

- Domain must have DMARC policy set up
- Verified Mark Certificate (VMC) - costs $1,000-$1,500/year
- Logo must be in SVG Tiny Portable/Secure format

### Steps:

1. **Set up DMARC** on your domain
2. **Purchase VMC** from DigiCert or Entrust
3. **Convert your logo** to SVG Tiny P/S format
4. **Host your logo** at a public URL
5. **Add BIMI DNS record:**
   ```
   default._bimi.m4capital.com TXT "v=BIMI1; l=https://m4capital.com/logo.svg; a=https://m4capital.com/vmc.pem"
   ```

**Note:** BIMI is expensive and only supported by some email providers (Gmail, Yahoo, Fastmail). Not recommended unless you're a large enterprise.

---

## Option 3: Enhanced Email Logo Display (Current Implementation)

Your emails already include your logo prominently in the header. While this doesn't change the Gmail avatar, it ensures your branding is visible when emails are opened.

**Current Setup:**

- Logo appears at top of every email
- 180px width with white background
- Professional gradient header
- Consistent across all email templates

---

## Recommended Path for M4 Capital (Using SendGrid)

### Immediate (Free):

✅ **Already done** - Logo in email header (current implementation)

### Step 1: Verify Domain in SendGrid (Required)

🔧 **Domain Authentication**

- Add SendGrid DNS records to m4capital.com
- Takes 5-10 minutes
- Free with SendGrid account

### Step 2: Upload Logo in SendGrid (Easy)

🎨 **Sender Identity with Logo**

- Go to Marketing → Sender Management
- Upload m4capitallogo2.png
- Takes 2 minutes
- Free

### Step 3: Set Up BIMI for Gmail Avatar (Optional)

📧 **BIMI DNS Record**

- Convert logo to SVG
- Add DNS TXT record
- Gmail displays your logo instead of "M"
- Free (basic BIMI)

### Enterprise Option (If Needed Later):

📈 **Verified Mark Certificate (VMC)** - $1,500/year

- Only needed for maximum trust indicators
- Required by some strict email filters
- Not necessary for most businesses

---

## Quick Start: SendGrid Logo Setup (5 Minutes)

### Step 1: Verify Your Domain

```bash
# Add these DNS records to m4capital.com (get from SendGrid dashboard):
# Settings → Sender Authentication → Authenticate Your Domain
# SendGrid will provide specific CNAME records like:

CNAME: em1234.m4capital.com → u12345.wl123.sendgrid.net
CNAME: s1._domainkey.m4capital.com → s1.domainkey.u12345.wl123.sendgrid.net
CNAME: s2._domainkey.m4capital.com → s2.domainkey.u12345.wl123.sendgrid.net
```

### Step 2: Create Verified Sender with Logo

1. **Marketing → Sender Management → Create New Sender**
2. Fill form:
   ```
   From Name: M4 Capital
   From Email: noreply@m4capital.com
   Reply To: support@m4capital.com
   Company: M4 Capital
   Address: [Your business address]
   ```
3. **Click "Upload Logo"**
4. **Select:** `C:\Users\HP\Desktop\m4capital\public\m4capitallogo2.png`
5. **Save**

### Step 3: Update .env File

```bash
# Production environment variables
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="apikey"
SMTP_PASSWORD="SG.your-sendgrid-api-key"
SMTP_FROM_NAME="M4 Capital"
SMTP_FROM="noreply@m4capital.com"
```

### Step 4: Redeploy

```bash
git add -A
git commit -m "Update SendGrid email configuration"
git push origin master
```

---

## Optional: BIMI Setup for Gmail Avatar

If you want your logo to appear as the sender avatar in Gmail (instead of "M"):

### Requirements:

- Domain authenticated in SendGrid ✅
- DMARC policy set up ✅ (SendGrid handles this)
- Logo in SVG format
- Public URL for logo

### Steps:

#### 1. Convert Your Logo to SVG

Use online converter:

- Go to: https://convertio.co/png-svg/
- Upload: `m4capitallogo2.png`
- Download SVG file

Or use design tool:

- Open in Figma/Adobe Illustrator
- Export as SVG Tiny PS format

#### 2. Host Your SVG Logo

Upload to your website:

```bash
# Place at: public/bimi-logo.svg
# Accessible at: https://m4capital.com/bimi-logo.svg
```

#### 3. Add BIMI DNS Record

Add to your domain DNS:

```
Type: TXT
Name: default._bimi
Value: v=BIMI1; l=https://m4capital.com/bimi-logo.svg
```

#### 4. Wait for Propagation

- Gmail checks BIMI records periodically
- May take 24-48 hours
- SendGrid automatically includes BIMI headers

---

## Testing Your SendGrid Setup

### 1. Send Test Email

```bash
# From your dashboard, trigger a test deposit or signup
# Email should now come from: M4 Capital <noreply@m4capital.com>
```

### 2. Check Email Headers

Open email in Gmail → Click "Show original" → Look for:

```
BIMI-Indicator: logo-url
BIMI-Location: https://m4capital.com/bimi-logo.svg
```

### 3. Verify Logo Display

- **Marketing emails:** Logo shows in email body (from Sender Identity)
- **Gmail avatar (with BIMI):** Logo shows instead of "M"

---

## Cost Comparison (SendGrid)

### 1. Domain Verification

If you own `m4capital.com` or `m4capital.online`:

- Add TXT record provided by Google to your DNS
- Wait 24-48 hours for verification

### 2. Create Service Account

```bash
Email: noreply@m4capital.com
Password: [Generate strong password]
Purpose: Automated system emails
```

### 3. Update Production Environment Variables

```bash
# On Vercel Dashboard → Settings → Environment Variables
SMTP_USER=noreply@m4capital.com
SMTP_PASSWORD=[app-specific-password-from-google]
EMAIL_FROM_ADDRESS=noreply@m4capital.com
```

### 4. Redeploy Application

```bash
# Trigger Vercel redeploy or run:
git commit --allow-empty -m "Update email configuration"
git push origin master
```

---

## Testing Your Logo

### After Setting Up Google Workspace:

1. **Send test email** from dashboard
2. **Check Gmail inbox** - you should see:
   - Your M4 Capital logo instead of "M" avatar
   - Professional sender name
   - Higher trust indicators

### Verification:

- Open email in Gmail
- Sender should show your logo (not "M")
- Hover over sender - should show verified checkmark

---

## Cost Comparison (SendGrid)

| Solution            | Setup Cost | Monthly Cost | Annual Cost                   |
| ------------------- | ---------- | ------------ | ----------------------------- |
| SendGrid Free Plan  | $0         | $0           | $0 (100 emails/day)           |
| SendGrid Essentials | $0         | $19.95       | $239.40 (50K emails/month)    |
| SendGrid Pro        | $0         | $89.95       | $1,079.40 (100K emails/month) |
| BIMI (Basic)        | $0         | $0           | $0                            |
| BIMI + VMC          | $1,500     | $0           | $1,500                        |

**Your Current Setup:** SendGrid (already using)
**Recommendation:** Just upload logo in SendGrid dashboard (free, takes 5 minutes)

---

## Support Resources

- **SendGrid Documentation:** https://docs.sendgrid.com/
- **SendGrid Sender Identity:** https://docs.sendgrid.com/ui/sending-email/senders
- **BIMI Setup Guide:** https://docs.sendgrid.com/ui/sending-email/bimi
- **DMARC Setup:** https://docs.sendgrid.com/ui/sending-email/dmarc

---

## Need Help?

If you need assistance with:

- SendGrid domain authentication
- Logo upload in SendGrid
- BIMI DNS configuration
- SVG logo conversion

Check SendGrid's support or the documentation links above.

---

**Last Updated:** November 16, 2025
