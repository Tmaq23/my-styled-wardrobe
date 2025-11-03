# Stripe Payment Setup - Complete Guide

## ✅ Step-by-Step Setup

### 1. Get Your Stripe Keys

**Test Mode (for testing):**
1. Go to: https://dashboard.stripe.com/test/apikeys
2. Copy both keys:
   - **Publishable key**: `pk_test_...`
   - **Secret key**: `sk_test_...` (click "Reveal")

**Live Mode (for real payments):**
1. Complete Stripe account verification
2. Go to: https://dashboard.stripe.com/apikeys
3. Copy both keys:
   - **Publishable key**: `pk_live_...`
   - **Secret key**: `sk_live_...`

### 2. Add Keys to Vercel

Go to: https://vercel.com/tmaq23s-projects/my-styled-wardrobe/settings/environment-variables

Add these two variables:

| Name | Value | Environments |
|------|-------|--------------|
| `STRIPE_SECRET_KEY` | `sk_test_...` or `sk_live_...` | Production, Preview, Development |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_...` or `pk_live_...` | Production, Preview, Development |

### 3. Redeploy

After adding the keys, redeploy:
```bash
vercel --prod
```

Or trigger a redeploy in Vercel Dashboard:
- Go to **Deployments** tab
- Click **"Redeploy"** on the latest deployment

---

## 🧪 Testing Your Stripe Integration

### Test Credit Card Numbers

Use these test cards in **Test Mode**:

**Success:**
- Card: `4242 4242 4242 4242`
- Expiry: Any future date (e.g., `12/34`)
- CVC: Any 3 digits (e.g., `123`)
- ZIP: Any 5 digits (e.g., `12345`)

**Decline (insufficient funds):**
- Card: `4000 0000 0000 9995`

**Requires 3D Secure:**
- Card: `4000 0025 0000 3155`

### Testing the Verification Flow

1. Go to your site: https://my-styled-wardrobe-krqa71r2l-tmaq23s-projects.vercel.app/style-interface
2. Complete an AI analysis
3. Click **"Get Verified - £30"**
4. You should be redirected to Stripe Checkout
5. Use test card: `4242 4242 4242 4242`
6. Complete the payment
7. You should be redirected back with success message

---

## 💰 Going Live (Real Payments)

### Before Accepting Real Payments:

1. **Complete Stripe Verification**
   - Go to: https://dashboard.stripe.com/settings/account
   - Complete business information
   - Verify identity documents
   - Add bank account for payouts

2. **Switch to Live Keys**
   - Go to Stripe Dashboard
   - Toggle from **Test mode** to **Live mode**
   - Copy your **Live keys** (pk_live_... and sk_live_...)
   - Update them in Vercel environment variables

3. **Update Pricing (if needed)**
   - The verification is currently set to £30
   - Change in: `app/api/verification/create-checkout/route.ts`

4. **Test Live Payment**
   - Use a real card (small amount first)
   - Check payment appears in Stripe Dashboard
   - Verify email notifications work

---

## 🔐 Security Checklist

✅ **Never commit `.env` files to git**
✅ **Use Test keys for development**
✅ **Use Live keys only in production**
✅ **Keep Secret keys private** (never expose in frontend)
✅ **Publishable keys are safe** (can be in frontend code)

---

## 📊 Monitoring Payments

### View Payments in Stripe:
- **Test Mode**: https://dashboard.stripe.com/test/payments
- **Live Mode**: https://dashboard.stripe.com/payments

### Key Stripe Dashboard Sections:
- **Payments**: See all transactions
- **Customers**: See customer records
- **Products**: Manage your offerings
- **Webhooks**: Set up payment notifications
- **Reports**: View financial reports

---

## 🆘 Troubleshooting

### "Payment system is not configured"
- Check environment variables are added in Vercel
- Redeploy after adding keys
- Check keys start with `sk_test_` or `sk_live_`

### "Invalid API Key"
- Verify you copied the full key (no spaces)
- Check you're using the correct mode (test vs live)
- Regenerate keys if needed in Stripe Dashboard

### "Payment declined"
- In test mode: Use `4242 4242 4242 4242`
- In live mode: Contact your bank

### "Webhook signature failed"
- Not critical for basic checkout
- Optional: Set up webhooks for payment confirmations

---

## 📝 Support

- **Stripe Docs**: https://stripe.com/docs
- **Stripe Support**: https://support.stripe.com
- **Test Cards**: https://stripe.com/docs/testing

---

## 🚀 Quick Start Summary

1. Get Stripe keys from: https://dashboard.stripe.com/test/apikeys
2. Add to Vercel: https://vercel.com/tmaq23s-projects/my-styled-wardrobe/settings/environment-variables
3. Redeploy: `vercel --prod`
4. Test with card: `4242 4242 4242 4242`
5. Go live when ready! 🎉

