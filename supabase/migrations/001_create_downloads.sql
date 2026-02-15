-- ============================================================================
-- Supabase SQL: Create `downloads` table
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ============================================================================

-- 1. Create the table
CREATE TABLE IF NOT EXISTS public.downloads (
    id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    video_url   TEXT NOT NULL,
    video_title TEXT NOT NULL DEFAULT 'Untitled',
    format      TEXT NOT NULL DEFAULT 'info',
    created_at  TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.downloads ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Allow anyone to read (public history)
CREATE POLICY "Allow public read" ON public.downloads
    FOR SELECT
    USING (true);

-- 4. Policy: Allow service role to insert (backend API)
CREATE POLICY "Allow service role insert" ON public.downloads
    FOR INSERT
    WITH CHECK (true);

-- 5. Create index for faster ordering by date
CREATE INDEX IF NOT EXISTS idx_downloads_created_at
    ON public.downloads (created_at DESC);

-- 6. (Optional) Grant access to the anon role for reading
GRANT SELECT ON public.downloads TO anon;
GRANT INSERT ON public.downloads TO service_role;
