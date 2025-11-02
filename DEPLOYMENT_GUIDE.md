# Deployment Guide - My Styled Wardrobe

## Overview

This Next.js 15 application requires:
- **Node.js** 18.17.0 or higher
- **PostgreSQL** database
- **Environment variables** for configuration
- **PM2 or process manager** (for VPS/hosting)

## Deployment Options

### Option 1: Vercel (Recommended - Easiest) ⭐

**Best for:** Quick deployment, automatic SSL, global CDN, zero server management

**Pros:**
- Free tier available
- Automatic deployments from Git
- Built-in PostgreSQL (via integrations)
- Zero configuration needed
- Global CDN and edge functions

**Steps:**
1. Push your code to GitHub/GitLab/Bitbucket
2. Go to [vercel.com](https://vercel.com) and sign up
3. Click "New Project" → Import your repository
4. Add environment variables (see `.env.example`)
5. Vercel automatically detects Next.js and deploys
6. Your site is live in 2 minutes!

**Database:** Use Vercel Postgres (free tier: 256 MB, $20/month for production)

---

### Option 2: Railway 🚂

**Best for:** Simple deployment with database included

**Pros:**
- Includes PostgreSQL database
- $5/month starter plan
- Simple UI
- Automatic HTTPS

**Steps:**
1. Go to [railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Add PostgreSQL service
4. Set environment variables
5. Deploy!

---

### Option 3: Fasthost / Traditional Hosting

**Best for:** If you already have Fasthost and want to use existing infrastructure

#### Requirements:
- **VPS or Dedicated Server** (shared hosting won't work)
- Node.js 20.x installed
- PostgreSQL database
- PM2 or similar process manager

#### Deployment Steps:

**1. Prepare Server Environment**
```bash
# SSH into your server
ssh user@your-server-ip

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install PostgreSQL (if not already installed)
sudo apt-get install postgresql postgresql-contrib
```

**2. Setup PostgreSQL Database**
```bash
sudo -u postgres psql
CREATE DATABASE mystyledwardrobe;
CREATE USER wardrobeuser WITH PASSWORD 'your-secure-password';
GRANT ALL PRIVILEGES ON DATABASE mystyledwardrobe TO wardrobeuser;
\q
```

**3. Deploy Application**
```bash
# Clone your repository
cd /var/www
git clone your-repo-url mystyledwardrobe
cd mystyledwardrobe

# Install dependencies
npm install

# Create production environment file
nano .env.production
# (Add all variables from .env.example)

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# Build the application
npm run build
```

**4. Configure PM2**
```bash
# Use the existing ecosystem.config.js or create one
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # Follow instructions to enable auto-start
```

**5. Setup Nginx Reverse Proxy** (if using Nginx)
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**6. Setup SSL (Let's Encrypt)**
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

---

### Option 4: Docker Deployment 🐳

**Best for:** Consistent deployments, containerized environments

**Prerequisites:** Docker and Docker Compose installed

**Steps:**
```bash
# Build and run with Docker Compose
docker-compose up -d

# Or build manually
docker build -t mystyledwardrobe .
docker run -p 3000:3000 --env-file .env.production mystyledwardrobe
```

---

## Environment Variables Required

Copy `.env.example` to `.env.production` and fill in all values:

### Critical (Required):
- `DATABASE_URL` - PostgreSQL connection string
- `AUTH_SESSION_SECRET` - 32+ character random string for session signing
- `ADMIN_USERNAME` - Admin login email
- `ADMIN_PASSWORD` - Admin password
- `NEXTAUTH_URL` - Your production URL (e.g., https://yourdomain.com)

### Optional but Recommended:
- `OPENAI_API_KEY` - For AI features (body analysis, recommendations)
- `GOOGLE_CLIENT_ID` - For Google OAuth (if using)
- `GOOGLE_CLIENT_SECRET` - For Google OAuth (if using)

### Generate AUTH_SESSION_SECRET:
```bash
# On Linux/Mac:
openssl rand -base64 32

# Or use online generator:
# https://generate-secret.vercel.app/32
```

---

## Pre-Deployment Checklist

- [ ] All environment variables set in production
- [ ] Database created and migrations run (`prisma db push`)
- [ ] `AUTH_SESSION_SECRET` generated (32+ characters)
- [ ] `ADMIN_USERNAME` and `ADMIN_PASSWORD` configured
- [ ] `NEXTAUTH_URL` set to production domain
- [ ] Domain DNS configured (A record pointing to server)
- [ ] SSL certificate installed (for HTTPS)
- [ ] Build completes successfully (`npm run build`)
- [ ] Test locally in production mode (`npm run build && npm start`)

---

## Post-Deployment

### 1. Verify Health Check
Visit: `https://yourdomain.com/healthcheck`

### 2. Test Admin Login
- Go to `/admin`
- Login with `ADMIN_USERNAME` and `ADMIN_PASSWORD`
- Verify admin functions work

### 3. Test User Registration
- Go to `/auth/signup`
- Create a test account
- Verify login works

### 4. Monitor Logs
```bash
# If using PM2
pm2 logs mystyledwardrobe

# If using Docker
docker-compose logs -f
```

---

## Troubleshooting

### Build Fails
- Check Node.js version: `node --version` (must be >=18.17.0)
- Clear cache: `rm -rf .next node_modules/.cache`
- Rebuild: `npm run build`

### Database Connection Errors
- Verify `DATABASE_URL` format: `postgresql://user:password@host:5432/database`
- Check PostgreSQL is running: `sudo systemctl status postgresql`
- Test connection: `psql $DATABASE_URL`

### Session Errors
- Ensure `AUTH_SESSION_SECRET` is set and 32+ characters
- Clear browser cookies
- Verify `NEXTAUTH_URL` matches your actual domain

### 500 Errors
- Check application logs
- Verify all environment variables are set
- Check database migrations completed

---

## Fasthost-Specific Notes

If using Fasthost:

1. **Check Node.js Support**: Contact Fasthost support to confirm your plan supports Node.js applications
2. **Use Plesk**: If available, use Plesk's Node.js module for easier management
3. **Database**: Either use Fasthost's PostgreSQL hosting or external service (Supabase, Neon, etc.)
4. **Port Configuration**: Ensure port 3000 is accessible (or configure custom port)

### Alternative: Use External Database
If Fasthost doesn't offer PostgreSQL:
- **Supabase** (free tier: 500MB, good for development)
- **Neon** (free tier: 256MB, serverless Postgres)
- **Railway Postgres** ($5/month starter)
- **Vercel Postgres** (included with Vercel hosting)

Then update `DATABASE_URL` to point to external database.

---

## Recommended Setup for Production

1. **Hosting**: Vercel (easiest) or Railway
2. **Database**: Supabase Postgres (free tier) or Vercel Postgres
3. **File Storage**: Vercel Blob Storage or AWS S3 (for user uploads)
4. **Monitoring**: Vercel Analytics (included) or Sentry (for error tracking)

---

## Support

For issues:
1. Check application logs
2. Verify environment variables
3. Test database connection
4. Review Next.js build output

