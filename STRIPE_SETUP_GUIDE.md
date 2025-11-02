# Stripe Payment Setup Guide

This guide will walk you through setting up Stripe to accept payments for the stylist verification feature (£30) on your site.

## Step 1: Create a Stripe Account

1. Go to [https://stripe.com](https://stripe.com)
2. Click **"Start now"** or **"Sign up"**
3. Create your account with your email address
4. Complete the account verification process

## Step 2: Get Your API Keys

### For Testing (Development)

1. Log into your [Stripe Dashboard](https://dashboard.stripe.com)
2. Make sure you're in **Test mode** (toggle in the top right)
3. Go to **Developers** → **API keys**
4. You'll see two keys:
   - **Publishable key** (starts with `pk_test_...`)
   - **Secret key** (starts with `sk_test_...`) - Click "Reveal test key" to see it

### For Production (Live Payments)

1. In Stripe Dashboard, switch to **Live mode** (toggle in top right)
2. Go to **Developers** → **API keys**
3. Get your live keys:
   - **Publishable key** (starts with `pk_live_...`)
   - **Secret key** (starts with `sk_live_...`) - Click "Reveal live key"

⚠️ **Important**: Never share your secret keys publicly or commit them to Git!

## Step 3: Add Keys to Your Environment Variables

### For Local Development

1. Open or create `.env.local` in your project root
2. Add your Stripe keys:

```env
# Stripe (Test Mode for Development)
STRIPE_SECRET_KEY="sk_test_51ABC123..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_51ABC123..."
```

**Note**: The `NEXT_PUBLIC_` prefix is required for keys used in the browser (client-side). The secret key should NOT have this prefix.

### For Production (Vercel/Other Hosting)

1. **Vercel**: 
   - Go to your project → Settings → Environment Variables
   - Add each variable:
     - `STRIPE_SECRET_KEY` = `sk_live_...` (use live key!)
     - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = `pk_live_...` (use live key!)
   - Select the environment (Production)
   - Redeploy your app

2. **Other Hosting**:
   - Add the same variables to your hosting platform's environment variable settings
   - Make sure to use **live keys** for production

## Step 4: Verify Your Setup

1. **Restart your development server**:
   ```bash
   npm run dev
   ```

2. **Test the payment flow**:
   - Go to your site
   - Complete an AI analysis
   - Click "Get Verified - £30"
   - You should be redirected to Stripe Checkout

## Step 5: Test Payments

### Using Stripe Test Cards

Stripe provides test card numbers for testing without real charges:

**Successful Payment:**
- Card: `4242 4242 4242 4242`
- Expiry: Any future date (e.g., `12/25`)
- CVC: Any 3 digits (e.g., `123`)
- ZIP: Any 5 digits (e.g., `12345`)

**Declined Payment:**
- Card: `4000 0000 0000 0002`

**3D Secure (SCA) Authentication:**
- Card: `4000 0027 6000 3184`

**More Test Cards:** See [Stripe Test Cards](https://stripe.com/docs/testing#cards)

### View Test Payments

1. Go to Stripe Dashboard
2. Make sure you're in **Test mode**
3. Click **Payments** to see all test transactions

## Step 6: Enable Webhooks (Optional but Recommended)

Webhooks let Stripe notify your app when payment events occur.

1. In Stripe Dashboard → **Developers** → **Webhooks**
2. Click **"Add endpoint"**
3. Enter your endpoint URL: `https://yourdomain.com/api/stripe/webhook`
4. Select events to listen for:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy the **Signing secret** (starts with `whsec_...`)
6. Add to your `.env.local`:
   ```env
   STRIPE_WEBHOOK_SECRET="whsec_..."
   ```

**Note**: For local testing, use Stripe CLI (see below) or skip webhooks for now.

## Step 7: Go Live

When ready for real payments:

1. **Complete Stripe account activation**:
   - Go to Dashboard → **Activate your account**
   - Provide business information
   - Add bank account for payouts

2. **Switch to Live mode**:
   - Get your live API keys (see Step 2)
   - Update environment variables in production
   - Use `pk_live_...` and `sk_live_...` keys

3. **Update your site**:
   - Redeploy with live keys
   - Test with a small real payment first

## Testing Webhooks Locally (Optional)

If you want to test webhooks during development:

1. **Install Stripe CLI**:
   ```bash
   # macOS
   brew install stripe/stripe-cli/stripe
   
   # Or download from: https://stripe.com/docs/stripe-cli
   ```

2. **Login to Stripe CLI**:
   ```bash
   stripe login
   ```

3. **Forward webhooks to local server**:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

4. **Copy the webhook signing secret** that appears and add to `.env.local`

## Troubleshooting

### "Payment system is not configured"
- Check that `STRIPE_SECRET_KEY` is set in your `.env.local`
- Restart your development server after adding keys

### "Failed to create checkout session"
- Verify your Stripe keys are correct
- Check browser console for detailed error messages
- Ensure you're using test keys in development, live keys in production

### Payment succeeds but verification doesn't update
- Check the success page is correctly calling `/api/verification/confirm-checkout`
- Check server logs for errors
- Verify database connection is working

### Keys not working
- Make sure you copied the full key (they're long!)
- Test keys should start with `sk_test_` or `pk_test_`
- Live keys should start with `sk_live_` or `pk_live_`
- Never mix test and live keys in the same environment

## Security Best Practices

1. ✅ **Never commit API keys to Git**
   - Add `.env.local` to `.gitignore`
   - Use environment variables in production

2. ✅ **Use test keys for development**
   - Only use live keys in production
   - Keep test and live modes separate

3. ✅ **Rotate keys if compromised**
   - Stripe Dashboard → Developers → API keys
   - Click "..." next to key → "Reveal/Rotate"

4. ✅ **Monitor your Stripe Dashboard**
   - Check for suspicious activity
   - Review failed payments
   - Set up email notifications

## Current Implementation

Your site is configured to use Stripe Checkout for:
- **Stylist Verification**: £30 payment
- **Payment Flow**: Stripe Checkout (hosted payment page)
- **Success/Cancel URLs**: Configured in `app/api/verification/create-checkout/route.ts`

## Additional Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Checkout Guide](https://stripe.com/docs/payments/checkout)
- [Test Cards Reference](https://stripe.com/docs/testing)
- [Stripe Dashboard](https://dashboard.stripe.com)

## Need Help?

- Stripe Support: [support.stripe.com](https://support.stripe.com)
- Your site's API endpoints are in `app/api/verification/`

---

**Next Steps**: Add your test keys to `.env.local` and restart your dev server to start accepting payments! 🚀

