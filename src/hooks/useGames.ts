import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { MOCK_GAMES, MOCK_TEAMS } from "@/lib/mockData";
import { Game, Team, GroupStanding, GameStatus, GameStage } from "@/types";

export function useGames() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  // Load games from Supabase or Fallback
  useEffect(() => {
    async function loadGames() {
      setLoading(true);
      try {
        if (isSupabaseConfigured && supabase) {
          const { data, error } = await supabase
            .from("games")
            .select("*")
            .order("kickoff", { ascending: true });

          if (error) throw error;
          
          if (data && data.length > 0) {
            setGames(data as Game[]);
          } else {
            // Seed Supabase with initial games if empty
            const { error: seedError } = await supabase.from("games").insert(MOCK_GAMES);
            if (seedError) console.error("Error seeding games:", seedError);
            setGames(MOCK_GAMES);
          }
        } else {
          // LocalStorage fallback
          const localGames = localStorage.getItem("copa2026_games");
          if (localGames) {
            setGames(JSON.parse(localGames));
          } else {
            setGames(MOCK_GAMES);
            localStorage.setItem("copa2026_games", JSON.stringify(MOCK_GAMES));
          }
        }
      } catch (err) {
        console.error("Error loading games:", err);
      } finally {
        setLoading(false);
      }
    }

    loadGames();
  }, []);

  // Sync games list helper
  const syncGames = useCallback((newGames: Game[]) => {
    setGames(newGames);
    if (isSupabaseConfigured && supabase) {
      // For production, we can update individual records, 
      // but for simulation, we update the whole list or individual upserts.
      // Let's upsert all updated records asynchronously
      supabase
        .from("games")
        .upsert(newGames)
        .then(({ error }) => {
          if (error) console.error("Error syncing games to DB:", error);
        });
    } else {
      localStorage.setItem("copa2026_games", JSON.stringify(newGames));
    }
  }, []);

  // Update a single game score manually
  const updateGameScore = useCallback(
    (gameId: string, homeScore: number | null, awayScore: number | null, status: GameStatus, homePenalty: number | null = null, awayPenalty: number | null = null) => {
      const updated = games.map((game) => {
        if (game.id === gameId) {
          let winner_id: string | null = null;
          if (status === "finished") {
            if (homeScore !== null && awayScore !== null) {
              if (homeScore > awayScore) {
                winner_id = game.home_team_id;
              } else if (homeScore < awayScore) {
                winner_id = game.away_team_id;
              } else if (homePenalty !== null && awayPenalty !== null) {
                winner_id = homePenalty > awayPenalty ? game.home_team_id : game.away_team_id;
              }
            }
          }

          return {
            ...game,
            home_score: homeScore,
            away_score: awayScore,
            home_penalty: homePenalty,
            away_penalty: awayPenalty,
            status,
            winner_id,
            updated_at: new Date().toISOString()
          };
        }
        return game;
      });

      syncGames(updated);
    },
    [games, syncGames]
  );

  // Live Score Simulation (random updates for "live" games every 60s)
  useEffect(() => {
    const interval = setInterval(() => {
      let changed = false;
      const updated = games.map((game) => {
        if (game.status === "live") {
          changed = true;
          // 30% chance to score
          const trigger = Math.random();
          let homeDelta = 0;
          let awayDelta = 0;
          if (trigger < 0.15) {
            homeDelta = 1;
          } else if (trigger < 0.3) {
            awayDelta = 1;
          }
          
          const currentHome = game.home_score ?? 0;
          const currentAway = game.away_score ?? 0;

          // 5% chance to finish the game
          const shouldFinish = Math.random() < 0.05;

          const nextHome = currentHome + homeDelta;
          const nextAway = currentAway + awayDelta;
          const nextStatus = shouldFinish ? "finished" : "live";
          let winner_id = game.winner_id;

          if (shouldFinish) {
            if (nextHome > nextAway) winner_id = game.home_team_id;
            else if (nextHome < nextAway) winner_id = game.away_team_id;
          }

          return {
            ...game,
            home_score: nextHome,
            away_score: nextAway,
            status: nextStatus as GameStatus,
            winner_id,
            updated_at: new Date().toISOString()
          };
        }
        return game;
      });

      if (changed) {
        syncGames(updated);
      }
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, [games, syncGames]);

  // Compute standings per group dynamically
  const standings = useMemo(() => {
    const map: Record<string, GroupStanding[]> = {};
    const groups = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

    groups.forEach((group) => {
      const groupTeams = MOCK_TEAMS.filter((t) => t.group === group);
      const groupStandings: Record<string, GroupStanding> = {};

      // Initialize
      groupTeams.forEach((team) => {
        groupStandings[team.id] = {
          teamId: team.id,
          teamName: team.name,
          flag: team.flag,
          code: team.code,
          points: 0,
          played: 0,
          wins: 0,
          draws: 0,
          losses: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          goalDifference: 0,
        };
      });

      // Filter matches
      const groupMatches = games.filter(
        (g) => g.stage === "groups" && g.group === group && (g.status === "finished" || g.status === "live")
      );

      groupMatches.forEach((game) => {
        const home = groupStandings[game.home_team_id];
        const away = groupStandings[game.away_team_id];

        if (!home || !away) return;

        const hScore = game.home_score ?? 0;
        const aScore = game.away_score ?? 0;

        home.played += 1;
        away.played += 1;
        home.goalsFor += hScore;
        home.goalsAgainst += aScore;
        away.goalsFor += aScore;
        away.goalsAgainst += hScore;

        if (hScore > aScore) {
          home.wins += 1;
          home.points += 3;
          away.losses += 1;
        } else if (hScore < aScore) {
          away.wins += 1;
          away.points += 3;
          home.losses += 1;
        } else {
          home.draws += 1;
          home.points += 1;
          away.draws += 1;
          away.points += 1;
        }
      });

      // Convert to array and sort
      const standingsArray = Object.values(groupStandings).map((s) => ({
        ...s,
        goalDifference: s.goalsFor - s.goalsAgainst,
      }));

      // Sort standing standard logic: Points -> GD -> GF -> Alphabetical
      standingsArray.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
        if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
        return a.teamName.localeCompare(b.teamName);
      });

      map[group] = standingsArray;
    });

    return map;
  }, [games]);

  // Compute live bracket game definitions (propagating standings and knockout winners)
  const bracketGames = useMemo(() => {
    // 1. Compile 3rd place rankings to find the 8 best 3rd placed teams
    const allThirdPlaces: { teamId: string; points: number; gd: number; gf: number; group: string }[] = [];
    Object.entries(standings).forEach(([group, groupStandings]) => {
      if (groupStandings.length >= 3) {
        const third = groupStandings[2]; // Index 2 is 3rd place
        allThirdPlaces.push({
          teamId: third.teamId,
          points: third.points,
          gd: third.goalDifference,
          gf: third.goalsFor,
          group
        });
      }
    });

    // Sort third places
    allThirdPlaces.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.gd !== a.gd) return b.gd - a.gd;
      if (b.gf !== a.gf) return b.gf - a.gf;
      return 0;
    });

    const top8ThirdIds = allThirdPlaces.slice(0, 8).map(t => t.teamId);

    // Helper to get team by ID
    const getTeam = (id: string): Team | undefined => MOCK_TEAMS.find((t) => t.id === id);

    // Create a working map of game definitions
    const gameMap: Record<string, Game> = {};
    games.forEach((g) => {
      gameMap[g.id] = { ...g };
    });

    // Phase 1: Propagate Group Stage outcomes to Round of 32
    // Group A to L winners and runners-up
    const getGroupResult = (group: string, rank: number): string => {
      const groupStandings = standings[group];
      if (!groupStandings || groupStandings.length < rank) return "";
      
      // Check if all 6 matches for this group are played to declare final standing
      const groupFinishedCount = games.filter(g => g.stage === "groups" && g.group === group && g.status === "finished").length;
      if (groupFinishedCount < 6) return ""; // Still to be defined officially

      return groupStandings[rank - 1].teamId;
    };

    // Assign Group outcomes to the Round of 32 game slots
    const r32Assignments: Record<string, { homeSource: () => string; awaySource: () => string }> = {
      game_73: { homeSource: () => getGroupResult("A", 1), awaySource: () => top8ThirdIds[0] || "" }, // 1A vs 3rd B/C/D
      game_74: { homeSource: () => getGroupResult("A", 2), awaySource: () => getGroupResult("B", 2) }, // 2A vs 2B
      game_75: { homeSource: () => getGroupResult("B", 1), awaySource: () => top8ThirdIds[1] || "" }, // 1B vs 3rd A/C/D
      game_76: { homeSource: () => getGroupResult("C", 2), awaySource: () => getGroupResult("D", 2) }, // 2C vs 2D
      game_77: { homeSource: () => getGroupResult("C", 1), awaySource: () => top8ThirdIds[2] || "" }, // 1C vs 3rd A/B/D
      game_78: { homeSource: () => getGroupResult("D", 1), awaySource: () => top8ThirdIds[3] || "" }, // 1D vs 3rd E/F/G
      game_79: { homeSource: () => getGroupResult("E", 1), awaySource: () => top8ThirdIds[4] || "" }, // 1E vs 3rd H/I/J
      game_80: { homeSource: () => getGroupResult("E", 2), awaySource: () => getGroupResult("F", 2) }, // 2E vs 2F
      game_81: { homeSource: () => getGroupResult("F", 1), awaySource: () => top8ThirdIds[5] || "" }, // 1F vs 3rd K/L/A
      game_82: { homeSource: () => getGroupResult("G", 2), awaySource: () => getGroupResult("H", 2) }, // 2G vs 2H
      game_83: { homeSource: () => getGroupResult("G", 1), awaySource: () => top8ThirdIds[6] || "" }, // 1G vs 3rd C/E/F
      game_84: { homeSource: () => getGroupResult("H", 1), awaySource: () => top8ThirdIds[7] || "" }, // 1H vs 3rd I/J/K
      game_85: { homeSource: () => getGroupResult("I", 1), awaySource: () => top8ThirdIds[0] || "" }, // 1I vs 3rd B/F/G
      game_86: { homeSource: () => getGroupResult("I", 2), awaySource: () => getGroupResult("J", 2) }, // 2I vs 2J
      game_87: { homeSource: () => getGroupResult("J", 1), awaySource: () => top8ThirdIds[1] || "" }, // 1J vs 3rd A/H/L
      game_88: { homeSource: () => getGroupResult("K", 1), awaySource: () => getGroupResult("L", 2) }, // 1K vs 2L
    };

    Object.entries(r32Assignments).forEach(([gameId, sources]) => {
      const g = gameMap[gameId];
      if (g) {
        g.home_team_id = sources.homeSource();
        g.away_team_id = sources.awaySource();
      }
    });

    // Helper to get winner of a specific match
    const getWinnerId = (gameId: string): string => {
      const g = gameMap[gameId];
      if (!g || g.status !== "finished") return "";
      return g.winner_id || "";
    };

    // Helper to get loser of a specific match (for 3rd place)
    const getLoserId = (gameId: string): string => {
      const g = gameMap[gameId];
      if (!g || g.status !== "finished" || !g.winner_id) return "";
      return g.winner_id === g.home_team_id ? g.away_team_id : g.home_team_id;
    };

    // Phase 2: Propagate Round of 32 Winners to Oitavas (game_89 to game_96)
    const oitavasMapping: Record<string, { homeSrc: string; awaySrc: string }> = {
      game_89: { homeSrc: "game_73", awaySrc: "game_74" },
      game_90: { homeSrc: "game_75", awaySrc: "game_76" },
      game_91: { homeSrc: "game_77", awaySrc: "game_78" },
      game_92: { homeSrc: "game_79", awaySrc: "game_80" },
      game_93: { homeSrc: "game_81", awaySrc: "game_82" },
      game_94: { homeSrc: "game_83", awaySrc: "game_84" },
      game_95: { homeSrc: "game_85", awaySrc: "game_86" },
      game_96: { homeSrc: "game_87", awaySrc: "game_88" },
    };

    Object.entries(oitavasMapping).forEach(([gameId, src]) => {
      const g = gameMap[gameId];
      if (g) {
        g.home_team_id = getWinnerId(src.homeSrc);
        g.away_team_id = getWinnerId(src.awaySrc);
      }
    });

    // Phase 3: Propagate Oitavas Winners to Quartas (game_97 to game_100)
    const quartasMapping: Record<string, { homeSrc: string; awaySrc: string }> = {
      game_97: { homeSrc: "game_89", awaySrc: "game_90" },
      game_98: { homeSrc: "game_91", awaySrc: "game_92" },
      game_99: { homeSrc: "game_93", awaySrc: "game_94" },
      game_100: { homeSrc: "game_95", awaySrc: "game_96" },
    };

    Object.entries(quartasMapping).forEach(([gameId, src]) => {
      const g = gameMap[gameId];
      if (g) {
        g.home_team_id = getWinnerId(src.homeSrc);
        g.away_team_id = getWinnerId(src.awaySrc);
      }
    });

    // Phase 4: Propagate Quartas Winners to Semifinals (game_101 & game_102)
    const semiMapping: Record<string, { homeSrc: string; awaySrc: string }> = {
      game_101: { homeSrc: "game_97", awaySrc: "game_98" },
      game_102: { homeSrc: "game_99", awaySrc: "game_100" },
    };

    Object.entries(semiMapping).forEach(([gameId, src]) => {
      const g = gameMap[gameId];
      if (g) {
        g.home_team_id = getWinnerId(src.homeSrc);
        g.away_team_id = getWinnerId(src.awaySrc);
      }
    });

    // Phase 5: Propagate Semifinals to Final and Third Place
    // Third place: game_103 gets losers of game_101 and game_102
    const thirdPlaceGame = gameMap["game_103"];
    if (thirdPlaceGame) {
      thirdPlaceGame.home_team_id = getLoserId("game_101");
      thirdPlaceGame.away_team_id = getLoserId("game_102");
    }

    // Final: game_104 gets winners of game_101 and game_102
    const finalGame = gameMap["game_104"];
    if (finalGame) {
      finalGame.home_team_id = getWinnerId("game_101");
      finalGame.away_team_id = getWinnerId("game_102");
    }

    return Object.values(gameMap);
  }, [games, standings]);

  return {
    games: bracketGames,
    loading,
    standings,
    updateGameScore,
    isLocalFallback: !isSupabaseConfigured
  };
}
