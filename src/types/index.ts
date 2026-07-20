export interface Team {
  id: string;
  name: string;
  code: string;
  group: string;
  flag: string;
  stickerCount?: number; // Overrides the default sticker count for this team/set
}

export interface Sticker {
  id: string;
  team_id: string;
  code: string;
  checked: boolean;
  updated_at?: string;
}
