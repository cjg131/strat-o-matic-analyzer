export interface WantedPlayer {
  id: string;
  playerId: string;
  playerName: string;
  playerType: 'hitter' | 'pitcher';
  season: string;
  team?: string;
  roster?: string;
  salary: number;
  positions?: string;
  fantasyPoints?: number;
  addedDate: string;
  notes?: string;
}
