import type { NextRequest } from 'next/server';

const PRODUCTION_URL = 'https://www.mystyledwardrobe.com';

/**
 * Public site origin for Stripe redirects and emails.
 * Prefer the current request host so preview/local checkouts return
 * to the same environment instead of always bouncing to production.
 */
export function getAppBaseUrl(request?: NextRequest): string {
  const fromEnv = process.env['NEXTAUTH_URL']?.replace(/\/$/, '');
  if (fromEnv && !fromEnv.includes('localhost')) {
    return fromEnv;
  }

  const origin = request?.nextUrl?.origin;
  if (origin && !origin.includes('localhost')) {
    return origin;
  }

  if (fromEnv) {
    return fromEnv;
  }

  return PRODUCTION_URL;
}
