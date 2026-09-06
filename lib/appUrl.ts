import type { NextRequest } from 'next/server';

const PRODUCTION_URL = 'https://www.mystyledwardrobe.com';

/**
 * Turn an env/header value into a clean origin, or null if it is unusable.
 * Env values pasted into dashboards often carry stray whitespace or newlines
 * (which Stripe rejects as `url_invalid`), so we trim and re-serialise.
 */
function toOrigin(value?: string | null): string | null {
  if (!value) return null;

  const trimmed = value.trim().replace(/\/+$/, '');
  if (!trimmed || /\s/.test(trimmed)) return null;

  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const url = new URL(candidate);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
    if (!url.hostname.includes('.') && url.hostname !== 'localhost') return null;
    return url.origin;
  } catch {
    return null;
  }
}

function isLocal(origin: string): boolean {
  return /localhost|127\.0\.0\.1|0\.0\.0\.0/.test(origin);
}

/**
 * Public site origin for Stripe redirects and emails.
 * Prefer the current request host so preview/local checkouts return
 * to the same environment instead of always bouncing to production.
 */
export function getAppBaseUrl(request?: NextRequest): string {
  const fromEnv = toOrigin(process.env['NEXTAUTH_URL']) ?? toOrigin(process.env['NEXT_PUBLIC_APP_URL']);
  if (fromEnv && !isLocal(fromEnv)) {
    return fromEnv;
  }

  const requestOrigin = toOrigin(request?.nextUrl?.origin);
  if (requestOrigin && !isLocal(requestOrigin)) {
    return requestOrigin;
  }

  const vercelOrigin = toOrigin(process.env['VERCEL_URL']);
  if (vercelOrigin) {
    return vercelOrigin;
  }

  return fromEnv ?? PRODUCTION_URL;
}
