import { NextRequest, NextResponse } from 'next/server';

import prisma from '@/lib/prisma';
import { getSessionContext } from '@/lib/apiAuth';
import { sendVerificationRequestToAdmin, sendVerificationConfirmationToCustomer } from '@/lib/email';

const STRIPE_SECRET_KEY = process.env['STRIPE_SECRET_KEY'];

export async function GET(request: NextRequest) {
  try {
    const context = await getSessionContext(request);

    if (!context) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId || !STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Retrieve checkout session from Stripe
    const sessionResponse = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, {
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
      },
    });

    if (!sessionResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to verify payment session' },
        { status: 400 }
      );
    }

    const session = await sessionResponse.json();

    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      );
    }

    // Get verification ID from metadata
    const metadata = typeof session.metadata === 'string' 
      ? JSON.parse(session.metadata) 
      : session.metadata;
    
    const verificationId = metadata?.verificationId;

    if (!verificationId) {
      return NextResponse.json(
        { error: 'Verification ID not found' },
        { status: 400 }
      );
    }

    // Update verification status
    const verification = await prisma.analysisVerification.update({
      where: { id: verificationId },
      data: {
        paymentStatus: 'paid',
        status: 'in_review',
        stripePaymentIntentId: session.payment_intent || null,
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

    // Send emails asynchronously (don't block the response)
    Promise.all([
      // Send notification to admin with customer's photos
      sendVerificationRequestToAdmin({
        customerEmail: verification.user.email || 'Unknown',
        customerName: verification.user.name || undefined,
        bodyShape: verification.bodyShape,
        colorPalette: verification.colorPalette,
        imageUrls: verification.imageUrls,
        verificationId: verification.id,
      }),
      // Send confirmation to customer
      sendVerificationConfirmationToCustomer({
        customerEmail: verification.user.email || 'Unknown',
        customerName: verification.user.name || undefined,
        bodyShape: verification.bodyShape,
        colorPalette: verification.colorPalette,
      }),
    ]).catch((error) => {
      // Log email errors but don't fail the request
      console.error('Email sending error (non-blocking):', error);
    });

    return NextResponse.json({
      success: true,
      verification,
      message: 'Payment confirmed. Your analysis is now in review.',
    });

  } catch (error) {
    console.error('Checkout confirmation error:', error);
    return NextResponse.json(
      { error: 'Failed to confirm checkout' },
      { status: 500 }
    );
  }
}

