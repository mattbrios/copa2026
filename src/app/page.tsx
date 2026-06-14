"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { BottomNavigation, TabType } from "@/components/BottomNavigation";
import { SearchInput } from "@/components/SearchInput";
import { StickerSection } from "@/components/StickerSection";
import { GamesSection } from "@/components/GamesSection";
import { StandingsSection } from "@/components/StandingsSection";
import { useStickers } from "@/hooks/useStickers";
import { useGames } from "@/hooks/useGames";
import { AlertCircle } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>("album");
  const [searchQuery, setSearchQuery] = useState("");

  const {
    stickers,
    loading: loadingStickers,
    stats,
    toggleSticker,
    markAll,
    clearAll,
    getTeamProgress,
    isLocalFallback: stickersLocal,
  } = useStickers();

  const {
    games,
    loading: loadingGames,
    standings,
    updateGameScore,
    isLocalFallback: gamesLocal,
  } = useGames();

  const loading = loadingStickers || loadingGames;
  const isLocalFallback = stickersLocal || gamesLocal;

  // Render loading skeleton
  if (loading) {
    return (
      <div className="flex-1 flex flex-col max-w-md mx-auto w-full bg-background min-h-screen pb-24">
        {/* Skeleton Header */}
        <div className="p-4 border-b border-card-border flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <div className="h-6 w-32 bg-[#1C1C1C] rounded-lg animate-pulse" />
            <div className="h-5 w-20 bg-[#1C1C1C] rounded-full animate-pulse" />
          </div>
          <div className="h-8 w-full bg-[#1C1C1C] rounded-xl animate-pulse mt-1" />
        </div>

        {/* Skeleton Search */}
        <div className="px-4 py-2 mt-2">
          <div className="h-10 w-full bg-[#1C1C1C] rounded-xl animate-pulse" />
        </div>

        {/* Skeleton Cards */}
        <div className="px-4 mt-4 flex flex-col gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-20 bg-card-bg border border-card-border rounded-2xl p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-[#1C1C1C] rounded-full animate-pulse" />
                <div className="flex flex-col gap-1.5">
                  <div className="h-4 w-24 bg-[#1C1C1C] rounded animate-pulse" />
                  <div className="h-3.5 w-16 bg-[#1C1C1C] rounded animate-pulse" />
                </div>
              </div>
              <div className="h-6 w-12 bg-[#1C1C1C] rounded-lg animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col max-w-md mx-auto w-full bg-background min-h-screen relative shadow-2xl border-x border-card-border/50">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        stats={stats}
        isLocalFallback={isLocalFallback}
      />

      {/* Main Content Area */}
      <main className="flex-grow overflow-y-auto no-scrollbar">
        {activeTab === "album" && (
          <>
            {/* Inline search box */}
            <div className="px-4 pt-3">
              <SearchInput value={searchQuery} onChange={setSearchQuery} />
            </div>
            
            <StickerSection
              stickers={stickers}
              toggleSticker={toggleSticker}
              markAll={markAll}
              clearAll={clearAll}
              getTeamProgress={getTeamProgress}
              searchQuery={searchQuery}
            />
          </>
        )}

        {activeTab === "games" && (
          <GamesSection games={games} updateGameScore={updateGameScore} />
        )}

        {activeTab === "standings" && (
          <StandingsSection standings={standings} games={games} />
        )}
      </main>

      {/* Bottom Sticky Navigation */}
      <BottomNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
