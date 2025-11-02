import { NextRequest, NextResponse } from 'next/server';

import prisma from '@/lib/prisma';
import { getSessionContext } from '@/lib/apiAuth';

export async function POST(request: NextRequest) {
  try {
    const context = await getSessionContext(request);

    if (!context) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { paymentIntentId, verificationId } = await request.json();

    if (!paymentIntentId || !verificationId) {
      return NextResponse.json(
        { error: 'Payment intent ID and verification ID are required' },
        { status: 400 }
      );
    }

    // Verify payment intent via Stripe API
    const stripeSecretKey = process.env['STRIPE_SECRET_KEY'];
    if (!stripeSecretKey) {
      return NextResponse.json(
        { error: 'Payment system not configured' },
        { status: 500 }
      );
    }

    const stripeResponse = await fetch(`https://api.stripe.com/v1/payment_intents/${paymentIntentId}`, {
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
      },
    });

    if (!stripeResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to verify payment' },
        { status: 400 }
      );
    }

    const paymentIntent = await stripeResponse.json();

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

    // Verify it belongs to the user
    if (verification.userId !== context.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Check payment status
    if (paymentIntent.status === 'succeeded') {
      // Update verification to paid and in_review
      const updatedVerification = await prisma.analysisVerification.update({
        where: { id: verificationId },
        data: {
          paymentStatus: 'paid',
          status: 'in_review',
        },
      });

      return NextResponse.json({
        success: true,
        verification: updatedVerification,
        message: 'Payment confirmed. Your analysis is now in review by a qualified stylist.',
      });
    } else if (paymentIntent.status === 'processing') {
      return NextResponse.json({
        success: false,
        status: 'processing',
        message: 'Payment is still processing. Please wait...',
      });
    } else {
      // Payment failed
      await prisma.analysisVerification.update({
        where: { id: verificationId },
        data: {
          paymentStatus: 'failed',
        },
      });

      return NextResponse.json(
        { error: 'Payment failed', status: paymentIntent.status },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Payment confirmation error:', error);
    return NextResponse.json(
      { error: 'Failed to confirm payment' },
      { status: 500 }
    );
  }
}

