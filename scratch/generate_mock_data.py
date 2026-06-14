import json
import re

# Load JSON data
with open('/Users/mateusrios/.gemini/antigravity-ide/brain/5640b3cf-395e-409b-b7f8-685580f81ed0/scratch/page_props_pretty.json', 'r', encoding='utf-8') as f:
    page_props = json.load(f)

# TEAM MAPPING
TEAM_MAP = {
    'Alemanha': {'id': 'GER', 'flag': '🇩🇪', 'code': 'GER'},
    'Argentina': {'id': 'ARG', 'flag': '🇦🇷', 'code': 'ARG'},
    'Argélia': {'id': 'ALG', 'flag': '🇩🇿', 'code': 'ALG'},
    'Arábia Saudita': {'id': 'KSA', 'flag': '🇸🇦', 'code': 'KSA'},
    'Austrália': {'id': 'AUS', 'flag': '🇦🇺', 'code': 'AUS'},
    'Brasil': {'id': 'BRA', 'flag': '🇧🇷', 'code': 'BRA'},
    'Bélgica': {'id': 'BEL', 'flag': '🇧🇪', 'code': 'BEL'},
    'Bósnia': {'id': 'BIH', 'flag': '🇧🇦', 'code': 'BIH'},
    'Cabo Verde': {'id': 'CPV', 'flag': '🇨🇻', 'code': 'CPV'},
    'Canadá': {'id': 'CAN', 'flag': '🇨🇦', 'code': 'CAN'},
    'Catar': {'id': 'QAT', 'flag': '🇶🇦', 'code': 'QAT'},
    'Colômbia': {'id': 'COL', 'flag': '🇨🇴', 'code': 'COL'},
    'Coreia do Sul': {'id': 'KOR', 'flag': '🇰🇷', 'code': 'KOR'},
    'Costa do Marfim': {'id': 'CIV', 'flag': '🇨🇮', 'code': 'CIV'},
    'Croácia': {'id': 'CRO', 'flag': '🇭🇷', 'code': 'CRO'},
    'Curaçao': {'id': 'CUW', 'flag': '🇨🇼', 'code': 'CUW'},
    'Egito': {'id': 'EGY', 'flag': '🇪🇬', 'code': 'EGY'},
    'Equador': {'id': 'ECU', 'flag': '🇪🇨', 'code': 'ECU'},
    'Escócia': {'id': 'SCO', 'flag': '🏴󠁧󠁢󠁳󠁣󠁴󠁿', 'code': 'SCO'},
    'Espanha': {'id': 'ESP', 'flag': '🇪🇸', 'code': 'ESP'},
    'Estados Unidos': {'id': 'USA', 'flag': '🇺🇸', 'code': 'USA'},
    'França': {'id': 'FRA', 'flag': '🇫🇷', 'code': 'FRA'},
    'Gana': {'id': 'GHA', 'flag': '🇬🇭', 'code': 'GHA'},
    'Haiti': {'id': 'HAI', 'flag': '🇭🇹', 'code': 'HAI'},
    'Holanda': {'id': 'NED', 'flag': '🇳🇱', 'code': 'NED'},
    'Inglaterra': {'id': 'ENG', 'flag': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'code': 'ENG'},
    'Iraque': {'id': 'IRQ', 'flag': '🇮🇶', 'code': 'IRQ'},
    'Irã': {'id': 'IRN', 'flag': '🇮🇷', 'code': 'IRN'},
    'Japão': {'id': 'JPN', 'flag': '🇯🇵', 'code': 'JPN'},
    'Jordânia': {'id': 'JOR', 'flag': '🇯🇴', 'code': 'JOR'},
    'Marrocos': {'id': 'MAR', 'flag': '🇲🇦', 'code': 'MAR'},
    'México': {'id': 'MEX', 'flag': '🇲🇽', 'code': 'MEX'},
    'Noruega': {'id': 'NOR', 'flag': '🇳🇴', 'code': 'NOR'},
    'Nova Zelândia': {'id': 'NZL', 'flag': '🇳🇿', 'code': 'NZL'},
    'Panamá': {'id': 'PAN', 'flag': '🇵🇦', 'code': 'PAN'},
    'Paraguai': {'id': 'PAR', 'flag': '🇵🇾', 'code': 'PAR'},
    'Portugal': {'id': 'POR', 'flag': '🇵🇹', 'code': 'POR'},
    'RD Congo': {'id': 'COD', 'flag': '🇨🇩', 'code': 'COD'},
    'República Tcheca': {'id': 'CZE', 'flag': '🇨🇿', 'code': 'CZE'},
    'Senegal': {'id': 'SEN', 'flag': '🇸🇳', 'code': 'SEN'},
    'Suécia': {'id': 'SWE', 'flag': '🇸🇪', 'code': 'SWE'},
    'Suíça': {'id': 'SUI', 'flag': '🇨🇭', 'code': 'SUI'},
    'Tunísia': {'id': 'TUN', 'flag': '🇹🇳', 'code': 'TUN'},
    'Turquia': {'id': 'TUR', 'flag': '🇹🇷', 'code': 'TUR'},
    'Uruguai': {'id': 'URU', 'flag': '🇺🇾', 'code': 'URU'},
    'Uzbequistão': {'id': 'UZB', 'flag': '🇺🇿', 'code': 'UZB'},
    'África do Sul': {'id': 'RSA', 'flag': '🇿🇦', 'code': 'RSA'},
    'Áustria': {'id': 'AUT', 'flag': '🇦🇹', 'code': 'AUT'}
}

# 1. EXTRACT TEAMS WITH GROUPS
standings_data = page_props.get('standingsData', [])
teams_list = []
seen_teams = set()

# First extract from standings data
for item in standings_data:
    t_name = item['team']
    if t_name in TEAM_MAP and t_name not in seen_teams:
        group_letter = item['group']
        t_info = TEAM_MAP[t_name]
        teams_list.append({
            'id': t_info['id'],
            'name': t_name,
            'code': t_info['code'],
            'group': group_letter,
            'flag': t_info['flag']
        })
        seen_teams.add(t_name)

# Sort teams by Group, then ID
teams_list.sort(key=lambda x: (x['group'], x['id']))

# 2. EXTRACT FIXTURES (GROUP STAGE)
fixtures = page_props.get('fixtures', [])
games_list = []
game_counter = 1

for f in fixtures:
    h_name = f['homeTeam']['name']
    a_name = f['awayTeam']['name']
    
    if h_name not in TEAM_MAP or a_name not in TEAM_MAP:
        print(f"Warning: Skipping game between {h_name} and {a_name}")
        continue
        
    h_info = TEAM_MAP[h_name]
    a_info = TEAM_MAP[a_name]
    
    # Parse kickoff date/time (website uses Brazil time UTC-3, we represent it as such)
    kickoff_str = f"{f['date']}T{f['time']}:00-03:00"
    
    # Scores
    h_score = f['homeTeam'].get('score')
    a_score = f['awayTeam'].get('score')
    
    # Status
    status_raw = f.get('status', 'agendado')
    if status_raw == 'finalizado':
        status = 'finished'
    elif status_raw in ['ao_vivo', 'em_andamento']:
        status = 'live'
    else:
        status = 'scheduled'
        
    group_match = re.search(r'Grupo\s+([A-L])', f.get('group', ''))
    group_letter = group_match.group(1) if group_match else 'A'
    
    games_list.append({
        'id': f"game_{game_counter}",
        'stage': 'groups',
        'group': group_letter,
        'home_team_id': h_info['id'],
        'away_team_id': a_info['id'],
        'kickoff': kickoff_str,
        'home_score': h_score,
        'away_score': a_score,
        'status': status,
        'stadium': f.get('stadium', 'A definir')
    })
    game_counter += 1

group_games_count = len(games_list)

# 3. DEFINE BRACKET SEGMENTS TEMPLATE
# Match template mapping according to printed list
r32_legs = [
    {"label": "Chave 1", "homeP": "1º Grupo E", "awayP": "3º Grupo A/B/C/D/F", "next": "game_89"},
    {"label": "Chave 2", "homeP": "1º Grupo I", "awayP": "3º Grupo C/D/F/G/H", "next": "game_89"},
    {"label": "Chave 3", "homeP": "2º Grupo A", "awayP": "2º Grupo B", "next": "game_90"},
    {"label": "Chave 4", "homeP": "1º Grupo F", "awayP": "2º Grupo C", "next": "game_90"},
    {"label": "Chave 5", "homeP": "2º Grupo K", "awayP": "2º Grupo L", "next": "game_91"},
    {"label": "Chave 6", "homeP": "1º Grupo H", "awayP": "2º Grupo J", "next": "game_91"},
    {"label": "Chave 7", "homeP": "1º Grupo D", "awayP": "3º Grupo B/E/F/I/J", "next": "game_92"},
    {"label": "Chave 8", "homeP": "1º Grupo G", "awayP": "3º Grupo A/E/H/I/J", "next": "game_92"},
    {"label": "Chave 9", "homeP": "1º Grupo C", "awayP": "2º Grupo F", "next": "game_93"},
    {"label": "Chave 10", "homeP": "2º Grupo E", "awayP": "2º Grupo I", "next": "game_93"},
    {"label": "Chave 11", "homeP": "1º Grupo A", "awayP": "3º Grupo C/E/F/H/I", "next": "game_94"},
    {"label": "Chave 12", "homeP": "1º Grupo L", "awayP": "3º Grupo E/H/I/J/K", "next": "game_94"},
    {"label": "Chave 13", "homeP": "1º Grupo J", "awayP": "2º Grupo H", "next": "game_95"},
    {"label": "Chave 14", "homeP": "2º Grupo D", "awayP": "2º Grupo G", "next": "game_95"},
    {"label": "Chave 15", "homeP": "1º Grupo B", "awayP": "3º Grupo E/F/G/I/J", "next": "game_96"},
    {"label": "Chave 16", "homeP": "1º Grupo K", "awayP": "3º Grupo D/E/I/J/L", "next": "game_96"}
]

oitavas_legs = [
    {"label": "Oitavas 1", "homeP": "Vencedor Chave 1", "awayP": "Vencedor Chave 2", "next": "game_97"},
    {"label": "Oitavas 2", "homeP": "Vencedor Chave 3", "awayP": "Vencedor Chave 4", "next": "game_97"},
    {"label": "Oitavas 3", "homeP": "Vencedor Chave 5", "awayP": "Vencedor Chave 6", "next": "game_98"},
    {"label": "Oitavas 4", "homeP": "Vencedor Chave 7", "awayP": "Vencedor Chave 8", "next": "game_98"},
    {"label": "Oitavas 5", "homeP": "Vencedor Chave 9", "awayP": "Vencedor Chave 10", "next": "game_99"},
    {"label": "Oitavas 6", "homeP": "Vencedor Chave 11", "awayP": "Vencedor Chave 12", "next": "game_99"},
    {"label": "Oitavas 7", "homeP": "Vencedor Chave 13", "awayP": "Vencedor Chave 14", "next": "game_100"},
    {"label": "Oitavas 8", "homeP": "Vencedor Chave 15", "awayP": "Vencedor Chave 16", "next": "game_100"}
]

quartas_legs = [
    {"label": "Quartas 1", "homeP": "Vencedor Oitavas 1", "awayP": "Vencedor Oitavas 2", "next": "game_101"},
    {"label": "Quartas 2", "homeP": "Vencedor Oitavas 3", "awayP": "Vencedor Oitavas 4", "next": "game_101"},
    {"label": "Quartas 3", "homeP": "Vencedor Oitavas 5", "awayP": "Vencedor Oitavas 6", "next": "game_102"},
    {"label": "Quartas 4", "homeP": "Vencedor Oitavas 7", "awayP": "Vencedor Oitavas 8", "next": "game_102"}
]

semi_legs = [
    {"label": "Semifinal 1", "homeP": "Vencedor Quartas 1", "awayP": "Vencedor Quartas 2", "next": "game_104"},
    {"label": "Semifinal 2", "homeP": "Vencedor Quartas 3", "awayP": "Vencedor Quartas 4", "next": "game_104"}
]

# Generate TS code string
code_lines = [
    'import { Team, Game } from "@/types";',
    '',
    'export const STICKERS_PER_TEAM = 20;',
    '',
    'export const MOCK_TEAMS: Team[] = ['
]

# Add teams
for t in teams_list:
    code_lines.append(f"  {{ id: \"{t['id']}\", name: \"{t['name']}\", code: \"{t['code']}\", group: \"{t['group']}\", flag: \"{t['flag']}\" }},")

code_lines.append('];')
code_lines.append('')
code_lines.append('export const MOCK_STADIUMS = [')
code_lines.append('  "Estadio Azteca (Mexico City)",')
code_lines.append('  "MetLife Stadium (New York/New Jersey)",')
code_lines.append('  "SoFi Stadium (Los Angeles)",')
code_lines.append('  "Hard Rock Stadium (Miami)",')
code_lines.append('  "BC Place (Vancouver)",')
code_lines.append('  "BMO Field (Toronto)"')
code_lines.append('];')
code_lines.append('')
code_lines.append('export const MOCK_GAMES: Game[] = [')

# Add group stage games
for g in games_list:
    h_score_str = f"{g['home_score']}" if g['home_score'] is not None else "null"
    a_score_str = f"{g['away_score']}" if g['away_score'] is not None else "null"
    
    code_lines.append("  {")
    code_lines.append(f"    id: \"{g['id']}\",")
    code_lines.append("    stage: \"groups\",")
    code_lines.append(f"    group: \"{g['group']}\",")
    code_lines.append(f"    home_team_id: \"{g['home_team_id']}\",")
    code_lines.append(f"    away_team_id: \"{g['away_team_id']}\",")
    code_lines.append(f"    kickoff: \"{g['kickoff']}\",")
    code_lines.append(f"    home_score: {h_score_str},")
    code_lines.append(f"    away_score: {a_score_str},")
    code_lines.append(f"    status: \"{g['status']}\",")
    code_lines.append(f"    stadium: \"{g['stadium']}\"")
    code_lines.append("  },")

# Add Round of 32
r32_start_date = "2026-06-30T18:00:00-03:00"
for idx, r32 in enumerate(r32_legs):
    gid = idx + group_games_count + 1
    code_lines.append("  {")
    code_lines.append(f"    id: \"game_{gid}\",")
    code_lines.append("    stage: \"round_of_32\",")
    code_lines.append("    group: null,")
    code_lines.append("    home_team_id: \"\",")
    code_lines.append("    away_team_id: \"\",")
    code_lines.append(f"    kickoff: \"{r32_start_date}\",")
    code_lines.append("    home_score: null,")
    code_lines.append("    away_score: null,")
    code_lines.append("    status: \"scheduled\",")
    code_lines.append("    placeholder_home: \"" + r32['homeP'] + "\",")
    code_lines.append("    placeholder_away: \"" + r32['awayP'] + "\",")
    code_lines.append(f"    next_match_id: \"{r32['next']}\",")
    code_lines.append("    stadium: \"A definir\"")
    code_lines.append("  },")

# Add Round of 16 (Oitavas)
r16_start_date = "2026-07-04T18:00:00-03:00"
for idx, o16 in enumerate(oitavas_legs):
    gid = idx + group_games_count + 16 + 1
    code_lines.append("  {")
    code_lines.append(f"    id: \"game_{gid}\",")
    code_lines.append("    stage: \"round_of_16\",")
    code_lines.append("    group: null,")
    code_lines.append("    home_team_id: \"\",")
    code_lines.append("    away_team_id: \"\",")
    code_lines.append(f"    kickoff: \"{r16_start_date}\",")
    code_lines.append("    home_score: null,")
    code_lines.append("    away_score: null,")
    code_lines.append("    status: \"scheduled\",")
    code_lines.append("    placeholder_home: \"" + o16['homeP'] + "\",")
    code_lines.append("    placeholder_away: \"" + o16['awayP'] + "\",")
    code_lines.append(f"    next_match_id: \"{o16['next']}\",")
    code_lines.append("    stadium: \"A definir\"")
    code_lines.append("  },")

# Add Quarterfinals (Quartas)
qf_start_date = "2026-07-09T18:00:00-03:00"
for idx, qf in enumerate(quartas_legs):
    gid = idx + group_games_count + 24 + 1
    code_lines.append("  {")
    code_lines.append(f"    id: \"game_{gid}\",")
    code_lines.append("    stage: \"quarterfinals\",")
    code_lines.append("    group: null,")
    code_lines.append("    home_team_id: \"\",")
    code_lines.append("    away_team_id: \"\",")
    code_lines.append(f"    kickoff: \"{qf_start_date}\",")
    code_lines.append("    home_score: null,")
    code_lines.append("    away_score: null,")
    code_lines.append("    status: \"scheduled\",")
    code_lines.append("    placeholder_home: \"" + qf['homeP'] + "\",")
    code_lines.append("    placeholder_away: \"" + qf['awayP'] + "\",")
    code_lines.append(f"    next_match_id: \"{qf['next']}\",")
    code_lines.append("    stadium: \"A definir\"")
    code_lines.append("  },")

# Add Semifinals
sf_start_date = "2026-07-14T18:00:00-03:00"
for idx, sf in enumerate(semi_legs):
    gid = idx + group_games_count + 28 + 1
    code_lines.append("  {")
    code_lines.append(f"    id: \"game_{gid}\",")
    code_lines.append("    stage: \"semifinals\",")
    code_lines.append("    group: null,")
    code_lines.append("    home_team_id: \"\",")
    code_lines.append("    away_team_id: \"\",")
    code_lines.append(f"    kickoff: \"{sf_start_date}\",")
    code_lines.append("    home_score: null,")
    code_lines.append("    away_score: null,")
    code_lines.append("    status: \"scheduled\",")
    code_lines.append("    placeholder_home: \"" + sf['homeP'] + "\",")
    code_lines.append("    placeholder_away: \"" + sf['awayP'] + "\",")
    code_lines.append(f"    next_match_id: \"game_104\",")
    code_lines.append("    stadium: \"A definir\"")
    code_lines.append("  },")

# Add 3rd Place Match (game_103)
code_lines.append("  {")
code_lines.append("    id: \"game_103\",")
code_lines.append("    stage: \"third_place\",")
code_lines.append("    group: null,")
code_lines.append("    home_team_id: \"\",")
code_lines.append("    away_team_id: \"\",")
code_lines.append("    kickoff: \"2026-07-18T15:00:00-03:00\",")
code_lines.append("    home_score: null,")
code_lines.append("    away_score: null,")
code_lines.append("    status: \"scheduled\",")
code_lines.append("    placeholder_home: \"Perdedor Semifinal 1\",")
code_lines.append("    placeholder_away: \"Perdedor Semifinal 2\",")
code_lines.append("    stadium: \"A definir\"")
code_lines.append("  },")

# Add Final Match (game_104)
code_lines.append("  {")
code_lines.append("    id: \"game_104\",")
code_lines.append("    stage: \"final\",")
code_lines.append("    group: null,")
code_lines.append("    home_team_id: \"\",")
code_lines.append("    away_team_id: \"\",")
code_lines.append("    kickoff: \"2026-07-19T15:00:00-03:00\",")
code_lines.append("    home_score: null,")
code_lines.append("    away_score: null,")
code_lines.append("    status: \"scheduled\",")
code_lines.append("    placeholder_home: \"Vencedor Semifinal 1\",")
code_lines.append("    placeholder_away: \"Vencedor Semifinal 2\",")
code_lines.append("    stadium: \"MetLife Stadium (New York/New Jersey)\"")
code_lines.append("  }")

code_lines.append('];')

# Write output to src/lib/mockData.ts
with open('/Users/mateusrios/projects/copa2026/src/lib/mockData.ts', 'w', encoding='utf-8') as f_out:
    f_out.write('\n'.join(code_lines))

print(f"Generated mockData.ts successfully with {len(teams_list)} teams and {group_games_count + 32} games!")
