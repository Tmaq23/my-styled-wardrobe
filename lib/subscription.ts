import prisma from '@/lib/prisma';
import { getSessionContext } from '@/lib/apiAuth';
import { isDemoUser } from '@/lib/demoUser';

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

function resolveTier(subscription?: { tier?: string | null; stripeSubscriptionId?: string | null } | null): UserTier {
  if (subscription?.tier === 'stylist_pro') return 'stylist_pro';
  if (subscription?.tier === 'premium' && subscription.stripeSubscriptionId) return 'premium';
  return 'free';
}

export async function getUserTier(): Promise<{ tier: UserTier; userId: string | null; isAuthenticated: boolean }> {
  const context = await getSessionContext();

  if (!context) {
    return { tier: 'free', userId: null, isAuthenticated: false };
  }

  if (isDemoUser(context.user)) {
    return { tier: 'premium', userId: context.user.id, isAuthenticated: true };
  }

  const record = await prisma.user.findUnique({
    where: { id: context.user.id },
    select: {
      subscription: {
        select: {
          tier: true,
          stripeSubscriptionId: true,
        },
      },
    },
  });

  return {
    tier: resolveTier(record?.subscription),
    userId: context.user.id,
    isAuthenticated: true,
  };
}

export async function checkUserLimits(action: 'upload_item' | 'generate_outfit'): Promise<{ allowed: boolean; tier: UserTier; reason?: string; isAuthenticated: boolean }> {
  const { tier: userTier, userId, isAuthenticated } = await getUserTier();

  if (!isAuthenticated || !userId) {
    if (action === 'upload_item') {
      return { allowed: false, tier: userTier, reason: 'Please sign in to upload items to your wardrobe.', isAuthenticated };
    }
    return { allowed: true, tier: userTier, isAuthenticated };
  }

  if (userTier === 'premium' || userTier === 'stylist_pro') {
    return { allowed: true, tier: userTier, isAuthenticated };
  }

  const limits = TIER_LIMITS[userTier];
  const usage = await prisma.userLimit.findUnique({
    where: { userId },
    select: {
      itemsUploaded: true,
      outfitsGenerated: true,
    },
  });

  const currentUsage = {
    items: usage?.itemsUploaded ?? 0,
    outfits: usage?.outfitsGenerated ?? 0,
  };

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
