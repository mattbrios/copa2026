-- Create teams table
CREATE TABLE IF NOT EXISTS public.teams (
    id TEXT PRIMARY KEY, -- e.g. "BRA", "ARG"
    name TEXT NOT NULL,
    code VARCHAR(3) NOT NULL UNIQUE,
    "group" VARCHAR(1) NOT NULL,
    flag TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create stickers table
CREATE TABLE IF NOT EXISTS public.stickers (
    id TEXT PRIMARY KEY, -- e.g. "BRA_1", "BRA_10"
    team_id TEXT REFERENCES public.teams(id) ON DELETE CASCADE,
    code TEXT NOT NULL, -- e.g. "BRA 1", "BRA 10"
    checked BOOLEAN DEFAULT false NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID DEFAULT NULL -- Optional, for future authentication features
);

-- Create games table
CREATE TABLE IF NOT EXISTS public.games (
    id TEXT PRIMARY KEY, -- e.g. "game_1" to "game_104"
    stage TEXT NOT NULL, -- "groups", "round_of_32", "round_of_16", "quarterfinals", "semifinals", "third_place", "final"
    "group" VARCHAR(1) DEFAULT NULL, -- A to L
    home_team_id TEXT REFERENCES public.teams(id),
    away_team_id TEXT REFERENCES public.teams(id),
    kickoff TIMESTAMP WITH TIME ZONE NOT NULL,
    home_score INTEGER DEFAULT NULL,
    away_score INTEGER DEFAULT NULL,
    home_penalty INTEGER DEFAULT NULL,
    away_penalty INTEGER DEFAULT NULL,
    status TEXT DEFAULT 'scheduled' NOT NULL, -- "scheduled", "live", "finished"
    winner_id TEXT REFERENCES public.teams(id),
    next_match_id TEXT DEFAULT NULL, -- ID of the next match (for the bracket)
    placeholder_home TEXT DEFAULT NULL, -- e.g. "1º Grupo A"
    placeholder_away TEXT DEFAULT NULL, -- e.g. "2º Grupo B"
    stadium TEXT DEFAULT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stickers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Teams
CREATE POLICY "Allow public read access to teams" ON public.teams
    FOR SELECT USING (true);

CREATE POLICY "Allow public inserts to teams" ON public.teams
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public updates to teams" ON public.teams
    FOR UPDATE USING (true) WITH CHECK (true);

-- RLS Policies for Games
CREATE POLICY "Allow public read access to games" ON public.games
    FOR SELECT USING (true);

CREATE POLICY "Allow public inserts to games" ON public.games
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public updates to games" ON public.games
    FOR UPDATE USING (true) WITH CHECK (true);

-- RLS Policies for Stickers
CREATE POLICY "Allow public read access to stickers" ON public.stickers
    FOR SELECT USING (true);

CREATE POLICY "Allow public inserts to stickers" ON public.stickers
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public updates to stickers" ON public.stickers
    FOR UPDATE USING (true) WITH CHECK (true);

-- Seed Teams Data (48 Teams - Groups A to L)
INSERT INTO public.teams (id, name, code, "group", flag) VALUES
('CZE', 'Tchéquia', 'CZE', 'A', '🇨🇿'),
('KOR', 'Coreia do Sul', 'KOR', 'A', '🇰🇷'),
('MEX', 'México', 'MEX', 'A', '🇲🇽'),
('RSA', 'África do Sul', 'RSA', 'A', '🇿🇦'),
('BIH', 'Bósnia e Herzegovina', 'BIH', 'B', '🇧🇦'),
('CAN', 'Canadá', 'CAN', 'B', '🇨🇦'),
('QAT', 'Catar', 'QAT', 'B', '🇶🇦'),
('SUI', 'Suíça', 'SUI', 'B', '🇨🇭'),
('BRA', 'Brasil', 'BRA', 'C', '🇧🇷'),
('HAI', 'Haiti', 'HAI', 'C', '🇭🇹'),
('MAR', 'Marrocos', 'MAR', 'C', '🇲🇦'),
('SCO', 'Escócia', 'SCO', 'C', '🏴'),
('AUS', 'Austrália', 'AUS', 'D', '🇦🇺'),
('PAR', 'Paraguai', 'PAR', 'D', '🇵🇾'),
('TUR', 'Turquia', 'TUR', 'D', '🇹🇷'),
('USA', 'Estados Unidos', 'USA', 'D', '🇺🇸'),
('CIV', 'Costa do Marfim', 'CIV', 'E', '🇨🇮'),
('CUW', 'Curaçao', 'CUW', 'E', '🇨🇼'),
('ECU', 'Equador', 'ECU', 'E', '🇪🇨'),
('GER', 'Alemanha', 'GER', 'E', '🇩🇪'),
('JPN', 'Japão', 'JPN', 'F', '🇯🇵'),
('NED', 'Países Baixos', 'NED', 'F', '🇳🇱'),
('SWE', 'Suécia', 'SWE', 'F', '🇸🇪'),
('TUN', 'Tunísia', 'TUN', 'F', '🇹🇳'),
('BEL', 'Bélgica', 'BEL', 'G', '🇧🇪'),
('EGY', 'Egito', 'EGY', 'G', '🇪🇬'),
('IRN', 'Irã', 'IRN', 'G', '🇮🇷'),
('NZL', 'Nova Zelândia', 'NZL', 'G', '🇳🇿'),
('CPV', 'Cabo Verde', 'CPV', 'H', '🇨🇻'),
('ESP', 'Espanha', 'ESP', 'H', '🇪🇸'),
('KSA', 'Arábia Saudita', 'KSA', 'H', '🇸🇦'),
('URU', 'Uruguai', 'URU', 'H', '🇺🇾'),
('FRA', 'França', 'FRA', 'I', '🇫🇷'),
('IRQ', 'Iraque', 'IRQ', 'I', '🇮🇶'),
('NOR', 'Noruega', 'NOR', 'I', '🇳🇴'),
('SEN', 'Senegal', 'SEN', 'I', '🇸🇳'),
('ALG', 'Argélia', 'ALG', 'J', '🇩🇿'),
('ARG', 'Argentina', 'ARG', 'J', '🇦🇷'),
('AUT', 'Áustria', 'AUT', 'J', '🇦🇹'),
('JOR', 'Jordânia', 'JOR', 'J', '🇯🇴'),
('COD', 'RD Congo', 'COD', 'K', '🇨🇩'),
('COL', 'Colômbia', 'COL', 'K', '🇨🇴'),
('POR', 'Portugal', 'POR', 'K', '🇵🇹'),
('UZB', 'Uzbequistão', 'UZB', 'K', '🇺🇿'),
('CRO', 'Croácia', 'CRO', 'L', '🇭🇷'),
('ENG', 'Inglaterra', 'ENG', 'L', '🏴'),
('GHA', 'Gana', 'GHA', 'L', '🇬🇭'),
('PAN', 'Panamá', 'PAN', 'L', '🇵🇦')
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    code = EXCLUDED.code,
    "group" = EXCLUDED."group",
    flag = EXCLUDED.flag;

-- Enable replication for realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.stickers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.games;
