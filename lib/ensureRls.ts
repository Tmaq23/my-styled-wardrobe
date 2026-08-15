import type { PrismaClient } from '@prisma/client';

/**
 * Application tables managed by Prisma. These live in the Supabase
 * `public` schema and are exposed by PostgREST unless RLS is enabled
 * and API-role grants are revoked.
 */
export const APP_TABLES = [
  'users',
  'accounts',
  'sessions',
  'verificationtokens',
  'user_subscriptions',
  'user_limits',
  'wardrobe_items',
  'outfits',
  'affiliate_clicks',
  'lookbooks',
  'blog_posts',
  'blog_comments',
  'analysis_verifications',
  'custom_shop_requests',
] as const;

let ensurePromise: Promise<void> | null = null;

/**
 * Enable RLS and revoke anon/authenticated grants on every app table.
 * Safe to call repeatedly. Server-side Prisma (postgres role) bypasses RLS.
 */
export async function ensureRowLevelSecurity(prisma: PrismaClient): Promise<void> {
  if (!ensurePromise) {
    ensurePromise = (async () => {
      for (const table of APP_TABLES) {
        // Identifier allowlist only — never interpolate untrusted input.
        await prisma.$executeRawUnsafe(
          `DO $$ BEGIN
             IF to_regclass('public.${table}') IS NOT NULL THEN
               EXECUTE 'ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY';
               EXECUTE 'REVOKE ALL ON TABLE public.${table} FROM anon';
               EXECUTE 'REVOKE ALL ON TABLE public.${table} FROM authenticated';
               EXECUTE 'REVOKE ALL ON TABLE public.${table} FROM PUBLIC';
             END IF;
           END $$;`
        );
      }
    })().catch((error) => {
      // Allow a later retry if the first attempt fails (e.g. DB waking up).
      ensurePromise = null;
      throw error;
    });
  }

  return ensurePromise;
}
