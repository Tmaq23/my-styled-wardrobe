import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAccess } from '@/lib/apiAuth';

export async function GET(request: NextRequest) {
  try {
    const access = await verifyAdminAccess(request);
    
    if (access.status === 'ok' && access.context) {
      return NextResponse.json({
        authenticated: true,
        user: {
          id: access.context.user.id,
          email: access.context.user.email,
          name: access.context.user.name,
          isAdmin: access.context.user.isAdmin,
        },
      });
    }
    
    return NextResponse.json({ authenticated: false }, { status: 401 });
  } catch (error) {
    console.error('Admin session check error:', error);
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}

