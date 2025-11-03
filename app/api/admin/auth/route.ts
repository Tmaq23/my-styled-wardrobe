import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

import prisma from '@/lib/prisma';
import { consumeRateLimit } from '@/lib/rateLimit';
import { createSessionValue, writeSessionCookie } from '@/lib/session';

const WINDOW_MS = 60_000; // 1 minute
const MAX_ATTEMPTS_PER_WINDOW = 5;

function safeCompare(a: string, b: string): boolean {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);

  if (aBuffer.length !== bBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(aBuffer, bBuffer);
}

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
    const rawUsername = typeof payload?.username === 'string' ? payload.username.trim() : '';
    const suppliedPassword = typeof payload?.password === 'string' ? payload.password : '';

    if (!rawUsername || !suppliedPassword) {
      return NextResponse.json(
        { success: false, error: 'Username and password are required' },
        { status: 400 }
      );
    }

    const adminUsername = process.env['ADMIN_USERNAME'];
    const adminPassword = process.env['ADMIN_PASSWORD'];

    console.log('Admin credentials check:', {
      hasUsername: !!adminUsername,
      hasPassword: !!adminPassword,
      usernameLength: adminUsername?.length || 0,
      passwordLength: adminPassword?.length || 0,
    });

    if (!adminUsername || !adminPassword) {
      console.error('Admin credentials are not configured. Set ADMIN_USERNAME and ADMIN_PASSWORD.');
      return NextResponse.json(
        { success: false, error: 'Admin authentication is not configured' },
        { status: 500 }
      );
    }

    const normalizedUsername = rawUsername.toLowerCase();
    const rateKey = `admin-auth:${getClientIdentifier(request)}:${normalizedUsername}`;
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

    const cookieStore = await cookies();
    let authenticatedUser: { id: string; email: string | null; name: string | null; isAdmin: boolean } | null = null;
    let isSuperAdmin = false;

    console.log('Comparing credentials:', {
      rawUsername: rawUsername.substring(0, 3) + '***',
      adminUsername: adminUsername ? adminUsername.substring(0, 3) + '***' : 'NOT SET',
      passwordLength: suppliedPassword.length,
      adminPasswordLength: adminPassword ? adminPassword.length : 0,
      rawUsernameFull: rawUsername,
      adminUsernameFull: adminUsername,
    });

    // For debugging: use regular comparison if safeCompare fails
    let usernameMatch = false;
    let passwordMatch = false;
    
    try {
      usernameMatch = safeCompare(rawUsername, adminUsername);
      passwordMatch = safeCompare(suppliedPassword, adminPassword);
    } catch (compareError) {
      console.error('SafeCompare error, falling back to regular comparison:', compareError);
      // Fallback to regular comparison if safeCompare fails
      usernameMatch = rawUsername === adminUsername;
      passwordMatch = suppliedPassword === adminPassword;
    }
    
    console.log('Credential comparison:', { 
      usernameMatch, 
      passwordMatch,
      rawUsernameEquals: rawUsername === adminUsername,
      passwordEquals: suppliedPassword === adminPassword,
    });

    if (usernameMatch && passwordMatch) {
      try {
        console.log('Master admin credentials match, creating/updating admin record...');
        console.log('Using email:', adminUsername);
        
        // First try to find existing user
        let adminRecord = await prisma.user.findUnique({
          where: { email: adminUsername },
          select: {
            id: true,
            email: true,
            name: true,
            isAdmin: true,
          },
        });

        if (adminRecord) {
          // Update existing user
          console.log('Updating existing admin user');
          adminRecord = await prisma.user.update({
            where: { email: adminUsername },
            data: {
              name: 'Master Admin',
              isAdmin: true,
            },
            select: {
              id: true,
              email: true,
              name: true,
              isAdmin: true,
            },
          });
        } else {
          // Create new user
          console.log('Creating new admin user');
          adminRecord = await prisma.user.create({
            data: {
              email: adminUsername,
              name: 'Master Admin',
              isAdmin: true,
            },
            select: {
              id: true,
              email: true,
              name: true,
              isAdmin: true,
            },
          });
        }

        console.log('Admin record:', adminRecord);
        authenticatedUser = adminRecord;
        isSuperAdmin = true;
      } catch (dbError) {
        console.error('Database error creating admin record:', dbError);
        const dbErrorMessage = dbError instanceof Error ? dbError.message : String(dbError);
        console.error('Database error details:', dbErrorMessage);
        throw dbError; // Re-throw to be caught by outer catch
      }
    } else {
      const adminUser = await prisma.user.findUnique({
        where: { email: normalizedUsername },
        select: {
          id: true,
          name: true,
          email: true,
          password: true,
          isAdmin: true,
        },
      });

      if (!adminUser || !adminUser.isAdmin || !adminUser.password) {
        return NextResponse.json(
          { success: false, error: 'Invalid credentials' },
          { status: 401 }
        );
      }

      const passwordMatch = await bcrypt.compare(suppliedPassword, adminUser.password);

      if (!passwordMatch) {
        return NextResponse.json(
          { success: false, error: 'Invalid credentials' },
          { status: 401 }
        );
      }

      authenticatedUser = {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        isAdmin: adminUser.isAdmin,
      };
    }

    if (!authenticatedUser) {
      return NextResponse.json(
        { success: false, error: 'Authentication failed' },
        { status: 401 }
      );
    }

    const sessionValue = createSessionValue({
      id: authenticatedUser.id,
      email: authenticatedUser.email,
      name: authenticatedUser.name,
      roles: ['admin'],
    });

    writeSessionCookie(cookieStore, sessionValue);

    return NextResponse.json({
      success: true,
      user: {
        username: authenticatedUser.email ?? rawUsername,
        name: authenticatedUser.name,
        isSuperAdmin,
      },
    });
  } catch (error) {
    console.error('Admin auth error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorName = error instanceof Error ? error.name : 'Unknown';
    
    // Check if it's a database connection error
    const isDatabaseError = errorMessage.includes('Can\'t reach database server') || 
                           errorMessage.includes('PrismaClientInitializationError') ||
                           errorMessage.includes('database server');
    
    if (isDatabaseError) {
      console.error('Database connection error detected');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Database connection failed. Please check your database configuration.',
          errorType: 'DatabaseError',
        },
        { status: 503 } // Service Unavailable
      );
    }
    
    // For other errors, return generic message
    return NextResponse.json(
      { 
        success: false, 
        error: 'Authentication failed. Please try again.',
        errorType: errorName,
      },
      { status: 500 }
    );
  }
}

