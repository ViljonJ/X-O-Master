
import React from 'react';
import Button from './Button';
import { AIDifficulty } from '../types';

interface DifficultySelectorProps {
  onSelectDifficulty: (difficulty: AIDifficulty) => void;
  onBack: () => void;
  currentDifficulty: AIDifficulty;
}

const DifficultySelector: React.FC<DifficultySelectorProps> = ({ onSelectDifficulty, onBack, currentDifficulty }) => {
  const getDisplayName = (difficulty: AIDifficulty) => {
    if (difficulty === AIDifficulty.Medium) {
      return 'Normal';
    }
    return difficulty;
  };

  return (
    <div className="flex flex-col space-y-4 w-full max-w-xs md:max-w-sm p-6 glass-card animate-fade-in">
      <h2 className="text-3xl font-bold text-gray-800 mb-4 text-center">Select AI Difficulty</h2>
      {Object.values(AIDifficulty).map((difficulty) => (
        <Button
          key={difficulty}
          onClick={() => onSelectDifficulty(difficulty)}
          fullWidth
          size="lg"
          variant={currentDifficulty === difficulty ? 'primary' : 'secondary'}
        >
          {getDisplayName(difficulty)}
        </Button>
      ))}
      <div className="pt-4">
        <Button onClick={onBack} fullWidth variant="ghost" size="md">
          Back to Symbol Selection
        </Button>
      </div>
    </div>
  );
};

export default DifficultySelector;
