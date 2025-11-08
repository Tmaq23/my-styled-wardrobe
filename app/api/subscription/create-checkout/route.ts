import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { requireAuthenticatedUser } from '@/lib/apiAuth';

export async function POST(request: NextRequest) {
  try {
    console.log('🔵 Starting subscription checkout creation...');
    console.log('🔑 Checking Stripe configuration...');
    
    const stripeKey = process.env['STRIPE_SECRET_KEY'];
    if (!stripeKey) {
      console.error('❌ STRIPE_SECRET_KEY is not set!');
      return NextResponse.json(
        { error: 'Stripe is not configured. Please contact support.' },
        { status: 500 }
      );
    }
    
    // Validate Stripe key format
    if (!stripeKey.startsWith('sk_test_') && !stripeKey.startsWith('sk_live_')) {
      console.error('❌ STRIPE_SECRET_KEY has invalid format!');
      return NextResponse.json(
        { error: 'Stripe API key format is invalid. Please check configuration.' },
        { status: 500 }
      );
    }
    
    console.log('✅ Stripe key found, length:', stripeKey.length);
    console.log('✅ Stripe key prefix:', stripeKey.substring(0, 10));
    console.log('✅ Stripe key type:', stripeKey.startsWith('sk_test_') ? 'test' : 'live');
    
    const stripe = new Stripe(stripeKey, {
      apiVersion: '2024-11-20.acacia',
      timeout: 20000, // 20 second timeout
      maxNetworkRetries: 2,
    });
    
    // Test Stripe connection by retrieving account info
    try {
      console.log('🔵 Testing Stripe API connection...');
      const account = await stripe.balance.retrieve();
      console.log('✅ Stripe connection successful!');
    } catch (stripeTestError) {
      console.error('❌ Stripe connection test failed:', stripeTestError);
      const errorMsg = stripeTestError instanceof Error ? stripeTestError.message : 'Unknown error';
      return NextResponse.json(
        { 
          error: 'Unable to connect to Stripe',
          details: errorMsg,
          suggestion: 'Please verify that STRIPE_SECRET_KEY is correctly set in Vercel environment variables'
        },
        { status: 500 }
      );
    }
    
    // Use centralized authentication
    const authContext = await requireAuthenticatedUser(request);
    
    if (!authContext) {
      console.log('❌ Authentication failed: No user context');
      return NextResponse.json(
        { error: 'You must be logged in to subscribe' },
        { status: 401 }
      );
    }

    const user = authContext.user;
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
    
    console.log('🔵 Creating Stripe checkout session...');
    console.log('🔑 Stripe key exists:', !!process.env['STRIPE_SECRET_KEY']);
    console.log('🔑 Stripe key starts with:', process.env['STRIPE_SECRET_KEY']?.substring(0, 10));
    
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
      url: session.url,
      hasUrl: !!session.url,
    });

    if (!session.url) {
      console.error('❌ Stripe session created but no URL returned:', session);
      return NextResponse.json(
        { 
          error: 'Stripe checkout session created but no URL was returned. Please check your Stripe API keys.',
          sessionId: session.id
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error('❌ Failed to create subscription checkout session:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('❌ Error details:', JSON.stringify(error, null, 2));
    
    // Extract more detailed error information
    let errorMessage = 'Failed to create checkout session';
    let errorDetails = 'Unknown error';
    
    if (error instanceof Error) {
      errorMessage = error.message;
      errorDetails = error.message;
      
      // Check for Stripe-specific errors
      if ('type' in error && 'code' in error) {
        const stripeError = error as any;
        errorMessage = stripeError.message || errorMessage;
        errorDetails = `${stripeError.type || 'Unknown'}: ${stripeError.message || 'No details'}`;
        
        // Add more context for common Stripe errors
        if (stripeError.code === 'api_key_invalid') {
          errorDetails = 'Stripe API key is invalid. Please check your STRIPE_SECRET_KEY configuration.';
        } else if (stripeError.code === 'resource_missing') {
          errorDetails = 'Stripe resource not found. This might be a configuration issue.';
        }
      }
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: errorDetails,
        errorType: error instanceof Error ? error.constructor.name : typeof error,
        hasStripeKey: !!process.env['STRIPE_SECRET_KEY'],
        stripeKeyPrefix: process.env['STRIPE_SECRET_KEY']?.substring(0, 8)
      },
      { status: 500 }
    );
  }
}


