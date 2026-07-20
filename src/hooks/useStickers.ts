import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { MOCK_TEAMS, STICKERS_PER_TEAM, getStickerCount } from "@/lib/mockData";

export interface StickerStats {
  total: number;
  checked: number;
  percentage: number;
  mostCompletedTeam: { name: string; flag: string; count: number; total: number } | null;
  lastChecked: string[]; // List of sticker codes
}

interface StickerCollectionConfig {
  table: string;
  storageKey: string;
  recentStorageKey: string;
  realtimeChannel: string;
}

// Shared implementation behind independent sticker collections (e.g. album vs repeated),
// each backed by its own Supabase table / localStorage keys / realtime channel.
export function useStickerCollection({
  table,
  storageKey,
  recentStorageKey,
  realtimeChannel,
}: StickerCollectionConfig) {
  const [stickers, setStickers] = useState<Record<string, boolean>>({});
  const [lastChecked, setLastChecked] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Load stickers check state
  useEffect(() => {
    async function loadStickers() {
      setLoading(true);
      try {
        let loadedFromSupabase = false;

        if (isSupabaseConfigured && supabase) {
          try {
            const { data, error } = await supabase
              .from(table)
              .select("id, checked, code")
              .eq("checked", true);

            if (error) throw error;

            const stickerMap: Record<string, boolean> = {};
            const recentList: string[] = [];

            if (data) {
              data.forEach((item: any) => {
                stickerMap[item.id] = item.checked;
              });

              // Fetch the last 5 updated stickers for stats
              const { data: recentData } = await supabase
                .from(table)
                .select("code")
                .eq("checked", true)
                .order("updated_at", { ascending: false })
                .limit(5);

              if (recentData) {
                recentData.forEach((item: any) => {
                  recentList.push(item.code);
                });
              }
            }
            setStickers(stickerMap);
            setLastChecked(recentList);
            loadedFromSupabase = true;
          } catch (dbErr) {
            console.warn(`Supabase ${table} query failed, falling back to LocalStorage:`, dbErr);
          }
        }

        if (!loadedFromSupabase) {
          // LocalStorage fallback
          const localData = localStorage.getItem(storageKey);
          const localRecent = localStorage.getItem(recentStorageKey);

          if (localData) {
            setStickers(JSON.parse(localData));
          }
          if (localRecent) {
            setLastChecked(JSON.parse(localRecent));
          }
        }
      } catch (err) {
        console.error(`Error loading ${table}:`, err);
      } finally {
        setLoading(false);
      }
    }

    loadStickers();
  }, [table, storageKey, recentStorageKey]);

  // Subscribe to real-time stickers updates from Supabase
  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      const channel = supabase
        .channel(realtimeChannel)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table },
          (payload) => {
            const newSticker = payload.new as any;
            const oldSticker = payload.old as any;

            if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
              setStickers((prev) => ({
                ...prev,
                [newSticker.id]: newSticker.checked,
              }));

              if (newSticker.checked) {
                // Add to recent if not already there, limit to 5
                setLastChecked((prev) => [
                  newSticker.code,
                  ...prev.filter((c) => c !== newSticker.code)
                ].slice(0, 5));
              } else {
                // Remove from recent
                setLastChecked((prev) => prev.filter((c) => c !== newSticker.code));
              }
            } else if (payload.eventType === "DELETE") {
              setStickers((prev) => {
                const updated = { ...prev };
                delete updated[oldSticker.id];
                return updated;
              });
              if (oldSticker && oldSticker.code) {
                setLastChecked((prev) => prev.filter((c) => c !== oldSticker.code));
              }
            }
          }
        )
        .subscribe();

      return () => {
        supabase?.removeChannel(channel);
      };
    }
  }, [table, realtimeChannel]);

  // Update localStorage helper
  const saveToLocal = useCallback((updatedStickers: Record<string, boolean>, updatedRecent: string[]) => {
    localStorage.setItem(storageKey, JSON.stringify(updatedStickers));
    localStorage.setItem(recentStorageKey, JSON.stringify(updatedRecent));
  }, [storageKey, recentStorageKey]);

  // Toggle single sticker checked status
  const toggleSticker = useCallback(
    async (teamId: string, num: number) => {
      const stickerId = `${teamId}_${num}`;
      const code = `${teamId} ${num}`;

      setStickers((prev) => {
        const isCurrentChecked = prev[stickerId] || false;
        const nextChecked = !isCurrentChecked;
        const newStickers = { ...prev, [stickerId]: nextChecked };

        // Handle recent list updates
        let newRecent = [...lastChecked];
        if (nextChecked) {
          // Add to start, limit to 5
          newRecent = [code, ...newRecent.filter((c) => c !== code)].slice(0, 5);
        } else {
          // Remove from recent
          newRecent = newRecent.filter((c) => c !== code);
        }

        setLastChecked(newRecent);

        // Async save to database
        if (isSupabaseConfigured && supabase) {
          supabase
            .from(table)
            .upsert(
              {
                id: stickerId,
                team_id: teamId,
                code,
                checked: nextChecked,
                updated_at: new Date().toISOString(),
              },
              { onConflict: "id" }
            )
            .then(({ error }) => {
              if (error) {
                console.error("Database update error, saving to LocalStorage:", error);
                saveToLocal(newStickers, newRecent);
              }
            });
        } else {
          saveToLocal(newStickers, newRecent);
        }

        return newStickers;
      });
    },
    [lastChecked, saveToLocal, table]
  );

  // Mark all stickers for a team
  const markAll = useCallback(
    async (teamId: string) => {
      const updatedStickers = { ...stickers };
      const teamStickers: any[] = [];
      const nowStr = new Date().toISOString();
      const team = MOCK_TEAMS.find((t) => t.id === teamId);
      const teamStickerCount = team ? getStickerCount(team) : STICKERS_PER_TEAM;

      for (let i = 1; i <= teamStickerCount; i++) {
        const stickerId = `${teamId}_${i}`;
        const code = `${teamId} ${i}`;
        updatedStickers[stickerId] = true;

        teamStickers.push({
          id: stickerId,
          team_id: teamId,
          code,
          checked: true,
          updated_at: nowStr,
        });
      }

      setStickers(updatedStickers);

      // Add one of the team's stickers to recent
      const teamCodeExample = `${teamId} 10`;
      const newRecent = [teamCodeExample, ...lastChecked.filter(c => !c.startsWith(teamId))].slice(0, 5);
      setLastChecked(newRecent);

      if (isSupabaseConfigured && supabase) {
        try {
          const { error } = await supabase.from(table).upsert(teamStickers, { onConflict: "id" });
          if (error) throw error;
        } catch (err) {
          console.error("Error marking all stickers in database, saving to LocalStorage:", err);
          saveToLocal(updatedStickers, newRecent);
        }
      } else {
        saveToLocal(updatedStickers, newRecent);
      }
    },
    [stickers, lastChecked, saveToLocal, table]
  );

  // Clear all stickers for a team
  const clearAll = useCallback(
    async (teamId: string) => {
      const updatedStickers = { ...stickers };
      const teamStickers: any[] = [];
      const nowStr = new Date().toISOString();
      const team = MOCK_TEAMS.find((t) => t.id === teamId);
      const teamStickerCount = team ? getStickerCount(team) : STICKERS_PER_TEAM;

      for (let i = 1; i <= teamStickerCount; i++) {
        const stickerId = `${teamId}_${i}`;
        const code = `${teamId} ${i}`;
        updatedStickers[stickerId] = false;

        teamStickers.push({
          id: stickerId,
          team_id: teamId,
          code,
          checked: false,
          updated_at: nowStr,
        });
      }

      setStickers(updatedStickers);

      // Clean from recent
      const newRecent = lastChecked.filter((c) => !c.startsWith(teamId));
      setLastChecked(newRecent);

      if (isSupabaseConfigured && supabase) {
        try {
          const { error } = await supabase.from(table).upsert(teamStickers, { onConflict: "id" });
          if (error) throw error;
        } catch (err) {
          console.error("Error clearing stickers in database, saving to LocalStorage:", err);
          saveToLocal(updatedStickers, newRecent);
        }
      } else {
        saveToLocal(updatedStickers, newRecent);
      }
    },
    [stickers, lastChecked, saveToLocal, table]
  );

  // Compute album statistics
  const stats = useMemo<StickerStats>(() => {
    const totalStickers = MOCK_TEAMS.reduce((sum, team) => sum + getStickerCount(team), 0);
    let checkedCount = 0;

    // Count checked
    Object.keys(stickers).forEach((key) => {
      if (stickers[key]) checkedCount++;
    });

    // Find the most completed team
    let maxCheckedCount = -1;
    let bestTeam: typeof MOCK_TEAMS[0] | null = null;

    MOCK_TEAMS.forEach((team) => {
      let teamChecked = 0;
      for (let i = 1; i <= getStickerCount(team); i++) {
        if (stickers[`${team.id}_${i}`]) teamChecked++;
      }
      if (teamChecked > maxCheckedCount) {
        maxCheckedCount = teamChecked;
        bestTeam = team;
      }
    });

    const mostCompletedTeam =
      bestTeam && maxCheckedCount > 0
        ? {
            name: (bestTeam as any).name,
            flag: (bestTeam as any).flag,
            count: maxCheckedCount,
            total: getStickerCount(bestTeam as any),
          }
        : null;

    return {
      total: totalStickers,
      checked: checkedCount,
      percentage: totalStickers > 0 ? Math.round((checkedCount / totalStickers) * 100) : 0,
      mostCompletedTeam,
      lastChecked,
    };
  }, [stickers, lastChecked]);

  // Check if a team has any stickers checked, and the count
  const getTeamProgress = useCallback(
    (teamId: string) => {
      const team = MOCK_TEAMS.find((t) => t.id === teamId);
      const total = team ? getStickerCount(team) : STICKERS_PER_TEAM;
      let checked = 0;
      for (let i = 1; i <= total; i++) {
        if (stickers[`${teamId}_${i}`]) checked++;
      }
      return {
        checked,
        total,
        percentage: Math.round((checked / total) * 100),
      };
    },
    [stickers]
  );

  return {
    stickers,
    loading,
    stats,
    toggleSticker,
    markAll,
    clearAll,
    getTeamProgress,
    isLocalFallback: !isSupabaseConfigured,
  };
}

export function useStickers() {
  return useStickerCollection({
    table: "stickers",
    storageKey: "copa2026_stickers",
    recentStorageKey: "copa2026_recent",
    realtimeChannel: "stickers-realtime",
  });
}
