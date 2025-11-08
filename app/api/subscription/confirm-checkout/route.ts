import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const STRIPE_SECRET_KEY = process.env['STRIPE_SECRET_KEY'];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    if (!STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Stripe is not configured' },
        { status: 500 }
      );
    }

    // Retrieve the checkout session from Stripe using REST API
    const sessionResponse = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${sessionId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        },
      }
    );

    if (!sessionResponse.ok) {
      const errorData = await sessionResponse.json();
      console.error('❌ Stripe API error:', errorData);
      throw new Error(errorData.error?.message || 'Failed to retrieve session from Stripe');
    }

    const session = await sessionResponse.json();

    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      );
    }

    const userId = session.metadata?.userId;
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID not found in session' },
        { status: 400 }
      );
    }

    // Get the subscription ID
    const subscriptionId = session.subscription as string;

    // Update user subscription in database
    await prisma.userSubscription.upsert({
      where: { userId },
      create: {
        userId,
        tier: 'premium',
        stripeSubscriptionId: subscriptionId,
        stripeCustomerId: session.customer as string,
        activeUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      },
      update: {
        tier: 'premium',
        stripeSubscriptionId: subscriptionId,
        stripeCustomerId: session.customer as string,
        activeUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    console.log('✅ Subscription confirmed and database updated:', {
      userId,
      subscriptionId,
      sessionId,
    });

    return NextResponse.json({
      success: true,
      message: 'Subscription activated successfully',
    });
  } catch (error) {
    console.error('❌ Failed to confirm subscription:', error);
    return NextResponse.json(
      { 
        error: 'Failed to confirm subscription',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

