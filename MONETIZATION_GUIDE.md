# Monetization Implementation Guide

## 🏗️ Architecture Overview

### Tech Stack
- **Payments**: Stripe (subscriptions + one-time purchases)
- **Auth & Database**: Supabase
- **Affiliate Links**: Skimlinks API
- **Email**: Resend
- **File Storage**: Supabase Storage (for lookbook PDFs)

### Environment Variables Required
```env
# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Skimlinks
SKIMLINKS_API_KEY=your_api_key
SKIMLINKS_PUBLISHER_ID=your_publisher_id

# Resend
RESEND_API_KEY=re_...

# Supabase (if using)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App
NEXT_PUBLIC_APP_URL=https://mystyledwardrobe.com
```

## 🗄️ Database Schema Extensions

```sql
-- User subscriptions
CREATE TABLE users_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  tier TEXT CHECK (tier IN ('free', 'premium', 'stylist_pro')),
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  active_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Usage tracking
CREATE TABLE user_limits (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  items_uploaded INTEGER DEFAULT 0,
  outfits_generated INTEGER DEFAULT 0,
  tier_limit_items INTEGER DEFAULT 6,
  tier_limit_outfits INTEGER DEFAULT 10,
  reset_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Affiliate tracking
CREATE TABLE affiliate_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  product_url TEXT NOT NULL,
  affiliate_url TEXT NOT NULL,
  clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  purchase_tracked BOOLEAN DEFAULT FALSE,
  commission_amount DECIMAL(10,2)
);

-- Lookbooks
CREATE TABLE lookbooks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  body_shape TEXT NOT NULL,
  season TEXT NOT NULL,
  file_url TEXT,
  preview_images JSONB,
  outfits JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User purchases
CREATE TABLE user_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  lookbook_id TEXT REFERENCES lookbooks(id),
  stripe_payment_id TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email tracking
CREATE TABLE email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  email_type TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE
);

-- User engagement analytics
CREATE TABLE user_engagement (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  wardrobe_items_worn INTEGER DEFAULT 0,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  email_opens INTEGER DEFAULT 0,
  outfit_views INTEGER DEFAULT 0,
  total_sessions INTEGER DEFAULT 0,
  avg_session_duration INTERVAL DEFAULT '0 minutes'
);
```

## 📱 Frontend Integration Points

### 1. Add to style-interface page:
```tsx
import LookbookShop from '../../components/LookbookShop';
import UpgradePrompt from '../../components/UpgradePrompt';

// Add after outfit recommendations
{shopResults && (
  <LookbookShop 
    bodyShape={bodyShape} 
    season="Autumn" // or detect current season
  />
)}
```

### 2. Update WardrobeUploader with limits check:
```tsx
const handleFileUpload = async (files: File[]) => {
  // Check limits before upload
  const limitCheck = await fetch('/api/check-limits', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: 'current-user', action: 'upload_item' })
  }).then(r => r.json());
  
  if (!limitCheck.allowed) {
    setShowUpgradePrompt(true);
    return;
  }
  
  // Proceed with upload...
};
```

### 3. Add affiliate tracking to product links:
```tsx
import { trackAffiliateClick } from '../lib/affiliate';

const handleProductClick = async (product: any) => {
  await trackAffiliateClick('user-id', product.originalUrl, product.url);
  window.open(product.url, '_blank');
};
```

## 🔄 Retention Features Implementation

### Weekly Email Automation (cron job or Vercel cron):
```js
// api/cron/weekly-emails.js
export default async function handler(req, res) {
  // Get active users who haven't been emailed this week
  const users = await getActiveUsers();
  
  for (const user of users) {
    await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'weekly_nudge',
        userEmail: user.email,
        userProfile: user.profile
      })
    });
  }
  
  res.json({ sent: users.length });
}
```

## 🎯 Next Steps for Implementation

1. **Set up Stripe**: Create products and prices in Stripe dashboard
2. **Configure Skimlinks**: Get API credentials and set up affiliate account
3. **Set up Resend**: Verify domain and get API key
4. **Database setup**: Run the SQL schema on your database
5. **Test payments**: Use Stripe test mode for initial testing
6. **Add authentication**: Implement user accounts (Supabase Auth recommended)
7. **Deploy lookbook storage**: Set up file storage for PDF downloads

## 💰 Expected Revenue Potential

**Monthly Projections (conservative estimates):**
- 100 Premium users × £7.99 = £799/month
- 20 Stylist Pro users × £19.99 = £400/month  
- 50 lookbook sales × £12.99 = £650/month
- Affiliate commissions (5% on £10k sales) = £500/month

**Total: ~£2,349/month potential revenue**

Scale these numbers based on your user acquisition strategy and market size.
