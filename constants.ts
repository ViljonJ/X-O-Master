
import { PlayerSymbol, AIDifficulty, UserProfile } from './types';

export const WINNING_COMBINATIONS: number[][] = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
  [0, 4, 8], [2, 4, 6],           // Diagonals
];

export const PLAYER_COLORS: Record<PlayerSymbol, string> = {
  [PlayerSymbol.X]: 'text-blue-600',
  [PlayerSymbol.O]: 'text-red-600',
};

export const AI_DELAY_MS: Record<AIDifficulty, number> = {
  [AIDifficulty.Easy]: 800,
  [AIDifficulty.Medium]: 600,
  [AIDifficulty.Hard]: 400,
};

export const DEFAULT_USER_PROFILE: UserProfile = {
  id: 'user-123',
  username: 'Player1',
  avatarUrl: 'https://picsum.photos/50/50',
  onlineStatus: 'online',
  stats: {
    wins: 0,
    losses: 0,
    draws: 0,
  },
  elo: 1200,
};

export const AI_USER_PROFILE: UserProfile = {
  id: 'ai-bot',
  username: 'AI Opponent',
  avatarUrl: 'https://picsum.photos/id/237/50/50', // Dog image
  onlineStatus: 'online',
  stats: {
    wins: 0,
    losses: 0,
    draws: 0,
  },
  elo: 1500,
};

export const BOARD_SIZE = 9;
