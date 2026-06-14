import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { MOCK_TEAMS, STICKERS_PER_TEAM } from "@/lib/mockData";
import { Sticker } from "@/types";

export interface StickerStats {
  total: number;
  checked: number;
  percentage: number;
  mostCompletedTeam: { name: string; flag: string; count: number } | null;
  lastChecked: string[]; // List of sticker codes
}

export function useStickers() {
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
              .from("stickers")
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
                .from("stickers")
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
            console.warn("Supabase stickers query failed, falling back to LocalStorage:", dbErr);
          }
        }

        if (!loadedFromSupabase) {
          // LocalStorage fallback
          const localData = localStorage.getItem("copa2026_stickers");
          const localRecent = localStorage.getItem("copa2026_recent");
          
          if (localData) {
            setStickers(JSON.parse(localData));
          }
          if (localRecent) {
            setLastChecked(JSON.parse(localRecent));
          }
        }
      } catch (err) {
        console.error("Error loading stickers:", err);
      } finally {
        setLoading(false);
      }
    }

    loadStickers();
  }, []);

  // Update localStorage helper
  const saveToLocal = useCallback((updatedStickers: Record<string, boolean>, updatedRecent: string[]) => {
    localStorage.setItem("copa2026_stickers", JSON.stringify(updatedStickers));
    localStorage.setItem("copa2026_recent", JSON.stringify(updatedRecent));
  }, []);

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
            .from("stickers")
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
    [lastChecked, saveToLocal]
  );

  // Mark all stickers for a team
  const markAll = useCallback(
    async (teamId: string) => {
      const updatedStickers = { ...stickers };
      const teamStickers: any[] = [];
      const nowStr = new Date().toISOString();

      for (let i = 1; i <= STICKERS_PER_TEAM; i++) {
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
          const { error } = await supabase.from("stickers").upsert(teamStickers, { onConflict: "id" });
          if (error) throw error;
        } catch (err) {
          console.error("Error marking all stickers in database, saving to LocalStorage:", err);
          saveToLocal(updatedStickers, newRecent);
        }
      } else {
        saveToLocal(updatedStickers, newRecent);
      }
    },
    [stickers, lastChecked, saveToLocal]
  );

  // Clear all stickers for a team
  const clearAll = useCallback(
    async (teamId: string) => {
      const updatedStickers = { ...stickers };
      const teamStickers: any[] = [];
      const nowStr = new Date().toISOString();

      for (let i = 1; i <= STICKERS_PER_TEAM; i++) {
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
          const { error } = await supabase.from("stickers").upsert(teamStickers, { onConflict: "id" });
          if (error) throw error;
        } catch (err) {
          console.error("Error clearing stickers in database, saving to LocalStorage:", err);
          saveToLocal(updatedStickers, newRecent);
        }
      } else {
        saveToLocal(updatedStickers, newRecent);
      }
    },
    [stickers, lastChecked, saveToLocal]
  );

  // Compute album statistics
  const stats = useMemo<StickerStats>(() => {
    const totalStickers = MOCK_TEAMS.length * STICKERS_PER_TEAM;
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
      for (let i = 1; i <= STICKERS_PER_TEAM; i++) {
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
      let checked = 0;
      for (let i = 1; i <= STICKERS_PER_TEAM; i++) {
        if (stickers[`${teamId}_${i}`]) checked++;
      }
      return {
        checked,
        total: STICKERS_PER_TEAM,
        percentage: Math.round((checked / STICKERS_PER_TEAM) * 100),
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
