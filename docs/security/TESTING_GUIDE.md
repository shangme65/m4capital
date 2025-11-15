# 🧪 Quick Testing Guide

## How to Test All New Features

### Prerequisites

- Development server running: `npm run dev`
- Browser open at: http://localhost:3000
- Logged in as a user

---

## 1️⃣ Test Custom Confirmation Modal

**Location:** Settings → Telegram Integration

**Steps:**

1. Go to Settings page
2. Scroll to "Telegram Integration" section
3. If Telegram is linked, click "Unlink Telegram" button
4. **Expected:** Custom modal appears (NOT browser alert)
5. **Verify:**
   - Modal has backdrop
   - Title shows "Unlink Telegram Account?"
   - Message explains the action
   - "Cancel" button closes modal
   - "Unlink" button is red/danger style
6. Click "Cancel" - modal closes
7. Click "Unlink Telegram" again
8. Click "Unlink" - Telegram unlinked and modal closes

**✅ Pass Criteria:**

- No browser alert appears
- Custom modal is styled correctly
- Both buttons work
- Backdrop closes modal

---

## 2️⃣ Test Notification Truncation

**Location:** Notifications Panel (Bell icon)

**Steps:**

1. Trigger some notifications (e.g., change profile, unlink Telegram)
2. Click Bell icon to open Notifications
3. **Expected:** Only notification titles visible
4. Click "Show details" on any notification
5. **Expected:** Full message expands smoothly
6. **Verify:**
   - Chevron icon changes (down → right)
   - Animation is smooth
   - Message content is readable
7. Click "Hide details"
8. **Expected:** Message collapses smoothly
9. Try expanding multiple notifications at once
10. **Expected:** All expanded notifications remain open

**✅ Pass Criteria:**

- Only titles show by default
- Expand/collapse works smoothly
- Icons change correctly
- Multiple notifications can be expanded

---

## 3️⃣ Test Password Change

**Location:** Settings → Security → Change Password

**Steps:**

1. Go to Settings page
2. Click "Security" in sidebar
3. Scroll to "Change Password" section
4. **Test Show/Hide:**
   - Click eye icon on "Current Password" - password visible
   - Click again - password hidden
   - Repeat for "New Password" and "Confirm Password"
5. **Test Validation:**
   - Enter wrong current password
   - Enter "test123" as new password
   - Click "Change Password"
   - **Expected:** "Current password is incorrect" error
6. **Test Short Password:**
   - Enter correct current password
   - Enter "abc" as new password
   - Click "Change Password"
   - **Expected:** "Password must be at least 8 characters" error
7. **Test Mismatch:**
   - Enter correct current password
   - Enter "password123" as new password
   - Enter "password456" as confirm
   - Click "Change Password"
   - **Expected:** "Passwords do not match" error
8. **Test Same Password:**
   - Enter current password in all three fields
   - Click "Change Password"
   - **Expected:** "New password must be different from current password" error
9. **Test Success:**
   - Enter correct current password
   - Enter "newpass123" as new password
   - Enter "newpass123" as confirm
   - Click "Change Password"
   - **Expected:** Green success message appears
   - Try logging out and back in with new password
10. **Test Forgot Password:**
    - Click "Forgot Password?" link
    - **Expected:** Notification says email sent (or error if not configured)

**✅ Pass Criteria:**

- All validations work correctly
- Show/hide toggles work
- Error messages are clear
- Success message appears
- Password actually changes in database
- Can log in with new password

---

## 4️⃣ Test Two-Factor Authentication (Authenticator App)

**Location:** Settings → Security → Two-Factor Authentication

### Setup 2FA

**Steps:**

1. Go to Settings → Security
2. Scroll to "Two-Factor Authentication" section
3. Click "Authenticator App" button
4. **Expected:** QR code appears
5. **Verify:**

   - QR code is displayed (white background)
   - Manual secret code shown below
   - "Verification Code" input field visible
   - "Enable 2FA" and "Cancel" buttons visible

6. **Test QR Code:**

   - Open Google Authenticator or Authy on phone
   - Scan the QR code
   - **Expected:** Account added to authenticator app
   - 6-digit code appears in app

7. **Test Wrong Code:**

   - Enter "000000" in verification field
   - Click "Enable 2FA"
   - **Expected:** Error message "Invalid verification code"

8. **Test Correct Code:**

   - Enter the 6-digit code from authenticator app
   - Click "Enable 2FA"
   - **Expected:**
     - Green success banner appears
     - Text says "Two-Factor Authentication is Enabled"
     - Method shows "Authenticator App"
     - QR code section disappears
     - "Disable 2FA" button appears

9. **Test Cancel:**
   - Click "Authenticator App" again (to test cancel)
   - QR code appears
   - Click "Cancel"
   - **Expected:** Back to 2FA options screen

### Disable 2FA

**Steps:**

1. With 2FA enabled, click "Disable 2FA" button
2. **Expected:**

   - Warning message appears (yellow background)
   - Password input field visible
   - "Confirm Disable" and "Cancel" buttons visible

3. **Test Wrong Password:**

   - Enter wrong password
   - Click "Confirm Disable"
   - **Expected:** Error message "Incorrect password"

4. **Test Cancel:**

   - Click "Cancel"
   - **Expected:** Back to "2FA Enabled" screen

5. **Test Correct Password:**
   - Click "Disable 2FA" again
   - Enter correct password
   - Click "Confirm Disable"
   - **Expected:**
     - 2FA disabled
     - Back to 2FA setup options screen
     - Both buttons (Authenticator App, Email) visible

**✅ Pass Criteria:**

- QR code is scannable
- Manual secret works
- Wrong codes rejected
- Correct codes accepted
- 2FA status updates in database
- Disable requires password
- All cancels work correctly

---

## 5️⃣ Test Two-Factor Authentication (Email)

**Location:** Settings → Security → Two-Factor Authentication

**Steps:**

1. Go to Settings → Security
2. Click "Email" button under 2FA
3. **Expected:** 2FA method set to EMAIL in database
4. **Verify:** Status shows "Enabled" with method "Email"

**Note:** Email verification implementation pending. This tests the setup mechanism.

**✅ Pass Criteria:**

- Button clickable
- Method saved to database
- Status updates correctly

---

## 🔍 Database Verification

### Check 2FA Fields

**Using Prisma Studio:**

```bash
npx prisma studio
```

1. Open "User" model
2. Find your test user
3. **Verify fields:**
   - `twoFactorEnabled`: true/false based on test
   - `twoFactorSecret`: Base32 string when enabled
   - `twoFactorMethod`: "APP" or "EMAIL"

**Using SQL:**

```sql
SELECT
  email,
  twoFactorEnabled,
  twoFactorMethod,
  LENGTH(twoFactorSecret) as secret_length
FROM "User"
WHERE email = 'your-test-email@example.com';
```

---

## 📊 Expected Results Summary

| Feature       | Test             | Expected Result               |
| ------------- | ---------------- | ----------------------------- |
| ConfirmModal  | Click unlink     | Custom modal appears          |
| ConfirmModal  | Click cancel     | Modal closes                  |
| ConfirmModal  | Click confirm    | Action executes               |
| Notifications | Default view     | Only titles shown             |
| Notifications | Click expand     | Message reveals smoothly      |
| Notifications | Click collapse   | Message hides smoothly        |
| Password      | Show/hide        | Password visibility toggles   |
| Password      | Wrong current    | Error message                 |
| Password      | Too short        | Error message                 |
| Password      | Mismatch         | Error message                 |
| Password      | Same password    | Error message                 |
| Password      | Valid change     | Success message + DB update   |
| 2FA Setup     | Click button     | QR code appears               |
| 2FA Setup     | Scan QR          | Code in authenticator app     |
| 2FA Verify    | Wrong code       | Error message                 |
| 2FA Verify    | Correct code     | 2FA enabled + status updated  |
| 2FA Disable   | Wrong password   | Error message                 |
| 2FA Disable   | Correct password | 2FA disabled + status updated |

---

## 🐛 Common Issues & Solutions

### Issue: Modal doesn't appear

**Solution:** Check browser console for errors. Verify ConfirmModal imported correctly.

### Issue: QR code not scannable

**Solution:**

- Ensure phone camera has permission
- Try manual secret entry instead
- Check QR code is not blurry (zoom out if needed)

### Issue: Verification code always fails

**Solution:**

- Ensure phone time is synced (Settings → Date & Time → Auto)
- Wait for code to refresh in app
- Try entering code immediately after generation

### Issue: Password change doesn't work

**Solution:**

- Verify current password is correct
- Check database connection
- Look for errors in console
- Verify bcrypt is working

### Issue: Database errors

**Solution:**

```bash
# Restart Prisma
npx prisma generate
npx prisma db push

# Check .env file
cat .env | grep DATABASE_URL
```

---

## ✅ Final Test Checklist

Run through all tests and check each:

- [ ] Custom modal works for Telegram unlink
- [ ] Notifications show only titles by default
- [ ] Notification expand/collapse works
- [ ] Password show/hide toggles work
- [ ] Current password validation works
- [ ] New password length validation works
- [ ] Password mismatch validation works
- [ ] Cannot reuse current password
- [ ] Password change succeeds with valid input
- [ ] Can log in with new password
- [ ] Forgot password link works
- [ ] 2FA Authenticator App setup shows QR
- [ ] QR code scannable by phone app
- [ ] Manual secret entry works
- [ ] Wrong 2FA code rejected
- [ ] Correct 2FA code enables 2FA
- [ ] 2FA status shows "Enabled"
- [ ] 2FA method displays correctly
- [ ] 2FA disable requires password
- [ ] Wrong password rejected for disable
- [ ] Correct password disables 2FA
- [ ] All cancel buttons work
- [ ] Database fields update correctly

---

## 📸 Screenshots to Take

For documentation/demo:

1. Custom confirmation modal (styled)
2. Notification panel (collapsed state)
3. Notification panel (expanded state)
4. Password change form (with eye icons)
5. Password change success message
6. 2FA setup options screen
7. 2FA QR code display
8. 2FA enabled status banner
9. 2FA disable warning
10. All modals on mobile view

---

**Happy Testing! 🎉**

All features should work flawlessly. If you encounter any issues, check the console for errors and verify environment variables are set correctly.
