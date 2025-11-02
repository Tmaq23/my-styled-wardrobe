import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Get the cookies
    const cookieStore = await cookies();
    
    // Delete NextAuth cookies
    const cookiesToDelete = [
      'auth-session',
      'next-auth.session-token',
      '__Secure-next-auth.session-token',
      'next-auth.csrf-token',
      '__Secure-next-auth.csrf-token',
      'next-auth.callback-url',
      '__Secure-next-auth.callback-url',
    ];

    // Delete all NextAuth-related cookies
    cookiesToDelete.forEach(cookieName => {
      try {
        cookieStore.delete(cookieName);
      } catch (e) {
        // Cookie might not exist, that's fine
      }
    });

    // Return a response that forces a redirect to home
    return NextResponse.redirect(new URL('/', process.env.NEXTAUTH_URL || 'http://localhost:3000'), {
      headers: {
        'Clear-Site-Data': '"cookies", "storage"',
      },
    });
  } catch (error) {
    console.error('Force logout error:', error);
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
  }
}




