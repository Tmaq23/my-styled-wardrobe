import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminAccess } from '@/lib/apiAuth';
import { sendCustomShopCompleteToCustomer } from '@/lib/email';

export async function POST(request: NextRequest) {
  // Verify admin access
  const adminCheck = await verifyAdminAccess(request);
  if (adminCheck.status === 'unauthenticated') {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  if (adminCheck.status === 'forbidden') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { requestId, status, estimatedDelivery, message } = await request.json();

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

    const previous = await prisma.customShopRequest.findUnique({
      where: { id: requestId },
      select: { status: true },
    });

    if (!previous) {
      return NextResponse.json({ error: 'Custom shop request not found' }, { status: 404 });
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
      oldStatus: previous.status,
      newStatus: updatedRequest.status,
    });

    // Tell the customer once, when the request first becomes completed.
    if (status === 'completed' && previous.status !== 'completed') {
      const customerEmail = updatedRequest.user?.email || updatedRequest.userEmail;
      if (customerEmail) {
        sendCustomShopCompleteToCustomer({
          customerEmail,
          customerName: updatedRequest.user?.name || updatedRequest.userName,
          occasion: updatedRequest.occasion,
          requestId: updatedRequest.id,
          message: typeof message === 'string' && message.trim() ? message.trim().slice(0, 2000) : undefined,
        }).catch((err) => console.error('Custom shop completion email error (non-blocking):', err));
      }
    }

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

