import { NextRequest, NextResponse } from 'next/server';

import prisma from '@/lib/prisma';
import { getSessionContext } from '@/lib/apiAuth';
import { normalizeBodyShape } from '@/lib/bodyShapeAliases';
import { DATABASE_UNAVAILABLE_MESSAGE, isDatabaseUnavailableError } from '@/lib/dbHealth';
import { LEGACY_DEMO_USER_ID } from '@/lib/demoUser';

const PALETTES = ['Spring', 'Summer', 'Autumn', 'Winter'] as const;
type Palette = (typeof PALETTES)[number];

function normalizePalette(value: unknown): Palette | null {
  if (typeof value !== 'string') return null;
  const match = PALETTES.find((p) => p.toLowerCase() === value.trim().toLowerCase());
  return match ?? null;
}

/**
 * GET: the signed-in user's saved style profile (body shape + colour season).
 */
export async function GET(request: NextRequest) {
  try {
    const context = await getSessionContext(request);

    if (!context) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    if (context.user.id === LEGACY_DEMO_USER_ID) {
      return NextResponse.json({ success: true, profile: { bodyShape: null, colorPalette: null, updatedAt: null } });
    }

    const user = await prisma.user.findUnique({
      where: { id: context.user.id },
      select: { bodyShape: true, colorPalette: true, updatedAt: true },
    });

    return NextResponse.json({
      success: true,
      profile: {
        bodyShape: user?.bodyShape ?? null,
        colorPalette: user?.colorPalette ?? null,
        updatedAt: user?.updatedAt?.toISOString() ?? null,
      },
    });
  } catch (error) {
    console.error('Failed to load style profile:', error);
    const status = isDatabaseUnavailableError(error) ? 503 : 500;
    return NextResponse.json(
      { error: status === 503 ? DATABASE_UNAVAILABLE_MESSAGE : 'Failed to load profile' },
      { status }
    );
  }
}

/**
 * PUT: save the user's body shape and/or colour season so they are prefilled
 * on their next visit. Either field may be omitted; nulls clear a value.
 */
export async function PUT(request: NextRequest) {
  try {
    const context = await getSessionContext(request);

    if (!context) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const data: { bodyShape?: string | null; colorPalette?: string | null } = {};

    if ('bodyShape' in body) {
      if (body.bodyShape === null || body.bodyShape === '') {
        data.bodyShape = null;
      } else if (typeof body.bodyShape === 'string') {
        data.bodyShape = normalizeBodyShape(body.bodyShape);
      } else {
        return NextResponse.json({ error: 'Invalid body shape' }, { status: 400 });
      }
    }

    if ('colorPalette' in body) {
      if (body.colorPalette === null || body.colorPalette === '') {
        data.colorPalette = null;
      } else {
        const palette = normalizePalette(body.colorPalette);
        if (!palette) {
          return NextResponse.json(
            { error: `Invalid colour palette. Expected one of: ${PALETTES.join(', ')}` },
            { status: 400 }
          );
        }
        data.colorPalette = palette;
      }
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
    }

    if (context.user.id === LEGACY_DEMO_USER_ID) {
      // Stateless demo session (database offline): acknowledge without persisting.
      return NextResponse.json({ success: true, persisted: false, profile: { ...data, updatedAt: null } });
    }

    const user = await prisma.user.update({
      where: { id: context.user.id },
      data,
      select: { bodyShape: true, colorPalette: true, updatedAt: true },
    });

    return NextResponse.json({
      success: true,
      persisted: true,
      profile: {
        bodyShape: user.bodyShape,
        colorPalette: user.colorPalette,
        updatedAt: user.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Failed to save style profile:', error);
    const status = isDatabaseUnavailableError(error) ? 503 : 500;
    return NextResponse.json(
      { error: status === 503 ? DATABASE_UNAVAILABLE_MESSAGE : 'Failed to save profile' },
      { status }
    );
  }
}
