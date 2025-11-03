# 🔑 Add Your Stripe Keys to Vercel

## Your Stripe Keys (Test Mode)

**Publishable Key:**
```
pk_test_51SP5AbEWKVZwYTgvA2M21nLcbqq7LJUrYqoX0oa7UQGGIzdbzxZdGSe0alH3AHwtRmCD7WUkPs1z1TTxt94Oxgu200Az4zwkmO
```

**Secret Key:**
```
sk_test_51SP5AbEWKVZwYTgvYZ4wgCokeLqaqr9qv0th7Pohi17NHEYXbtfDgbOdreXtlPHyaTWsX3JpdY583cLFRp2KUHyD00ZYykgb5g
```

---

## 📋 Step-by-Step Instructions

### 1. Go to Vercel Environment Variables

Click this link: 
👉 **https://vercel.com/tmaq23s-projects/my-styled-wardrobe/settings/environment-variables**

### 2. Add First Variable (Secret Key)

Click **"Add New"** button and enter:

| Field | Value |
|-------|-------|
| **Name** | `STRIPE_SECRET_KEY` |
| **Value** | `sk_test_51SP5AbEWKVZwYTgvYZ4wgCokeLqaqr9qv0th7Pohi17NHEYXbtfDgbOdreXtlPHyaTWsX3JpdY583cLFRp2KUHyD00ZYykgb5g` |
| **Environments** | ✅ Production<br>✅ Preview<br>✅ Development |

Click **"Save"**

### 3. Add Second Variable (Publishable Key)

Click **"Add New"** again and enter:

| Field | Value |
|-------|-------|
| **Name** | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` |
| **Value** | `pk_test_51SP5AbEWKVZwYTgvA2M21nLcbqq7LJUrYqoX0oa7UQGGIzdbzxZdGSe0alH3AHwtRmCD7WUkPs1z1TTxt94Oxgu200Az4zwkmO` |
| **Environments** | ✅ Production<br>✅ Preview<br>✅ Development |

Click **"Save"**

---

## ✅ After Adding Both Keys

You should see both variables listed:
- ✅ STRIPE_SECRET_KEY (Production, Preview, Development)
- ✅ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (Production, Preview, Development)

---

## 🚀 Next Step: Redeploy!

After adding the keys, you MUST redeploy for them to take effect.

Run this command from your terminal:

```bash
cd /Users/marldonsmalling/my-styled-wardrobe
vercel --prod
```

---

## 🧪 Test Your Payment

After redeployment completes:

1. Go to: https://my-styled-wardrobe-krqa71r2l-tmaq23s-projects.vercel.app/style-interface
2. Complete an AI analysis
3. Click **"Get Verified - £30"**
4. Use test card:
   - **Card number:** `4242 4242 4242 4242`
   - **Expiry:** `12/34` (any future date)
   - **CVC:** `123` (any 3 digits)
   - **ZIP:** `12345` (any 5 digits)

**The error "Payment system is not configured" should be gone!** ✅

---

## 📞 Need Help?

If you see any issues:
1. Double-check both keys are added to Vercel
2. Make sure you selected all 3 environments
3. Make sure you redeployed after adding keys
4. Check Stripe Dashboard is in Test mode: https://dashboard.stripe.com/test/dashboard

