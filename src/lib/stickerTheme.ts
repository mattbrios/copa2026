export type StickerVariant = "album" | "repeated";

export const STICKER_THEMES: Record<
  StickerVariant,
  {
    pageBg: string;
    headerBg: string;
    cardBg: string;
    cardBorder: string;
    groupActive: string;
    checkedSticker: string;
    completeBadge: string;
    markAllBtn: string;
    expandedBg: string;
    progressGradient: string;
    accentText: string;
    accentBg: string;
    focusRing: string;
  }
> = {
  album: {
    pageBg: "bg-background",
    headerBg: "bg-[#0B0B0BE0]",
    cardBg: "bg-card-bg",
    cardBorder: "border-card-border",
    groupActive: "bg-brand-accent text-white shadow-md shadow-brand-accent/20",
    checkedSticker: "bg-brand-success border-brand-success text-white shadow-md shadow-brand-success/15",
    completeBadge: "bg-brand-success/15 text-brand-success border border-brand-success/25",
    markAllBtn: "text-brand-success bg-brand-success/10 border border-brand-success/10 hover:bg-brand-success/15",
    expandedBg: "bg-[#0E0E0E60]",
    progressGradient: "from-brand-success to-emerald-400 shadow-[0_0_8px_#10B981A0]",
    accentText: "text-brand-accent",
    accentBg: "bg-brand-accent/10 hover:bg-brand-accent/20",
    focusRing: "focus:border-brand-accent/50 focus:ring-1 focus:ring-brand-accent/50",
  },
  repeated: {
    pageBg: "bg-[#170404]",
    headerBg: "bg-[#170404E0]",
    cardBg: "bg-[#1E0707]",
    cardBorder: "border-[#3F1414]",
    groupActive: "bg-brand-danger-strong text-white shadow-md shadow-brand-danger-strong/20",
    checkedSticker: "bg-brand-danger-vivid border-transparent text-white shadow-md shadow-brand-danger-vivid/25",
    completeBadge: "bg-brand-danger-strong/15 text-brand-danger-strong border border-brand-danger-strong/25",
    markAllBtn: "text-brand-danger-strong bg-brand-danger-strong/10 border border-brand-danger-strong/10 hover:bg-brand-danger-strong/15",
    expandedBg: "bg-brand-danger/50",
    progressGradient: "from-brand-danger-strong to-red-400 shadow-[0_0_8px_#DC2626A0]",
    accentText: "text-brand-danger-strong",
    accentBg: "bg-brand-danger-strong/10 hover:bg-brand-danger-strong/20",
    focusRing: "focus:border-brand-danger-strong/50 focus:ring-1 focus:ring-brand-danger-strong/50",
  },
};
