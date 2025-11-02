# Quick Deployment Guide

## 🚀 Fastest Option: Deploy to Vercel (5 minutes)

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 2: Deploy on Vercel
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Add environment variables (see `env.template`)
   - **Already have:** `DATABASE_URL` from your Supabase project
   - **Already have:** Supabase keys (if using Supabase features)
4. Click Deploy
5. Done! Your site is live.

**Note:** You're already using Supabase! Just make sure to add your Supabase connection string and keys to Vercel's environment variables.

---

## 🏠 For Fasthost Users

### Option A: If Fasthost supports Node.js (VPS/Dedicated)

1. **SSH into your server:**
   ```bash
   ssh user@your-server-ip
   ```

2. **Install dependencies:**
   ```bash
   cd /var/www
   git clone your-repo-url mystyledwardrobe
   cd mystyledwardrobe
   npm install
   ```

3. **Setup environment:**
   ```bash
   cp env.template .env.production
   nano .env.production  # Edit with your values
   ```

4. **Setup database:**
   - Use external database (recommended): Supabase or Neon (free tiers available)
   - Or install PostgreSQL on server

5. **Build and start:**
   ```bash
   npx prisma generate
   npx prisma db push
   npm run build
   pm2 start ecosystem.config.js
   pm2 save
   ```

6. **Configure Nginx** (if using):
   - Point domain to `localhost:3000`
   - Setup SSL with Let's Encrypt

### Option B: Use External Hosting (Recommended)

If Fasthost doesn't support Node.js, use:

1. **Vercel** (free tier available)
2. **Railway** ($5/month)
3. **Render** (free tier available)

All support Node.js and databases.

---

## 📋 Required Environment Variables

**Since you're already using Supabase, you likely have:**
```
DATABASE_URL=postgresql://... (from Supabase)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

**Still Required for Deployment:**
```
AUTH_SESSION_SECRET=<generate-32-char-string>
NEXTAUTH_SECRET=<same-as-above>
NEXTAUTH_URL=https://yourdomain.com
ADMIN_USERNAME=admin@yourdomain.com
ADMIN_PASSWORD=<strong-password>
```

**Optional (for AI features):**
```
OPENAI_API_KEY=sk-...
```

**Generate AUTH_SESSION_SECRET:**
```bash
openssl rand -base64 32
```

---

## 🎯 Recommended Setup

**For Best Results:**
- **Hosting:** Vercel (easiest) or Railway
- **Database:** ✅ Already using Supabase! Just copy your existing `DATABASE_URL`
- **Total Cost:** $0/month (with free tiers)

**Steps:**
1. ✅ You already have Supabase set up!
2. Copy your Supabase `DATABASE_URL` from your `.env.local` file
3. Deploy to Vercel and add all environment variables
4. Run `npx prisma db push` after first deployment (if needed)
5. Done!

---

## ⚠️ Before Going Live

- [ ] All environment variables set
- [ ] Database created and migrated
- [ ] AUTH_SESSION_SECRET generated (32+ chars)
- [ ] ADMIN_USERNAME and ADMIN_PASSWORD changed
- [ ] Test admin login works
- [ ] Test user registration works
- [ ] SSL certificate installed (HTTPS)
- [ ] Domain DNS configured

---

## 🆘 Need Help?

1. Check `DEPLOYMENT_GUIDE.md` for detailed instructions
2. Verify all environment variables are set
3. Check application logs for errors
4. Test database connection

