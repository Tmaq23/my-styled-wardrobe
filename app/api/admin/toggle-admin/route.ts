import { NextResponse } from 'next/server';

import prisma from '@/lib/prisma';
import { verifyAdminAccess } from '@/lib/apiAuth';

export async function POST(request: Request) {
  try {
    const access = await verifyAdminAccess();

    if (access.status === 'unauthenticated') {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const isSuperAdmin =
      access.context.user.email?.toLowerCase() === process.env['ADMIN_USERNAME']?.toLowerCase();

    if (access.status === 'forbidden' || !isSuperAdmin) {
      return NextResponse.json(
        { success: false, error: 'Only the primary admin can change admin privileges' },
        { status: 403 }
      );
    }

    const { userId, isAdmin } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true },
    });

    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    if (targetUser.email?.toLowerCase() === process.env['ADMIN_USERNAME']?.toLowerCase()) {
      return NextResponse.json(
        { success: false, error: 'Primary admin privileges cannot be changed' },
        { status: 400 }
      );
    }

    // Update user admin status
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isAdmin: Boolean(isAdmin) },
      select: {
        id: true,
        email: true,
        name: true,
        isAdmin: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });

  } catch (error) {
    console.error('❌ Toggle admin error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update admin status' },
      { status: 500 }
    );
  }
}




