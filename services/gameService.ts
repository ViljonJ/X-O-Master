
import { BoardState, PlayerSymbol, GameOutcome, GameStatus, AIDifficulty, Move } from '../types';
import { WINNING_COMBINATIONS, BOARD_SIZE } from '../constants';
import { checkWin, checkDraw, findBestMove, getAvailableMoves } from '../utils/minimax';

/**
 * Initializes a new empty Tic-Tac-Toe board.
 * @returns An array of nulls representing an empty board.
 */
export function initializeBoard(): BoardState {
  return Array<null>(BOARD_SIZE).fill(null);
}

/**
 * Attempts to make a move on the board.
 * @param board The current board state.
 * @param index The index on the board to make the move.
 * @param player The player making the move.
 * @returns A new board state if the move is valid, otherwise null.
 */
export function makeMove(board: BoardState, index: number, player: PlayerSymbol): BoardState | null {
  if (index < 0 || index >= BOARD_SIZE || board[index] !== null) {
    return null; // Invalid move
  }
  const newBoard = [...board];
  newBoard[index] = player;
  return newBoard;
}

/**
 * Determines the current outcome of the game (win, draw, or ongoing).
 * @param board The current board state.
 * @returns A GameOutcome object if the game is over, otherwise null.
 */
export function getGameOutcome(board: BoardState): GameOutcome | null {
  // Check for 'X' win
  for (const combination of WINNING_COMBINATIONS) {
    if (combination.every(index => board[index] === PlayerSymbol.X)) {
      return { status: GameStatus.Won, winner: PlayerSymbol.X, winningCells: combination };
    }
  }

  // Check for 'O' win
  for (const combination of WINNING_COMBINATIONS) {
    if (combination.every(index => board[index] === PlayerSymbol.O)) {
      return { status: GameStatus.Won, winner: PlayerSymbol.O, winningCells: combination };
    }
  }

  // Check for draw
  if (board.every(cell => cell !== null)) {
    return { status: GameStatus.Draw };
  }

  return null; // Game is still ongoing
}

/**
 * Generates an AI's move based on the specified difficulty.
 * @param board The current board state.
 * @param difficulty The AI difficulty level.
 * @param aiPlayer The AI's symbol.
 * @returns The index where the AI makes its move.
 */
export function getAIMove(board: BoardState, difficulty: AIDifficulty, aiPlayer: PlayerSymbol): number {
  const humanPlayer = aiPlayer === PlayerSymbol.X ? PlayerSymbol.O : PlayerSymbol.X;

  switch (difficulty) {
    case AIDifficulty.Easy:
      // Easy: Random move
      const availableMovesEasy = getAvailableMoves(board);
      return availableMovesEasy[Math.floor(Math.random() * availableMovesEasy.length)];
    case AIDifficulty.Medium:
    case AIDifficulty.Hard:
      // Medium/Hard: Minimax algorithm
      return findBestMove(board, aiPlayer, humanPlayer, difficulty);
    default:
      // Fallback to easy if difficulty is not recognized
      const availableMovesDefault = getAvailableMoves(board);
      return availableMovesDefault[Math.floor(Math.random() * availableMovesDefault.length)];
  }
}
