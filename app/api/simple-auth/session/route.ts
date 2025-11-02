import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

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

    return NextResponse.json({
      user: sessionData.user,
    });
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json({ user: null });
  }
}




