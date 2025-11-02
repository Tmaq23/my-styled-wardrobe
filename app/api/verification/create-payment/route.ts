import { NextRequest, NextResponse } from 'next/server';

import prisma from '@/lib/prisma';
import { getSessionContext } from '@/lib/apiAuth';
import { createPaymentIntent } from '@/lib/stripe';

const VERIFICATION_AMOUNT = 30.0; // £30
const CURRENCY = 'gbp';

export async function POST(request: NextRequest) {
  try {
    const context = await getSessionContext(request);

    if (!context) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { bodyShape, colorPalette, bodyImageUrl, faceImageUrl } = await request.json();

    if (!bodyShape || !colorPalette) {
      return NextResponse.json(
        { error: 'Body shape and color palette are required' },
        { status: 400 }
      );
    }

    // Check if Stripe is configured
    if (!process.env['STRIPE_SECRET_KEY']) {
      return NextResponse.json(
        { error: 'Payment system is not configured. Please contact support.' },
        { status: 500 }
      );
    }

    // Check if user already has a pending verification for this analysis
    const existingVerification = await prisma.analysisVerification.findFirst({
      where: {
        userId: context.user.id,
        bodyShape,
        colorPalette,
        status: { in: ['pending', 'in_review'] },
        paymentStatus: { in: ['pending', 'paid'] },
      },
    });

    if (existingVerification) {
      return NextResponse.json(
        { 
          error: 'You already have a verification request for this analysis',
          verificationId: existingVerification.id,
        },
        { status: 409 }
      );
    }

    // Create verification record
    const verification = await prisma.analysisVerification.create({
      data: {
        userId: context.user.id,
        bodyShape,
        colorPalette,
        bodyImageUrl: bodyImageUrl || null,
        faceImageUrl: faceImageUrl || null,
        amount: VERIFICATION_AMOUNT,
        currency: CURRENCY,
        paymentStatus: 'pending',
        status: 'pending',
      },
    });

    // Create Stripe payment intent using existing helper
    const paymentIntent = await createPaymentIntent(VERIFICATION_AMOUNT, CURRENCY, {
      type: 'analysis_verification',
      userId: context.user.id,
      itemId: verification.id,
      description: `Stylist verification for body shape and color palette analysis`,
    });

    // Update verification with payment intent ID
    await prisma.analysisVerification.update({
      where: { id: verification.id },
      data: {
        stripePaymentIntentId: paymentIntent.id,
      },
    });

    return NextResponse.json({
      verificationId: verification.id,
      clientSecret: paymentIntent.clientSecret,
      paymentIntentId: paymentIntent.id,
      amount: VERIFICATION_AMOUNT,
      currency: CURRENCY,
    });

  } catch (error) {
    console.error('Verification payment creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    );
  }
}

