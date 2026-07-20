-- Independent duplicate-tracking sticker collection ("Repetidas" area), mirrors "stickers"
CREATE TABLE IF NOT EXISTS public.repeated_stickers (
    id TEXT PRIMARY KEY, -- e.g. "BRA_1", "BRA_10"
    team_id TEXT REFERENCES public.teams(id) ON DELETE CASCADE,
    code TEXT NOT NULL, -- e.g. "BRA 1", "BRA 10"
    checked BOOLEAN DEFAULT false NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID DEFAULT NULL
);

ALTER TABLE public.repeated_stickers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to repeated_stickers" ON public.repeated_stickers
    FOR SELECT USING (true);

CREATE POLICY "Allow public inserts to repeated_stickers" ON public.repeated_stickers
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public updates to repeated_stickers" ON public.repeated_stickers
    FOR UPDATE USING (true) WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.repeated_stickers;
