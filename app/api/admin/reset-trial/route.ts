import { NextRequest, NextResponse } from 'next/server';

import prisma from '@/lib/prisma';
import { verifyAdminAccess } from '@/lib/apiAuth';

export async function POST(request: NextRequest) {
  try {
    const access = await verifyAdminAccess();

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

    const { userId, email } = await request.json();

    if (!userId || !email) {
      return NextResponse.json(
        { success: false, error: 'User ID and email are required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (!user || user.email?.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json(
        { success: false, error: 'User not found or email mismatch' },
        { status: 404 }
      );
    }

    // Check if user has limits record
    const userLimit = await prisma.userLimit.findUnique({
      where: { userId },
    });

    if (userLimit) {
      // Reset the analysis count to 0
      await prisma.userLimit.update({
        where: { userId },
        data: {
          aiAnalysesUsed: 0,
          updatedAt: new Date(),
        },
      });
    } else {
      // Create a new limits record if it doesn't exist
      await prisma.userLimit.create({
        data: {
          userId,
          aiAnalysesUsed: 0,
          tierLimitAnalyses: 1,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Trial reset successfully',
      userId,
      email,
      resetTimestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to reset trial:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reset trial' },
      { status: 500 }
    );
  }
}

