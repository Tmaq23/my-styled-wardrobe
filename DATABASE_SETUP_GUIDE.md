# 🗄️ Database Setup Guide - My Styled Wardrobe

This guide will walk you through setting up Supabase (PostgreSQL) database for your application.

## 📋 Overview

**Database Provider:** Supabase (PostgreSQL)
**ORM:** Prisma
**Why Supabase?**
- Free tier available (up to 500MB database)
- Built-in authentication
- File storage included
- Real-time subscriptions
- Easy to use dashboard

---

## 🚀 Step 1: Create Supabase Account

1. Go to [https://supabase.com](https://supabase.com)
2. Click **"Start your project"** or **"Sign Up"**
3. Sign up with GitHub, Google, or email

---

## 🏗️ Step 2: Create a New Project

1. Once logged in, click **"New Project"**
2. Fill in the details:
   - **Name:** `my-styled-wardrobe` (or any name you prefer)
   - **Database Password:** Create a strong password (save this!)
   - **Region:** Choose closest to your location
   - **Pricing Plan:** Free tier is fine for development
3. Click **"Create new project"**
4. Wait 2-3 minutes for provisioning

---

## 🔑 Step 3: Get Your Database Connection String

1. In your Supabase project dashboard, click **"Settings"** (gear icon in left sidebar)
2. Click **"Database"** in the settings menu
3. Scroll down to **"Connection string"**
4. Select **"URI"** tab
5. Copy the connection string that looks like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
   ```
6. Replace `[YOUR-PASSWORD]` with the database password you created in Step 2

---

## 🔐 Step 4: Get Your Supabase API Keys

1. In Supabase dashboard, go to **"Settings"** → **"API"**
2. Copy these values:
   - **Project URL** (looks like: `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon public** key (starts with `eyJ...`)
   - **service_role** key (starts with `eyJ...`)

---

## ⚙️ Step 5: Update Your .env.local File

1. Open the `.env.local` file in your project root
2. Add/update these environment variables:

```env
# NextAuth Configuration (already exists)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# OpenAI API (already exists)
OPENAI_API_KEY=your-openai-api-key-here

# Database Connection (ADD THIS)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres

# Supabase Configuration (ADD THIS)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...your-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...your-service-role-key
```

3. Save the file

---

## 📦 Step 6: Install Prisma Dependencies

Run this command in your terminal:

```bash
npm install
```

This will install the newly added Prisma dependencies.

---

## 🔄 Step 7: Push Database Schema

This will create all the necessary tables in your Supabase database:

```bash
npm run db:push
```

You should see output like:
```
✔ Generated Prisma Client
✔ The database is now in sync with the Prisma schema
```

---

## ✅ Step 8: Verify Database Setup

### Option A: Using Prisma Studio (GUI)
```bash
npm run db:studio
```

This opens a visual database browser at `http://localhost:5555` where you can see all your tables.

### Option B: Check in Supabase Dashboard
1. Go to Supabase dashboard
2. Click **"Table Editor"** in left sidebar
3. You should see all these tables:
   - `users`
   - `accounts`
   - `sessions`
   - `verificationtokens`
   - `user_subscriptions`
   - `user_limits`
   - `wardrobe_items`
   - `outfits`
   - `affiliate_clicks`
   - `lookbooks`

---

## 📊 Database Schema Overview

### Core Tables:

**Users Table** (`users`)
- Stores user accounts, profiles, body shape, colour palette

**Authentication Tables** (`accounts`, `sessions`, `verificationtokens`)
- Managed by NextAuth for login/signup

**User Subscriptions** (`user_subscriptions`)
- Tracks free/premium/pro tier memberships
- Stripe integration for payments

**User Limits** (`user_limits`)
- Tracks usage (uploaded items, generated outfits)
- Enforces tier limits

**Wardrobe Items** (`wardrobe_items`)
- Stores user's uploaded clothing items
- Categories, colours, seasons, tags

**Outfits** (`outfits`)
- AI-generated outfit combinations
- Links to shopping recommendations

**Affiliate Clicks** (`affiliate_clicks`)
- Tracks clicks on shopping links
- Commission tracking

**Lookbooks** (`lookbooks`)
- PDF style guides
- Collections of outfits

---

## 🛠️ Useful Commands

```bash
# Generate Prisma Client (after schema changes)
npm run db:generate

# Push schema changes to database
npm run db:push

# Open Prisma Studio (database GUI)
npm run db:studio

# View database in browser
# Go to Supabase dashboard → Table Editor
```

---

## 🔒 Security Notes

1. **NEVER commit `.env.local`** to Git (already in `.gitignore`)
2. **Keep your `service_role` key secret** - it has admin access
3. **Use `anon` key in frontend** - it's safe to expose
4. **Rotate keys** if accidentally exposed

---

## 🎯 Next Steps After Database Setup

1. **Test the database connection:**
   - Start your dev server: `npm run dev`
   - Try uploading a body/face photo
   - Your analysis results should now save to database

2. **Enable Row Level Security (RLS) in Supabase:**
   - Go to Supabase → Authentication → Policies
   - Set policies to ensure users can only access their own data

3. **Optional - Enable Stripe for payments:**
   - Add Stripe keys to `.env.local`
   - Users can upgrade to premium tier

---

## 🆘 Troubleshooting

### "Can't reach database server"
- Check your `DATABASE_URL` is correct
- Ensure password is URL-encoded (replace special chars)
- Check Supabase project is active (not paused)

### "Schema is out of sync"
```bash
npm run db:push
```

### "Prisma Client not generated"
```bash
npm run db:generate
```

### "Too many connections"
- Free tier has connection limits
- Use connection pooling (Prisma handles this)
- Close Prisma Studio when not using it

---

## 📚 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth with Prisma](https://next-auth.js.org/adapters/prisma)

---

## ✨ You're All Set!

Your database is now configured and ready to store:
- ✅ User accounts and profiles
- ✅ Body shape and colour palette analysis
- ✅ Wardrobe items
- ✅ Generated outfit recommendations
- ✅ Shopping affiliate tracking
- ✅ Subscription management (when you add Stripe)

Start your app with `npm run dev` and everything should work! 🎉


