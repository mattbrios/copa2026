# Copa 2026 — Análise do Projeto

> Documento gerado a partir de uma análise completa do código-fonte em 2026-07-19.

## 1. Visão Geral

**Copa 2026** é um aplicativo web (PWA, mobile-first) em português (pt-BR) para acompanhar a Copa do Mundo FIFA de 2026. Combina três funcionalidades em um único app com layout de "cartão" (max-width estilo celular, tema escuro fixo):

1. **Álbum de figurinhas** (estilo Panini) — marcar quais figurinhas de cada seleção o usuário já colou.
2. **Tabela de jogos** — cronograma completo dos 104 jogos do torneio (fase de grupos + mata-mata), com edição manual de placares e uma simulação de "jogo ao vivo".
3. **Classificação & Fases** — classificação de grupos calculada dinamicamente e progressão automática do chaveamento eliminatório (oitavas → quartas → semis → 3º lugar → final), incluindo a lógica dos 8 melhores terceiros colocados.

O objetivo do produto é ser um "companion app" pessoal/social para a Copa 2026 nos EUA/México/Canadá: gamificar o preenchimento do álbum e servir como fonte de consulta rápida de jogos e classificação, funcionando tanto online (sincronizado via nuvem) quanto offline (fallback local).

## 2. Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 16.2.9 (App Router, React Server/Client Components) |
| UI Library | React 19.2.4 |
| Linguagem | TypeScript 5 |
| Estilos | Tailwind CSS 4 (`@tailwindcss/postcss`) |
| Ícones | lucide-react |
| Backend/DB | Supabase (Postgres + Realtime + Row Level Security) via `@supabase/supabase-js` |
| Persistência offline | `localStorage` (fallback automático quando Supabase não está configurado ou falha) |
| PWA | `manifest.ts` nativo do Next.js + Service Worker customizado (`public/sw.js`) |
| Lint | ESLint 9 (`eslint-config-next`) |
| Deploy alvo | Vercel (padrão do template Next.js) |

Não há testes automatizados, backend próprio (API routes) nem autenticação — o app é 100% client-side (`"use client"`) falando diretamente com o Supabase pelo cliente JS.

## 3. Arquitetura e Estrutura de Pastas

```
src/
  app/
    layout.tsx        # Layout raiz, fontes Geist, tema dark fixo, registra o SW
    page.tsx           # Única rota "/" — orquestra os 3 tabs e os hooks de dados
    manifest.ts         # Web App Manifest (PWA)
    globals.css
  components/
    Header.tsx          # Cabeçalho com progresso do álbum, modal de estatísticas, badge online/offline
    BottomNavigation.tsx # Navegação inferior fixa (3 abas: album | games | standings)
    SearchInput.tsx      # Busca de seleção/figurinha
    StickerSection.tsx   # Grade de figurinhas por seleção, com filtro por grupo e busca
    GamesSection.tsx     # Lista de jogos por fase, edição de placar
    StandingsSection.tsx # Tabela de classificação + bracket do mata-mata
    sw-register.tsx      # Registro do Service Worker + toast de "nova versão disponível"
  hooks/
    useStickers.ts       # Estado das figurinhas: Supabase + Realtime + fallback localStorage
    useGames.ts           # Estado dos jogos, standings e propagação do chaveamento
  lib/
    supabase.ts           # Cliente Supabase + flag isSupabaseConfigured
    mockData.ts            # 48 seleções (grupos A–L) + 104 jogos mockados (dados iniciais/seed)
  types/
    index.ts               # Team, Sticker, Game, GroupStanding, GameStage, GameStatus

supabase/
  schema.sql              # DDL completo: tabelas teams/stickers/games + RLS + seed de times
  migrations/               # Migração adicional (histórico do Supabase CLI)

public/
  sw.js                    # Service worker: cache stale-while-revalidate/network-first
  icon-*.png                # Ícones do PWA

scratch/                   # Scripts utilitários fora do build (Python/Node) para gerar/comparar dados e testar a conexão com o banco
```

### Fluxo de dados (padrão "cloud-first com fallback local")

Tanto `useStickers` quanto `useGames` seguem o mesmo padrão:

1. Ao montar, tentam ler do Supabase.
2. Se o Supabase não estiver configurado (`.env` ausente) ou a query falhar, caem para `localStorage`.
3. Assinam mudanças em tempo real via `supabase.channel(...).on("postgres_changes", ...)` — múltiplos dispositivos/abas ficam sincronizados automaticamente.
4. Toda escrita (toggle de figurinha, placar de jogo) é otimista na UI e depois persistida (Supabase `upsert`, com fallback silencioso para `localStorage` em caso de erro).
5. `Header` exibe um badge "Nuvem" ou "Modo Local" conforme `isLocalFallback`.

Esse design deixa o app 100% funcional sem necessidade de configurar backend (ótimo para dev/demo), mas com sincronização multi-dispositivo quando as credenciais do Supabase estão presentes.

## 4. Modelo de Dados (Supabase / `supabase/schema.sql`)

- **`teams`**: 48 seleções, `id` = código de 3 letras (ex. `BRA`), `group` (A–L), bandeira emoji.
- **`stickers`**: uma linha por figurinha (`id` = `TEAM_N`, 20 por seleção = 960 no total), booleano `checked`, `updated_at`. Tem coluna `user_id` (nullable) preparada para autenticação futura, mas ainda não usada.
- **`games`**: 104 jogos (`game_1`...`game_104`), com `stage` (groups/round_of_32/round_of_16/quarterfinals/semifinals/third_place/final), placar, pênaltis, `status` (scheduled/live/finished), `winner_id`, e placeholders textuais (`placeholder_home`/`away`, ex. "1º Grupo A") para exibição antes da definição dos confrontos.
- RLS está habilitado nas três tabelas, mas as políticas atuais permitem **SELECT/INSERT/UPDATE públicos irrestritos** (`USING (true)`), ou seja, qualquer pessoa com a `anon key` pode alterar dados de qualquer usuário. Isso é aceitável para um app sem login onde o estado é "compartilhado"/demonstrativo, mas é um ponto de atenção caso o produto evolua para dados por usuário.

## 5. Lógica de Negócio Notável

- **`useGames.ts`** contém a parte mais sofisticada do projeto: a propagação automática do chaveamento eliminatório.
  - Calcula a classificação de cada grupo (pontos, saldo de gols, gols pró) via `useMemo`.
  - Determina os **8 melhores terceiros colocados** entre os 12 grupos (regra real da Copa 2026 com 48 seleções) e os mapeia para as vagas corretas da fase de 32 (`game_73`...`game_88`).
  - Propaga vencedores automaticamente por oitavas → quartas → semifinais → final/3º lugar, atualizando `home_team_id`/`away_team_id` a cada fase conforme os jogos anteriores são finalizados.
  - Isso é recalculado a cada render via `useMemo`, então é "derivado", não persistido — cada vez que os jogos mudam, o bracket inteiro é recomputado no cliente.
- **Simulação de jogo ao vivo**: quando um jogo está com `status: "live"`, um `setInterval` de 60s aplica gols aleatórios (30% de chance) e finaliza o jogo com 5% de chance por ciclo — parece uma feature de demonstração/protótipo, não uma integração com um provedor real de dados esportivos ao vivo.
- **Busca inteligente de figurinhas**: o campo de busca aceita tanto nome/código da seleção quanto código de figurinha específico (ex. "BRA 10" ou "BRA10").

## 6. PWA

- `manifest.ts` define nome, ícones, tema escuro (`#0B0B0B`), modo `standalone`.
- `sw.js` implementa cache do app shell e estratégia de fetch (stale-while-revalidate para estáticos, network-first para documento/dados), com um fluxo de atualização: quando uma nova versão do SW é instalada, um toast "Nova versão disponível!" aparece (`sw-register.tsx`) permitindo ao usuário acionar `SKIP_WAITING` e recarregar.

## 7. Scripts Auxiliares (`scratch/`)

Não fazem parte do build do Next.js; são utilitários de desenvolvimento:
- `generate_mock_data.py`, `compare_groups.py`, `reorder_teams.py` — geração/validação dos dados mockados de seleções e jogos (`groups.json`, `worldcup2026.json`).
- `test_db.js` — script Node para testar a conexão com o Supabase usando a Service Role Key do `.env` (verifica existência das tabelas).

## 8. Observações e Possíveis Próximos Passos

- **Sem autenticação/multiusuário real**: o álbum de figurinhas é um estado global compartilhado (não há login), o que é adequado para um app pessoal/família mas não isola dados por usuário. A coluna `stickers.user_id` já foi deixada pronta para essa evolução.
- **RLS totalmente aberto**: convém revisar antes de expor o projeto publicamente em produção, caso o volume de usuários cresça (risco de vandalismo de dados por ser gravação pública).
- **Simulação de "jogo ao vivo" é fake** (números aleatórios) — se o objetivo for acompanhar jogos reais, será necessário integrar uma API de resultados ao vivo (ex. API-Football, SportRadar) para substituir o `setInterval` simulado.
- **Sem testes automatizados** (unitários/E2E) — todo o cálculo de classificação e chaveamento (lógica complexa em `useGames.ts`) hoje depende só de verificação manual.
- **Sem CI configurado** visível no repositório.
