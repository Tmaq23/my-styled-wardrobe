import { NextRequest, NextResponse } from 'next/server';
import { AVAILABLE_LOOKBOOKS, getLookbooksForUser } from '../../../lib/lookbooks';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bodyShape = searchParams.get('bodyShape');
    const season = searchParams.get('season') || undefined;
    
    let lookbooks = AVAILABLE_LOOKBOOKS;
    
    if (bodyShape) {
      lookbooks = getLookbooksForUser(bodyShape, season);
    }
    
    return NextResponse.json({ 
      lookbooks: lookbooks.map(book => ({
        ...book,
        fileUrl: undefined // Don't expose download URLs in public API
      }))
    });
    
  } catch (error) {
    console.error('Error fetching lookbooks:', error);
    return NextResponse.json({ error: 'Failed to fetch lookbooks' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { lookbookId, userId, paymentIntentId } = await request.json();
    
    // TODO: Verify payment with Stripe
    // const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    // if (paymentIntent.status !== 'succeeded') {
    //   return NextResponse.json({ error: 'Payment not confirmed' }, { status: 400 });
    // }
    
    const lookbook = AVAILABLE_LOOKBOOKS.find(book => book.id === lookbookId);
    if (!lookbook) {
      return NextResponse.json({ error: 'Lookbook not found' }, { status: 404 });
    }
    
    // TODO: Save purchase to database
    // await supabase.from('user_purchases').insert({
    //   user_id: userId,
    //   lookbook_id: lookbookId,
    //   stripe_payment_id: paymentIntentId,
    //   purchased_at: new Date().toISOString()
    // });
    
    // Generate download URL (in production, this would be a signed URL)
    const downloadUrl = `/api/lookbooks/download/${lookbookId}?token=${userId}-${Date.now()}`;
    
    return NextResponse.json({
      success: true,
      downloadUrl,
      lookbook: {
        ...lookbook,
        fileUrl: downloadUrl
      }
    });
    
  } catch (error) {
    console.error('Error processing lookbook purchase:', error);
    return NextResponse.json({ error: 'Failed to process purchase' }, { status: 500 });
  }
}
