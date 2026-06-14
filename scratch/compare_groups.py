import json

# Load groups.json
with open('/Users/mateusrios/projects/copa2026/scratch/groups.json', 'r', encoding='utf-8') as f:
    groups_data = json.load(f)

# Load worldcup2026.json
with open('/Users/mateusrios/projects/copa2026/scratch/worldcup2026.json', 'r', encoding='utf-8') as f:
    wc_data = json.load(f)

# Collect teams from groups.json
groups_teams = []
for g in groups_data['groups']:
    for t in g['teams']:
        groups_teams.append((g['id'], t['code'], t['name']))

# Collect teams from worldcup2026.json
wc_teams = []
for group_letter, names in wc_data['grupos'].items():
    for name in names:
        wc_teams.append((group_letter, name))

print(f"Number of teams in groups.json: {len(groups_teams)}")
print(f"Number of teams in worldcup2026.json: {len(wc_teams)}")

# Compare by group and see if there are mismatches
for g_id, t_code, t_name in groups_teams:
    # See if there's a match in wc_teams for this group
    found = False
    for wc_g, wc_name in wc_teams:
        if wc_g == g_id:
            # check if they match (allow República Tcheca / Tchéquia)
            if wc_name == t_name or (t_code == 'CZE' and wc_name == 'República Tcheca'):
                found = True
                break
    if not found:
        print(f"Mismatch: {g_id} {t_code} {t_name} not found in worldcup2026.json for group {g_id}")

# Let's also verify if there are teams in worldcup2026.json not in groups.json
for wc_g, wc_name in wc_teams:
    found = False
    for g_id, t_code, t_name in groups_teams:
        if g_id == wc_g:
            if wc_name == t_name or (t_code == 'CZE' and wc_name == 'República Tcheca'):
                found = True
                break
    if not found:
        print(f"Mismatch: {wc_g} {wc_name} not found in groups.json for group {wc_g}")
