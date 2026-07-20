import { MOCK_TEAMS, getStickerCount } from "@/lib/mockData";

export function buildMissingStickersMessage(stickers: Record<string, boolean>): string {
  const lines = ["🏆 Copa 2026"];
  const teamBlocks: string[] = [];
  let totalMissing = 0;

  MOCK_TEAMS.forEach((team) => {
    const missing: number[] = [];
    for (let i = 1; i <= getStickerCount(team); i++) {
      if (!stickers[`${team.id}_${i}`]) missing.push(i);
    }
    if (missing.length > 0) {
      totalMissing += missing.length;
      teamBlocks.push(
        `${team.flag} ${team.code}\n${missing.map((n) => `${team.code}${n}`).join(", ")}`
      );
    }
  });

  lines.push(`❌ FIGURINHAS FALTANDO (${totalMissing})`);
  lines.push("─────────────");
  lines.push(teamBlocks.join("\n\n"));

  return lines.join("\n");
}
