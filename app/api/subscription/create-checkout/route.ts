import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { requireAuthenticatedUser } from '@/lib/apiAuth';

const stripe = new Stripe(process.env['STRIPE_SECRET_KEY'] || '', {
  apiVersion: '2024-11-20.acacia',
});

export async function POST(request: NextRequest) {
  try {
    console.log('🔵 Starting subscription checkout creation...');
    
    // Use centralized authentication
    const authResult = await requireAuthenticatedUser(request);
    
    if (authResult.status !== 'ok') {
      console.log('❌ Authentication failed:', authResult.message);
      return NextResponse.json(
        { error: authResult.message },
        { status: authResult.statusCode }
      );
    }

    const user = authResult.user;
    console.log('✅ User authenticated:', { userId: user.id, userEmail: user.email });

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
        email: user.email || undefined,
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

