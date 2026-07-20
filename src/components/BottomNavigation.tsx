"use client";

import { Book, Copy } from "lucide-react";
import { STICKER_THEMES } from "@/lib/stickerTheme";

export type TabType = "album" | "repeated";

interface BottomNavigationProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export function BottomNavigation({ activeTab, setActiveTab }: BottomNavigationProps) {
  const navItems = [
    { id: "album", label: "Álbum", icon: Book },
    { id: "repeated", label: "Repetidas", icon: Copy },
  ] as const;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0E0E0EC0] backdrop-blur-md border-t border-card-border safe-pb flex items-center justify-around py-3">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        const theme = STICKER_THEMES[item.id];

        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center gap-1.5 py-1 px-5 rounded-2xl smooth-transition active:scale-90 cursor-pointer ${
              isActive ? `${theme.accentText} ${theme.accentBg}` : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <Icon className={`h-5 w-5 smooth-transition ${isActive ? "scale-110" : ""}`} />
            <span className="text-[10px] font-semibold tracking-wider uppercase">
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
