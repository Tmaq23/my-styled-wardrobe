import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

import prisma from '@/lib/prisma';
import { consumeRateLimit } from '@/lib/rateLimit';
import { createSessionValue, writeSessionCookie } from '@/lib/session';
import { sendNewSignupAlert } from '@/lib/email';

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS_PER_WINDOW = 10;

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
    const providedName = typeof payload?.name === 'string' ? payload.name.trim() : '';

    if (!rawEmail || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const normalizedEmail = rawEmail.toLowerCase();
    const rateKey = `simple-auth-register:${getClientIdentifier(request)}:${normalizedEmail}`;
    const rate = consumeRateLimit({
      key: rateKey,
      limit: MAX_ATTEMPTS_PER_WINDOW,
      windowMs: WINDOW_MS,
    });

    if (!rate.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many sign-up attempts. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(rate.retryAfterSeconds ?? Math.ceil(WINDOW_MS / 1000)),
          },
        }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    if (password.length > 128) {
      return NextResponse.json(
        { success: false, error: 'Password is too long' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const safeName = (providedName || normalizedEmail.split('@')[0]).slice(0, 80);

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        name: safeName,
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    await prisma.userLimit.create({
      data: {
        userId: user.id,
        itemsUploaded: 0,
        outfitsGenerated: 0,
        aiAnalysesUsed: 0,
        tierLimitItems: 6,
        tierLimitOutfits: 10,
        tierLimitAnalyses: 1,
      },
    });

    const cookieStore = await cookies();
    const sessionValue = createSessionValue({
      id: user.id,
      email: user.email,
      name: user.name,
    });

    writeSessionCookie(cookieStore, sessionValue);

    // Send signup alert to admin (non-blocking)
    sendNewSignupAlert({
      userEmail: user.email,
      userName: user.name || undefined,
      signupDate: new Date(),
    }).catch((error) => {
      // Log email errors but don't fail the request
      console.error('Signup alert email error (non-blocking):', error);
    });

    return NextResponse.json({
      success: true,
      user: {
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, error: 'Registration failed' },
      { status: 500 }
    );
  }
}

