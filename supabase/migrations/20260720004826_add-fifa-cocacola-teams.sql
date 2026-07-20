-- Add FIFA and Coca-Cola as sticker sets (not real World Cup teams, so they use group "X")
INSERT INTO public.teams (id, name, code, "group", flag) VALUES
('FWC', 'FIFA', 'FWC', 'X', '⚽'),
('CC', 'Coca-Cola', 'CC', 'X', '🥤')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    code = EXCLUDED.code,
    "group" = EXCLUDED."group",
    flag = EXCLUDED.flag;
