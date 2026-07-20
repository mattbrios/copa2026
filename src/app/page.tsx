"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { BottomNavigation, TabType } from "@/components/BottomNavigation";
import { SearchInput } from "@/components/SearchInput";
import { StickerSection } from "@/components/StickerSection";
import { useStickers } from "@/hooks/useStickers";
import { useRepeatedStickers } from "@/hooks/useRepeatedStickers";
import { STICKER_THEMES } from "@/lib/stickerTheme";

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>("album");
  const [albumSearch, setAlbumSearch] = useState("");
  const [repeatedSearch, setRepeatedSearch] = useState("");

  const album = useStickers();
  const repeated = useRepeatedStickers();

  const loading = album.loading || repeated.loading;

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

  const isAlbum = activeTab === "album";
  const current = isAlbum ? album : repeated;
  const searchQuery = isAlbum ? albumSearch : repeatedSearch;
  const setSearchQuery = isAlbum ? setAlbumSearch : setRepeatedSearch;
  const theme = STICKER_THEMES[activeTab];

  return (
    <div
      className={`flex-1 flex flex-col max-w-md mx-auto w-full ${theme.pageBg} min-h-screen relative shadow-2xl border-x ${theme.cardBorder} smooth-transition`}
    >
      {/* Top Header */}
      <Header
        title={isAlbum ? "Álbum de Figurinhas" : "Figurinhas Repetidas"}
        stats={current.stats}
        isLocalFallback={current.isLocalFallback}
        variant={activeTab}
      />

      {/* Main Content Area */}
      <main className="flex-grow overflow-y-auto no-scrollbar">
        {/* Inline search box */}
        <div className="px-4 pt-3">
          <SearchInput value={searchQuery} onChange={setSearchQuery} variant={activeTab} />
        </div>

        <StickerSection
          key={activeTab}
          stickers={current.stickers}
          toggleSticker={current.toggleSticker}
          markAll={current.markAll}
          clearAll={current.clearAll}
          getTeamProgress={current.getTeamProgress}
          searchQuery={searchQuery}
          variant={activeTab}
        />
      </main>

      {/* Bottom Sticky Navigation */}
      <BottomNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
