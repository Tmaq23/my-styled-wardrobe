import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { isAdmin: false },
        { status: 200 }
      );
    }

    // Check if user exists and is admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        isAdmin: true,
        email: true
      },
    });

    // Check if user is admin either by flag or by matching admin email
    const adminEmail = process.env['ADMIN_USERNAME']?.toLowerCase();
    const isAdminByEmail = adminEmail && user?.email?.toLowerCase() === adminEmail;

    return NextResponse.json({
      isAdmin: user?.isAdmin || isAdminByEmail || false,
    });
  } catch (error) {
    console.error('Error checking admin status:', error);
    return NextResponse.json(
      { isAdmin: false },
      { status: 200 }
    );
  }
}
