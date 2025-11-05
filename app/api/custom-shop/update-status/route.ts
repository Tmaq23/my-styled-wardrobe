import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminAccess } from '@/lib/apiAuth';

export async function POST(request: NextRequest) {
  // Verify admin access
  const adminCheck = await verifyAdminAccess(request);
  if (adminCheck.status !== 'ok') {
    return NextResponse.json({ error: adminCheck.message }, { status: adminCheck.statusCode });
  }

  try {
    const { requestId, status, estimatedDelivery } = await request.json();

    if (!requestId || !status) {
      return NextResponse.json(
        { error: 'Request ID and status are required' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be one of: pending, in_progress, completed, cancelled' },
        { status: 400 }
      );
    }

    // Update the custom shop request status
    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    // If marking as completed, set completedAt
    if (status === 'completed' && !updateData.completedAt) {
      updateData.completedAt = new Date();
    }

    // If estimated delivery is provided, update it
    if (estimatedDelivery !== undefined) {
      updateData.estimatedDelivery = estimatedDelivery;
    }

    const updatedRequest = await prisma.customShopRequest.update({
      where: { id: requestId },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    console.log('✅ Custom shop request status updated:', {
      requestId,
      oldStatus: status,
      newStatus: updatedRequest.status,
    });

    return NextResponse.json({
      success: true,
      request: updatedRequest,
      message: `Status updated to ${status}`,
    });
  } catch (error) {
    console.error('❌ Failed to update custom shop request status:', error);
    return NextResponse.json(
      { error: 'Failed to update status' },
      { status: 500 }
    );
  }
}

