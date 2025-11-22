import { NextRequest, NextResponse } from 'next/server';

import prisma from '@/lib/prisma';
import { getSessionContext } from '@/lib/apiAuth';

export async function POST(req: NextRequest) {
  try {
    const context = await getSessionContext(req);

    if (!context) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const userId = context.user.id;

    // Skip incrementing for demo user
    if (userId === 'demo-user-1') {
      return NextResponse.json({ success: true });
    }

    // Check if user is a subscriber (ONLY subscribers get unlimited AI outfit generation)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        subscription: {
          select: {
            tier: true,
            stripeSubscriptionId: true,
          }
        }
      }
    });

    // Skip incrementing ONLY for premium subscribers (they have unlimited)
    const isSubscriber = user?.subscription?.tier === 'premium' && 
                        !!user?.subscription?.stripeSubscriptionId;

    if (isSubscriber) {
      return NextResponse.json({ success: true });
    }

    // Get or create user limits
    let userLimit = await prisma.userLimit.findUnique({
      where: { userId }
    });

    if (!userLimit) {
      // Verify user exists before creating UserLimit
      const userExists = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (userExists) {
        userLimit = await prisma.userLimit.create({
          data: {
            userId,
            wardrobeOutfitsGenerated: 1,
            tierLimitWardrobeOutfits: 1
          }
        });
      }
    } else {
      // Increment the counter
      userLimit = await prisma.userLimit.update({
        where: { userId },
        data: {
          wardrobeOutfitsGenerated: {
            increment: 1
          }
        }
      });
    }

    return NextResponse.json({ 
      success: true,
      wardrobeOutfitsGenerated: userLimit?.wardrobeOutfitsGenerated || 1
    });

  } catch (error) {
    console.error('Error incrementing wardrobe count:', error);
    return NextResponse.json({ error: 'Failed to update count' }, { status: 500 });
  }
}

