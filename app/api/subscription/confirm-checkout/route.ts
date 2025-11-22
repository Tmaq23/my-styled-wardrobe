import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendSubscriptionNotificationToAdmin, sendSubscriptionConfirmationToCustomer } from '@/lib/email';

const STRIPE_SECRET_KEY = process.env['STRIPE_SECRET_KEY'];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      console.error('No session ID provided');
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    if (!STRIPE_SECRET_KEY) {
      console.error('Stripe secret key not configured');
      return NextResponse.json(
        { error: 'Payment system not configured' },
        { status: 500 }
      );
    }

    console.log('Retrieving Stripe session:', sessionId);

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
      return NextResponse.json(
        { error: 'Failed to retrieve payment session' },
        { status: 500 }
      );
    }

    const session = await sessionResponse.json();
    console.log('Session retrieved:', { id: session.id, payment_status: session.payment_status });

    if (session.payment_status !== 'paid') {
      console.error('Payment not completed:', session.payment_status);
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      );
    }

    const userId = session.metadata?.userId;
    if (!userId) {
      console.error('User ID not found in session metadata');
      return NextResponse.json(
        { error: 'User ID not found in session' },
        { status: 400 }
      );
    }

    // Get the subscription ID
    const subscriptionId = session.subscription;

    console.log('Updating database for user:', userId);

    // Update user subscription in database and get user info for emails
    const updatedSubscription = await prisma.userSubscription.upsert({
      where: { userId },
      create: {
        userId,
        tier: 'premium',
        stripeSubscriptionId: subscriptionId,
        stripeCustomerId: session.customer,
        activeUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      },
      update: {
        tier: 'premium',
        stripeSubscriptionId: subscriptionId,
        stripeCustomerId: session.customer,
        activeUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      select: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    console.log('✅ Subscription confirmed and database updated:', {
      userId,
      subscriptionId,
      sessionId,
    });

    // Send emails asynchronously (don't block the response)
    Promise.all([
      // Send notification to admin
      sendSubscriptionNotificationToAdmin({
        customerEmail: updatedSubscription.user.email || 'Unknown',
        customerName: updatedSubscription.user.name || undefined,
        subscriptionId: subscriptionId,
        customerId: session.customer,
      }),
      // Send confirmation to customer
      sendSubscriptionConfirmationToCustomer({
        customerEmail: updatedSubscription.user.email || 'Unknown',
        customerName: updatedSubscription.user.name || undefined,
      }),
    ]).catch((error) => {
      // Log email errors but don't fail the request
      console.error('Email sending error (non-blocking):', error);
    });

    return NextResponse.json({
      success: true,
      message: 'Subscription activated successfully',
    });
  } catch (error) {
    console.error('❌ Failed to confirm subscription:', error);
    console.error('Error details:', error instanceof Error ? error.stack : String(error));
    return NextResponse.json(
      { 
        error: 'Failed to confirm subscription',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
