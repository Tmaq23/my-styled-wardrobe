# Push to GitHub - Step by Step Guide

## Quick Steps

### Step 1: Create GitHub Repository

1. Go to [https://github.com/new](https://github.com/new)
2. **Repository name**: `my-styled-wardrobe` (or your preferred name)
3. **Description**: "My Styled Wardrobe - AI-powered fashion styling platform"
4. **Visibility**: 
   - Choose **Private** (recommended for your project)
   - Or **Public** (if you want it open source)
5. **DO NOT** check:
   - ❌ Add a README file
   - ❌ Add .gitignore
   - ❌ Choose a license
6. Click **"Create repository"**

### Step 2: Copy Repository URL

After creating, GitHub will show you a URL like:
- `https://github.com/YOUR_USERNAME/my-styled-wardrobe.git`

**Copy this URL** - you'll need it in Step 4!

---

## Step 3: Prepare Your Local Repository

Run these commands in your terminal:

```bash
cd /Users/marldonsmalling/my-styled-wardrobe

# Add all files (except those in .gitignore like .env.local)
git add .

# Make your first commit
git commit -m "Initial commit: My Styled Wardrobe site"

# Set the main branch
git branch -M main
```

---

## Step 4: Connect to GitHub and Push

Replace `YOUR_USERNAME` and `REPO_NAME` with your actual GitHub username and repository name:

```bash
# Add GitHub as remote (replace with YOUR repository URL)
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# Push to GitHub
git push -u origin main
```

**If prompted for credentials:**
- **Username**: Your GitHub username
- **Password**: Use a **Personal Access Token** (not your GitHub password)
  - Get token: GitHub → Settings → Developer settings → Personal access tokens → Generate new token
  - Give it `repo` permissions

---

## Alternative: Using GitHub CLI (Easier)

If you have GitHub CLI installed:

```bash
# Install GitHub CLI (if not installed)
# macOS: brew install gh

# Login to GitHub
gh auth login

# Create repo and push in one command
gh repo create my-styled-wardrobe --private --source=. --remote=origin --push
```

---

## What Gets Pushed

✅ **Will be pushed:**
- All your code files
- Configuration files
- Documentation

❌ **Won't be pushed (protected by .gitignore):**
- `.env.local` (your secrets)
- `node_modules/`
- `.next/` (build files)
- Other sensitive files

---

## Verify Everything is Pushed

1. Go to your GitHub repository page
2. You should see all your files
3. You should **NOT** see `.env.local` (good!)

---

## Next Step: Deploy to Vercel

Once your code is on GitHub:

1. Go to [https://vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Add environment variables (from your `.env.local` - but don't copy the file!)
4. Deploy!

See `VERCEL_DEPLOYMENT.md` for detailed Vercel setup.

---

## Troubleshooting

### "Remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
```

### "Authentication failed"
- Use Personal Access Token instead of password
- Or use SSH: `git remote set-url origin git@github.com:USERNAME/REPO.git`

### "Large file" error
- If you have large files, they might need Git LFS
- Or exclude them in `.gitignore`

---

## Security Reminder

⚠️ **Never commit:**
- `.env.local` (already ignored)
- API keys
- Passwords
- Secret keys

Your `.gitignore` already protects these files!

