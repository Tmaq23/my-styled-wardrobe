import crypto from 'crypto';

export const SESSION_COOKIE_NAME = 'auth-session';
const DEFAULT_MAX_AGE_SECONDS = 60 * 60 * 24; // 24 hours
const SESSION_VERSION = 1;

export interface SessionUser {
  id: string;
  email?: string | null;
  name?: string | null;
  roles?: string[];
}

export interface SessionPayload {
  user: SessionUser;
  issuedAt: number;
  expiresAt: number;
  version: number;
}

type CookieWriter = {
  set: (name: string, value: string, options: {
    httpOnly: boolean;
    secure: boolean;
    sameSite: 'lax' | 'strict' | 'none';
    maxAge: number;
    path: string;
  }) => void;
  delete: (name: string) => void;
};

function getSecret(): string {
  const secret = process.env['AUTH_SESSION_SECRET'] || process.env['NEXTAUTH_SECRET'];

  if (!secret || secret.length < 32) {
    throw new Error(
      'AUTH_SESSION_SECRET (or NEXTAUTH_SECRET) must be set and contain at least 32 characters.'
    );
  }

  return secret;
}

function base64UrlEncode(buffer: Buffer): string {
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function base64UrlDecode(value: string): Buffer {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '==='.slice((normalized.length + 3) % 4);
  return Buffer.from(padded, 'base64');
}

function createSignature(payload: string): string {
  const hmac = crypto.createHmac('sha256', getSecret());
  hmac.update(payload);
  return base64UrlEncode(hmac.digest());
}

function constantTimeCompare(a: string, b: string): boolean {
  const aBuffer = base64UrlDecode(a);
  const bBuffer = base64UrlDecode(b);

  if (aBuffer.length !== bBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(aBuffer, bBuffer);
}

export function createSessionValue(
  user: SessionUser,
  options?: { maxAgeSeconds?: number }
): string {
  const maxAgeSeconds = options?.maxAgeSeconds ?? DEFAULT_MAX_AGE_SECONDS;
  const now = Date.now();

  const payload: SessionPayload = {
    user,
    issuedAt: now,
    expiresAt: now + maxAgeSeconds * 1000,
    version: SESSION_VERSION,
  };

  const encodedPayload = base64UrlEncode(Buffer.from(JSON.stringify(payload), 'utf8'));
  const signature = createSignature(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

export function parseSessionValue(value?: string | null): SessionPayload | null {
  if (!value) {
    return null;
  }

  const [encodedPayload, signature] = value.split('.');

  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = createSignature(encodedPayload);

  if (!constantTimeCompare(signature, expectedSignature)) {
    return null;
  }

  try {
    const payloadBuffer = base64UrlDecode(encodedPayload);
    const payloadJson = payloadBuffer.toString('utf8');
    const payload = JSON.parse(payloadJson) as SessionPayload;

    if (!payload?.user?.id) {
      return null;
    }

    if (typeof payload.expiresAt !== 'number' || payload.expiresAt <= Date.now()) {
      return null;
    }

    if (payload.version !== SESSION_VERSION) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function writeSessionCookie(
  cookieStore: CookieWriter,
  value: string,
  options?: { maxAgeSeconds?: number }
) {
  const maxAgeSeconds = options?.maxAgeSeconds ?? DEFAULT_MAX_AGE_SECONDS;

  cookieStore.set(SESSION_COOKIE_NAME, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: maxAgeSeconds,
    path: '/',
  });
}

export function deleteSessionCookie(cookieStore: CookieWriter) {
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export function getSessionTTLSeconds(options?: { maxAgeSeconds?: number }) {
  return options?.maxAgeSeconds ?? DEFAULT_MAX_AGE_SECONDS;
}

