-- The application accesses these tables only through server-side Prisma queries.
-- Enabling RLS without policies prevents Supabase's anon and authenticated API
-- roles from reading or modifying application data. The database owner and
-- Supabase service role continue to bypass RLS for trusted server-side access.

ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.verificationtokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.wardrobe_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.outfits ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.affiliate_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.lookbooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.blog_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.analysis_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.custom_shop_requests ENABLE ROW LEVEL SECURITY;
