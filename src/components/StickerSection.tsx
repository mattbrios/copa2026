"use client";

import { useState, useMemo, useEffect } from "react";
import { STICKERS_PER_TEAM, MOCK_TEAMS } from "@/lib/mockData";
import { Check, ChevronDown, ChevronUp, CheckSquare, Square } from "lucide-react";

interface StickerSectionProps {
  stickers: Record<string, boolean>;
  toggleSticker: (teamId: string, num: number) => Promise<void>;
  markAll: (teamId: string) => Promise<void>;
  clearAll: (teamId: string) => Promise<void>;
  getTeamProgress: (teamId: string) => { checked: number; total: number; percentage: number };
  searchQuery: string;
}

export function StickerSection({
  stickers,
  toggleSticker,
  markAll,
  clearAll,
  getTeamProgress,
  searchQuery,
}: StickerSectionProps) {
  const [selectedGroup, setSelectedGroup] = useState<string>("ALL");
  const [expandedTeams, setExpandedTeams] = useState<Record<string, boolean>>({});

  const groups = ["ALL", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

  // Toggle expand state for a team card
  const toggleExpand = (teamId: string) => {
    setExpandedTeams((prev) => ({
      ...prev,
      [teamId]: !prev[teamId],
    }));
  };

  // Process and filter teams based on search query and group filters
  const filteredTeams = useMemo(() => {
    let result = MOCK_TEAMS;

    // Filter by group tab
    if (selectedGroup !== "ALL") {
      result = result.filter((t) => t.group === selectedGroup);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((team) => {
        // Match team name, code or individual sticker code e.g. "BRA 10"
        const nameMatch = team.name.toLowerCase().includes(q);
        const codeMatch = team.code.toLowerCase().includes(q);
        
        // Check if query is looking for a sticker code like "BRA 10" or "BRA10"
        const cleanQuery = q.replace(/\s+/g, "");
        let stickerMatch = false;
        for (let i = 1; i <= STICKERS_PER_TEAM; i++) {
          const stickerCode = `${team.code}${i}`.toLowerCase();
          if (stickerCode.includes(cleanQuery)) {
            stickerMatch = true;
            break;
          }
        }

        return nameMatch || codeMatch || stickerMatch;
      });
    }

    return result;
  }, [selectedGroup, searchQuery]);

  // Auto-expand teams if there is a search query
  useEffect(() => {
    if (searchQuery.trim()) {
      const expansions: Record<string, boolean> = {};
      filteredTeams.forEach((team) => {
        expansions[team.id] = true;
      });
      setExpandedTeams(expansions);
    }
  }, [searchQuery, filteredTeams]);

  // Render sticker grid buttons
  const renderStickerGrid = (teamId: string, teamCode: string) => {
    const buttons = [];
    const qClean = searchQuery.toLowerCase().trim().replace(/\s+/g, "");

    for (let i = 1; i <= STICKERS_PER_TEAM; i++) {
      const stickerId = `${teamId}_${i}`;
      const stickerCode = `${teamCode} ${i}`;
      const isChecked = stickers[stickerId] || false;
      
      // If searching, dim other stickers that don't match
      const matchesSearch = searchQuery
        ? stickerCode.toLowerCase().replace(/\s+/g, "").includes(qClean) ||
          teamCode.toLowerCase().includes(qClean)
        : true;

      buttons.push(
        <button
          key={stickerId}
          onClick={() => toggleSticker(teamId, i)}
          disabled={!matchesSearch && !!searchQuery}
          className={`flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-semibold select-none border transition-all active:scale-95 cursor-pointer duration-150 ${
            isChecked
              ? "bg-brand-success border-brand-success text-white shadow-md shadow-brand-success/15"
              : "bg-[#1E1E1E] border-card-border hover:border-gray-700 text-gray-300"
          } ${!matchesSearch && !!searchQuery ? "opacity-25" : "opacity-100"}`}
        >
          {isChecked && <Check className="h-3.5 w-3.5" />}
          <span>{teamCode} {i}</span>
        </button>
      );
    }

    return <div className="grid grid-cols-4 gap-2.5 mt-3 animate-scale-in">{buttons}</div>;
  };

  return (
    <div className="flex flex-col gap-4 pb-24 px-4 pt-2">
      {/* Horizontal Group Selector */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar py-1.5 -mx-4 px-4">
        {groups.map((group) => (
          <button
            key={group}
            onClick={() => setSelectedGroup(group)}
            className={`py-1.5 px-4 rounded-xl text-xs font-bold shrink-0 smooth-transition cursor-pointer ${
              selectedGroup === group
                ? "bg-brand-accent text-white shadow-md shadow-brand-accent/20"
                : "bg-card-bg border border-card-border text-gray-400 hover:text-gray-200"
            }`}
          >
            {group === "ALL" ? "Todos" : `Grupo ${group}`}
          </button>
        ))}
      </div>

      {/* Grid of Team Cards */}
      <div className="flex flex-col gap-3.5">
        {filteredTeams.length > 0 ? (
          filteredTeams.map((team) => {
            const isExpanded = expandedTeams[team.id];
            const progress = getTeamProgress(team.id);

            return (
              <div
                key={team.id}
                className="bg-card-bg border border-card-border rounded-2xl overflow-hidden smooth-transition hover:border-gray-800"
              >
                {/* Team Card Header */}
                <div
                  onClick={() => toggleExpand(team.id)}
                  className="p-4 flex items-center justify-between cursor-pointer select-none active:bg-white/5"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl leading-none select-none">{team.flag}</span>
                    <div className="flex flex-col">
                      <span className="font-bold text-white text-sm tracking-wide">
                        {team.name}
                      </span>
                      <span className="text-xs text-gray-400 font-medium">
                        {progress.checked} / {progress.total} figurinhas
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Completion ring/percentage badge */}
                    <span
                      className={`text-xs font-bold py-1 px-2.5 rounded-lg ${
                        progress.percentage === 100
                          ? "bg-brand-success/15 text-brand-success border border-brand-success/25"
                          : "bg-[#1E1E1E] text-gray-400 border border-card-border"
                      }`}
                    >
                      {progress.percentage}%
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="h-4.5 w-4.5 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-4.5 w-4.5 text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Sticker grid (Revealed when expanded) */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-card-border bg-[#0E0E0E60] animate-scale-in">
                    {/* Action buttons (Select all / Clear all) */}
                    <div className="flex items-center justify-end gap-3 pt-3">
                      <button
                        onClick={() => markAll(team.id)}
                        className="flex items-center gap-1.5 text-xs text-brand-success bg-brand-success/10 border border-brand-success/10 py-1.5 px-3 rounded-lg active:scale-95 smooth-transition hover:bg-brand-success/15 cursor-pointer font-medium"
                      >
                        <CheckSquare className="h-3.5 w-3.5" />
                        <span>Marcar Todas</span>
                      </button>
                      <button
                        onClick={() => clearAll(team.id)}
                        className="flex items-center gap-1.5 text-xs text-gray-400 bg-white/5 py-1.5 px-3 rounded-lg active:scale-95 smooth-transition hover:bg-white/10 cursor-pointer font-medium"
                      >
                        <Square className="h-3.5 w-3.5" />
                        <span>Limpar</span>
                      </button>
                    </div>

                    {renderStickerGrid(team.id, team.code)}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="text-3xl">🔍</span>
            <h4 className="font-semibold text-gray-300 mt-3">Nenhum país encontrado</h4>
            <p className="text-xs text-gray-500 max-w-[240px] mt-1">
              Verifique a grafia ou o filtro de grupos selecionado.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
