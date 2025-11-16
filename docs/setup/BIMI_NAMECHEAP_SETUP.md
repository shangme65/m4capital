# BIMI Setup for M4 Capital - Namecheap DNS

## What You're Setting Up

BIMI will make your M4 Capital logo appear in Gmail instead of the "M" circle avatar.

---

## Step 1: ✅ DONE - Your Logo Ready

Your actual M4 Capital logo is ready for BIMI:

- **File location:** `public/m4capitallogo2.png`
- **Will be accessible at:** `https://m4capital.online/m4capitallogo2.png`

---

## Step 2: Add DNS Record in Namecheap

### Login to Namecheap:

1. Go to: https://www.namecheap.com/
2. Click **Sign In** (top right)
3. Enter your credentials

### Navigate to DNS Settings:

1. Click **Domain List** (left sidebar)
2. Find **m4capital.online**
3. Click **Manage** button
4. Click **Advanced DNS** tab

### Add BIMI Record:

Click **Add New Record** and enter:

```
Type: TXT Record
Host: default._bimi
Value: v=BIMI1; l=https://m4capital.online/m4capitallogo2.png;
TTL: Automatic (or 1 hour)
```

**Important:**

- Make sure there's NO SPACE after the semicolon in the Value field
- The "Host" must be exactly: `default._bimi`
- The URL must be exactly: `https://m4capital.online/m4capitallogo2.png`

### Save Changes:

1. Click **Save Changes** or **Add Record** button
2. Wait 5-10 minutes for DNS propagation

---

## Step 3: Verify SendGrid Domain Authentication

### In SendGrid Dashboard:

1. Go to: https://mc.sendgrid.com/
2. Click **Settings** → **Sender Authentication**
3. Under **Domain Authentication**, verify you see:
   - ✅ Domain: m4capital.online (verified)
   - ✅ DKIM: Verified

### If Not Verified:

1. Click **Authenticate Your Domain**
2. Select **Namecheap** as your DNS host
3. Copy the CNAME records SendGrid provides
4. Add them to Namecheap DNS (same place as BIMI record)
5. Click **Verify** in SendGrid

**SendGrid will give you 3 CNAME records like:**

```
CNAME: em1234.m4capital.online → u12345.wl123.sendgrid.net
CNAME: s1._domainkey.m4capital.online → s1.domainkey.u12345.wl123.sendgrid.net
CNAME: s2._domainkey.m4capital.online → s2.domainkey.u12345.wl123.sendgrid.net
```

---

## Step 4: Add DMARC Record (Required for BIMI)

### In Namecheap Advanced DNS:

Click **Add New Record**:

```
Type: TXT Record
Host: _dmarc
Value: v=DMARC1; p=none; rua=mailto:dmarc@m4capital.online; pct=100; adkim=r; aspf=r
TTL: Automatic
```

**What this does:**

- Tells email providers your domain is legitimate
- Required for BIMI to work
- "p=none" means no action (safe to start with)

---

## Step 5: Deploy Your Application

After adding DNS records, deploy your site so the SVG is accessible:

```bash
cd C:\Users\HP\Desktop\m4capital
git add public/bimi-logo.svg
git commit -m "Add BIMI logo for email branding"
git push origin develop
git checkout master
git merge develop
git push origin master
```

Vercel will auto-deploy and your logo will be live at:
`https://m4capital.online/bimi-logo.svg`

---

## Step 6: Wait for Propagation

### Timeline:

- **DNS propagation:** 5 minutes - 48 hours (usually 1-2 hours)
- **Gmail BIMI check:** Gmail checks BIMI records periodically
- **First appearance:** May take 24-48 hours after DNS propagates

### How to Check:

1. Send yourself a test email from your app
2. Open Gmail
3. Look for your logo instead of "M" circle
4. If not showing yet, wait 24 hours and check again

---

## Verification Tools

### Check DNS Propagation:

- Go to: https://dnschecker.org/
- Enter: `default._bimi.m4capital.online`
- Select: **TXT** record type
- Click **Search**
- Should show: `v=BIMI1; l=https://m4capital.online/bimi-logo.svg;`

### Check DMARC:

- Go to: https://mxtoolbox.com/dmarc.aspx
- Enter: `m4capital.online`
- Should show: ✅ DMARC record found

### Check BIMI Record:

- Go to: https://bimigroup.org/bimi-generator/
- Enter: `m4capital.online`
- Click **Check BIMI Record**
- Should show: ✅ Valid BIMI record

---

## Your Complete DNS Records (Namecheap)

After setup, you should have these records in **Advanced DNS**:

### BIMI Record:

```
Type: TXT
Host: default._bimi
Value: v=BIMI1; l=https://m4capital.online/bimi-logo.svg;
```

### DMARC Record:

```
Type: TXT
Host: _dmarc
Value: v=DMARC1; p=none; rua=mailto:dmarc@m4capital.online; pct=100; adkim=r; aspf=r
```

### SendGrid CNAME Records (3 records):

```
Type: CNAME
Host: em[number].m4capital.online
Value: u[number].wl[number].sendgrid.net

Type: CNAME
Host: s1._domainkey.m4capital.online
Value: s1.domainkey.u[number].wl[number].sendgrid.net

Type: CNAME
Host: s2._domainkey.m4capital.online
Value: s2.domainkey.u[number].wl[number].sendgrid.net
```

_Replace [number] with actual values from SendGrid_

---

## Troubleshooting

### Logo Not Showing After 48 Hours?

**1. Check SVG is accessible:**

- Open browser
- Go to: `https://m4capital.online/bimi-logo.svg`
- Should display your logo
- If 404 error, redeploy your application

**2. Verify DNS records:**

```bash
nslookup -type=txt default._bimi.m4capital.online
```

Should return your BIMI record

**3. Check DMARC:**

```bash
nslookup -type=txt _dmarc.m4capital.online
```

Should return your DMARC policy

**4. Verify SendGrid domain:**

- SendGrid dashboard → Sender Authentication
- Must show "Verified" status

**5. Check email headers:**

- Open email in Gmail
- Click "Show original"
- Look for: `BIMI-Indicator` or `BIMI-Location` headers

### Common Issues:

**Issue:** DNS not propagating
**Solution:** Wait 24-48 hours, check with dnschecker.org

**Issue:** SVG returns 404
**Solution:** Run `git push` again, check Vercel deployment logs

**Issue:** SendGrid domain not verified
**Solution:** Add all 3 CNAME records to Namecheap DNS

**Issue:** DMARC not found
**Solution:** Double-check the `_dmarc` TXT record is added correctly

---

## Expected Result

### Before BIMI:

```
[M] M4 Capital
    Incoming USD Deposit
```

### After BIMI (24-48 hours):

```
[🖼️ Your Logo] M4 Capital
    Incoming USD Deposit
```

Your M4 Capital logo will appear as the sender avatar in Gmail, Yahoo, and other BIMI-supporting email clients!

---

## Summary Checklist

- [ ] SVG logo created (`bimi-logo.svg`) ✅
- [ ] Logged into Namecheap
- [ ] Added BIMI TXT record (`default._bimi`)
- [ ] Added DMARC TXT record (`_dmarc`)
- [ ] Verified SendGrid domain authentication
- [ ] Added SendGrid CNAME records (if not done)
- [ ] Deployed application (pushed to master)
- [ ] Verified SVG is accessible at URL
- [ ] Waited 24-48 hours for propagation
- [ ] Tested by sending email to Gmail
- [ ] Logo appears in Gmail inbox ✅

---

**Estimated Time:** 15-20 minutes setup + 24-48 hours propagation

**Cost:** $0 (completely free)

**Last Updated:** November 16, 2025
