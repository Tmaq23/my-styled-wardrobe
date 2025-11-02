import { NextRequest, NextResponse } from 'next/server';

import prisma from '@/lib/prisma';
import { verifyAdminAccess } from '@/lib/apiAuth';

// Get user activity including analysis count
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

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get user's subscription info which includes analysis tracking
    const userLimit = await prisma.userLimit.findUnique({
      where: { userId },
      select: {
        currentWardrobeItems: true,
        currentOutfits: true,
        maxWardrobeItems: true,
        maxOutfits: true,
      },
    });

    return NextResponse.json({
      success: true,
      activity: userLimit || {},
    });
  } catch (error) {
    console.error('Failed to fetch user activity:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch activity' },
      { status: 500 }
    );
  }
}

// Track AI analysis
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

    const { userId, action } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Update user's last activity timestamp
    await prisma.user.update({
      where: { id: userId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      message: 'Activity tracked',
    });
  } catch (error) {
    console.error('Failed to track activity:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to track activity' },
      { status: 500 }
    );
  }
}




