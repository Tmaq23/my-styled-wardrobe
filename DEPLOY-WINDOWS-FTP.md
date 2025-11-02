# Deploy via FTP on Windows Hosting (Plesk Node.js or similar)

If your plan supports Node.js in Plesk (or similar control panel), you can deploy by uploading the Next.js standalone bundle and starting it there.

## 1) Build and prepare a ZIP locally

PowerShell on your machine:

```powershell
# from repo root
./scripts/prepare-ftp-package.ps1 -ZipPath mystyledwardrobe-standalone.zip
```

This creates `mystyledwardrobe-standalone.zip` with:
- .next/standalone (server)
- .next/static
- public
- package.json
- next.config.mjs
- start-windows.cmd

## 2) Upload via FTP
- Upload the ZIP to your site directory (e.g., `httpdocs\mystyledwardrobe`)
- Unzip it (via control panel file manager)
- Create `.env.production` with either:
  - `KEYLESS_MODE=1` (no external APIs)
  - Or `OPENAI_API_KEY=...` (plus optional `BING_SEARCH_KEY=...`)

## 3) Start with Plesk Node.js (preferred)
- Enable Node.js for the site or subfolder
- Node version: 20.x
- App root: the folder you unzipped
- Startup file: `.next/standalone/server.js`
- Environment vars: set `PORT=3000` and any keys
- Click Restart

## 4) Bind domain
- Point `mystyledwardrobe.com` and `www.mystyledwardrobe.com` A records to the server IP
- Add/renew SSL (Let’s Encrypt) via the control panel

## Troubleshooting
- 500 error: check Node logs in the panel; ensure `.env.production` has correct keys.
- Blank page: confirm the app responds at `http://localhost:3000` internally.
- No Node feature in your plan: you need RDP to run Node manually or upgrade the hosting tier.
