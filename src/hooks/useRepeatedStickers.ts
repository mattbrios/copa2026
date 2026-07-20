import { useStickerCollection } from "./useStickers";

export function useRepeatedStickers() {
  return useStickerCollection({
    table: "repeated_stickers",
    storageKey: "copa2026_repeated_stickers",
    recentStorageKey: "copa2026_repeated_recent",
    realtimeChannel: "repeated-stickers-realtime",
  });
}
