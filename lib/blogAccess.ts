import type { NextRequest } from 'next/server';

import prisma from '@/lib/prisma';
import { getSessionContext, type AuthContext } from '@/lib/apiAuth';

export interface BlogAccess {
  context: AuthContext | null;
  isAdmin: boolean;
  /** Full article access: admins and active premium subscribers. */
  canRead: boolean;
}

function isAdminEmail(email?: string | null): boolean {
  const adminUsername = process.env['ADMIN_USERNAME']?.toLowerCase();
  return Boolean(adminUsername && email && email.toLowerCase() === adminUsername);
}

/**
 * Mirrors the rule used by the blog pages: only premium subscribers with an
 * active Stripe (or admin-granted) subscription, plus admins, may read posts.
 */
export async function getBlogAccess(req?: NextRequest): Promise<BlogAccess> {
  const context = await getSessionContext(req);

  if (!context) {
    return { context: null, isAdmin: false, canRead: false };
  }

  const isAdmin = context.user.isAdmin || isAdminEmail(context.user.email);
  if (isAdmin) {
    return { context, isAdmin: true, canRead: true };
  }

  try {
    const subscription = await prisma.userSubscription.findUnique({
      where: { userId: context.user.id },
      select: { tier: true, stripeSubscriptionId: true, activeUntil: true },
    });

    const active =
      subscription?.tier === 'premium' &&
      Boolean(subscription.stripeSubscriptionId) &&
      (!subscription.activeUntil || subscription.activeUntil.getTime() > Date.now());

    return { context, isAdmin: false, canRead: Boolean(active) };
  } catch (error) {
    console.error('Failed to resolve blog access:', error);
    return { context, isAdmin: false, canRead: false };
  }
}

/** Plain-text teaser from stored HTML for locked previews. */
export function buildPreview(content: string | null | undefined, excerpt?: string | null, maxLength = 280): string {
  if (excerpt && excerpt.trim()) {
    return excerpt.trim();
  }

  const text = (content || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return text.length > maxLength ? `${text.slice(0, maxLength).trimEnd()}…` : text;
}
