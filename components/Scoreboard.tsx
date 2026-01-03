
import React from 'react';
import { PlayerSymbol, UserProfile, GameMode } from '../types';
import { PLAYER_COLORS, AI_USER_PROFILE } from '../constants';

interface ScoreboardProps {
  playerX: UserProfile | null;
  playerO: UserProfile | null;
  scoreX: number;
  scoreO: number;
  currentPlayer: PlayerSymbol;
  gameMode: GameMode; // New prop
}

const Scoreboard: React.FC<ScoreboardProps> = ({ playerX, playerO, scoreX, scoreO, currentPlayer, gameMode }) => {
  const activePlayerClass = (player: PlayerSymbol) =>
    currentPlayer === player ? 'border-b-4 border-blue-600' : 'text-gray-500';

  const isAIOpponentInSinglePlayer = gameMode === GameMode.SinglePlayer && playerO?.id === AI_USER_PROFILE.id;

  return (
    <div className="flex justify-around w-full max-w-md p-4 glass-card shadow-lg rounded-xl mb-6">
      <div className={`flex flex-col items-center w-1/2 ${activePlayerClass(PlayerSymbol.X)} pb-2 transition-all duration-300`}>
        <img src={playerX?.avatarUrl || 'https://picsum.photos/50/50?random=x'} alt={playerX?.username || 'Player X'} className="w-12 h-12 rounded-full mb-2 border-2 border-blue-400" />
        <span className="text-xl font-semibold text-gray-800">{playerX?.username || 'Player X'} (X)</span>
        <span className={`${PLAYER_COLORS[PlayerSymbol.X]} text-4xl font-extrabold`}>{scoreX}</span>
      </div>
      <div className={`flex flex-col items-center w-1/2 ${activePlayerClass(PlayerSymbol.O)} pb-2 transition-all duration-300`}>
        {isAIOpponentInSinglePlayer ? (
          <>
            <img src={AI_USER_PROFILE.avatarUrl} alt="AI Opponent" className="w-12 h-12 rounded-full mb-2 border-2 border-gray-400" />
            <span className="text-xl font-semibold text-gray-800">AI Opponent</span> {/* No (O) symbol for AI */}
          </>
        ) : (
          <>
            <img src={playerO?.avatarUrl || 'https://picsum.photos/50/50?random=o'} alt={playerO?.username || 'Player O'} className="w-12 h-12 rounded-full mb-2 border-2 border-red-400" />
            <span className="text-xl font-semibold text-gray-800">{playerO?.username || 'Player O'} (O)</span>
          </>
        )}
        <span className={`${PLAYER_COLORS[PlayerSymbol.O]} text-4xl font-extrabold`}>{scoreO}</span>
      </div>
    </div>
  );
};

export default Scoreboard;
