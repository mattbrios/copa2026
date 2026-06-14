"use client";

import { useState } from "react";
import { StickerStats } from "@/hooks/useStickers";
import { Trophy, CheckCircle2, History, Database, WifiOff } from "lucide-react";

interface HeaderProps {
  activeTab: string;
  stats: StickerStats;
  isLocalFallback: boolean;
}

export function Header({ activeTab, stats, isLocalFallback }: HeaderProps) {
  const [showStatsModal, setShowStatsModal] = useState(false);

  // Translate tab name to friendly title
  const getTitle = () => {
    switch (activeTab) {
      case "album":
        return "Álbum de Figurinhas";
      case "games":
        return "Tabela de Jogos";
      case "standings":
        return "Classificação & Fases";
      default:
        return "Copa 2026";
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-[#0B0B0BE0] backdrop-blur-md border-b border-card-border px-4 pt-4 pb-3">
      {/* Top row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="h-6 w-6 text-brand-accent animate-pulse-slow" />
          <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Copa 2026
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {isLocalFallback && (
            <div className="flex items-center gap-1 py-1 px-2.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 rounded-full text-[10px] font-semibold uppercase tracking-wider">
              <WifiOff className="h-3 w-3" />
              <span>Modo Local</span>
            </div>
          )}
          {!isLocalFallback && (
            <div className="flex items-center gap-1 py-1 px-2.5 bg-brand-success/10 border border-brand-success/20 text-brand-success rounded-full text-[10px] font-semibold uppercase tracking-wider">
              <Database className="h-3 w-3" />
              <span>Nuvem</span>
            </div>
          )}
        </div>
      </div>

      {/* Title block */}
      <div className="mt-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-300">{getTitle()}</h2>
        {activeTab === "album" && (
          <button
            onClick={() => setShowStatsModal(!showStatsModal)}
            className="flex items-center gap-1 text-xs text-brand-accent font-medium bg-brand-accent/10 py-1 px-2.5 rounded-lg active:scale-95 smooth-transition hover:bg-brand-accent/20 cursor-pointer"
          >
            <History className="h-3.5 w-3.5" />
            <span>Estatísticas</span>
          </button>
        )}
      </div>

      {/* Album progress bar */}
      {activeTab === "album" && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-gray-400 font-medium mb-1">
            <span>Progresso Geral</span>
            <div className="flex items-center gap-1.5 font-semibold text-white">
              <span>{stats.checked} / {stats.total}</span>
              <span className="text-brand-success">({stats.percentage}%)</span>
            </div>
          </div>
          
          {/* Progress bar container */}
          <div className="w-full h-2 bg-[#1C1C1C] rounded-full overflow-hidden border border-white/5">
            <div
              style={{ width: `${stats.percentage}%` }}
              className="h-full bg-gradient-to-r from-brand-success to-emerald-400 rounded-full smooth-transition relative shadow-[0_0_8px_#10B981A0]"
            />
          </div>
        </div>
      )}

      {/* Quick stats drawer overlay */}
      {activeTab === "album" && showStatsModal && (
        <div className="absolute top-full left-0 right-0 m-4 p-4 bg-card-bg border border-card-border rounded-2xl shadow-2xl glass-panel animate-scale-in flex flex-col gap-4 text-sm z-50">
          <div className="flex items-center justify-between border-b border-card-border pb-2">
            <h4 className="font-semibold text-white">Resumo do Álbum</h4>
            <button
              onClick={() => setShowStatsModal(false)}
              className="text-xs text-gray-400 hover:text-white"
            >
              Fechar
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#1C1C1C] border border-card-border rounded-xl p-3 flex flex-col gap-1">
              <span className="text-xs text-gray-400">Total Preenchido</span>
              <span className="text-lg font-bold text-white flex items-center gap-1.5">
                <CheckCircle2 className="h-4.5 w-4.5 text-brand-success" />
                {stats.checked}
              </span>
            </div>
            
            <div className="bg-[#1C1C1C] border border-card-border rounded-xl p-3 flex flex-col gap-1">
              <span className="text-xs text-gray-400">Faltando</span>
              <span className="text-lg font-bold text-gray-200">
                {stats.total - stats.checked}
              </span>
            </div>
          </div>

          {stats.mostCompletedTeam && (
            <div className="bg-[#1C1C1C] border border-card-border rounded-xl p-3 flex flex-col gap-1.5">
              <span className="text-xs text-gray-400">Seleção mais completa</span>
              <div className="flex items-center justify-between">
                <span className="font-medium text-white flex items-center gap-1.5">
                  <span className="text-lg">{stats.mostCompletedTeam.flag}</span>
                  {stats.mostCompletedTeam.name}
                </span>
                <span className="text-brand-success font-semibold">
                  {stats.mostCompletedTeam.count} / 20
                </span>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <span className="text-xs text-gray-400">Últimas figurinhas coladas</span>
            {stats.lastChecked.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {stats.lastChecked.map((code) => (
                  <span
                    key={code}
                    className="text-xs bg-brand-success/10 border border-brand-success/20 text-brand-success px-2 py-0.5 rounded-full font-medium"
                  >
                    {code}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-xs text-gray-500 italic">Nenhuma figurinha colada ainda.</span>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
