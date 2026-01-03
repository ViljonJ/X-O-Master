
export enum PlayerSymbol {
  X = 'X',
  O = 'O',
}

export type BoardState = (PlayerSymbol | null)[];

export enum GameStatus {
  Playing = 'PLAYING',
  Won = 'WON',
  Draw = 'DRAW',
  Idle = 'IDLE',
}

export enum GameMode {
  SinglePlayer = 'SINGLE_PLAYER',
  LocalMultiplayer = 'LOCAL_MULTIPLAYER',
  OnlineMultiplayer = 'ONLINE_MULTIPLAYER',
}

export enum AIDifficulty {
  Easy = 'EASY',
  Medium = 'MEDIUM',
  Hard = 'HARD',
}

export interface PlayerStats {
  wins: number;
  losses: number;
  draws: number;
}

export interface UserProfile {
  id: string;
  username: string;
  avatarUrl: string;
  onlineStatus: 'online' | 'offline' | 'away';
  stats: PlayerStats;
  elo: number;
}

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
}

export enum ReactionType {
  ThumbsUp = '👍',
  Heart = '❤️',
  Laugh = '😂',
  Angry = '😠',
}

export interface GameOutcome {
  status: GameStatus.Won | GameStatus.Draw;
  winner?: PlayerSymbol;
  winningCells?: number[];
}

export interface Move {
  index: number;
  player: PlayerSymbol;
}
