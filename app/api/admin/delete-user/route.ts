import { NextRequest, NextResponse } from 'next/server';

import prisma from '@/lib/prisma';
import { verifyAdminAccess } from '@/lib/apiAuth';

export async function DELETE(request: NextRequest) {
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

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check if user is demo user (protect demo account)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, isAdmin: true },
    });

    if (user?.email === 'demo@mystyledwardrobe.com') {
      return NextResponse.json(
        { success: false, error: 'Cannot delete demo account' },
        { status: 403 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    if (userId === access.context.user.id) {
      return NextResponse.json(
        { success: false, error: 'Admins cannot delete their own account' },
        { status: 400 }
      );
    }

    const isSuperAdmin = access.context.user.email?.toLowerCase() === process.env['ADMIN_USERNAME']?.toLowerCase();

    if (user.isAdmin && !isSuperAdmin) {
      return NextResponse.json(
        { success: false, error: 'Only the primary admin can delete other admins' },
        { status: 403 }
      );
    }

    // Delete user and all related data (Prisma will handle cascade deletes based on schema)
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Failed to delete user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}




