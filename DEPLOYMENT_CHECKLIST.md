# Vercel Deployment Checklist

## Quick Deployment Steps

### ✅ Step 1: Prepare Your Code
- [ ] Make sure all changes are committed
- [ ] Push to GitHub (if not already done)

### ✅ Step 2: Go to Vercel
1. Go to [https://vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"**
3. Select your GitHub repository

### ✅ Step 3: Configure Build Settings
- Vercel will auto-detect Next.js - just verify it says "Next.js"
- Click **"Environment Variables"**

### ✅ Step 4: Add Environment Variables

Copy these from your `.env.local` to Vercel (one by one):

#### Database & Supabase
- [ ] `DATABASE_URL` = `postgresql://postgres.pmdlnlrlrqfwhawwcaxl:F6BfH!q5AFcDRdc%40@aws-1-eu-west-1.pooler.supabase.com:5432/postgres`
- [ ] `NEXT_PUBLIC_SUPABASE_URL` = `https://pmdlnlrlrqfwhawwcaxl.supabase.co`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

#### Authentication
- [ ] `AUTH_SESSION_SECRET` = `iI0+TePYt46eVxqPFO8jIQe3Ptlm+n7GiIIvKjMTR5I=` (or generate new one)
- [ ] `NEXTAUTH_SECRET` = `iI0+TePYt46eVxqPFO8jIQe3Ptlm+n7GiIIvKjMTR5I=`
- [ ] `NEXTAUTH_URL` = `https://your-project-name.vercel.app` ⚠️ **Update this after deployment!**

#### Admin
- [ ] `ADMIN_USERNAME` = `admin`
- [ ] `ADMIN_PASSWORD` = `GodMode?2023`

#### Optional (if you use these)
- [ ] `OPENAI_API_KEY` = `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`
- [ ] `STRIPE_SECRET_KEY` = (add if you set up Stripe)
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = (add if you set up Stripe)

**Important**: 
- Select **"Production"** environment for all variables
- You can also select "Preview" and "Development" if you want them for all environments

### ✅ Step 5: Deploy!
1. Click **"Deploy"**
2. Wait 2-5 minutes
3. Your site will be live!

### ✅ Step 6: After First Deployment

1. **Update NEXTAUTH_URL**:
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Find `NEXTAUTH_URL`
   - Update to: `https://your-actual-vercel-url.vercel.app`
   - Redeploy

2. **Run Database Migration**:
   ```bash
   # Run locally (will update production database)
   DATABASE_URL="postgresql://postgres.pmdlnlrlrqfwhawwcaxl:F6BfH!q5AFcDRdc%40@aws-1-eu-west-1.pooler.supabase.com:5432/postgres" npx prisma db push
   ```

3. **Test Your Site**:
   - Visit your Vercel URL
   - Test registration
   - Test admin login at `/admin`
   - Test features

---

## Quick Copy-Paste for Environment Variables

When adding variables in Vercel, copy these exact names and values:

```
DATABASE_URL
postgresql://postgres.pmdlnlrlrqfwhawwcaxl:F6BfH!q5AFcDRdc%40@aws-1-eu-west-1.pooler.supabase.com:5432/postgres

NEXT_PUBLIC_SUPABASE_URL
https://pmdlnlrlrqfwhawwcaxl.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtZGxubHJscnFmd2hhd3djYXhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0Nzc2MjksImV4cCI6MjA3NzA1MzYyOX0.UsPNZMZ9XHDSPZILMN_QToG7OuEg4AggeyO0la8RsuY

SUPABASE_SERVICE_ROLE_KEY
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtZGxubHJscnFmd2hhd3djYXhsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTQ3NzYyOSwiZXhwIjoyMDc3MDUzNjI5fQ.8Eg0K99K9u8ByKnfsZ1c11lAAq2T9BtvnPi-GPONYlk

AUTH_SESSION_SECRET
iI0+TePYt46eVxqPFO8jIQe3Ptlm+n7GiIIvKjMTR5I=

NEXTAUTH_SECRET
iI0+TePYt46eVxqPFO8jIQe3Ptlm+n7GiIIvKjMTR5I=

NEXTAUTH_URL
https://your-project.vercel.app

ADMIN_USERNAME
admin

ADMIN_PASSWORD
GodMode?2023

OPENAI_API_KEY
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
```

⚠️ **Note**: Update `NEXTAUTH_URL` after deployment with your actual Vercel URL!

---

## Troubleshooting

### Build Fails?
- Check all environment variables are added
- Ensure `AUTH_SESSION_SECRET` is set (32+ characters)

### Site Works But Authentication Doesn't?
- Update `NEXTAUTH_URL` to your actual Vercel URL
- Redeploy after updating

### Database Errors?
- Run `npx prisma db push` with production DATABASE_URL
- Check Supabase dashboard to ensure database is accessible

---

## Need Detailed Guide?

See `VERCEL_DEPLOYMENT.md` for complete step-by-step instructions.

