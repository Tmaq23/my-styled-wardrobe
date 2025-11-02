param(
  [string]$ZipPath = "mystyledwardrobe-standalone.zip"
)

$ErrorActionPreference = "Stop"

Write-Host "Installing deps..." -ForegroundColor Cyan
npm ci

Write-Host "Building standalone..." -ForegroundColor Cyan
npm run build

$standalone = Join-Path ".next" "standalone"
$staticDir = Join-Path ".next" "static"
if (!(Test-Path $standalone)) {
  throw ".next/standalone not found. Ensure next.config.mjs has output: 'standalone' and build succeeded."
}

$dist = Join-Path (Get-Location) "deploy-dist"
if (Test-Path $dist) { Remove-Item -Recurse -Force $dist }
New-Item -ItemType Directory -Force -Path $dist | Out-Null

# Copy runtime bundle
Copy-Item $standalone -Destination (Join-Path $dist ".next") -Recurse
Copy-Item $staticDir -Destination (Join-Path $dist ".next") -Recurse

# Public assets
if (Test-Path "public") { Copy-Item "public" -Destination (Join-Path $dist "public") -Recurse }

# Minimal files
Copy-Item "package.json" -Destination $dist
Copy-Item "next.config.mjs" -Destination $dist -ErrorAction SilentlyContinue

# Start helper
Copy-Item "start-windows.cmd" -Destination $dist -ErrorAction SilentlyContinue

# IIS web.config (for hosts using IIS + iisnode instead of Plesk Node.js)
if (Test-Path "deploy/iis-web.config") {
  Copy-Item "deploy/iis-web.config" -Destination (Join-Path $dist "web.config")
}

# Optional env example
if (Test-Path ".env.example") { Copy-Item ".env.example" -Destination (Join-Path $dist "README.env.example.txt") }

# Zip it
if (Test-Path $ZipPath) { Remove-Item $ZipPath -Force }
Write-Host "Creating ZIP at $ZipPath..." -ForegroundColor Cyan
Compress-Archive -Path (Join-Path $dist "*") -DestinationPath $ZipPath

Write-Host "Done. Upload $ZipPath via FTP and unzip on the server folder for your app." -ForegroundColor Green
