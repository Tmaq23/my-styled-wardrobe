import { NextResponse } from 'next/server';
import { getWearStats } from '@/lib/stats';

export const runtime = 'nodejs';

export async function GET() {
  const stats = await getWearStats();
  return NextResponse.json(stats, { headers: { 'Cache-Control': 'no-store' } });
}
