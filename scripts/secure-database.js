#!/usr/bin/env node
/**
 * Apply Row Level Security to all application tables.
 * Usage: node scripts/secure-database.js
 * Requires DATABASE_URL (e.g. from .env.local or Import.env).
 */
const { readFileSync, existsSync } = require('fs');
const { resolve } = require('path');
const { PrismaClient } = require('@prisma/client');

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return;
  const text = readFileSync(filePath, 'utf8');
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnvFile(resolve(process.cwd(), '.env.local'));
loadEnvFile(resolve(process.cwd(), '.env'));
loadEnvFile(resolve(process.cwd(), 'Import.env'));

const APP_TABLES = [
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
];

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not set. Add it to .env.local and retry.');
    process.exit(1);
  }

  const host = (() => {
    try {
      return new URL(process.env.DATABASE_URL).hostname;
    } catch {
      return 'unknown';
    }
  })();

  console.log(`Securing database at ${host}...`);
  const prisma = new PrismaClient();

  try {
    for (const table of APP_TABLES) {
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
      console.log(`  secured ${table}`);
    }

    const tableList = APP_TABLES.map((t) => `'${t}'`).join(', ');
    const status = await prisma.$queryRawUnsafe(
      `SELECT c.relname AS tablename, c.relrowsecurity AS rowsecurity
       FROM pg_class c
       JOIN pg_namespace n ON n.oid = c.relnamespace
       WHERE n.nspname = 'public'
         AND c.relkind = 'r'
         AND c.relname IN (${tableList})
       ORDER BY c.relname`
    );

    console.log('\nRLS status:');
    for (const row of status) {
      console.log(`  ${row.tablename}: ${row.rowsecurity ? 'ENABLED' : 'DISABLED'}`);
    }

    const open = status.filter((r) => !r.rowsecurity);
    if (open.length) {
      console.error('\nSome tables still have RLS disabled.');
      process.exit(1);
    }

    console.log('\nAll application tables are secured.');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
