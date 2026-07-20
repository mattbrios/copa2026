import { MOCK_TEAMS, getStickerCount } from "@/lib/mockData";

function buildStickerReportMessage(
  stickers: Record<string, boolean>,
  emoji: string,
  label: string,
  include: (isChecked: boolean) => boolean
): string {
  const lines = ["🏆 Copa 2026"];
  const teamBlocks: string[] = [];
  let total = 0;

  MOCK_TEAMS.forEach((team) => {
    const matches: number[] = [];
    for (let i = 1; i <= getStickerCount(team); i++) {
      if (include(!!stickers[`${team.id}_${i}`])) matches.push(i);
    }
    if (matches.length > 0) {
      total += matches.length;
      teamBlocks.push(
        `${team.flag} ${team.code}\n${matches.map((n) => `${team.code}${n}`).join(", ")}`
      );
    }
  });

  lines.push(`${emoji} ${label} (${total})`);
  lines.push("─────────────");
  lines.push(teamBlocks.join("\n\n"));

  return lines.join("\n");
}

export function buildMissingStickersMessage(stickers: Record<string, boolean>): string {
  return buildStickerReportMessage(stickers, "❌", "FIGURINHAS FALTANDO", (isChecked) => !isChecked);
}

export function buildRepeatedStickersMessage(stickers: Record<string, boolean>): string {
  return buildStickerReportMessage(stickers, "🔁", "FIGURINHAS REPETIDAS", (isChecked) => isChecked);
}
