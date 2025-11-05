import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * Simple endpoint to test database connection
 * Access: GET /api/test-db
 */
export async function GET() {
  try {
    console.log('Testing database connection...');
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
    console.log('DATABASE_URL starts with:', process.env.DATABASE_URL?.substring(0, 20));
    
    // Try a simple query
    const userCount = await prisma.user.count();
    
    console.log('✅ Database connection successful! User count:', userCount);
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      userCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Database connection test failed:');
    console.error(error);
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorName = error instanceof Error ? error.name : 'Unknown';
    
    return NextResponse.json({
      success: false,
      error: 'Database connection failed',
      errorType: errorName,
      errorMessage: errorMessage,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

