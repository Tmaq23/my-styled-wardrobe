import { NextRequest, NextResponse } from 'next/server';
import { getSessionContext } from '@/lib/apiAuth';

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
    const stripeSecretKey = process.env['STRIPE_SECRET_KEY'];
    if (!stripeSecretKey) {
      return NextResponse.json(
        { error: 'Payment system is not configured. Please contact support.' },
        { status: 500 }
      );
    }

    // Create a unique request ID for tracking
    const requestId = `CSR-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;

    // Get the base URL for success/cancel redirects
    const baseUrl = process.env['NEXTAUTH_URL'] || 'http://localhost:3000';

    // Create Stripe Checkout Session
    const params = new URLSearchParams({
      'payment_method_types[0]': 'card',
      mode: 'payment',
      'line_items[0][price_data][currency]': CURRENCY,
      'line_items[0][price_data][product_data][name]': 'Customised Online Shop Service',
      'line_items[0][price_data][product_data][description]': 'Personalised styling service with curated product recommendations',
      'line_items[0][price_data][unit_amount]': String(Math.round(CUSTOM_SHOP_AMOUNT * 100)),
      'line_items[0][quantity]': '1',
      success_url: `${baseUrl}/style-interface?custom_shop_success=true&request_id=${requestId}`,
      cancel_url: `${baseUrl}/style-interface?custom_shop_cancelled=true`,
      'metadata[type]': 'custom_shop_request',
      'metadata[requestId]': requestId,
      'metadata[userId]': context.user.id,
      'metadata[userName]': userName,
      'metadata[userEmail]': userEmail,
      'metadata[bodyShape]': bodyShape || '',
      'metadata[colourPalette]': colourPalette || '',
      'metadata[occasion]': occasion || '',
      'metadata[budget]': budget || '',
      'metadata[retailers]': JSON.stringify(retailers || []),
      'metadata[preferences]': preferences || '',
    });

    const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!stripeResponse.ok) {
      const errorText = await stripeResponse.text();
      console.error('Stripe API error:', errorText);
      throw new Error(`Stripe API error: ${stripeResponse.status}`);
    }

    const session = await stripeResponse.json();

    console.log('🛍️ Custom shop checkout session created:', {
      requestId,
      sessionId: session.id,
      userName,
      userEmail,
    });

    return NextResponse.json({
      requestId,
      sessionId: session.id,
      checkoutUrl: session.url,
      amount: CUSTOM_SHOP_AMOUNT,
      currency: CURRENCY,
    });

  } catch (error) {
    console.error('Custom shop checkout creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
