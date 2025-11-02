// Subscription management and tier limits
import { getServerSession } from 'next-auth';
import { authOptions } from './auth';

export type UserTier = 'free' | 'premium' | 'stylist_pro';

export interface TierLimits {
  maxItems: number;
  maxOutfits: number;
  features: string[];
}

export const TIER_LIMITS: Record<UserTier, TierLimits> = {
  free: {
    maxItems: 6,
    maxOutfits: 10,
    features: ['basic_outfits', 'color_analysis']
  },
  premium: {
    maxItems: 30,
    maxOutfits: -1, // unlimited
    features: ['basic_outfits', 'color_analysis', 'seasonal_trends', 'priority_support']
  },
  stylist_pro: {
    maxItems: -1, // unlimited
    maxOutfits: -1,
    features: ['basic_outfits', 'color_analysis', 'seasonal_trends', 'ai_chat', 'budget_breakdown', 'lookbook_requests']
  }
};

export const TIER_PRICING = {
  premium: { monthly: 7.99, yearly: 79.99 },
  stylist_pro: { monthly: 19.99, yearly: 199.99 }
};

// Get user tier (with authentication check)
export async function getUserTier(): Promise<{ tier: UserTier; userId: string | null; isAuthenticated: boolean }> {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return { tier: 'free', userId: null, isAuthenticated: false };
  }
  
  // TODO: Query user's subscription tier from database
  // For now, demo users get premium tier, others get free
  const userTier: UserTier = session.user.email === 'demo@mystyledwardrobe.com' ? 'premium' : 'free';
  
  return { tier: userTier, userId: session.user.id, isAuthenticated: true };
}

// Check if user can perform action
export async function checkUserLimits(action: 'upload_item' | 'generate_outfit'): Promise<{ allowed: boolean; tier: UserTier; reason?: string; isAuthenticated: boolean }> {
  const { tier: userTier, userId, isAuthenticated } = await getUserTier();
  
  // For unauthenticated users, allow limited access
  if (!isAuthenticated) {
    if (action === 'upload_item') {
      return { allowed: false, tier: userTier, reason: 'Please sign in to upload items to your wardrobe.', isAuthenticated };
    }
    // Allow outfit generation for unauthenticated users but with limitations
    return { allowed: true, tier: userTier, isAuthenticated };
  }
  
  // TODO: Query user's current usage from database
  const currentUsage = { items: 5, outfits: 8 }; // placeholder
  
  const limits = TIER_LIMITS[userTier];
  
  if (action === 'upload_item' && limits.maxItems !== -1 && currentUsage.items >= limits.maxItems) {
    return { allowed: false, tier: userTier, reason: `${userTier} tier limited to ${limits.maxItems} items. Upgrade to Premium for 30 items.`, isAuthenticated };
  }
  
  if (action === 'generate_outfit' && limits.maxOutfits !== -1 && currentUsage.outfits >= limits.maxOutfits) {
    return { allowed: false, tier: userTier, reason: `${userTier} tier limited to ${limits.maxOutfits} outfits. Upgrade for unlimited outfits.`, isAuthenticated };
  }
  
  return { allowed: true, tier: userTier, isAuthenticated };
}

export function hasFeature(tier: UserTier, feature: string): boolean {
  return TIER_LIMITS[tier].features.includes(feature);
}
