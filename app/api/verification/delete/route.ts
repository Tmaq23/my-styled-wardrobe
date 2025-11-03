import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdminAccess } from '@/lib/apiAuth';

export async function DELETE(request: NextRequest) {
  try {
    const access = await verifyAdminAccess(request);

    if (access.status !== 'ok') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const verificationId = searchParams.get('id');

    if (!verificationId) {
      return NextResponse.json(
        { error: 'Verification ID is required' },
        { status: 400 }
      );
    }

    // Check if verification exists
    const verification = await prisma.analysisVerification.findUnique({
      where: { id: verificationId },
      select: {
        id: true,
        status: true,
        paymentStatus: true,
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });

    if (!verification) {
      return NextResponse.json(
        { error: 'Verification not found' },
        { status: 404 }
      );
    }

    // Delete the verification
    await prisma.analysisVerification.delete({
      where: { id: verificationId },
    });

    return NextResponse.json({
      success: true,
      message: 'Verification deleted successfully',
      deleted: {
        id: verification.id,
        user: verification.user.email || verification.user.name,
      },
    });

  } catch (error) {
    console.error('Verification deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete verification' },
      { status: 500 }
    );
  }
}

