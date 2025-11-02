import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { deleteSessionCookie } from '@/lib/session';

export async function POST() {
  try {
    const cookieStore = await cookies();

    deleteSessionCookie(cookieStore);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, error: 'Logout failed' },
      { status: 500 }
    );
  }
}




