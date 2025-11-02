import { NextResponse } from 'next/server';

import prisma from '@/lib/prisma';
import { getSessionContext } from '@/lib/apiAuth';

export async function GET() {
  try {
    const context = await getSessionContext();

    if (!context) {
      return NextResponse.json({
        success: false,
        analysisCount: 1, // Default to 1 (used up) if not logged in
        analysisLimit: 1,
      });
    }

    const userId = context.user.id;

    // Check if this is the demo user
    if (userId === 'demo-user-1') {
      return NextResponse.json({
        success: true,
        analysisCount: 0, // Demo user always has unlimited analyses
        analysisLimit: 999,
      });
    }

    // Check if user is an admin (admins get unlimited analyses)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        isAdmin: true,
      },
    });

    if (user?.isAdmin) {
      return NextResponse.json({
        success: true,
        analysisCount: 0, // Admin users have unlimited analyses
        analysisLimit: 999,
      });
    }

    // Fetch user limits from database
    const userLimit = await prisma.userLimit.findUnique({
      where: { userId },
      select: {
        aiAnalysesUsed: true,
        tierLimitAnalyses: true,
      },
    });

    if (!userLimit) {
      // Check if user exists before creating limit record
      const userExists = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true },
      });

      if (!userExists) {
        console.error(`User ${userId} does not exist, cannot create limit record`);
        return NextResponse.json({
          success: false,
          analysisCount: 1,
          analysisLimit: 1,
        });
      }

      // If no limit record exists, create one with defaults
      const newLimit = await prisma.userLimit.create({
        data: {
          userId,
          itemsUploaded: 0,
          outfitsGenerated: 0,
          aiAnalysesUsed: 0,
          tierLimitItems: 6,
          tierLimitOutfits: 10,
          tierLimitAnalyses: 1,
        },
      });

      return NextResponse.json({
        success: true,
        analysisCount: newLimit.aiAnalysesUsed,
        analysisLimit: newLimit.tierLimitAnalyses,
      });
    }

    return NextResponse.json({
      success: true,
      analysisCount: userLimit.aiAnalysesUsed,
      analysisLimit: userLimit.tierLimitAnalyses,
    });

  } catch (error) {
    console.error('Failed to fetch analysis count:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analysis count' },
      { status: 500 }
    );
  }
}

