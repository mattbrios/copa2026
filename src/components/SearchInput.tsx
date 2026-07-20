"use client";

import { Search, X } from "lucide-react";
import { STICKER_THEMES, StickerVariant } from "@/lib/stickerTheme";

interface SearchInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  variant?: StickerVariant;
}

export function SearchInput({ value, onChange, placeholder = "Pesquise por código ou país...", variant = "album" }: SearchInputProps) {
  const theme = STICKER_THEMES[variant];

  return (
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-gray-400" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full pl-10 pr-10 py-2.5 ${theme.cardBg} border ${theme.cardBorder} ${theme.focusRing} rounded-xl text-sm text-white placeholder-gray-500 outline-none smooth-transition`}
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-200 cursor-pointer active:scale-90"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
