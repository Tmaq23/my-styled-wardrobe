# 🚀 Stripe Setup - Quick Guide (5 Minutes)

## Step 1: Get Your Stripe Test Keys

Go to: **https://dashboard.stripe.com/test/apikeys**

You'll see two keys:

```
Publishable key: pk_test_51QCj... (Reveal and copy)
Secret key:      sk_test_51QCj... (Click "Reveal test key" and copy)
```

---

## Step 2: Add to Vercel (Required!)

Go to: **https://vercel.com/tmaq23s-projects/my-styled-wardrobe/settings/environment-variables**

Click **"Add New"** and add:

### Variable 1:
```
Name:  STRIPE_SECRET_KEY
Value: sk_test_YOUR_KEY_HERE
Environments: ✅ Production  ✅ Preview  ✅ Development
```

### Variable 2:
```
Name:  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
Value: pk_test_YOUR_KEY_HERE
Environments: ✅ Production  ✅ Preview  ✅ Development
```

---

## Step 3: Redeploy

Option A - From Terminal:
```bash
cd /Users/marldonsmalling/my-styled-wardrobe
vercel --prod
```

Option B - From Vercel Dashboard:
- Go to "Deployments" tab
- Click "Redeploy" on latest deployment

---

## Step 4: Test It! 🎉

1. Go to your site
2. Do an AI analysis
3. Click "Get Verified - £30"
4. Use test card:
   - Card: `4242 4242 4242 4242`
   - Expiry: `12/34`
   - CVC: `123`

**Done!** ✅

---

## 📌 Important Notes

- ⚠️ **You MUST redeploy** after adding environment variables
- 🧪 Test keys are safe for testing (start with `pk_test_` and `sk_test_`)
- 💰 For real payments later, you'll need live keys (`pk_live_` and `sk_live_`)
- 🔐 Never commit secret keys to git

---

## ❓ Need Help?

Full guide: See `STRIPE_SETUP_COMPLETE.md`

Stripe Dashboard: https://dashboard.stripe.com

