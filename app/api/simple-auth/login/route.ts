import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

import prisma from '@/lib/prisma';
import { consumeRateLimit } from '@/lib/rateLimit';
import { createSessionValue, writeSessionCookie } from '@/lib/session';
import { DATABASE_UNAVAILABLE_MESSAGE, isDatabaseUnavailableError } from '@/lib/dbHealth';
import {
  DEMO_EMAIL,
  DEMO_FALLBACK_USER,
  DEMO_NAME,
  DEMO_PASSWORD,
  ensureDemoUser,
} from '@/lib/demoUser';

const WINDOW_MS = 60_000; // 1 minute
const MAX_ATTEMPTS_PER_WINDOW = 5;

function getClientIdentifier(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');

  if (forwardedFor) {
    const [first] = forwardedFor.split(',');
    if (first) {
      return first.trim();
    }
  }

  return 'unknown';
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const rawEmail = typeof payload?.email === 'string' ? payload.email.trim() : '';
    const password = typeof payload?.password === 'string' ? payload.password : '';

    if (!rawEmail || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const normalizedEmail = rawEmail.toLowerCase();
    const rateKey = `simple-auth-login:${getClientIdentifier(request)}:${normalizedEmail}`;
    const rate = consumeRateLimit({
      key: rateKey,
      limit: MAX_ATTEMPTS_PER_WINDOW,
      windowMs: WINDOW_MS,
    });

    if (!rate.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many login attempts. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(rate.retryAfterSeconds ?? Math.ceil(WINDOW_MS / 1000)),
          },
        }
      );
    }

    // Persist the advertised demo account so session-backed APIs can resolve it.
    // If the database is down, still issue a stateless demo session so the
    // site can be demonstrated.
    if (normalizedEmail === DEMO_EMAIL && password === DEMO_PASSWORD) {
      let demoUser: { id: string; email: string | null; name: string | null };
      try {
        demoUser = await ensureDemoUser();
      } catch (error) {
        if (!isDatabaseUnavailableError(error)) throw error;
        console.error('Database unavailable during demo login; using stateless demo session');
        demoUser = DEMO_FALLBACK_USER;
      }
      const cookieStore = await cookies();
      const sessionValue = createSessionValue({
        id: demoUser.id,
        email: demoUser.email,
        name: demoUser.name ?? DEMO_NAME,
      });

      writeSessionCookie(cookieStore, sessionValue);

      return NextResponse.json({
        success: true,
        user: {
          email: demoUser.email,
          name: demoUser.name ?? DEMO_NAME,
        },
      });
    }

    // Check database for real user
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
      },
    });

    if (!user || !user.password) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Create session
    const cookieStore = await cookies();
    const sessionValue = createSessionValue({
      id: user.id,
      email: user.email,
      name: user.name,
    });

    writeSessionCookie(cookieStore, sessionValue);
    
    return NextResponse.json({
      success: true,
      user: {
        email: user.email,
        name: user.name,
      },
    });

  } catch (error) {
    console.error('Login error:', error);

    if (isDatabaseUnavailableError(error)) {
      return NextResponse.json(
        { success: false, error: DATABASE_UNAVAILABLE_MESSAGE, code: 'database_unavailable' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Login failed' },
      { status: 500 }
    );
  }
}

