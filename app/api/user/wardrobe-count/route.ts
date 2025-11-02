import { NextRequest, NextResponse } from 'next/server';

import prisma from '@/lib/prisma';
import { getSessionContext } from '@/lib/apiAuth';

export async function GET(req: NextRequest) {
  try {
    const context = await getSessionContext(req);

    if (!context) {
      return NextResponse.json({
        wardrobeOutfitsGenerated: 0,
        wardrobeOutfitsLimit: 1
      });
    }

    const userId = context.user.id;

    // Check if user is demo user or admin
    if (userId === 'demo-user-1') {
      return NextResponse.json({
        wardrobeOutfitsGenerated: 0,
        wardrobeOutfitsLimit: 999
      });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isAdmin: true }
    });

    if (user?.isAdmin) {
      return NextResponse.json({
        wardrobeOutfitsGenerated: 0,
        wardrobeOutfitsLimit: 999
      });
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
            wardrobeOutfitsGenerated: 0,
            tierLimitWardrobeOutfits: 1
          }
        });
      } else {
        // User doesn't exist, return default free tier limits
        return NextResponse.json({
          wardrobeOutfitsGenerated: 0,
          wardrobeOutfitsLimit: 1
        });
      }
    }

    return NextResponse.json({
      wardrobeOutfitsGenerated: userLimit.wardrobeOutfitsGenerated,
      wardrobeOutfitsLimit: userLimit.tierLimitWardrobeOutfits
    });

  } catch (error) {
    console.error('Error fetching wardrobe count:', error);
    return NextResponse.json({
      wardrobeOutfitsGenerated: 0,
      wardrobeOutfitsLimit: 1
    }, { status: 500 });
  }
}

