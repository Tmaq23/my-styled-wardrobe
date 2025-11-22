import { NextRequest, NextResponse } from 'next/server';

import prisma from '@/lib/prisma';
import { verifyAdminAccess } from '@/lib/apiAuth';

export async function GET(request: NextRequest) {
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

    // Fetch all users with their related data including limits and subscription
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        isAdmin: true,
        createdAt: true,
        emailVerified: true,
        updatedAt: true,
        limits: {
          select: {
            aiAnalysesUsed: true,
            tierLimitAnalyses: true,
          },
        },
        subscription: {
          select: {
            tier: true,
            stripeSubscriptionId: true,
            activeUntil: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Map users with their analysis counts and subscription status
    const usersWithActivity = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt.toISOString(),
      emailVerified: user.emailVerified?.toISOString() || null,
      analysisCount: user.limits?.aiAnalysesUsed || 0,
      analysisLimit: user.limits?.tierLimitAnalyses || 1,
      lastActivity: user.updatedAt.toISOString(),
      subscription: user.subscription ? {
        tier: user.subscription.tier,
        stripeSubscriptionId: user.subscription.stripeSubscriptionId || undefined,
        activeUntil: user.subscription.activeUntil?.toISOString() || undefined,
      } : null,
    }));

    return NextResponse.json({
      success: true,
      users: usersWithActivity,
    });
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

