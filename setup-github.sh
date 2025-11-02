#!/bin/bash
# GitHub Setup Script for My Styled Wardrobe

echo "🚀 Setting up GitHub for My Styled Wardrobe"
echo ""

# Check if git config is set
if [ -z "$(git config user.name)" ] || [ -z "$(git config user.email)" ]; then
  echo "📝 Git needs your name and email to make commits."
  echo ""
  read -p "Enter your name (for git commits): " git_name
  read -p "Enter your email (GitHub email): " git_email
  
  git config --global user.name "$git_name"
  git config --global user.email "$git_email"
  
  echo "✅ Git configured!"
  echo ""
fi

# Create initial commit
echo "📦 Creating initial commit..."
git add .
git commit -m "Initial commit: My Styled Wardrobe - AI-powered fashion styling platform with stylist verification"

# Set main branch
git branch -M main

echo ""
echo "✅ Repository is ready!"
echo ""
echo "📋 Next steps:"
echo "1. Go to https://github.com/new"
echo "2. Create a new repository (name it 'my-styled-wardrobe')"
echo "3. DO NOT initialize with README, .gitignore, or license"
echo "4. After creating, run these commands:"
echo ""
echo "   git remote add origin https://github.com/YOUR_USERNAME/my-styled-wardrobe.git"
echo "   git push -u origin main"
echo ""
echo "   (Replace YOUR_USERNAME with your GitHub username)"
echo ""

