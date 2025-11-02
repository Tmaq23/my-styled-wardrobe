# Deployment Guide - Already Using Supabase! 🎉

Since you're already using Supabase, deployment is simpler! This guide focuses on deploying your Next.js app with your existing Supabase setup.

## ✅ What You Already Have

- ✅ Supabase PostgreSQL database
- ✅ Database schema configured (Prisma)
- ✅ Supabase client packages installed
- ✅ Connection string ready

## 🚀 Quick Deployment Options

### Option 1: Vercel (Recommended - 5 minutes)

**Perfect for:** Fast deployment, automatic SSL, zero server management

**Steps:**

1. **Push code to GitHub** (if not already):
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy on Vercel:**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Add environment variables from your `.env.local`:
     - `DATABASE_URL` (your Supabase connection string)
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`
     - `AUTH_SESSION_SECRET` (generate: `openssl rand -base64 32`)
     - `NEXTAUTH_SECRET` (same as AUTH_SESSION_SECRET)
     - `NEXTAUTH_URL` (your production URL: `https://yourdomain.com`)
     - `ADMIN_USERNAME`
     - `ADMIN_PASSWORD`
     - `OPENAI_API_KEY` (optional)

3. **After deployment:**
   ```bash
   # In Vercel dashboard → Deployments → View Function Logs
   # Run Prisma migrations (if needed):
   npx prisma db push
   ```

4. **Done!** Your site is live with Supabase database.

---

### Option 2: Railway ($5/month)

**Perfect for:** Simple deployment with included database (but you already have Supabase!)

**Steps:**
1. Go to https://railway.app
2. New Project → Deploy from GitHub
3. Add all environment variables (same as Vercel)
4. Deploy!

---

### Option 3: Fasthost VPS/Dedicated Server

**If you want to use your existing Fasthost infrastructure:**

**Requirements:**
- VPS or Dedicated Server (Node.js support)
- Your Supabase database (already set up ✅)

**Steps:**

1. **SSH into server:**
   ```bash
   ssh user@your-server-ip
   ```

2. **Setup Node.js:**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   sudo npm install -g pm2
   ```

3. **Deploy app:**
   ```bash
   cd /var/www
   git clone your-repo-url mystyledwardrobe
   cd mystyledwardrobe
   npm install
   ```

4. **Create production environment:**
   ```bash
   cp env.template .env.production
   nano .env.production
   # Copy all values from your .env.local, especially:
   # - DATABASE_URL (your Supabase connection)
   # - All Supabase keys
   # - Change NEXTAUTH_URL to your production domain
   ```

5. **Build and start:**
   ```bash
   npx prisma generate
   npm run build
   pm2 start ecosystem.config.js
   pm2 save
   ```

6. **Setup Nginx** (reverse proxy):
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

7. **Setup SSL:**
   ```bash
   sudo certbot --nginx -d yourdomain.com
   ```

---

## 📋 Environment Variables Checklist

**Copy from your `.env.local` to production:**

### From Supabase (you already have these):
- ✅ `DATABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`

### New for Production:
- `AUTH_SESSION_SECRET` (generate new one: `openssl rand -base64 32`)
- `NEXTAUTH_SECRET` (same as above)
- `NEXTAUTH_URL` (change to: `https://yourdomain.com`)
- `ADMIN_USERNAME` (your admin email)
- `ADMIN_PASSWORD` (strong password!)

### Optional:
- `OPENAI_API_KEY` (if using AI features)
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` (if using Google OAuth)

---

## 🗄️ Database Migration

Since you're using Supabase, your database should already be set up. But verify:

1. **Check tables exist:**
   - Go to Supabase Dashboard → Table Editor
   - Should see: `users`, `accounts`, `sessions`, `user_subscriptions`, etc.

2. **If tables missing, run:**
   ```bash
   npx prisma db push
   ```

3. **Generate Prisma Client:**
   ```bash
   npx prisma generate
   ```

---

## 🔒 Security Checklist

Before going live:

- [ ] `AUTH_SESSION_SECRET` is 32+ characters (generate new for production)
- [ ] `ADMIN_PASSWORD` is strong and unique
- [ ] `NEXTAUTH_URL` matches your production domain exactly
- [ ] All Supabase keys are correct
- [ ] Database connection string is correct
- [ ] SSL/HTTPS enabled
- [ ] Test admin login works
- [ ] Test user registration works

---

## 🧪 Testing After Deployment

1. **Health Check:**
   Visit: `https://yourdomain.com/healthcheck`

2. **Admin Login:**
   - Go to `/admin`
   - Login with `ADMIN_USERNAME` and `ADMIN_PASSWORD`

3. **User Registration:**
   - Go to `/auth/signup`
   - Create test account
   - Verify it appears in Supabase Dashboard → Table Editor → `users`

4. **Database Connection:**
   - Check Supabase Dashboard → Logs
   - Verify no connection errors

---

## 🎯 Recommended: Vercel + Supabase

**Best Setup:**
- **Frontend/API:** Vercel (free tier)
- **Database:** Your existing Supabase (free tier)
- **Total Cost:** $0/month
- **Deployment Time:** 5 minutes

**Why this combo:**
- Vercel auto-deploys from Git
- Supabase provides database + storage
- Both have generous free tiers
- Perfect integration together

---

## 💡 Tips

1. **Keep Supabase project active:**
   - Free tier pauses after 1 week of inactivity
   - Just visit Supabase dashboard occasionally

2. **Backup your database:**
   - Supabase Dashboard → Settings → Database
   - Can download backups

3. **Monitor usage:**
   - Vercel: Dashboard shows bandwidth/storage
   - Supabase: Dashboard shows database size/API calls

4. **Use Vercel Environment Variables:**
   - Add them in Vercel Dashboard → Settings → Environment Variables
   - Different values for Production/Preview/Development

---

## 🆘 Troubleshooting

**Database Connection Errors:**
- Verify `DATABASE_URL` is correct (escape special characters in password)
- Check Supabase project is active (not paused)
- Verify IP allowlist in Supabase (Settings → Database → Connection Pooling)

**Session Errors:**
- Ensure `AUTH_SESSION_SECRET` is set (32+ chars)
- Verify `NEXTAUTH_URL` matches your actual domain
- Clear browser cookies

**Build Failures:**
- Check Node.js version (18.17.0+)
- Verify all environment variables are set
- Check Vercel build logs

---

## ✅ You're Ready!

Since you already have Supabase configured, you're 90% done. Just:
1. Choose hosting (Vercel recommended)
2. Copy environment variables
3. Deploy
4. Done! 🎉

