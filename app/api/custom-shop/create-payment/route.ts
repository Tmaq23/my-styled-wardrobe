import { NextRequest, NextResponse } from 'next/server';
import { getSessionContext } from '@/lib/apiAuth';
import { createPaymentIntent } from '@/lib/stripe';

const CUSTOM_SHOP_AMOUNT = 120.0; // £120
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

    const {
      userName,
      userEmail,
      bodyShape,
      colourPalette,
      occasion,
      budget,
      retailers,
      preferences
    } = await request.json();

    if (!userName || !userEmail) {
      return NextResponse.json(
        { error: 'Name and email are required' },
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

    // Create a unique request ID for tracking
    const requestId = `CSR-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;

    // Create Stripe payment intent
    const paymentIntent = await createPaymentIntent(CUSTOM_SHOP_AMOUNT, CURRENCY, {
      type: 'custom_shop_request',
      userId: context.user.id,
      itemId: requestId,
      description: `Customised Online Shop Service - ${userName}`,
    });

    // Store request details temporarily (you can enhance this with database storage)
    console.log('🛍️ Custom shop payment created:', {
      requestId,
      paymentIntentId: paymentIntent.id,
      userName,
      userEmail,
      profile: { bodyShape, colourPalette, occasion, budget },
      retailers,
      preferences
    });

    return NextResponse.json({
      requestId,
      clientSecret: paymentIntent.clientSecret,
      paymentIntentId: paymentIntent.id,
      amount: CUSTOM_SHOP_AMOUNT,
      currency: CURRENCY,
    });

  } catch (error) {
    console.error('Custom shop payment creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    );
  }
}
