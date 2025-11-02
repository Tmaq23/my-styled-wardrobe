# Deploy to Vercel - Step by Step Guide

This guide will walk you through deploying your My Styled Wardrobe site to Vercel.

## Prerequisites

✅ You're logged into Vercel  
✅ Your code is ready to deploy  
✅ You have your environment variables ready

---

## Method 1: Deploy via Vercel Dashboard (Recommended for First Time)

### Step 1: Push Your Code to GitHub

If your code isn't already on GitHub:

```bash
# Initialize git if needed
git init

# Add all files
git add .

# Commit
git commit -m "Ready for Vercel deployment"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

### Step 2: Import Project to Vercel

1. Go to [https://vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"**
3. Select your GitHub repository
4. Click **"Import"**

### Step 3: Configure Project

Vercel will auto-detect Next.js settings. Verify:

- **Framework Preset**: Next.js (should be auto-detected)
- **Root Directory**: `./` (default)
- **Build Command**: `npm run build` (should be auto-detected)
- **Output Directory**: `.next` (should be auto-detected)

### Step 4: Add Environment Variables

**⚠️ IMPORTANT**: Add all these before clicking Deploy!

Click **"Environment Variables"** and add:

#### Required Variables

1. **Database Connection (Supabase)**
   ```
   DATABASE_URL=postgresql://postgres.xxxxx:password@aws-0-eu-west-1.pooler.supabase.com:5432/postgres
   ```

2. **Supabase Configuration**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
   ```

3. **Authentication Secrets**
   ```
   AUTH_SESSION_SECRET=your-32-character-minimum-secret-here
   NEXTAUTH_SECRET=same-value-as-above
   NEXTAUTH_URL=https://your-project-name.vercel.app
   ```

4. **Admin Credentials**
   ```
   ADMIN_USERNAME=admin@yourdomain.com
   ADMIN_PASSWORD=YourStrongPassword123!
   ```

#### Optional Variables (Add if you use these features)

5. **OpenAI (for AI analysis)**
   ```
   OPENAI_API_KEY=sk-proj-...
   ```

6. **Stripe (for payments)**
   ```
   STRIPE_SECRET_KEY=sk_live_... (or sk_test_... for testing)
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_... (or pk_test_... for testing)
   ```

**Note**: For `NEXTAUTH_URL`, use your Vercel URL initially (e.g., `https://my-styled-wardrobe.vercel.app`). You can update it later when you add a custom domain.

### Step 5: Deploy!

1. Click **"Deploy"**
2. Wait 2-5 minutes for the build to complete
3. Your site will be live at: `https://your-project-name.vercel.app`

### Step 6: Run Database Migration

After first deployment, you need to run Prisma migrations:

1. Go to your Vercel project dashboard
2. Click **"Deployments"** → Click the latest deployment
3. Go to **"Functions"** tab
4. Or use Vercel CLI (see Method 2 below)

Alternatively, run this locally with production database:
```bash
DATABASE_URL="your-production-database-url" npx prisma db push
```

---

## Method 2: Deploy via Vercel CLI (Alternative)

### Step 1: Install Vercel CLI

```bash
npm i -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

### Step 3: Deploy

```bash
# First time - will ask questions
vercel

# Production deployment
vercel --prod
```

### Step 4: Set Environment Variables

```bash
# Set a single variable
vercel env add DATABASE_URL

# Or add all at once (interactive)
vercel env add
```

Or use the Vercel Dashboard to add environment variables.

---

## After Deployment

### 1. Test Your Site

- Visit your Vercel URL
- Test user registration
- Test admin login at `/admin`
- Test AI analysis (if OpenAI key is set)
- Test payment flow (if Stripe keys are set)

### 2. Add Custom Domain (Optional)

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your domain
3. Update DNS records as instructed
4. Update `NEXTAUTH_URL` environment variable to your custom domain

### 3. Monitor Your Deployment

- Check **"Deployments"** tab for build status
- Check **"Functions"** tab for server logs
- Use **"Analytics"** for performance monitoring

---

## Troubleshooting

### Build Fails

**Common Issues:**

1. **"Missing environment variable"**
   - Solution: Add all required variables in Vercel Dashboard → Settings → Environment Variables

2. **"Prisma Client not generated"**
   - Solution: Your `package.json` already has `prisma generate` in build script - this should work automatically

3. **"Database connection error"**
   - Solution: Check your `DATABASE_URL` is correct
   - Ensure your Supabase database allows connections from Vercel IPs

### Site Loads But Has Errors

1. **Check Function Logs**:
   - Vercel Dashboard → Your Project → Functions
   - Look for error messages

2. **Check Environment Variables**:
   - Ensure all variables are set for **Production** environment
   - Rebuild after adding variables

3. **Database Migration**:
   ```bash
   # Run this locally pointing to production DB
   DATABASE_URL="your-prod-db-url" npx prisma db push
   ```

### Authentication Not Working

- Check `AUTH_SESSION_SECRET` is set (32+ characters)
- Check `NEXTAUTH_URL` matches your Vercel domain
- Ensure cookies are enabled in browser

---

## Environment Variables Checklist

Copy these from your `.env.local` to Vercel:

### ✅ Required

- [ ] `DATABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `AUTH_SESSION_SECRET` (32+ chars)
- [ ] `NEXTAUTH_SECRET` (same as above)
- [ ] `NEXTAUTH_URL` (your Vercel URL)
- [ ] `ADMIN_USERNAME`
- [ ] `ADMIN_PASSWORD`

### ✅ Optional (if used)

- [ ] `OPENAI_API_KEY`
- [ ] `STRIPE_SECRET_KEY`
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

---

## Quick Reference

### Vercel URLs

- **Dashboard**: https://vercel.com/dashboard
- **New Project**: https://vercel.com/new
- **Documentation**: https://vercel.com/docs

### Your Project

- **Project URL**: `https://your-project-name.vercel.app`
- **Admin Panel**: `https://your-project-name.vercel.app/admin`
- **Database**: Use existing Supabase connection

---

## Next Steps

1. ✅ Deploy to Vercel
2. ✅ Test all features
3. ✅ Add custom domain (optional)
4. ✅ Set up monitoring
5. ✅ Configure Stripe webhooks (if using payments)

---

## Need Help?

- **Vercel Docs**: https://vercel.com/docs
- **Vercel Support**: Available in Dashboard
- **Check logs**: Vercel Dashboard → Your Project → Functions → View logs

Good luck with your deployment! 🚀

