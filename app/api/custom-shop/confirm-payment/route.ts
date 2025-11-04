import { NextRequest, NextResponse } from 'next/server';
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

    const {
      paymentIntentId,
      requestId,
      userName,
      userEmail,
      bodyShape,
      colourPalette,
      occasion,
      budget,
      retailers,
      preferences
    } = await request.json();

    if (!paymentIntentId || !requestId) {
      return NextResponse.json(
        { error: 'Payment intent ID and request ID are required' },
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

    // Check payment status
    if (paymentIntent.status === 'succeeded') {
      // Log the successful custom shop request
      console.log('✅ Custom shop request paid and confirmed:', {
        requestId,
        paymentIntentId,
        userName,
        userEmail,
        userId: context.user.id,
        profile: {
          bodyShape,
          colourPalette,
          occasion,
          budget,
          retailers,
          preferences
        },
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        timestamp: new Date().toISOString()
      });

      // TODO: Send email notification to admin/styling team
      // TODO: Store in database for tracking

      return NextResponse.json({
        success: true,
        requestId,
        message: 'Payment confirmed. Your custom shop request has been received.',
        estimatedCompletionTime: '2-3 business days',
        nextSteps: [
          'Our styling team will review your profile',
          'We will curate a personalised selection of outfits',
          'You will receive your custom online shop via email',
          'The email will include clickable links to purchase items'
        ]
      });
    } else if (paymentIntent.status === 'processing') {
      return NextResponse.json({
        success: false,
        status: 'processing',
        message: 'Payment is still processing. Please wait...',
      });
    } else {
      // Payment failed
      return NextResponse.json(
        { error: 'Payment failed', status: paymentIntent.status },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Custom shop payment confirmation error:', error);
    return NextResponse.json(
      { error: 'Failed to confirm payment' },
      { status: 500 }
    );
  }
}
