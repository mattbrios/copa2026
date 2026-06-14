"use client";

import { useState, useMemo } from "react";
import { GroupStanding, Game, Team } from "@/types";
import { MOCK_TEAMS } from "@/lib/mockData";
import { Trophy, ChevronRight, MapPin, Award, CheckCircle } from "lucide-react";

interface StandingsSectionProps {
  standings: Record<string, GroupStanding[]>;
  games: Game[];
}

export function StandingsSection({ standings, games }: StandingsSectionProps) {
  const [subTab, setSubTab] = useState<"groups" | "bracket">("groups");
  const [bracketRound, setBracketRound] = useState<
    "round_of_32" | "round_of_16" | "quarterfinals" | "semifinals" | "finals"
  >("round_of_16"); // Default to Round of 16 for cleaner overview, users can easily change

  const getTeam = (teamId: string) => {
    return MOCK_TEAMS.find((t) => t.id === teamId);
  };

  // Filter knockout matches by round
  const filteredBracketGames = useMemo(() => {
    if (bracketRound === "finals") {
      return games.filter((g) => g.stage === "third_place" || g.stage === "final");
    }
    return games.filter((g) => g.stage === bracketRound);
  }, [games, bracketRound]);

  const getRoundLabel = (stage: string) => {
    switch (stage) {
      case "round_of_32":
        return "16 Avos de Final";
      case "round_of_16":
        return "Oitavas de Final";
      case "quarterfinals":
        return "Quartas de Final";
      case "semifinals":
        return "Semifinais";
      case "third_place":
        return "Disputa de 3º Lugar";
      case "final":
        return "Final";
      default:
        return "";
    }
  };

  return (
    <div className="flex flex-col gap-4 pb-24 px-4 pt-2">
      {/* Sub-tab selection (Groups vs Brackets) */}
      <div className="flex bg-[#121212] p-1 border border-card-border rounded-xl">
        <button
          onClick={() => setSubTab("groups")}
          className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg smooth-transition select-none cursor-pointer ${
            subTab === "groups"
              ? "bg-[#1E1E1E] text-white shadow-sm"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          Fase de Grupos
        </button>
        <button
          onClick={() => setSubTab("bracket")}
          className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg smooth-transition select-none cursor-pointer ${
            subTab === "bracket"
              ? "bg-[#1E1E1E] text-white shadow-sm"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          Mata-Mata
        </button>
      </div>

      {/* 1. Group Stage standings view */}
      {subTab === "groups" && (
        <div className="flex flex-col gap-5">
          {Object.entries(standings).map(([group, groupStandings]) => (
            <div
              key={group}
              className="bg-card-bg border border-card-border rounded-2xl p-4 flex flex-col gap-3"
            >
              <h3 className="text-sm font-bold text-white tracking-wide border-b border-card-border pb-1.5 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-brand-accent"></span>
                Grupo {group}
              </h3>

              <div className="overflow-x-auto -mx-4 px-4">
                <table className="w-full text-left border-collapse min-w-[340px]">
                  <thead>
                    <tr className="text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b border-card-border pb-1">
                      <th className="py-1.5 w-8">#</th>
                      <th className="py-1.5">Seleção</th>
                      <th className="py-1.5 text-center w-8 text-white font-black">P</th>
                      <th className="py-1.5 text-center w-8">J</th>
                      <th className="py-1.5 text-center w-6">V</th>
                      <th className="py-1.5 text-center w-6">E</th>
                      <th className="py-1.5 text-center w-6">D</th>
                      <th className="py-1.5 text-center w-8 text-gray-400">SG</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupStandings.map((team, idx) => {
                      const isQualified = idx < 2; // top 2 qualify
                      const isThird = idx === 2; // third place has a chance

                      return (
                        <tr
                          key={team.teamId}
                          className={`border-b border-card-border/30 last:border-0 text-xs font-semibold ${
                            isQualified ? "text-brand-success" : "text-gray-300"
                          }`}
                        >
                          <td className="py-2.5">
                            <span
                              className={`flex items-center justify-center h-4.5 w-4.5 rounded text-[10px] font-black ${
                                isQualified
                                  ? "bg-brand-success/15 text-brand-success"
                                  : isThird
                                  ? "bg-yellow-500/10 text-yellow-500"
                                  : "bg-[#1E1E1E] text-gray-400"
                              }`}
                            >
                              {idx + 1}
                            </span>
                          </td>
                          <td className="py-2.5 flex items-center gap-2">
                            <span className="text-lg leading-none select-none">{team.flag}</span>
                            <span className="truncate max-w-[100px] text-white">
                              {team.teamName}
                            </span>
                          </td>
                          <td className="py-2.5 text-center font-black text-white bg-white/5 rounded">
                            {team.points}
                          </td>
                          <td className="py-2.5 text-center">{team.played}</td>
                          <td className="py-2.5 text-center">{team.wins}</td>
                          <td className="py-2.5 text-center">{team.draws}</td>
                          <td className="py-2.5 text-center">{team.losses}</td>
                          <td
                            className={`py-2.5 text-center ${
                              team.goalDifference > 0
                                ? "text-brand-success"
                                : team.goalDifference < 0
                                ? "text-red-500"
                                : "text-gray-400"
                            }`}
                          >
                            {team.goalDifference > 0 ? `+${team.goalDifference}` : team.goalDifference}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 2. Knockout Bracket view */}
      {subTab === "bracket" && (
        <div className="flex flex-col gap-4">
          {/* Round selectors (Round of 32 down to Finals) */}
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1">
            {([
              { id: "round_of_32", label: "16 Avos" },
              { id: "round_of_16", label: "Oitavas" },
              { id: "quarterfinals", label: "Quartas" },
              { id: "semifinals", label: "Semis" },
              { id: "finals", label: "Finais" },
            ] as const).map((round) => (
              <button
                key={round.id}
                onClick={() => setBracketRound(round.id)}
                className={`py-1.5 px-3 rounded-lg text-[10px] font-extrabold uppercase tracking-widest shrink-0 smooth-transition cursor-pointer border ${
                  bracketRound === round.id
                    ? "bg-brand-accent border-brand-accent text-white shadow-sm"
                    : "bg-card-bg border-card-border text-gray-400 hover:text-gray-200"
                }`}
              >
                {round.label}
              </button>
            ))}
          </div>

          {/* Knockout Match Cards */}
          <div className="flex flex-col gap-3">
            {filteredBracketGames.map((game) => {
              const homeTeam = getTeam(game.home_team_id);
              const awayTeam = getTeam(game.away_team_id);
              const isFinished = game.status === "finished";

              const homeWinner = isFinished && game.winner_id === game.home_team_id;
              const awayWinner = isFinished && game.winner_id === game.away_team_id;
              const isTie = isFinished && game.home_score === game.away_score;

              return (
                <div
                  key={game.id}
                  className="bg-card-bg border border-card-border rounded-2xl overflow-hidden"
                >
                  {/* Round Subtitle */}
                  <div className="px-4 pt-3 flex items-center justify-between text-[10px] font-semibold text-gray-500 uppercase tracking-widest">
                    <span>{getRoundLabel(game.stage)}</span>
                    {game.stadium && <span className="truncate max-w-[160px]">{game.stadium}</span>}
                  </div>

                  {/* Visual Match block */}
                  <div className="p-4 flex flex-col gap-2.5">
                    {/* Home Side */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 truncate flex-1 pr-4">
                        {homeTeam ? (
                          <>
                            <span className="text-xl select-none">{homeTeam.flag}</span>
                            <span
                              className={`text-xs font-bold truncate ${
                                isFinished && !homeWinner ? "text-gray-500" : "text-white"
                              }`}
                            >
                              {homeTeam.name}
                            </span>
                            {homeWinner && (
                              <CheckCircle className="h-3.5 w-3.5 text-brand-success shrink-0" />
                            )}
                          </>
                        ) : (
                          <>
                            <span className="text-xl select-none">🏳️</span>
                            <span className="text-xs font-semibold text-gray-500 truncate">
                              {game.placeholder_home || "A definir"}
                            </span>
                          </>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {isTie && game.home_penalty !== null && (
                          <span className="text-[10px] text-brand-accent font-bold">
                            ({game.home_penalty})
                          </span>
                        )}
                        <span
                          className={`text-sm font-black w-6 text-center ${
                            isFinished
                              ? homeWinner
                                ? "text-brand-success"
                                : "text-gray-500"
                              : "text-gray-300"
                          }`}
                        >
                          {game.home_score ?? "-"}
                        </span>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-card-border/50" />

                    {/* Away Side */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 truncate flex-1 pr-4">
                        {awayTeam ? (
                          <>
                            <span className="text-xl select-none">{awayTeam.flag}</span>
                            <span
                              className={`text-xs font-bold truncate ${
                                isFinished && !awayWinner ? "text-gray-500" : "text-white"
                              }`}
                            >
                              {awayTeam.name}
                            </span>
                            {awayWinner && (
                              <CheckCircle className="h-3.5 w-3.5 text-brand-success shrink-0" />
                            )}
                          </>
                        ) : (
                          <>
                            <span className="text-xl select-none">🏳️</span>
                            <span className="text-xs font-semibold text-gray-500 truncate">
                              {game.placeholder_away || "A definir"}
                            </span>
                          </>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {isTie && game.away_penalty !== null && (
                          <span className="text-[10px] text-brand-accent font-bold">
                            ({game.away_penalty})
                          </span>
                        )}
                        <span
                          className={`text-sm font-black w-6 text-center ${
                            isFinished
                              ? awayWinner
                                ? "text-brand-success"
                                : "text-gray-500"
                              : "text-gray-300"
                          }`}
                        >
                          {game.away_score ?? "-"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bracket flow target text */}
                  {game.next_match_id && (
                    <div className="px-4 pb-2.5 border-t border-card-border/30 pt-2 flex items-center justify-between text-[8px] text-gray-500 font-bold tracking-wider uppercase">
                      <span>Id do Jogo: {game.id}</span>
                      <div className="flex items-center gap-0.5">
                        <span>Avança para Jogo {game.next_match_id}</span>
                        <ChevronRight className="h-2.5 w-2.5" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
