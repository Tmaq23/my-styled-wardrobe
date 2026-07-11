import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

import { deleteSessionCookie, parseSessionValue } from '@/lib/session';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('auth-session');

    if (!sessionCookie?.value) {
      return NextResponse.json({ user: null });
    }

    const sessionData = parseSessionValue(sessionCookie.value);

    if (!sessionData) {
      deleteSessionCookie(cookieStore);
      return NextResponse.json({ user: null });
    }

    // Fetch additional user data from database including subscription.
    // Time-boxed so a slow/unreachable database can never hang the session
    // check (which would leave the whole UI stuck in a loading state).
    try {
      const dbUser = await Promise.race([
        prisma.user.findUnique({
          where: { id: sessionData.user.id },
          select: {
            id: true,
            email: true,
            name: true,
            isAdmin: true,
            subscription: {
              select: {
                tier: true,
                stripeSubscriptionId: true,
                activeUntil: true,
              },
            },
          },
        }),
        new Promise<null>((_, reject) =>
          setTimeout(() => reject(new Error('Session DB lookup timed out')), 3000)
        ),
      ]);

      if (dbUser) {
        return NextResponse.json({
          user: {
            ...sessionData.user,
            isAdmin: dbUser.isAdmin,
            subscription: dbUser.subscription,
          },
        });
      }
    } catch (dbError) {
      console.error('Database error fetching user:', dbError);
    }

    return NextResponse.json({
      user: sessionData.user,
    });
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json({ user: null });
  }
}




