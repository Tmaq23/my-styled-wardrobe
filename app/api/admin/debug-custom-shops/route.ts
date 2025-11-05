import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdminAccess } from '@/lib/apiAuth';

/**
 * Debug endpoint to view and clean up custom shop requests
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    const adminCheck = await verifyAdminAccess(request);
    if (!adminCheck.authorized) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all custom shop requests
    const allRequests = await prisma.customShopRequest.findMany({
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

    // Count by status
    const byStatus = {
      pending: allRequests.filter(r => r.status === 'pending').length,
      in_progress: allRequests.filter(r => r.status === 'in_progress').length,
      completed: allRequests.filter(r => r.status === 'completed').length,
      cancelled: allRequests.filter(r => r.status === 'cancelled').length,
    };

    // Count by payment status
    const byPaymentStatus = {
      pending: allRequests.filter(r => r.paymentStatus === 'pending').length,
      paid: allRequests.filter(r => r.paymentStatus === 'paid').length,
      failed: allRequests.filter(r => r.paymentStatus === 'failed').length,
    };

    return NextResponse.json({
      total: allRequests.length,
      byStatus,
      byPaymentStatus,
      requests: allRequests.map(r => ({
        id: r.id,
        userEmail: r.userEmail,
        occasion: r.occasion,
        budget: r.budget,
        amount: r.amount,
        paymentStatus: r.paymentStatus,
        status: r.status,
        createdAt: r.createdAt,
      })),
    });

  } catch (error) {
    console.error('Debug custom shops error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch debug info' },
      { status: 500 }
    );
  }
}

/**
 * DELETE: Clean up all pending (unpaid) custom shop requests
 */
export async function DELETE(request: NextRequest) {
  try {
    // Verify admin access
    const adminCheck = await verifyAdminAccess(request);
    if (!adminCheck.authorized) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Delete all pending requests with pending payment
    const result = await prisma.customShopRequest.deleteMany({
      where: {
        paymentStatus: 'pending',
        status: 'pending',
      },
    });

    return NextResponse.json({
      success: true,
      deleted: result.count,
      message: `Deleted ${result.count} stuck pending request(s)`,
    });

  } catch (error) {
    console.error('Clean up error:', error);
    return NextResponse.json(
      { error: 'Failed to clean up requests' },
      { status: 500 }
    );
  }
}

