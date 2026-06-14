"use client";

import { useState, useMemo } from "react";
import { Game, GameStage, GameStatus } from "@/types";
import { MOCK_TEAMS } from "@/lib/mockData";
import { Calendar, MapPin, Play, CheckCircle, Clock, Plus, Minus, Settings2 } from "lucide-react";

interface GamesSectionProps {
  games: Game[];
  updateGameScore: (
    gameId: string,
    homeScore: number | null,
    awayScore: number | null,
    status: GameStatus,
    homePenalty?: number | null,
    awayPenalty?: number | null
  ) => void;
}

export function GamesSection({ games, updateGameScore }: GamesSectionProps) {
  const [filter, setFilter] = useState<"all" | "live" | "groups" | "knockout">("all");
  const [editingGameId, setEditingGameId] = useState<string | null>(null);

  // Score editing states
  const [editHomeScore, setEditHomeScore] = useState<number>(0);
  const [editAwayScore, setEditAwayScore] = useState<number>(0);
  const [editHomePen, setEditHomePen] = useState<number | null>(null);
  const [editAwayPen, setEditAwayPen] = useState<number | null>(null);
  const [editStatus, setEditStatus] = useState<GameStatus>("scheduled");

  // Helper to resolve team details safely
  const getTeam = (teamId: string) => {
    return MOCK_TEAMS.find((t) => t.id === teamId);
  };

  // Convert stage types to readable Portuguese labels
  const getStageLabel = (game: Game) => {
    switch (game.stage) {
      case "groups":
        return `Grupo ${game.group || ""}`;
      case "round_of_32":
        return "16 Avos de Final";
      case "round_of_16":
        return "Oitavas de Final";
      case "quarterfinals":
        return "Quartas de Final";
      case "semifinals":
        return "Semifinal";
      case "third_place":
        return "Disputa do 3º Lugar";
      case "final":
        return "Grande Final";
      default:
        return "";
    }
  };

  // Open the inline score editor
  const startEditing = (game: Game) => {
    // Check if both teams are defined (placeholder games cannot be edited yet)
    if (!game.home_team_id || !game.away_team_id) return;
    
    setEditingGameId(game.id);
    setEditHomeScore(game.home_score ?? 0);
    setEditAwayScore(game.away_score ?? 0);
    setEditHomePen(game.home_penalty ?? null);
    setEditAwayPen(game.away_penalty ?? null);
    setEditStatus(game.status);
  };

  // Save the edited score
  const saveScore = (gameId: string) => {
    updateGameScore(gameId, editHomeScore, editAwayScore, editStatus, editHomePen, editAwayPen);
    setEditingGameId(null);
  };

  // Filter games based on selected filter option
  const filteredGames = useMemo(() => {
    switch (filter) {
      case "live":
        return games.filter((g) => g.status === "live");
      case "groups":
        return games.filter((g) => g.stage === "groups");
      case "knockout":
        return games.filter((g) => g.stage !== "groups");
      default:
        return games;
    }
  }, [games, filter]);

  // Group games by kickoff date formatted to day/month in Portuguese
  const groupedGames = useMemo(() => {
    const groups: Record<string, Game[]> = {};
    const ptBrDate = new Intl.DateTimeFormat("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });

    filteredGames.forEach((game) => {
      const dateObj = new Date(game.kickoff);
      // Grouping string: "Sexta-feira, 12 de Junho"
      const groupKey = ptBrDate.format(dateObj);
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(game);
    });

    return Object.entries(groups);
  }, [filteredGames]);

  return (
    <div className="flex flex-col gap-4 pb-24 px-4 pt-2">
      {/* Category filters */}
      <div className="flex gap-2">
        {(["all", "live", "groups", "knockout"] as const).map((opt) => {
          const labels = {
            all: "Todos",
            live: "Ao Vivo",
            groups: "Fase de Grupos",
            knockout: "Mata-Mata",
          };
          const count =
            opt === "live"
              ? games.filter((g) => g.status === "live").length
              : opt === "groups"
              ? games.filter((g) => g.stage === "groups").length
              : opt === "knockout"
              ? games.filter((g) => g.stage !== "groups").length
              : games.length;

          return (
            <button
              key={opt}
              onClick={() => setFilter(opt)}
              className={`flex-1 py-2 px-1 rounded-xl text-[10px] font-bold uppercase tracking-wider smooth-transition select-none cursor-pointer ${
                filter === opt
                  ? opt === "live"
                    ? "bg-red-600 text-white shadow-md shadow-red-600/20"
                    : "bg-brand-accent text-white shadow-md shadow-brand-accent/20"
                  : "bg-card-bg border border-card-border text-gray-400 hover:text-gray-200"
              }`}
            >
              <span>{labels[opt]}</span>
              {count > 0 && <span className="ml-1 opacity-70">({count})</span>}
            </button>
          );
        })}
      </div>

      {/* Grouped Games List */}
      <div className="flex flex-col gap-5">
        {groupedGames.length > 0 ? (
          groupedGames.map(([dateLabel, dayGames]) => (
            <div key={dateLabel} className="flex flex-col gap-2.5">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">
                {dateLabel}
              </h3>

              {dayGames.map((game) => {
                const homeTeam = getTeam(game.home_team_id);
                const awayTeam = getTeam(game.away_team_id);
                const isLive = game.status === "live";
                const isFinished = game.status === "finished";
                const isEditing = editingGameId === game.id;
                
                const isKnockout = game.stage !== "groups";
                const isTie = isFinished && game.home_score === game.away_score && isKnockout;

                return (
                  <div
                    key={game.id}
                    className={`bg-card-bg border rounded-2xl overflow-hidden smooth-transition ${
                      isLive
                        ? "border-red-500/50 shadow-lg shadow-red-500/5 ring-1 ring-red-500/20"
                        : "border-card-border"
                    }`}
                  >
                    {/* Game Card Header Info */}
                    <div className="px-4 pt-3 flex items-center justify-between text-[10px] text-gray-400 font-semibold tracking-wider">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-2 py-0.5 rounded ${
                            isLive
                              ? "bg-red-600 text-white animate-pulse"
                              : "bg-white/5 text-gray-300 border border-white/5"
                          }`}
                        >
                          {isLive ? "AO VIVO" : getStageLabel(game)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3" />
                        <span>
                          {new Date(game.kickoff).toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Match Score Display */}
                    <div
                      onClick={() => !isEditing && startEditing(game)}
                      className={`p-4 flex items-center justify-between select-none ${
                        !isEditing && homeTeam && awayTeam
                          ? "cursor-pointer active:bg-white/5"
                          : ""
                      }`}
                    >
                      {/* Home Team */}
                      <div className="flex-1 flex flex-col items-center gap-2 text-center max-w-[35%]">
                        {homeTeam ? (
                          <>
                            <span className="text-3xl leading-none">{homeTeam.flag}</span>
                            <span className="font-bold text-white text-xs tracking-wide truncate w-full">
                              {homeTeam.name}
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="text-3xl leading-none">🏳️</span>
                            <span className="font-bold text-gray-500 text-xs tracking-wide truncate w-full">
                              {game.placeholder_home || "A definir"}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Match Score */}
                      <div className="flex flex-col items-center justify-center min-w-[30%]">
                        {!isEditing ? (
                          <div className="flex flex-col items-center">
                            <div className="flex items-center gap-4 text-2xl font-black tracking-widest text-white">
                              <span>{game.home_score ?? "-"}</span>
                              <span className="text-xs text-gray-500 font-normal">x</span>
                              <span>{game.away_score ?? "-"}</span>
                            </div>
                            
                            {/* Penalty shootout details */}
                            {isTie && (
                              <span className="text-[10px] text-brand-accent font-semibold mt-1">
                                Pen: {game.home_penalty ?? 0} x {game.away_penalty ?? 0}
                              </span>
                            )}
                            
                            {/* Edit Hint indicator */}
                            {homeTeam && awayTeam && (
                              <span className="text-[8px] text-gray-600 font-medium tracking-wide flex items-center gap-1 mt-1 opacity-0 hover:opacity-100 smooth-transition">
                                <Settings2 className="h-2.5 w-2.5" />
                                Clique para editar
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="text-xs font-bold text-brand-accent bg-brand-accent/10 py-1 px-3 rounded-full">
                            Editando...
                          </div>
                        )}
                      </div>

                      {/* Away Team */}
                      <div className="flex-1 flex flex-col items-center gap-2 text-center max-w-[35%]">
                        {awayTeam ? (
                          <>
                            <span className="text-3xl leading-none">{awayTeam.flag}</span>
                            <span className="font-bold text-white text-xs tracking-wide truncate w-full">
                              {awayTeam.name}
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="text-3xl leading-none">🏳️</span>
                            <span className="font-bold text-gray-500 text-xs tracking-wide truncate w-full">
                              {game.placeholder_away || "A definir"}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Inline Game Editor Panels */}
                    {isEditing && (
                      <div className="border-t border-card-border p-4 bg-[#0E0E0E80] flex flex-col gap-4 animate-scale-in">
                        {/* Status Selectors */}
                        <div className="flex justify-between items-center gap-2 border-b border-card-border pb-3">
                          <span className="text-xs text-gray-400 font-semibold uppercase">Status:</span>
                          <div className="flex gap-1.5">
                            {(["scheduled", "live", "finished"] as const).map((st) => (
                              <button
                                key={st}
                                onClick={() => {
                                  setEditStatus(st);
                                  if (st !== "finished") {
                                    setEditHomePen(null);
                                    setEditAwayPen(null);
                                  }
                                }}
                                className={`text-[10px] font-bold py-1 px-3 rounded-lg border uppercase smooth-transition cursor-pointer ${
                                  editStatus === st
                                    ? "bg-brand-accent border-brand-accent text-white"
                                    : "bg-card-bg border-card-border text-gray-400"
                                }`}
                              >
                                {st === "scheduled" ? "Agendado" : st === "live" ? "Ao vivo" : "Fim"}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Home and Away Score counters */}
                        <div className="flex items-center justify-between">
                          {/* Home Counter */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setEditHomeScore(Math.max(0, editHomeScore - 1))}
                              className="p-1.5 bg-[#1E1E1E] border border-card-border hover:border-gray-700 text-white rounded-lg cursor-pointer active:scale-90"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="w-8 text-center text-lg font-black text-white">{editHomeScore}</span>
                            <button
                              onClick={() => setEditHomeScore(editHomeScore + 1)}
                              className="p-1.5 bg-[#1E1E1E] border border-card-border hover:border-gray-700 text-white rounded-lg cursor-pointer active:scale-90"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>

                          <span className="text-xs text-gray-500 font-bold uppercase">Gols</span>

                          {/* Away Counter */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setEditAwayScore(Math.max(0, editAwayScore - 1))}
                              className="p-1.5 bg-[#1E1E1E] border border-card-border hover:border-gray-700 text-white rounded-lg cursor-pointer active:scale-90"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="w-8 text-center text-lg font-black text-white">{editAwayScore}</span>
                            <button
                              onClick={() => setEditAwayScore(editAwayScore + 1)}
                              className="p-1.5 bg-[#1E1E1E] border border-card-border hover:border-gray-700 text-white rounded-lg cursor-pointer active:scale-90"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {/* Penalties shootout inputs for knockout tie breaks */}
                        {isKnockout && editStatus === "finished" && editHomeScore === editAwayScore && (
                          <div className="flex items-center justify-between border-t border-card-border pt-3">
                            {/* Home Penalty Counter */}
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setEditHomePen(Math.max(0, (editHomePen ?? 0) - 1))}
                                className="p-1 bg-[#1E1E1E] border border-card-border text-white rounded cursor-pointer"
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                              <span className="w-6 text-center text-sm font-black text-brand-accent">
                                {editHomePen ?? 0}
                              </span>
                              <button
                                onClick={() => setEditHomePen((editHomePen ?? 0) + 1)}
                                className="p-1 bg-[#1E1E1E] border border-card-border text-white rounded cursor-pointer"
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>

                            <span className="text-[10px] text-brand-accent font-extrabold uppercase">Disputa Pênaltis</span>

                            {/* Away Penalty Counter */}
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setEditAwayPen(Math.max(0, (editAwayPen ?? 0) - 1))}
                                className="p-1 bg-[#1E1E1E] border border-card-border text-white rounded cursor-pointer"
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                              <span className="w-6 text-center text-sm font-black text-brand-accent">
                                {editAwayPen ?? 0}
                              </span>
                              <button
                                onClick={() => setEditAwayPen((editAwayPen ?? 0) + 1)}
                                className="p-1 bg-[#1E1E1E] border border-card-border text-white rounded cursor-pointer"
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-2 border-t border-card-border pt-3">
                          <button
                            onClick={() => setEditingGameId(null)}
                            className="flex-1 py-2 text-xs font-semibold bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl cursor-pointer"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={() => saveScore(game.id)}
                            className="flex-1 py-2 text-xs font-semibold bg-brand-success hover:bg-brand-success/90 text-white rounded-xl cursor-pointer shadow-md shadow-brand-success/10"
                          >
                            Confirmar
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Stadium details footer */}
                    {game.stadium && !isEditing && (
                      <div className="px-4 pb-3 border-t border-card-border/30 pt-2 flex items-center gap-1.5 text-[9px] text-gray-500 font-semibold">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">{game.stadium}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="text-3xl">⚽</span>
            <h4 className="font-semibold text-gray-300 mt-3">Nenhum jogo nesta categoria</h4>
            <p className="text-xs text-gray-500 max-w-[240px] mt-1">
              {filter === "live" ? "Não existem partidas acontecendo no momento." : "Sem partidas agendadas."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
