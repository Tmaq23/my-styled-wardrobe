import { NextRequest, NextResponse } from 'next/server';

import prisma from '@/lib/prisma';
import { getSessionContext } from '@/lib/apiAuth';

const STRIPE_SECRET_KEY = process.env['STRIPE_SECRET_KEY'];
const CUSTOM_SHOP_AMOUNT = 120.0; // £120

export async function POST(request: NextRequest) {
  try {
    const context = await getSessionContext(request);

    if (!context) {
      return NextResponse.json(
        { error: 'Authentication required. Please log in to request a custom shop.' },
        { status: 401 }
      );
    }

    const requestBody = await request.json();
    const { 
      bodyShape, 
      colorPalette, 
      occasion, 
      budget, 
      preferences,
      retailers 
    } = requestBody;

    console.log('Received custom shop request:', { 
      bodyShape, 
      colorPalette, 
      occasion,
      budget,
      hasStripeKey: !!STRIPE_SECRET_KEY 
    });

    // Validate required fields
    if (!STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Payment system is not configured. Please contact support.' },
        { status: 500 }
      );
    }

    if (!bodyShape || !colorPalette || !occasion || !budget) {
      return NextResponse.json(
        { error: 'Body shape, color palette, occasion, and budget are required' },
        { status: 400 }
      );
    }

    // Check if user already has a custom shop request with paid status
    const existingPaidRequest = await prisma.customShopRequest.findFirst({
      where: {
        userId: context.user.id,
        paymentStatus: 'paid', // Only check paid requests
        status: { in: ['pending', 'in_progress'] },
      },
    });

    if (existingPaidRequest) {
      return NextResponse.json(
        { 
          error: 'You already have a custom shop request in progress',
          requestId: existingPaidRequest.id,
        },
        { status: 409 }
      );
    }

    // ALWAYS clean up any stuck pending requests (payment never completed)
    // This ensures users can always retry if payment failed
    console.log(`🧹 Checking for stuck pending requests for user ${context.user.id}...`);
    
    const stuckRequests = await prisma.customShopRequest.deleteMany({
      where: {
        userId: context.user.id,
        paymentStatus: 'pending', // Payment never completed
      },
    });

    if (stuckRequests.count > 0) {
      console.log(`✅ Cleaned up ${stuckRequests.count} stuck pending request(s) for user ${context.user.id}`);
    } else {
      console.log(`✅ No stuck requests to clean up for user ${context.user.id}`);
    }

    // Create custom shop request record
    const customShopRequest = await prisma.customShopRequest.create({
      data: {
        userId: context.user.id,
        userEmail: context.user.email || '',
        userName: context.user.name || '',
        bodyShape,
        colorPalette,
        occasion,
        budget,
        preferences: preferences || null,
        retailers: retailers || [],
        amount: CUSTOM_SHOP_AMOUNT,
        currency: 'gbp',
        paymentStatus: 'pending',
        status: 'pending',
        estimatedDelivery: '2-3 business days',
      },
    });

    // Create Stripe Checkout Session
    const baseUrl = 'https://www.mystyledwardrobe.com';
    const successUrl = `${baseUrl}/custom-shop/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}/custom-shop/cancel`;

    const params = new URLSearchParams({
      'success_url': successUrl,
      'cancel_url': cancelUrl,
      'mode': 'payment',
      'payment_method_types[]': 'card',
      'line_items[0][price_data][currency]': 'gbp',
      'line_items[0][price_data][product_data][name]': 'Personalized Custom Shop Service',
      'line_items[0][price_data][product_data][description]': `Custom styling service for ${occasion} occasions`,
      'line_items[0][price_data][unit_amount]': String(Math.round(CUSTOM_SHOP_AMOUNT * 100)),
      'line_items[0][quantity]': '1',
      'metadata[type]': 'custom_shop',
      'metadata[customShopRequestId]': customShopRequest.id,
      'metadata[userId]': context.user.id,
      'customer_email': context.user.email || '',
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
      });
      return NextResponse.json(
        { error: `Failed to create checkout session: ${errorText.substring(0, 200)}` },
        { status: 500 }
      );
    }

    const session = await checkoutResponse.json();

    // Update request with session ID
    await prisma.customShopRequest.update({
      where: { id: customShopRequest.id },
      data: { stripeSessionId: session.id },
    });

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
    });

  } catch (error) {
    console.error('Custom shop checkout creation error:', error);
    return NextResponse.json(
      { error: `Failed to create checkout: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}


