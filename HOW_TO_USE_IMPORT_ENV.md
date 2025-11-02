# How to Use Import.env File

## ⚠️ Important Note

**Vercel does NOT support direct .env file import.** You cannot upload this file directly.

However, this file serves as a **reference** - use it to copy values when adding variables manually in Vercel.

---

## Step-by-Step: Using Import.env

### Step 1: Open the File
Open `Import.env` in your project folder - you'll see all your environment variables listed.

### Step 2: Go to Vercel Dashboard
1. Go to: https://vercel.com/dashboard
2. Click on your project
3. Go to: **Settings** → **Environment Variables**

### Step 3: Add Each Variable Manually

For each line in `Import.env` that doesn't start with `#`:

1. **Copy the variable name** (left side of `=`)
   - Example: `DATABASE_URL`

2. **Copy the variable value** (right side of `=`, remove quotes)
   - Example: `postgresql://postgres.pmdlnlrlrqfwhawwcaxl:F6BfH!q5AFcDRdc%40@aws-1-eu-west-1.pooler.supabase.com:5432/postgres`

3. **In Vercel:**
   - Click **"Add New"**
   - Paste the **Name**
   - Paste the **Value**
   - Select **Production** environment
   - Click **"Save"**

4. **Repeat** for each variable

---

## Variables to Add (from Import.env)

Copy these from `Import.env`:

1. ✅ `DATABASE_URL`
2. ✅ `NEXT_PUBLIC_SUPABASE_URL`
3. ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. ✅ `SUPABASE_SERVICE_ROLE_KEY`
5. ✅ `AUTH_SESSION_SECRET`
6. ✅ `NEXTAUTH_SECRET`
7. ✅ `NEXTAUTH_URL` (⚠️ update with your actual Vercel URL after deployment)
8. ✅ `ADMIN_USERNAME`
9. ✅ `ADMIN_PASSWORD`
10. ✅ `OPENAI_API_KEY`

---

## Quick Reference Format

Each line in `Import.env` looks like:
```
VARIABLE_NAME="value here"
```

When adding to Vercel:
- **Name**: `VARIABLE_NAME`
- **Value**: `value here` (remove the quotes)

---

## Alternative: Use the Setup Guide

If you prefer detailed instructions, see:
- **`VERCEL_ENV_SETUP_GUIDE.md`** - Step-by-step with all values listed

---

## After Adding All Variables

1. **Redeploy** your site:
   - Go to **Deployments** tab
   - Click **"..."** on latest deployment
   - Click **"Redeploy"**

2. **Update NEXTAUTH_URL**:
   - After deployment, copy your Vercel URL
   - Update `NEXTAUTH_URL` variable with the actual URL
   - Redeploy again

---

## Summary

The `Import.env` file is in your project root folder. Use it as a reference to copy values when adding variables in Vercel Dashboard manually.

**File Location:** `/Users/marldonsmalling/my-styled-wardrobe/Import.env`

