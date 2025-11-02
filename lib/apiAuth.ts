import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';

import prisma from '@/lib/prisma';
import {
  SESSION_COOKIE_NAME,
  type SessionPayload,
  parseSessionValue,
} from '@/lib/session';

export interface AuthenticatedUser {
  id: string;
  email: string | null;
  name: string | null;
  isAdmin: boolean;
}

export interface AuthContext {
  user: AuthenticatedUser;
  session: SessionPayload;
}

function isAdminEmail(email?: string | null): boolean {
  const adminUsername = process.env['ADMIN_USERNAME']?.toLowerCase();

  if (!adminUsername || !email) {
    return false;
  }

  return email.toLowerCase() === adminUsername;
}

async function getCookieValue(req?: NextRequest): Promise<string | null> {
  if (req) {
    return req.cookies.get(SESSION_COOKIE_NAME)?.value ?? null;
  }

  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;
}

export async function getSessionContext(req?: NextRequest): Promise<AuthContext | null> {
  try {
    const cookieValue = await getCookieValue(req);
    const session = parseSessionValue(cookieValue);

    if (!session) {
      return null;
    }

    const userRecord = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        isAdmin: true,
      },
    });

    if (!userRecord) {
      if (isAdminEmail(session.user.email)) {
        const adminEmail = session.user.email as string;

        const fallback = await prisma.user.upsert({
          where: { email: adminEmail },
          update: {
            name: session.user.name ?? 'Admin User',
            isAdmin: true,
          },
          create: {
            id: session.user.id,
            email: adminEmail,
            name: session.user.name ?? 'Admin User',
            isAdmin: true,
          },
          select: {
            id: true,
            email: true,
            name: true,
            isAdmin: true,
          },
        });

        return {
          user: fallback,
          session,
        };
      }

      return null;
    }

    return {
      user: userRecord,
      session,
    };
  } catch (error) {
    console.error('Failed to read authentication context:', error);
    return null;
  }
}

export async function requireAuthenticatedUser(
  req?: NextRequest
): Promise<AuthContext | null> {
  return getSessionContext(req);
}

export async function requireAdminUser(req?: NextRequest): Promise<AuthContext | null> {
  const context = await getSessionContext(req);

  if (!context) {
    return null;
  }

  if (context.user.isAdmin || isAdminEmail(context.user.email)) {
    return context;
  }

  return null;
}

export type AdminAccessCheck =
  | { status: 'ok'; context: AuthContext }
  | { status: 'unauthenticated' }
  | { status: 'forbidden'; context: AuthContext };

export async function verifyAdminAccess(req?: NextRequest): Promise<AdminAccessCheck> {
  const context = await getSessionContext(req);

  if (!context) {
    return { status: 'unauthenticated' };
  }

  if (context.user.isAdmin || isAdminEmail(context.user.email)) {
    return { status: 'ok', context };
  }

  return { status: 'forbidden', context };
}


