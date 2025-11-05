import { NextRequest, NextResponse } from 'next/server';

import prisma from '@/lib/prisma';
import { verifyAdminAccess } from '@/lib/apiAuth';

export async function GET(request: NextRequest) {
  try {
    console.log('🛍️ Custom shop list API called');
    
    // Verify admin access
    const adminCheck = await verifyAdminAccess(request);
    if (!adminCheck.authorized) {
      console.error('❌ Unauthorized access to custom shop list');
      return NextResponse.json(
        { error: adminCheck.error || 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('✅ Admin access verified');

    // Fetch ALL custom shop requests (including pending ones)
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

    console.log(`📊 Found ${customShopRequests.length} custom shop request(s)`);
    console.log('📋 Requests:', customShopRequests.map(r => ({
      id: r.id,
      email: r.userEmail,
      paymentStatus: r.paymentStatus,
      status: r.status,
    })));

    return NextResponse.json({
      customShopRequests,
      count: customShopRequests.length,
    });

  } catch (error) {
    console.error('❌ Failed to fetch custom shop requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch custom shop requests' },
      { status: 500 }
    );
  }
}

