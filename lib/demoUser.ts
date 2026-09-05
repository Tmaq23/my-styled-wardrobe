import bcrypt from 'bcryptjs';

import prisma from '@/lib/prisma';

export const DEMO_EMAIL = 'demo@mystyledwardrobe.com';
export const DEMO_PASSWORD = 'demo123';
export const DEMO_NAME = 'Demo User';
export const LEGACY_DEMO_USER_ID = 'demo-user-1';

/**
 * In-memory stand-in used when the database is unreachable so the demo
 * account can still be shown around the site.
 */
export const DEMO_FALLBACK_USER = {
  id: LEGACY_DEMO_USER_ID,
  email: DEMO_EMAIL,
  name: DEMO_NAME,
  isAdmin: false,
} as const;

export function isDemoEmail(email?: string | null): boolean {
  return (email || '').toLowerCase() === DEMO_EMAIL;
}

export function isDemoUser(user?: { id?: string | null; email?: string | null } | null): boolean {
  if (!user) return false;
  return user.id === LEGACY_DEMO_USER_ID || isDemoEmail(user.email);
}

/**
 * Ensure the advertised demo account exists in the database so session-backed
 * APIs (analysis count, custom shop, wardrobe limits) can resolve it.
 */
export async function ensureDemoUser() {
  const existing = await prisma.user.findUnique({
    where: { email: DEMO_EMAIL },
    select: { id: true, email: true, name: true, isAdmin: true },
  });

  if (existing) {
    await prisma.userLimit.upsert({
      where: { userId: existing.id },
      update: {
        tierLimitAnalyses: 999,
        tierLimitWardrobeOutfits: 999,
        tierLimitItems: 999,
        tierLimitOutfits: 999,
      },
      create: {
        userId: existing.id,
        itemsUploaded: 0,
        outfitsGenerated: 0,
        aiAnalysesUsed: 0,
        wardrobeOutfitsGenerated: 0,
        tierLimitItems: 999,
        tierLimitOutfits: 999,
        tierLimitAnalyses: 999,
        tierLimitWardrobeOutfits: 999,
      },
    });

    return existing;
  }

  const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 12);
  const created = await prisma.user.create({
    data: {
      email: DEMO_EMAIL,
      name: DEMO_NAME,
      password: hashedPassword,
    },
    select: { id: true, email: true, name: true, isAdmin: true },
  });

  await prisma.userLimit.create({
    data: {
      userId: created.id,
      itemsUploaded: 0,
      outfitsGenerated: 0,
      aiAnalysesUsed: 0,
      wardrobeOutfitsGenerated: 0,
      tierLimitItems: 999,
      tierLimitOutfits: 999,
      tierLimitAnalyses: 999,
      tierLimitWardrobeOutfits: 999,
    },
  });

  return created;
}
