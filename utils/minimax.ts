
import { BoardState, PlayerSymbol, GameStatus, AIDifficulty } from '../types';
import { WINNING_COMBINATIONS } from '../constants';

/**
 * Checks if a given player has won the game.
 * @param board The current state of the board.
 * @param player The player to check for a win.
 * @returns True if the player has won, false otherwise.
 */
export function checkWin(board: BoardState, player: PlayerSymbol): boolean {
  return WINNING_COMBINATIONS.some(combination =>
    combination.every(index => board[index] === player)
  );
}

/**
 * Checks if the game is a draw.
 * @param board The current state of the board.
 * @returns True if the game is a draw, false otherwise.
 */
export function checkDraw(board: BoardState): boolean {
  return !checkWin(board, PlayerSymbol.X) && !checkWin(board, PlayerSymbol.O) && board.every(cell => cell !== null);
}

/**
 * Determines the outcome of the game.
 * @param board The current state of the board.
 * @param maximizingPlayer The AI's symbol.
 * @param minimizingPlayer The human's symbol.
 * @returns 10 if AI wins, -10 if human wins, 0 for a draw, or null if the game is still playing.
 */
function evaluate(board: BoardState, maximizingPlayer: PlayerSymbol, minimizingPlayer: PlayerSymbol): number | null {
  if (checkWin(board, maximizingPlayer)) {
    return 10;
  }
  if (checkWin(board, minimizingPlayer)) {
    return -10;
  }
  if (checkDraw(board)) {
    return 0;
  }
  return null; // Game is not over
}

/**
 * Gets all available empty cells on the board.
 * @param board The current state of the board.
 * @returns An array of indices representing empty cells.
 */
export function getAvailableMoves(board: BoardState): number[] {
  return board.map((cell, index) => cell === null ? index : null).filter(index => index !== null) as number[];
}

/**
 * Implements the Minimax algorithm with Alpha-Beta Pruning to find the best move.
 * @param board The current state of the board.
 * @param currentPlayer The player whose turn it is.
 * @param aiPlayer The AI's symbol.
 * @param humanPlayer The human's symbol.
 * @param depth The current depth in the search tree.
 * @param isMaximizingPlayer True if the current player is the maximizing player (AI).
 * @param alpha The alpha value for alpha-beta pruning.
 * @param beta The beta value for alpha-beta pruning.
 * @param maxDepth The maximum depth to search for the Medium difficulty.
 * @returns The best score for the current player.
 */
export function minimax(
  board: BoardState,
  currentPlayer: PlayerSymbol,
  aiPlayer: PlayerSymbol,
  humanPlayer: PlayerSymbol,
  depth: number,
  isMaximizingPlayer: boolean,
  alpha: number,
  beta: number,
  maxDepth: number | undefined
): number {
  const score = evaluate(board, aiPlayer, humanPlayer);

  // If game is over or max depth reached, return the score
  if (score !== null) {
    return score - depth; // Prioritize quicker wins
  }

  if (maxDepth !== undefined && depth >= maxDepth) {
      // If max depth is reached, estimate the current state (e.g., return 0 for neutral)
      return 0;
  }

  const availableMoves = getAvailableMoves(board);

  if (isMaximizingPlayer) {
    let best = -Infinity;
    for (const move of availableMoves) {
      const newBoard = [...board];
      newBoard[move] = aiPlayer;
      best = Math.max(best, minimax(newBoard, humanPlayer, aiPlayer, humanPlayer, depth + 1, false, alpha, beta, maxDepth));
      alpha = Math.max(alpha, best);
      if (beta <= alpha) {
        break; // Alpha-beta pruning
      }
    }
    return best;
  } else {
    let best = Infinity;
    for (const move of availableMoves) {
      const newBoard = [...board];
      newBoard[move] = humanPlayer;
      best = Math.min(best, minimax(newBoard, humanPlayer, aiPlayer, humanPlayer, depth + 1, true, alpha, beta, maxDepth));
      beta = Math.min(beta, best);
      if (beta <= alpha) {
        break; // Alpha-beta pruning
      }
    }
    return best;
  }
}

/**
 * Finds the best move for the AI player using the Minimax algorithm.
 * @param board The current state of the board.
 * @param aiPlayer The AI's symbol.
 * @param difficulty The AI difficulty level.
 * @param humanPlayer The human's symbol.
 * @returns The index of the best move.
 */
export function findBestMove(
  board: BoardState,
  aiPlayer: PlayerSymbol,
  humanPlayer: PlayerSymbol,
  difficulty: AIDifficulty
): number {
  let bestVal = -Infinity;
  let bestMove = -1;
  const availableMoves = getAvailableMoves(board);

  if (difficulty === AIDifficulty.Easy) {
    // Easy: Random move
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
  }

  const maxDepth = difficulty === AIDifficulty.Medium ? 3 : undefined; // Limit depth for Medium

  for (const move of availableMoves) {
    const newBoard = [...board];
    newBoard[move] = aiPlayer;
    const moveVal = minimax(newBoard, humanPlayer, aiPlayer, humanPlayer, 0, false, -Infinity, Infinity, maxDepth);

    if (moveVal > bestVal) {
      bestVal = moveVal;
      bestMove = move;
    }
  }

  return bestMove;
}
