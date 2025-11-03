# 📧 Resend Email Setup Guide

This guide will help you set up email functionality for MyStyled Wardrobe using Resend.

---

## 🎯 What Emails Are Sent?

### 1. **Verification Request to Admin** 📸
- **When:** Customer pays £30 for professional verification
- **To:** admin@mystyledwardrobe.com
- **Includes:**
  - Customer's AI analysis results (body shape, color palette)
  - Customer's uploaded photos (attached)
  - Link to admin dashboard to complete verification

### 2. **Verification Confirmation to Customer** ✅
- **When:** Customer pays £30 for professional verification
- **To:** Customer's email
- **Includes:**
  - Payment confirmation
  - Their AI analysis results
  - What happens next
  - Expected timeline (24-48 hours)

### 3. **New Signup Alert to Admin** 🎉
- **When:** New user creates an account
- **To:** admin@mystyledwardrobe.com
- **Includes:**
  - User's name and email
  - Signup date/time
  - Link to admin dashboard

### 4. **Verification Complete to Customer** 🎨
- **When:** Stylist completes verification
- **To:** Customer's email
- **Includes:**
  - Verified body shape and color palette
  - Stylist's notes (if any)
  - Link to style interface

---

## 🚀 Quick Setup (5 Minutes)

### Step 1: Create Resend Account

1. Go to: **https://resend.com**
2. Click **"Sign Up"** (it's free!)
3. Verify your email address

### Step 2: Get Your API Key

1. Log in to Resend dashboard
2. Go to **API Keys** section
3. Click **"Create API Key"**
4. Give it a name: `MyStyled Wardrobe Production`
5. Copy the API key (starts with `re_`)

### Step 3: Verify Your Domain

**IMPORTANT:** To send emails from `admin@mystyledwardrobe.com`, you need to verify your domain.

#### Option A: Use Your Custom Domain (Recommended)

1. In Resend dashboard, go to **Domains**
2. Click **"Add Domain"**
3. Enter: `mystyledwardrobe.com`
4. Add the DNS records to your domain provider:
   - **TXT record** for verification
   - **DKIM records** for authentication
   - **MX records** (optional, for receiving emails)

#### Option B: Use Resend's Test Domain (For Testing Only)

- You can send up to 100 emails per day from `onboarding@resend.dev`
- **This is only for testing!** Use your custom domain for production

### Step 4: Add Environment Variable

Add this to your **Vercel** environment variables:

```
RESEND_API_KEY=re_your_api_key_here
```

**How to add in Vercel:**
1. Go to: https://vercel.com/tmaq23s-projects/my-styled-wardrobe/settings/environment-variables
2. Click **"Add New"**
3. Key: `RESEND_API_KEY`
4. Value: Your API key from Step 2
5. Select **"Production"**, **"Preview"**, and **"Development"**
6. Click **"Save"**

### Step 5: Redeploy

Vercel will automatically redeploy after adding the environment variable, or you can trigger a manual redeploy.

---

## 🧪 Testing

### Test Email Sending

1. **Create a Test Account:**
   - Go to: https://www.mystyledwardrobe.com/auth/signup
   - Sign up with your email
   - ✅ You should receive a signup alert at admin@mystyledwardrobe.com

2. **Test Verification Emails:**
   - Run AI analysis
   - Click "Get Verified - £30"
   - Complete payment with test card: `4242 4242 4242 4242`
   - ✅ Check admin@mystyledwardrobe.com for verification request with photos
   - ✅ Check your customer email for confirmation

3. **Test Completion Email:**
   - Go to admin dashboard → Stylist Verifications
   - Complete a verification
   - ✅ Customer should receive completion email

---

## 📊 Resend Dashboard

View your email activity in the Resend dashboard:
- **Recent Emails:** See all sent emails
- **Logs:** Check delivery status
- **Webhooks:** Set up webhooks for bounce/complaint handling (optional)

---

## 🔧 Email Configuration

All email templates and logic are in: `/lib/email.ts`

### Update Admin Email

To change the admin email address, edit `/lib/email.ts`:

```typescript
const ADMIN_EMAIL = 'admin@mystyledwardrobe.com'; // Change this
const FROM_EMAIL = 'MyStyled Wardrobe <admin@mystyledwardrobe.com>'; // And this
```

### Customize Email Templates

All email templates are HTML-based with inline styles. Edit them in `/lib/email.ts`:
- `sendVerificationRequestToAdmin()`
- `sendVerificationConfirmationToCustomer()`
- `sendNewSignupAlert()`
- `sendVerificationCompleteToCustomer()`

---

## 📈 Resend Free Tier

Resend's free tier includes:
- ✅ **3,000 emails per month** (plenty for most sites)
- ✅ **100 emails per day**
- ✅ **Custom domain support**
- ✅ **Unlimited API keys**
- ✅ **Email logs and analytics**

If you need more, paid plans start at $20/month for 50,000 emails.

---

## 🛟 Troubleshooting

### "Email failed to send"
- ✅ Check your `RESEND_API_KEY` is correct in Vercel
- ✅ Check your domain is verified in Resend dashboard
- ✅ Check Resend logs for error details

### "Emails going to spam"
- ✅ Make sure you've added all DKIM records
- ✅ Add SPF record: `v=spf1 include:resend.com ~all`
- ✅ Add DMARC record (optional but recommended)

### "Not receiving verification photos"
- ✅ Photos are embedded as inline images in the email
- ✅ Check your email client allows image display
- ✅ Check the imageUrls are publicly accessible URLs

---

## 🔒 Security Notes

- ✅ **API key is secret:** Never commit it to git or share publicly
- ✅ **Environment variable only:** Store in Vercel environment variables
- ✅ **Email sending is non-blocking:** If email fails, it won't break the payment flow
- ✅ **Rate limiting:** Resend has built-in rate limiting and abuse protection

---

## 📚 Resources

- **Resend Docs:** https://resend.com/docs
- **Resend Dashboard:** https://resend.com/emails
- **Resend Status:** https://status.resend.com

---

## ✅ Checklist

Before going live:

- [ ] Resend account created
- [ ] API key added to Vercel
- [ ] Domain verified in Resend
- [ ] DNS records added (TXT, DKIM)
- [ ] Test email sent successfully
- [ ] Signup alert received
- [ ] Verification emails working
- [ ] Emails not going to spam

---

**Need help?** Check the Resend documentation or contact their support team.

