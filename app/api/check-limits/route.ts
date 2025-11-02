import { NextRequest, NextResponse } from 'next/server';
import { checkUserLimits } from '../../../lib/subscription';

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();
    
    if (!action) {
      return NextResponse.json({ error: 'Missing action' }, { status: 400 });
    }
    
    const limitCheck = await checkUserLimits(action);
    
    return NextResponse.json(limitCheck);
    
  } catch (error) {
    console.error('Error checking limits:', error);
    return NextResponse.json({ error: 'Failed to check limits' }, { status: 500 });
  }
}
