# How to Add Environment Variables to Vercel

## Step-by-Step Instructions

### Step 1: Open Your Vercel Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your project (`my-styled-wardrobe`)
3. Click on **"Settings"** (top menu)
4. Click on **"Environment Variables"** (left sidebar)

### Step 2: Add Each Variable

For each variable below, follow these steps:

1. Click **"Add New"** button
2. Enter the **Name** (left field)
3. Enter the **Value** (right field)
4. Select **Environment(s)**:
   - Check **Production** ✅
   - Optionally check **Preview** and **Development** if you want them there too
5. Click **"Save"**
6. Repeat for each variable

---

## Variables to Add (in order)

### 1. Database Connection
**Name:** `DATABASE_URL`  
**Value:** `postgresql://postgres.pmdlnlrlrqfwhawwcaxl:F6BfH!q5AFcDRdc%40@aws-1-eu-west-1.pooler.supabase.com:5432/postgres`

### 2. Supabase URL
**Name:** `NEXT_PUBLIC_SUPABASE_URL`  
**Value:** `https://pmdlnlrlrqfwhawwcaxl.supabase.co`

### 3. Supabase Anon Key
**Name:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`  
**Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtZGxubHJscnFmd2hhd3djYXhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0Nzc2MjksImV4cCI6MjA3NzA1MzYyOX0.UsPNZMZ9XHDSPZILMN_QToG7OuEg4AggeyO0la8RsuY`

### 4. Supabase Service Role Key
**Name:** `SUPABASE_SERVICE_ROLE_KEY`  
**Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtZGxubHJscnFmd2hhd3djYXhsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTQ3NzYyOSwiZXhwIjoyMDc3MDUzNjI5fQ.8Eg0K99K9u8ByKnfsZ1c11lAAq2T9BtvnPi-GPONYlk`

### 5. Auth Session Secret
**Name:** `AUTH_SESSION_SECRET`  
**Value:** `iI0+TePYt46eVxqPFO8jIQe3Ptlm+n7GiIIvKjMTR5I=`

### 6. NextAuth Secret
**Name:** `NEXTAUTH_SECRET`  
**Value:** `iI0+TePYt46eVxqPFO8jIQe3Ptlm+n7GiIIvKjMTR5I=`

### 7. NextAuth URL ⚠️
**Name:** `NEXTAUTH_URL`  
**Value:** `https://your-project-name.vercel.app`  
**⚠️ IMPORTANT:** Replace `your-project-name` with your actual Vercel project name!  
You'll find it after your first deployment - it will be something like `my-styled-wardrobe-abc123.vercel.app`

### 8. Admin Username
**Name:** `ADMIN_USERNAME`  
**Value:** `admin`

### 9. Admin Password
**Name:** `ADMIN_PASSWORD`  
**Value:** `GodMode?2023`

### 10. OpenAI API Key (Optional)
**Name:** `OPENAI_API_KEY`  
**Value:** `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`

---

## Quick Copy-Paste Checklist

Use this to track what you've added:

- [ ] `DATABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `AUTH_SESSION_SECRET`
- [ ] `NEXTAUTH_SECRET`
- [ ] `NEXTAUTH_URL` (update with your actual Vercel URL!)
- [ ] `ADMIN_USERNAME`
- [ ] `ADMIN_PASSWORD`
- [ ] `OPENAI_API_KEY`

---

## After Adding Variables

1. **Redeploy** your site:
   - Go to **"Deployments"** tab
   - Click the **"..."** menu on the latest deployment
   - Click **"Redeploy"**

2. **Update NEXTAUTH_URL**:
   - After first successful deployment, copy your Vercel URL
   - Go back to Environment Variables
   - Update `NEXTAUTH_URL` with the actual URL
   - Redeploy again

---

## Important Notes

- ✅ All values are already filled in for you
- ⚠️ Make sure to update `NEXTAUTH_URL` after deployment
- ✅ Select **Production** environment for all variables
- ✅ Values are case-sensitive - copy exactly as shown
- 🔒 These are your production secrets - keep them secure!

---

## Troubleshooting

### "Variable not found" error
- Make sure you added the variable
- Make sure you selected **Production** environment
- Redeploy after adding variables

### Authentication not working
- Check `NEXTAUTH_URL` matches your actual Vercel URL
- Verify `AUTH_SESSION_SECRET` and `NEXTAUTH_SECRET` are set
- Redeploy after making changes

### Database connection error
- Verify `DATABASE_URL` is correct
- Check Supabase allows connections from Vercel IPs
- Make sure database is running

