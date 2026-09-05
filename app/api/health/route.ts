import { NextResponse } from 'next/server';

import { checkDatabaseConnection } from '@/lib/dbHealth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const database = await checkDatabaseConnection();

  const body = {
    status: database.ok ? 'ok' : 'degraded',
    database: database.ok ? 'up' : 'down',
    databaseLatencyMs: database.latencyMs,
    ...(database.error ? { databaseError: database.error } : {}),
    services: {
      stripe: Boolean(process.env['STRIPE_SECRET_KEY']),
      email: Boolean(process.env['RESEND_API_KEY']),
      openai: Boolean(process.env['OPENAI_API_KEY']),
      storage: Boolean(process.env['SUPABASE_SERVICE_ROLE_KEY'] && process.env['NEXT_PUBLIC_SUPABASE_URL']),
    },
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(body, {
    status: database.ok ? 200 : 503,
    headers: { 'Cache-Control': 'no-store' },
  });
}
