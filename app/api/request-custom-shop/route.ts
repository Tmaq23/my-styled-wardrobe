import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionContext } from '@/lib/apiAuth';

export async function POST(request: NextRequest) {
  try {
    const context = await getSessionContext(request);

    if (!context) {
      return NextResponse.json(
        { error: 'Authentication required. Please log in to request a custom shop.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    const {
      bodyShape,
      colourPalette,
      occasion,
      budget,
      preferences,
      retailers
    } = body;
    
    // Validate required fields
    if (!bodyShape || !colourPalette || !occasion || !budget) {
      return NextResponse.json({ 
        error: 'Body shape, color palette, occasion, and budget are required' 
      }, { status: 400 });
    }
    
    console.log('📬 Custom shop request received:', { 
      userEmail: context.user.email, 
      userName: context.user.name, 
      bodyShape, 
      occasion 
    });
    
    // Redirect to Stripe checkout endpoint
    const checkoutResponse = await fetch(`${request.nextUrl.origin}/api/custom-shop/create-checkout`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || '', // Forward session cookies
      },
      body: JSON.stringify({
        bodyShape,
        colorPalette: colourPalette,
        occasion,
        budget,
        preferences,
        retailers,
      }),
    });

    const checkoutData = await checkoutResponse.json();

    if (!checkoutResponse.ok) {
      return NextResponse.json(
        { error: checkoutData.error || 'Failed to create checkout session' },
        { status: checkoutResponse.status }
      );
    }
    
    return NextResponse.json({
      success: true,
      checkoutUrl: checkoutData.url,
      sessionId: checkoutData.sessionId,
    });
    
  } catch (error) {
    console.error('❌ Custom shop request error:', error);
    
    return NextResponse.json({ 
      error: 'Failed to process custom shop request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}




