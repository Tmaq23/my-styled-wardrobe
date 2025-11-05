import { NextRequest, NextResponse } from 'next/server';

import prisma from '@/lib/prisma';
import { getSessionContext } from '@/lib/apiAuth';
import { sendCustomShopRequestToAdmin, sendCustomShopConfirmationToCustomer } from '@/lib/email';

const STRIPE_SECRET_KEY = process.env['STRIPE_SECRET_KEY'];

export async function GET(request: NextRequest) {
  try {
    const context = await getSessionContext(request);

    if (!context) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId || !STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Retrieve checkout session from Stripe
    const sessionResponse = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, {
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
      },
    });

    if (!sessionResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to verify payment session' },
        { status: 400 }
      );
    }

    const session = await sessionResponse.json();

    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      );
    }

    // Get custom shop request ID from metadata
    const metadata = typeof session.metadata === 'string' 
      ? JSON.parse(session.metadata) 
      : session.metadata;
    
    const customShopRequestId = metadata?.customShopRequestId;

    if (!customShopRequestId) {
      return NextResponse.json(
        { error: 'Custom shop request ID not found' },
        { status: 400 }
      );
    }

    // Update custom shop request status
    const customShopRequest = await prisma.customShopRequest.update({
      where: { id: customShopRequestId },
      data: {
        paymentStatus: 'paid',
        status: 'in_progress',
        stripePaymentIntentId: session.payment_intent || null,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    console.log('✅ Custom shop request payment confirmed:', {
      requestId: customShopRequest.id,
      userEmail: customShopRequest.userEmail,
      amount: customShopRequest.amount,
    });

    // Send confirmation emails asynchronously
    Promise.all([
      // Send notification to admin with all request details
      sendCustomShopRequestToAdmin({
        customerEmail: customShopRequest.user.email || customShopRequest.userEmail,
        customerName: customShopRequest.user.name || customShopRequest.userName,
        bodyShape: customShopRequest.bodyShape,
        colorPalette: customShopRequest.colorPalette,
        occasion: customShopRequest.occasion,
        budget: customShopRequest.budget,
        retailers: customShopRequest.retailers,
        preferences: customShopRequest.preferences || undefined,
        requestId: customShopRequest.id,
      }),
      // Send confirmation to customer
      sendCustomShopConfirmationToCustomer({
        customerEmail: customShopRequest.user.email || customShopRequest.userEmail,
        customerName: customShopRequest.user.name || customShopRequest.userName,
        occasion: customShopRequest.occasion,
        budget: customShopRequest.budget,
        requestId: customShopRequest.id,
      }),
    ]).then((results) => {
      console.log('📧 Email results:', results);
    }).catch((err) => {
      console.error('📧 Error sending emails:', err);
    });

    return NextResponse.json({
      success: true,
      customShopRequest,
      message: 'Payment confirmed. Your custom shop request is being processed.',
    });

  } catch (error) {
    console.error('Custom shop checkout confirmation error:', error);
    return NextResponse.json(
      { error: 'Failed to confirm checkout' },
      { status: 500 }
    );
  }
}


