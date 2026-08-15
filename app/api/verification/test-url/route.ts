import { NextRequest, NextResponse } from 'next/server';
import { getAppBaseUrl } from '@/lib/appUrl';

export async function GET(request: NextRequest) {
  const baseUrl = getAppBaseUrl(request);
  
  return NextResponse.json({
    baseUrl,
    successUrl: `${baseUrl}/verification/success?session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${baseUrl}/verification/cancel`,
    envNextAuthUrl: process.env['NEXTAUTH_URL'],
    envVercelUrl: process.env['VERCEL_URL'],
  });
}

