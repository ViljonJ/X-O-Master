
import React from 'react';
import Button from './Button';
import { GameMode } from '../types';

interface GameModeSelectorProps {
  onSelectMode: (mode: GameMode) => void;
}

const GameModeSelector: React.FC<GameModeSelectorProps> = ({ onSelectMode }) => {
  return (
    <div className="flex flex-col space-y-4 w-full max-w-xs md:max-w-sm p-6 glass-card animate-fade-in">
      <h2 className="text-3xl font-bold text-gray-800 mb-4 text-center">Select Game Mode</h2>
      <Button onClick={() => onSelectMode(GameMode.SinglePlayer)} fullWidth size="lg">
        Single Player
      </Button>
      <Button onClick={() => onSelectMode(GameMode.LocalMultiplayer)} fullWidth size="lg">
        Local Multiplayer
      </Button>
      <Button onClick={() => onSelectMode(GameMode.OnlineMultiplayer)} fullWidth size="lg">
        Online Multiplayer (preview)
      </Button>
    </div>
  );
};

export default GameModeSelector;