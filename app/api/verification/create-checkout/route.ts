import { NextRequest, NextResponse } from 'next/server';

import prisma from '@/lib/prisma';
import { getSessionContext } from '@/lib/apiAuth';

const STRIPE_SECRET_KEY = process.env['STRIPE_SECRET_KEY'];
const VERIFICATION_AMOUNT = 30.0;

export async function POST(request: NextRequest) {
  try {
    const context = await getSessionContext(request);

    if (!context) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const requestBody = await request.json();
    const { bodyShape, colorPalette, bodyImageUrl, faceImageUrl } = requestBody;

    console.log('Received verification request:', { bodyShape, colorPalette, hasStripeKey: !!STRIPE_SECRET_KEY });

    // Validate required fields
    if (!STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Payment system is not configured. Please contact support.' },
        { status: 500 }
      );
    }

    if (!bodyShape || typeof bodyShape !== 'string' || bodyShape.trim().length === 0) {
      console.error('Invalid bodyShape:', bodyShape);
      return NextResponse.json(
        { error: 'Body shape is required and must be a valid string' },
        { status: 400 }
      );
    }

    if (!colorPalette || typeof colorPalette !== 'string' || colorPalette.trim().length === 0) {
      console.error('Invalid colorPalette:', colorPalette);
      return NextResponse.json(
        { error: 'Color palette is required and must be a valid string' },
        { status: 400 }
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

    // Create verification record first
    const verification = await prisma.analysisVerification.create({
      data: {
        userId: context.user.id,
        bodyShape,
        colorPalette,
        bodyImageUrl: bodyImageUrl || null,
        faceImageUrl: faceImageUrl || null,
        amount: VERIFICATION_AMOUNT,
        currency: 'gbp',
        paymentStatus: 'pending',
        status: 'pending',
      },
    });

    // Always use the production domain to avoid DNS issues
    const baseUrl = 'https://www.mystyledwardrobe.com';
    
    console.log('Creating Stripe checkout with baseUrl:', baseUrl);

    // Create Stripe Checkout Session
    const params = new URLSearchParams({
      mode: 'payment',
      'payment_method_types[0]': 'card',
      'line_items[0][price_data][currency]': 'gbp',
      'line_items[0][price_data][product_data][name]': 'Stylist Verification',
      'line_items[0][price_data][product_data][description]': 'Professional verification of body shape and color palette analysis',
      'line_items[0][price_data][unit_amount]': Math.round(VERIFICATION_AMOUNT * 100).toString(),
      'line_items[0][quantity]': '1',
      success_url: `${baseUrl}/verification/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/verification/cancel`,
      'metadata[verificationId]': verification.id,
      'metadata[userId]': context.user.id,
      'metadata[type]': 'analysis_verification',
    });

    const checkoutResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    if (!checkoutResponse.ok) {
      const errorText = await checkoutResponse.text();
      console.error('Stripe Checkout error:', {
        status: checkoutResponse.status,
        statusText: checkoutResponse.statusText,
        error: errorText,
        hasStripeKey: !!STRIPE_SECRET_KEY,
        stripeKeyPrefix: STRIPE_SECRET_KEY?.substring(0, 10)
      });
      return NextResponse.json(
        { error: `Failed to create checkout session: ${errorText.substring(0, 200)}` },
        { status: 500 }
      );
    }

    const session = await checkoutResponse.json();

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
    });

  } catch (error) {
    console.error('Checkout creation error:', error);
    return NextResponse.json(
      { error: `Failed to create checkout: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

