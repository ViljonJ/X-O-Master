
import React from 'react';
import { BoardState, PlayerSymbol } from '../types';
import Cell from './Cell';

interface BoardProps {
  board: BoardState;
  onCellClick: (index: number) => void;
  winningCells: number[] | null;
  disabled: boolean;
}

const Board: React.FC<BoardProps> = ({ board, onCellClick, winningCells, disabled }) => {
  return (
    <div className="grid grid-cols-3 gap-2 p-4 bg-white bg-opacity-50 backdrop-blur-md rounded-xl shadow-xl border-2 border-black">
      {board.map((cellValue, index) => (
        <Cell
          key={index}
          value={cellValue}
          onClick={() => onCellClick(index)}
          isWinningCell={winningCells ? winningCells.includes(index) : false}
          disabled={disabled || cellValue !== null}
        />
      ))}
    </div>
  );
};

export default Board;
