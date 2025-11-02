# Copy to .env.local for local dev, or add as Environment Variables in Vercel

# Enable keyless local mode (no external APIs)
# Set to 1 to use local sample data for copy + looks (unique images from catalog)
KEYLESS_MODE=1

# AI mode (optional). If set, AI will analyze uploaded photos and generate looks.
# OPENAI_API_KEY=sk-...
# OPENAI_MODEL=gpt-5

# Image search enrichment (optional but recommended if using AI mode)
# If Google CSE is not configured, the app falls back to Bing Images.
# BING_SEARCH_KEY=...
# BING_IMAGES_ENDPOINT=https://api.bing.microsoft.com/v7.0/images/search

# Google Custom Search (optional)
# GOOGLE_API_KEY=...
# GOOGLE_CSE_ID=...
