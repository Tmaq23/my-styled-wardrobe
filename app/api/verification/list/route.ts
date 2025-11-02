import { NextRequest, NextResponse } from 'next/server';

import prisma from '@/lib/prisma';
import { getSessionContext, verifyAdminAccess } from '@/lib/apiAuth';

// GET - List verifications (user's own or all for admin)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const isAdminRequest = searchParams.get('admin') === 'true';

    let verifications;

    if (isAdminRequest) {
      // Admin view - all verifications
      const access = await verifyAdminAccess(request);
      if (access.status !== 'ok') {
        return NextResponse.json(
          { error: 'Admin access required' },
          { status: 403 }
        );
      }

      verifications = await prisma.analysisVerification.findMany({
        where: status ? { status } : undefined,
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
    } else {
      // User view - their own verifications
      const context = await getSessionContext(request);
      if (!context) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }

      verifications = await prisma.analysisVerification.findMany({
        where: {
          userId: context.user.id,
          ...(status ? { status } : {}),
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }

    return NextResponse.json({
      verifications,
    });

  } catch (error) {
    console.error('Verification list error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch verifications' },
      { status: 500 }
    );
  }
}

