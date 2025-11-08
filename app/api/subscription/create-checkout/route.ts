import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuthenticatedUser } from '@/lib/apiAuth';

export async function POST(request: NextRequest) {
  try {
    console.log('🔵 Starting subscription checkout creation...');
    console.log('🔑 Checking Stripe configuration...');
    
    const STRIPE_SECRET_KEY = process.env['STRIPE_SECRET_KEY'];
    if (!STRIPE_SECRET_KEY) {
      console.error('❌ STRIPE_SECRET_KEY is not set!');
      return NextResponse.json(
        { error: 'Stripe is not configured. Please contact support.' },
        { status: 500 }
      );
    }
    
    console.log('✅ Stripe key found');
    
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

    // Check if user already has a subscription
    const subscription = await prisma.userSubscription.findUnique({
      where: { userId: user.id },
      select: { 
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        tier: true 
      },
    });

    // Create Stripe Checkout Session for subscription using REST API (same as working flows)
    const baseUrl = 'https://www.mystyledwardrobe.com';
    const successUrl = `${baseUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}/subscription/cancel`;

    console.log('🔵 Creating Stripe checkout session via REST API...');
    
    const params = new URLSearchParams({
      'success_url': successUrl,
      'cancel_url': cancelUrl,
      'mode': 'subscription',
      'payment_method_types[]': 'card',
      'line_items[0][price_data][currency]': 'gbp',
      'line_items[0][price_data][product_data][name]': 'My Styled Wardrobe - Subscribe',
      'line_items[0][price_data][product_data][description]': 'Unlimited AI outfit Combination Generator and Access to Style Blog',
      'line_items[0][price_data][unit_amount]': '599', // £5.99 in pence
      'line_items[0][price_data][recurring][interval]': 'month',
      'line_items[0][quantity]': '1',
      'metadata[userId]': user.id,
      'metadata[type]': 'subscription',
      'customer_email': user.email || '',
    });

    // Add existing customer ID if available
    if (subscription?.stripeCustomerId) {
      params.append('customer', subscription.stripeCustomerId);
    }

    const checkoutResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    if (!checkoutResponse.ok) {
      const errorData = await checkoutResponse.json();
      console.error('❌ Stripe API error:', errorData);
      throw new Error(errorData.error?.message || 'Failed to create Stripe checkout session');
    }

    const sessionData = await checkoutResponse.json();
    console.log('✅ Stripe checkout session created:', sessionData.id);

    if (!sessionData.url) {
      console.error('❌ No checkout URL in Stripe response');
      throw new Error('Stripe did not return a checkout URL');
    }

    // Update or create subscription record with customer ID
    if (sessionData.customer) {
      await prisma.userSubscription.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          stripeCustomerId: sessionData.customer,
          tier: 'free',
        },
        update: {
          stripeCustomerId: sessionData.customer,
        },
      });
    }

    return NextResponse.json({
      success: true,
      checkoutUrl: sessionData.url,
      sessionId: sessionData.id,
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


