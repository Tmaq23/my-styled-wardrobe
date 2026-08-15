import { NextRequest, NextResponse } from 'next/server';

import prisma from '@/lib/prisma';
import { verifyAdminAccess } from '@/lib/apiAuth';
import { ensureRowLevelSecurity, APP_TABLES } from '@/lib/ensureRls';

/**
 * Admin-only endpoint that enables RLS and revokes public API grants
 * on every application table. Clears Supabase security advisors
 * (rls_disabled_in_public / sensitive_columns_exposed) when the live
 * DATABASE_URL is available in production.
 */
export async function POST(request: NextRequest) {
  try {
    const access = await verifyAdminAccess(request);

    if (access.status === 'unauthenticated') {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (access.status === 'forbidden') {
      return NextResponse.json(
        { success: false, error: 'Admin privileges required' },
        { status: 403 }
      );
    }

    await ensureRowLevelSecurity(prisma);

    const tableList = APP_TABLES.map((t) => `'${t}'`).join(', ');
    const status = await prisma.$queryRawUnsafe<
      Array<{ tablename: string; rowsecurity: boolean }>
    >(
      `SELECT c.relname AS tablename, c.relrowsecurity AS rowsecurity
       FROM pg_class c
       JOIN pg_namespace n ON n.oid = c.relnamespace
       WHERE n.nspname = 'public'
         AND c.relkind = 'r'
         AND c.relname IN (${tableList})
       ORDER BY c.relname`
    );

    const securedTables = status.filter((s) => s.rowsecurity).map((s) => s.tablename);
    const stillOpen = APP_TABLES.filter((table) => !securedTables.includes(table));

    return NextResponse.json({
      success: stillOpen.length === 0,
      securedTables,
      stillOpen,
      message:
        stillOpen.length === 0
          ? 'Row Level Security enabled and API grants revoked on all application tables.'
          : 'Some tables are still missing or do not have RLS enabled.',
    });
  } catch (error) {
    console.error('secure-database failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to secure database',
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
