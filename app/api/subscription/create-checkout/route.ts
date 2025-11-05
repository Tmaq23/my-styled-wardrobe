import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(process.env['STRIPE_SECRET_KEY'] || '', {
  apiVersion: '2024-11-20.acacia',
});

export async function POST(request: NextRequest) {
  try {
    console.log('🔵 Starting subscription checkout creation...');
    
    // Get session cookie
    const cookieStore = await request.cookies;
    const sessionCookie = cookieStore.get('session');

    console.log('🔍 Session cookie exists:', !!sessionCookie);

    if (!sessionCookie) {
      console.log('❌ No session cookie found');
      return NextResponse.json(
        { error: 'Authentication required. Please log in.' },
        { status: 401 }
      );
    }

    // Parse session
    let userId: string;
    let userEmail: string;
    try {
      const sessionData = JSON.parse(
        Buffer.from(sessionCookie.value.split('.')[0], 'base64').toString()
      );
      userId = sessionData.userId;
      userEmail = sessionData.email;
      console.log('✅ Session parsed successfully:', { userId, userEmail });
    } catch (parseError) {
      console.error('❌ Session parse error:', parseError);
      return NextResponse.json(
        { error: 'Invalid session. Please log in again.' },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found. Please log in again.' },
        { status: 401 }
      );
    }

    // Create or retrieve Stripe customer
    let customerId: string;
    
    // Check if user already has a Stripe customer ID
    const subscription = await prisma.userSubscription.findUnique({
      where: { userId: user.id },
      select: { stripeCustomerId: true },
    });

    if (subscription?.stripeCustomerId) {
      customerId = subscription.stripeCustomerId;
    } else {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email || userEmail,
        name: user.name || undefined,
        metadata: {
          userId: user.id,
        },
      });
      customerId = customer.id;

      // Save customer ID to database
      await prisma.userSubscription.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          stripeCustomerId: customerId,
          tier: 'free',
        },
        update: {
          stripeCustomerId: customerId,
        },
      });
    }

    // Create Stripe Checkout Session for subscription
    const baseUrl = 'https://www.mystyledwardrobe.com';
    
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: 'My Styled Wardrobe - Subscribe',
              description: 'Unlimited AI outfit Combination Generator and Access to Style Blog',
            },
            unit_amount: 599, // £5.99 in pence
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/subscription/cancel`,
      metadata: {
        userId: user.id,
      },
    });

    console.log('✅ Subscription checkout session created:', {
      sessionId: session.id,
      userId: user.id,
      customerId: customerId,
    });

    return NextResponse.json({
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error('❌ Failed to create subscription checkout session:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create checkout session',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

