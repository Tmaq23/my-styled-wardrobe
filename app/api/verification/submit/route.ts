import { NextRequest, NextResponse } from 'next/server';

import prisma from '@/lib/prisma';
import { verifyAdminAccess } from '@/lib/apiAuth';

export async function POST(request: NextRequest) {
  try {
    const access = await verifyAdminAccess(request);

    if (access.status !== 'ok') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { verificationId, verifiedBodyShape, verifiedColorPalette, stylistNotes } = await request.json();

    if (!verificationId || !verifiedBodyShape || !verifiedColorPalette) {
      return NextResponse.json(
        { error: 'Verification ID, body shape, and color palette are required' },
        { status: 400 }
      );
    }

    // Validate body shape
    const validBodyShapes = ['Hourglass', 'Triangle', 'Inverted Triangle', 'Rectangle', 'Round'];
    if (!validBodyShapes.includes(verifiedBodyShape)) {
      return NextResponse.json(
        { error: 'Invalid body shape' },
        { status: 400 }
      );
    }

    // Validate color palette
    const validColorPalettes = ['Spring', 'Summer', 'Autumn', 'Winter'];
    if (!validColorPalettes.includes(verifiedColorPalette)) {
      return NextResponse.json(
        { error: 'Invalid color palette' },
        { status: 400 }
      );
    }

    // Find verification
    const verification = await prisma.analysisVerification.findUnique({
      where: { id: verificationId },
    });

    if (!verification) {
      return NextResponse.json(
        { error: 'Verification not found' },
        { status: 404 }
      );
    }

    // Verify payment was made
    if (verification.paymentStatus !== 'paid') {
      return NextResponse.json(
        { error: 'Payment must be completed before verification' },
        { status: 400 }
      );
    }

    // Update verification
    const updatedVerification = await prisma.analysisVerification.update({
      where: { id: verificationId },
      data: {
        verifiedBodyShape,
        verifiedColorPalette,
        stylistNotes: stylistNotes || null,
        stylistId: access.context.user.id,
        status: 'verified',
        verifiedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      verification: updatedVerification,
      message: 'Verification submitted successfully',
    });

  } catch (error) {
    console.error('Verification submission error:', error);
    return NextResponse.json(
      { error: 'Failed to submit verification' },
      { status: 500 }
    );
  }
}

