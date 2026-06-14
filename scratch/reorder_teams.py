import json

# Define the order mapping (group -> list of codes in order)
group_order = {
    "A": ["MEX", "RSA", "KOR", "CZE"],
    "B": ["CAN", "BIH", "QAT", "SUI"],
    "C": ["BRA", "MAR", "HAI", "SCO"],
    "D": ["USA", "PAR", "AUS", "TUR"],
    "E": ["GER", "CUW", "CIV", "ECU"],
    "F": ["NED", "JPN", "SWE", "TUN"],
    "G": ["BEL", "EGY", "IRN", "NZL"],
    "H": ["ESP", "CPV", "KSA", "URU"],
    "I": ["FRA", "SEN", "NOR", "IRQ"],
    "J": ["ARG", "ALG", "AUT", "JOR"],
    "K": ["POR", "COD", "UZB", "COL"],
    "L": ["ENG", "CRO", "GHA", "PAN"]
}

# The existing mock teams with their flags
existing_teams = {
    "CZE": { "id": "CZE", "name": "Tchéquia", "code": "CZE", "group": "A", "flag": "🇨🇿" },
    "KOR": { "id": "KOR", "name": "Coreia do Sul", "code": "KOR", "group": "A", "flag": "🇰🇷" },
    "MEX": { "id": "MEX", "name": "México", "code": "MEX", "group": "A", "flag": "🇲🇽" },
    "RSA": { "id": "RSA", "name": "África do Sul", "code": "RSA", "group": "A", "flag": "🇿🇦" },
    "BIH": { "id": "BIH", "name": "Bósnia e Herzegovina", "code": "BIH", "group": "B", "flag": "🇧🇦" },
    "CAN": { "id": "CAN", "name": "Canadá", "code": "CAN", "group": "B", "flag": "🇨🇦" },
    "QAT": { "id": "QAT", "name": "Catar", "code": "QAT", "group": "B", "flag": "🇶🇦" },
    "SUI": { "id": "SUI", "name": "Suíça", "code": "SUI", "group": "B", "flag": "🇨🇭" },
    "BRA": { "id": "BRA", "name": "Brasil", "code": "BRA", "group": "C", "flag": "🇧🇷" },
    "HAI": { "id": "HAI", "name": "Haiti", "code": "HAI", "group": "C", "flag": "🇭🇹" },
    "MAR": { "id": "MAR", "name": "Marrocos", "code": "MAR", "group": "C", "flag": "🇲🇦" },
    "SCO": { "id": "SCO", "name": "Escócia", "code": "SCO", "group": "C", "flag": "🏴" },
    "AUS": { "id": "AUS", "name": "Austrália", "code": "AUS", "group": "D", "flag": "🇦🇺" },
    "PAR": { "id": "PAR", "name": "Paraguai", "code": "PAR", "group": "D", "flag": "🇵🇾" },
    "TUR": { "id": "TUR", "name": "Turquia", "code": "TUR", "group": "D", "flag": "🇹🇷" },
    "USA": { "id": "USA", "name": "Estados Unidos", "code": "USA", "group": "D", "flag": "🇺🇸" },
    "CIV": { "id": "CIV", "name": "Costa do Marfim", "code": "CIV", "group": "E", "flag": "🇨🇮" },
    "CUW": { "id": "CUW", "name": "Curaçao", "code": "CUW", "group": "E", "flag": "🇨🇼" },
    "ECU": { "id": "ECU", "name": "Equador", "code": "ECU", "group": "E", "flag": "🇪🇨" },
    "GER": { "id": "GER", "name": "Alemanha", "code": "GER", "group": "E", "flag": "🇩🇪" },
    "JPN": { "id": "JPN", "name": "Japão", "code": "JPN", "group": "F", "flag": "🇯🇵" },
    "NED": { "id": "NED", "name": "Países Baixos", "code": "NED", "group": "F", "flag": "🇳🇱" },
    "SWE": { "id": "SWE", "name": "Suécia", "code": "SWE", "group": "F", "flag": "🇸🇪" },
    "TUN": { "id": "TUN", "name": "Tunísia", "code": "TUN", "group": "F", "flag": "🇹🇳" },
    "BEL": { "id": "BEL", "name": "Bélgica", "code": "BEL", "group": "G", "flag": "🇧🇪" },
    "EGY": { "id": "EGY", "name": "Egito", "code": "EGY", "group": "G", "flag": "🇪🇬" },
    "IRN": { "id": "IRN", "name": "Irã", "code": "IRN", "group": "G", "flag": "🇮🇷" },
    "NZL": { "id": "NZL", "name": "Nova Zelândia", "code": "NZL", "group": "G", "flag": "🇳🇿" },
    "CPV": { "id": "CPV", "name": "Cabo Verde", "code": "CPV", "group": "H", "flag": "🇨🇻" },
    "ESP": { "id": "ESP", "name": "Espanha", "code": "ESP", "group": "H", "flag": "🇪🇸" },
    "KSA": { "id": "KSA", "name": "Arábia Saudita", "code": "KSA", "group": "H", "flag": "🇸🇦" },
    "URU": { "id": "URU", "name": "Uruguai", "code": "URU", "group": "H", "flag": "🇺🇾" },
    "FRA": { "id": "FRA", "name": "França", "code": "FRA", "group": "I", "flag": "🇫🇷" },
    "IRQ": { "id": "IRQ", "name": "Iraque", "code": "IRQ", "group": "I", "flag": "🇮🇶" },
    "NOR": { "id": "NOR", "name": "Noruega", "code": "NOR", "group": "I", "flag": "🇳🇴" },
    "SEN": { "id": "SEN", "name": "Senegal", "code": "SEN", "group": "I", "flag": "🇸🇳" },
    "ALG": { "id": "ALG", "name": "Argélia", "code": "ALG", "group": "J", "flag": "🇩🇿" },
    "ARG": { "id": "ARG", "name": "Argentina", "code": "ARG", "group": "J", "flag": "🇦🇷" },
    "AUT": { "id": "AUT", "name": "Áustria", "code": "AUT", "group": "J", "flag": "🇦🇹" },
    "JOR": { "id": "JOR", "name": "Jordânia", "code": "JOR", "group": "J", "flag": "🇯🇴" },
    "COD": { "id": "COD", "name": "RD Congo", "code": "COD", "group": "K", "flag": "🇨🇩" },
    "COL": { "id": "COL", "name": "Colômbia", "code": "COL", "group": "K", "flag": "🇨🇴" },
    "POR": { "id": "POR", "name": "Portugal", "code": "POR", "group": "K", "flag": "🇵🇹" },
    "UZB": { "id": "UZB", "name": "Uzbequistão", "code": "UZB", "group": "K", "flag": "🇺🇿" },
    "CRO": { "id": "CRO", "name": "Croácia", "code": "CRO", "group": "L", "flag": "🇭🇷" },
    "ENG": { "id": "ENG", "name": "Inglaterra", "code": "ENG", "group": "L", "flag": "🏴" },
    "GHA": { "id": "GHA", "name": "Gana", "code": "GHA", "group": "L", "flag": "🇬🇭" },
    "PAN": { "id": "PAN", "name": "Panamá", "code": "PAN", "group": "L", "flag": "🇵🇦" }
}

ordered_list = []
for g_id, codes in group_order.items():
    for code in codes:
        t_data = existing_teams[code]
        ordered_list.append(t_data)

print("export const MOCK_TEAMS: Team[] = [")
for t in ordered_list:
    print(f"  {{ id: \"{t['id']}\", name: \"{t['name']}\", code: \"{t['code']}\", group: \"{t['group']}\", flag: \"{t['flag']}\" }},")
print("];")
