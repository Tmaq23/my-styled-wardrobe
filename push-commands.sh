#!/bin/bash
# Script to push to GitHub with authentication

echo "🚀 Pushing to GitHub..."
echo ""
echo "You'll need to enter:"
echo "  Username: Tmaq23"
echo "  Password: Your Personal Access Token (not your GitHub password)"
echo ""
echo "Get token at: https://github.com/settings/tokens"
echo ""

# Try to push
git push -u origin main

echo ""
echo "✅ Done! Check your repository at:"
echo "   https://github.com/Tmaq23/my-styled-wardrobe"
echo ""

