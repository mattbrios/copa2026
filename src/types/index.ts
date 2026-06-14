export interface Team {
  id: string;
  name: string;
  code: string;
  group: string;
  flag: string;
}

export interface Sticker {
  id: string;
  team_id: string;
  code: string;
  checked: boolean;
  updated_at?: string;
}

export type GameStage =
  | "groups"
  | "round_of_32"
  | "round_of_16"
  | "quarterfinals"
  | "semifinals"
  | "third_place"
  | "final";

export type GameStatus = "scheduled" | "live" | "finished";

export interface Game {
  id: string;
  stage: GameStage;
  group: string | null;
  home_team_id: string;
  away_team_id: string;
  kickoff: string; // ISO DateTime
  home_score: number | null;
  away_score: number | null;
  home_penalty?: number | null; // For knockout ties
  away_penalty?: number | null;
  status: GameStatus;
  stadium?: string;
  winner_id?: string | null;
  next_match_id?: string | null; // For brackets
  placeholder_home?: string | null; // E.g. "1º Grupo A"
  placeholder_away?: string | null; // E.g. "2º Grupo B"
  updated_at?: string;
}

export interface GroupStanding {
  teamId: string;
  teamName: string;
  flag: string;
  code: string;
  points: number;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
}
