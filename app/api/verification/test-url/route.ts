import { NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = 'https://www.mystyledwardrobe.com';
  
  return NextResponse.json({
    baseUrl,
    successUrl: `${baseUrl}/verification/success?session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${baseUrl}/verification/cancel`,
    envNextAuthUrl: process.env['NEXTAUTH_URL'],
    envVercelUrl: process.env['VERCEL_URL'],
  });
}

