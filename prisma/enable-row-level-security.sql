-- Fixes Supabase advisors:
--   - rls_disabled_in_public
--   - sensitive_columns_exposed
--
-- This app accesses Postgres only through server-side Prisma.
-- Enabling RLS with no policies denies PostgREST access for the
-- `anon` and `authenticated` roles. The `postgres` / service-role
-- connections used by the server continue to work.
--
-- Also revoke table grants from API roles so sensitive columns are
-- not reachable through the public Data API.

DO $$
DECLARE
  table_name text;
  app_tables text[] := ARRAY[
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
    'custom_shop_requests'
  ];
BEGIN
  FOREACH table_name IN ARRAY app_tables
  LOOP
    IF to_regclass(format('public.%I', table_name)) IS NOT NULL THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
      EXECUTE format('REVOKE ALL ON TABLE public.%I FROM anon', table_name);
      EXECUTE format('REVOKE ALL ON TABLE public.%I FROM authenticated', table_name);
      EXECUTE format('REVOKE ALL ON TABLE public.%I FROM PUBLIC', table_name);
    END IF;
  END LOOP;
END $$;
