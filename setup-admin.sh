#!/bin/bash

# Setup Admin Password for My Styled Wardrobe
# This script helps configure the admin dashboard password

echo "╔═══════════════════════════════════════════════════════════════════╗"
echo "║          MY STYLED WARDROBE - ADMIN SETUP                         ║"
echo "╚═══════════════════════════════════════════════════════════════════╝"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ .env.local file not found!"
    echo "Creating .env.local file..."
    touch .env.local
fi

# Check if ADMIN_PASSWORD already exists
if grep -q "ADMIN_PASSWORD" .env.local; then
    echo "⚠️  ADMIN_PASSWORD already exists in .env.local"
    echo ""
    read -p "Do you want to update it? (y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # Remove old ADMIN_PASSWORD line
        sed -i.bak '/^ADMIN_PASSWORD=/d' .env.local
        # Add new one
        echo "" >> .env.local
        echo "# Admin Dashboard Password" >> .env.local
        echo "ADMIN_PASSWORD=GodMode?2023" >> .env.local
        echo "✅ Admin password updated to: GodMode?2023"
    else
        echo "❌ Cancelled. Password not updated."
        exit 0
    fi
else
    # Add ADMIN_PASSWORD
    echo "" >> .env.local
    echo "# Admin Dashboard Password" >> .env.local
    echo "ADMIN_PASSWORD=GodMode?2023" >> .env.local
    echo "✅ Admin password set to: GodMode?2023"
fi

echo ""
echo "═══════════════════════════════════════════════════════════════════"
echo "✅ Admin setup complete!"
echo ""
echo "Next steps:"
echo "1. Restart your dev server: npm run dev"
echo "2. Access admin panel at: http://localhost:3000/admin"
echo "3. Login with password: GodMode?2023"
echo ""
echo "═══════════════════════════════════════════════════════════════════"




