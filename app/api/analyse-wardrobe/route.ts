import { NextRequest } from 'next/server';

export const runtime = 'nodejs';

// Minimal stub: returns an empty result set. This unblocks builds until the
// wardrobe analysis feature is implemented.
export async function POST(_req: NextRequest) {
	return Response.json({ ok: true, looks: [], products: [], items: [] });
}

export async function GET() {
	return Response.json({ ok: true });
}

