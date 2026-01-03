
import React from 'react';
import { PlayerSymbol } from '../types';
import { PLAYER_COLORS } from '../constants';

interface CellProps {
  value: PlayerSymbol | null;
  onClick: () => void;
  isWinningCell: boolean;
  disabled: boolean;
}

const Cell: React.FC<CellProps> = ({ value, onClick, isWinningCell, disabled }) => {
  const symbolClass = value ? PLAYER_COLORS[value] : 'text-gray-400';
  const winningClass = isWinningCell ? 'bg-green-200 transform scale-110' : 'hover:bg-gray-100';
  const disabledClass = disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer';

  return (
    <button
      className={`
        w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36
        flex items-center justify-center text-6xl font-extrabold
        rounded-lg transition-all duration-300 ease-in-out
        border border-black /* Added black border for individual cells */
        ${winningClass} ${disabledClass}
      `}
      onClick={onClick}
      disabled={disabled}
      aria-label={value ? `Cell with ${value}` : 'Empty cell'}
    >
      <span
        className={`
          ${symbolClass}
          ${value ? 'animate-pop-in' : ''}
          ${isWinningCell ? 'animate-pulse' : ''}
        `}
      >
        {value}
      </span>
    </button>
  );
};

export default Cell;
