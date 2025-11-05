import { NextRequest, NextResponse } from 'next/server';

import prisma from '@/lib/prisma';
import { getSessionContext } from '@/lib/apiAuth';

/**
 * Clean up stuck pending custom shop requests for a user
 * This helps when a user's payment failed but the request is still marked as pending
 */
export async function POST(request: NextRequest) {
  try {
    const context = await getSessionContext(request);

    if (!context) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.log('🧹 Cleaning up stuck pending requests for user:', context.user.id);

    // Find all pending requests with pending payment (not paid)
    const stuckRequests = await prisma.customShopRequest.findMany({
      where: {
        userId: context.user.id,
        paymentStatus: 'pending', // Only pending payments
        status: 'pending', // Only pending status
      },
    });

    console.log(`Found ${stuckRequests.length} stuck request(s)`);

    if (stuckRequests.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No stuck requests to clean up',
        cleaned: 0,
      });
    }

    // Delete these stuck requests (they never completed payment)
    const deleteResult = await prisma.customShopRequest.deleteMany({
      where: {
        userId: context.user.id,
        paymentStatus: 'pending',
        status: 'pending',
      },
    });

    console.log(`✅ Cleaned up ${deleteResult.count} stuck request(s)`);

    return NextResponse.json({
      success: true,
      message: `Cleaned up ${deleteResult.count} stuck request(s)`,
      cleaned: deleteResult.count,
    });

  } catch (error) {
    console.error('Failed to clean up stuck requests:', error);
    return NextResponse.json(
      { error: 'Failed to clean up stuck requests' },
      { status: 500 }
    );
  }
}

