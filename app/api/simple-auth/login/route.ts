import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

import prisma from '@/lib/prisma';
import { consumeRateLimit } from '@/lib/rateLimit';
import { createSessionValue, writeSessionCookie } from '@/lib/session';

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

    // Check for demo account first (no database lookup needed)
    if (normalizedEmail === 'demo@mystyledwardrobe.com' && password === 'demo123') {
      const cookieStore = await cookies();
      const sessionValue = createSessionValue({
        id: 'demo-user-1',
        email: 'demo@mystyledwardrobe.com',
        name: 'Demo User',
      });

      writeSessionCookie(cookieStore, sessionValue);

      return NextResponse.json({
        success: true,
        user: {
          email: 'demo@mystyledwardrobe.com',
          name: 'Demo User',
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
    return NextResponse.json(
      { success: false, error: 'Login failed' },
      { status: 500 }
    );
  }
}

