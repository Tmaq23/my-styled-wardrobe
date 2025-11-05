import { NextRequest, NextResponse } from 'next/server';

import prisma from '@/lib/prisma';
import { verifyAdminAccess } from '@/lib/apiAuth';

export async function DELETE(request: NextRequest) {
  try {
    // Verify admin access
    const adminCheck = await verifyAdminAccess(request);
    if (!adminCheck.authorized) {
      return NextResponse.json(
        { error: adminCheck.error || 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Custom shop request ID is required' },
        { status: 400 }
      );
    }

    // Delete the custom shop request
    await prisma.customShopRequest.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Custom shop request deleted successfully',
    });

  } catch (error) {
    console.error('Failed to delete custom shop request:', error);
    return NextResponse.json(
      { error: 'Failed to delete custom shop request' },
      { status: 500 }
    );
  }
}

