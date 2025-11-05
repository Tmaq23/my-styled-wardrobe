import { NextRequest, NextResponse } from 'next/server';

import prisma from '@/lib/prisma';
import { verifyAdminAccess } from '@/lib/apiAuth';

export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    const adminCheck = await verifyAdminAccess(request);
    if (!adminCheck.authorized) {
      return NextResponse.json(
        { error: adminCheck.error || 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch all custom shop requests with user information
    const customShopRequests = await prisma.customShopRequest.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      customShopRequests,
      count: customShopRequests.length,
    });

  } catch (error) {
    console.error('Failed to fetch custom shop requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch custom shop requests' },
      { status: 500 }
    );
  }
}

