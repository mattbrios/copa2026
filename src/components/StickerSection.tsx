"use client";

import { useState, useMemo, useEffect } from "react";
import { MOCK_TEAMS, getStickerCount } from "@/lib/mockData";
import { STICKER_THEMES, StickerVariant } from "@/lib/stickerTheme";
import { buildMissingStickersMessage } from "@/lib/missingStickersMessage";
import { Check, ChevronDown, ChevronUp, CheckSquare, Square } from "lucide-react";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413" />
    </svg>
  );
}

interface StickerSectionProps {
  stickers: Record<string, boolean>;
  toggleSticker: (teamId: string, num: number) => Promise<void>;
  markAll: (teamId: string) => Promise<void>;
  clearAll: (teamId: string) => Promise<void>;
  getTeamProgress: (teamId: string) => { checked: number; total: number; percentage: number };
  searchQuery: string;
  variant?: StickerVariant;
}

export function StickerSection({
  stickers,
  toggleSticker,
  markAll,
  clearAll,
  getTeamProgress,
  searchQuery,
  variant = "album",
}: StickerSectionProps) {
  const theme = STICKER_THEMES[variant];
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
        for (let i = 1; i <= getStickerCount(team); i++) {
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
  const renderStickerGrid = (teamId: string, teamCode: string, stickerCount: number) => {
    const buttons = [];
    const qClean = searchQuery.toLowerCase().trim().replace(/\s+/g, "");

    for (let i = 1; i <= stickerCount; i++) {
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
              ? theme.checkedSticker
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

  const handleSendMissing = () => {
    const message = buildMissingStickersMessage(stickers);
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
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
                ? theme.groupActive
                : `${theme.cardBg} border ${theme.cardBorder} text-gray-400 hover:text-gray-200`
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
                className={`${theme.cardBg} border ${theme.cardBorder} rounded-2xl overflow-hidden smooth-transition hover:border-gray-800`}
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
                          ? theme.completeBadge
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
                  <div className={`px-4 pb-4 border-t ${theme.cardBorder} ${theme.expandedBg} animate-scale-in`}>
                    {/* Action buttons (Select all / Clear all) */}
                    <div className="flex items-center justify-end gap-3 pt-3">
                      <button
                        onClick={() => markAll(team.id)}
                        className={`flex items-center gap-1.5 text-xs py-1.5 px-3 rounded-lg active:scale-95 smooth-transition cursor-pointer font-medium ${theme.markAllBtn}`}
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

                    {renderStickerGrid(team.id, team.code, getStickerCount(team))}
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

      {variant === "album" && (
        <button
          onClick={handleSendMissing}
          className="flex items-center justify-center gap-2 py-3 px-4 bg-whatsapp hover:bg-whatsapp/90 text-white rounded-xl text-sm font-semibold smooth-transition active:scale-95 cursor-pointer shadow-lg shadow-whatsapp/20"
        >
          <WhatsAppIcon className="h-4.5 w-4.5" />
          <span>Enviar faltantes</span>
        </button>
      )}
    </div>
  );
}
