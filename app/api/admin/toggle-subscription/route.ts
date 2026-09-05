import { NextRequest, NextResponse } from 'next/server';

import prisma from '@/lib/prisma';
import { verifyAdminAccess } from '@/lib/apiAuth';

/**
 * Marker stored in place of a Stripe subscription id when an admin grants
 * premium access manually. Premium checks only require the field to be
 * truthy, so this keeps the rest of the app working without a Stripe object.
 */
const MANUAL_SUBSCRIPTION_ID = 'admin-granted';
const MANUAL_GRANT_DAYS = 365;

export async function POST(request: NextRequest) {
  try {
    const access = await verifyAdminAccess(request);

    if (access.status === 'unauthenticated') {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (access.status === 'forbidden') {
      return NextResponse.json(
        { success: false, error: 'Admin privileges required' },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const userId = typeof body?.userId === 'string' ? body.userId : '';
    const subscribe = Boolean(body?.subscribe);

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, subscription: { select: { stripeSubscriptionId: true } } },
    });

    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const subscription = subscribe
      ? await prisma.userSubscription.upsert({
          where: { userId },
          create: {
            userId,
            tier: 'premium',
            stripeSubscriptionId: MANUAL_SUBSCRIPTION_ID,
            activeUntil: new Date(Date.now() + MANUAL_GRANT_DAYS * 24 * 60 * 60 * 1000),
          },
          update: {
            tier: 'premium',
            // Preserve a real Stripe id if one exists so billing history stays intact.
            stripeSubscriptionId: targetUser.subscription?.stripeSubscriptionId || MANUAL_SUBSCRIPTION_ID,
            activeUntil: new Date(Date.now() + MANUAL_GRANT_DAYS * 24 * 60 * 60 * 1000),
          },
          select: { tier: true, stripeSubscriptionId: true, activeUntil: true },
        })
      : await prisma.userSubscription.upsert({
          where: { userId },
          create: { userId, tier: 'free', stripeSubscriptionId: null, activeUntil: null },
          update: { tier: 'free', stripeSubscriptionId: null, activeUntil: null },
          select: { tier: true, stripeSubscriptionId: true, activeUntil: true },
        });

    return NextResponse.json({
      success: true,
      user: { id: targetUser.id, email: targetUser.email },
      subscription,
    });
  } catch (error) {
    console.error('❌ Toggle subscription error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update subscription status' },
      { status: 500 }
    );
  }
}
