
import { useState, useEffect, useCallback } from 'react';
import {
  BoardState,
  PlayerSymbol,
  GameStatus,
  GameMode,
  AIDifficulty,
  GameOutcome,
  UserProfile,
} from '../types';
import {
  initializeBoard,
  makeMove,
  getGameOutcome as checkGameOutcome,
  getAIMove,
} from '../services/gameService';
import { AI_DELAY_MS, DEFAULT_USER_PROFILE, AI_USER_PROFILE } from '../constants';
import { webSocketService } from '../services/webSocketService';

interface UseGameProps {
  initialMode?: GameMode;
  initialDifficulty?: AIDifficulty;
  onlineRoomId?: string | null;
  currentUser: UserProfile;
  chosenHumanSymbol?: PlayerSymbol | null; // NEW: Prop for chosen symbol in single player
}

interface GameState {
  board: BoardState;
  currentPlayer: PlayerSymbol;
  gameStatus: GameStatus;
  winner: PlayerSymbol | null;
  winningCells: number[] | null;
  scoreX: number;
  scoreO: number;
  difficulty: AIDifficulty;
  gameMode: GameMode;
  isAITurn: boolean;
  playerXProfile: UserProfile;
  playerOProfile: UserProfile;
  lastMove: { index: number; player: PlayerSymbol } | null;
}

const initialGameState: GameState = {
  board: initializeBoard(),
  currentPlayer: PlayerSymbol.X,
  gameStatus: GameStatus.Idle,
  winner: null,
  winningCells: null,
  scoreX: 0,
  scoreO: 0,
  difficulty: AIDifficulty.Hard,
  gameMode: GameMode.SinglePlayer,
  isAITurn: false,
  playerXProfile: DEFAULT_USER_PROFILE, // Will be updated dynamically
  playerOProfile: AI_USER_PROFILE,     // Will be updated dynamically
  lastMove: null,
};

const useGame = ({
  initialMode = GameMode.SinglePlayer,
  initialDifficulty = AIDifficulty.Hard,
  onlineRoomId = null,
  currentUser,
  chosenHumanSymbol = null, // NEW
}: UseGameProps) => {
  const [gameState, setGameState] = useState<GameState>({
    ...initialGameState,
    gameMode: initialMode,
    difficulty: initialDifficulty,
    // Profiles are initialized in the useEffect below based on chosenHumanSymbol
  });

  const {
    board,
    currentPlayer,
    gameStatus,
    winner,
    winningCells,
    scoreX,
    scoreO,
    difficulty,
    gameMode,
    isAITurn,
    playerXProfile,
    playerOProfile,
    lastMove,
  } = gameState;


  // Determine AI Player and Human Player symbols based on chosenHumanSymbol
  const getPlayerSymbols = useCallback(() => {
    let humanSym: PlayerSymbol;
    let aiSym: PlayerSymbol;

    if (gameMode === GameMode.SinglePlayer && chosenHumanSymbol) {
      humanSym = chosenHumanSymbol;
      aiSym = chosenHumanSymbol === PlayerSymbol.X ? PlayerSymbol.O : PlayerSymbol.X;
    } else {
      // Default for single player if no choice yet, or for multiplayer where X is human 1
      humanSym = PlayerSymbol.X;
      aiSym = PlayerSymbol.O;
    }
    return { humanSym, aiSym };
  }, [gameMode, chosenHumanSymbol]);


  // Function to reset the board and start a new round
  const resetGame = useCallback((keepScore: boolean = false) => {
    const { humanSym, aiSym } = getPlayerSymbols();

    // Assign player profiles based on chosen symbol
    let newPlayerXProfile = currentUser;
    let newPlayerOProfile = AI_USER_PROFILE;
    if (gameMode === GameMode.SinglePlayer) {
      if (humanSym === PlayerSymbol.X) {
        newPlayerXProfile = currentUser;
        newPlayerOProfile = AI_USER_PROFILE;
      } else { // humanSym is PlayerSymbol.O
        newPlayerXProfile = AI_USER_PROFILE;
        newPlayerOProfile = currentUser;
      }
    } else {
      // For multiplayer, X is current user, O is default/other user
      newPlayerXProfile = currentUser;
      newPlayerOProfile = DEFAULT_USER_PROFILE; // In a real app, this would be the other player's profile
    }

    setGameState((prev) => ({
      ...prev,
      board: initializeBoard(),
      currentPlayer: PlayerSymbol.X, // Always start with X
      gameStatus: GameStatus.Playing,
      winner: null,
      winningCells: null,
      // Determine if AI starts based on who is Player X and current game mode
      isAITurn: (gameMode === GameMode.SinglePlayer && PlayerSymbol.X === aiSym),
      scoreX: keepScore ? prev.scoreX : 0,
      scoreO: keepScore ? prev.scoreO : 0,
      lastMove: null,
      playerXProfile: newPlayerXProfile,
      playerOProfile: newPlayerOProfile,
    }));
  }, [gameMode, currentUser, chosenHumanSymbol, getPlayerSymbols]);


  // Function to handle a move being made
  const handleMove = useCallback((index: number, player: PlayerSymbol) => {
    setGameState((prev) => {
      // Determine AI player symbol for current game state
      const currentAIPlayerSymbol = (prev.playerXProfile.id === AI_USER_PROFILE.id) ? PlayerSymbol.X : ((prev.playerOProfile.id === AI_USER_PROFILE.id) ? PlayerSymbol.O : null);

      // Ensure the move is valid and it's the current player's turn
      if (prev.gameStatus !== GameStatus.Playing || prev.board[index] !== null || prev.currentPlayer !== player) {
        return prev;
      }

      const newBoard = makeMove(prev.board, index, player);
      if (!newBoard) {
        return prev;
      }

      const outcome = checkGameOutcome(newBoard);
      let newScoreX = prev.scoreX;
      let newScoreO = prev.scoreO;
      let newGameStatus = GameStatus.Playing;
      let newWinner: PlayerSymbol | null = null;
      let newWinningCells: number[] | null = null;
      let nextPlayer = player === PlayerSymbol.X ? PlayerSymbol.O : PlayerSymbol.X;
      let newIsAITurn = false;

      if (outcome) {
        newGameStatus = outcome.status;
        if (outcome.status === GameStatus.Won) {
          newWinner = outcome.winner!;
          newWinningCells = outcome.winningCells!;
          if (newWinner === PlayerSymbol.X) newScoreX++;
          else newScoreO++;
        }
      } else {
        // Only set AI turn if it's single player and next player is the AI
        if (prev.gameMode === GameMode.SinglePlayer && nextPlayer === currentAIPlayerSymbol) {
          newIsAITurn = true;
        }
      }

      // If online multiplayer, send move to server
      if (prev.gameMode === GameMode.OnlineMultiplayer && onlineRoomId && webSocketService.getIsConnected()) {
        webSocketService.sendMessage('GAME_MOVE', {
          roomId: onlineRoomId,
          board: newBoard,
          player: player,
          moveIndex: index,
        });
        // In online mode, we typically wait for server response to update state completely
        // For this mock, we update locally and assume server will sync.
      }


      return {
        ...prev,
        board: newBoard,
        currentPlayer: nextPlayer,
        gameStatus: newGameStatus,
        winner: newWinner,
        winningCells: newWinningCells,
        scoreX: newScoreX,
        scoreO: newScoreO,
        isAITurn: newIsAITurn,
        lastMove: { index, player },
      };
    });
  }, [gameMode, onlineRoomId]);


  // Initialize game on component mount or mode/difficulty/symbol change
  useEffect(() => {
    const { humanSym, aiSym } = getPlayerSymbols();

    // Assign player profiles based on chosen symbol
    let newPlayerXProfile = currentUser;
    let newPlayerOProfile = AI_USER_PROFILE;
    if (initialMode === GameMode.SinglePlayer) {
      if (humanSym === PlayerSymbol.X) {
        newPlayerXProfile = currentUser;
        newPlayerOProfile = AI_USER_PROFILE;
      } else { // humanSym is PlayerSymbol.O
        newPlayerXProfile = AI_USER_PROFILE;
        newPlayerOProfile = currentUser;
      }
    } else {
      // For multiplayer, X is current user, O is default/other user
      newPlayerXProfile = currentUser;
      newPlayerOProfile = DEFAULT_USER_PROFILE; // In a real app, this would be the other player's profile
    }

    setGameState((prev) => ({
      ...prev,
      gameMode: initialMode,
      difficulty: initialDifficulty,
      playerXProfile: newPlayerXProfile,
      playerOProfile: newPlayerOProfile,
    }));
    // Only reset game if a human symbol has been chosen for single player, or if not single player.
    // This prevents resetting too early when just picking difficulty.
    if (initialMode !== GameMode.SinglePlayer || chosenHumanSymbol) {
      resetGame(false);
    }
  }, [initialMode, initialDifficulty, currentUser, chosenHumanSymbol, getPlayerSymbols, resetGame]);


  // Handle online multiplayer specific logic
  useEffect(() => {
    if (gameMode === GameMode.OnlineMultiplayer && onlineRoomId) {
      const handleOnlineMessage = (message: any) => {
        if (message.type === 'GAME_STATE_UPDATE') {
          const { board: newBoard, currentPlayer: nextPlayer, lastMove: incomingLastMove } = message.payload;
          setGameState((prev) => {
            const outcome = checkGameOutcome(newBoard);
            const newScoreX = outcome?.winner === PlayerSymbol.X ? prev.scoreX + 1 : prev.scoreX;
            const newScoreO = outcome?.winner === PlayerSymbol.O ? prev.scoreO + 1 : prev.scoreO;

            return {
              ...prev,
              board: newBoard,
              currentPlayer: nextPlayer,
              gameStatus: outcome ? outcome.status : GameStatus.Playing,
              winner: outcome?.winner || null,
              winningCells: outcome?.winningCells || null,
              scoreX: newScoreX,
              scoreO: newScoreO,
              isAITurn: false, // Ensure local AI is off
              lastMove: incomingLastMove,
            };
          });
        }
      };
      const unsubscribe = webSocketService.onMessage(handleOnlineMessage);
      console.log(`Joined online room: ${onlineRoomId}. Waiting for game state.`);
      // Optionally send a "ready" message to the server
      webSocketService.sendMessage('PLAYER_READY', { roomId: onlineRoomId, playerId: currentUser.id });

      return () => {
        unsubscribe();
        console.log(`Left online room: ${onlineRoomId}.`);
        // Optionally send a "leave" message to the server
        webSocketService.sendMessage('PLAYER_LEAVE', { roomId: onlineRoomId, playerId: currentUser.id });
      };
    }
  }, [gameMode, onlineRoomId, currentUser]); // eslint-disable-next-line react-hooks/exhaustive-deps


  // AI turn logic for Single Player mode
  useEffect(() => {
    // Ensure it's single player, game is playing, and it's AI's turn (as indicated by the isAITurn flag)
    if (gameMode === GameMode.SinglePlayer && gameStatus === GameStatus.Playing && isAITurn) {
      // Determine the AI's actual symbol based on assigned profiles
      const aiPlayer = (playerXProfile.id === AI_USER_PROFILE.id) ? PlayerSymbol.X : PlayerSymbol.O;

      if (currentPlayer === aiPlayer) { // Double check it's AI's actual turn
        const delay = AI_DELAY_MS[difficulty];
        const timer = setTimeout(() => {
          const aiMoveIndex = getAIMove(board, difficulty, aiPlayer);
          if (aiMoveIndex !== -1) {
            handleMove(aiMoveIndex, aiPlayer);
          }
        }, delay);
        return () => clearTimeout(timer);
      }
    }
  }, [gameMode, gameStatus, isAITurn, currentPlayer, board, difficulty, playerXProfile.id, playerOProfile.id, handleMove]);


  // Effect to check for game outcome after every move
  // This is primarily for local/single-player where outcome is determined immediately
  useEffect(() => {
      // Game outcome is handled directly within handleMove for immediate updates
      // This effect can be kept if there are external triggers or delayed outcome checks
  }, [board, gameStatus]); // eslint-disable-next-line react-hooks/exhaustive-deps


  const handleCellClick = useCallback((index: number) => {
    if (gameStatus === GameStatus.Playing && board[index] === null) {
      // Prevent human move if it's AI's turn in single-player
      if (gameMode === GameMode.SinglePlayer && isAITurn) {
        return;
      }
      // In online multiplayer, only allow current player to make a move.
      // Assuming `currentPlayer` is synced with whose turn it actually is.
      if (gameMode === GameMode.OnlineMultiplayer && currentUser.id !== playerXProfile.id && currentUser.id !== playerOProfile.id) {
          console.warn("Not your turn or not authenticated for this player slot.");
          return;
      }

      // Determine who makes the move based on current turn and game mode
      const playerMakingMove = gameMode === GameMode.SinglePlayer || gameMode === GameMode.LocalMultiplayer
        ? currentPlayer
        : (currentUser.id === playerXProfile.id ? PlayerSymbol.X : PlayerSymbol.O);

      handleMove(index, playerMakingMove);
    }
  }, [board, gameStatus, currentPlayer, gameMode, isAITurn, handleMove, currentUser, playerXProfile, playerOProfile]);

  const setDifficulty = (newDifficulty: AIDifficulty) => {
    setGameState((prev) => ({ ...prev, difficulty: newDifficulty }));
    // Do not reset game here, symbol choice comes next
  };

  const setGameMode = (newMode: GameMode) => {
    setGameState((prev) => {
      // Reset profiles to a clean state for the new mode,
      // especially if coming from single player with chosen symbols.
      let pX = currentUser;
      let pO = DEFAULT_USER_PROFILE; // Default for non-AI opponent in multiplayer

      if (newMode === GameMode.SinglePlayer) {
        // For single player, initial setup of profiles waits for chosenHumanSymbol
        pX = DEFAULT_USER_PROFILE; // Placeholder, will be overwritten by chosenHumanSymbol logic
        pO = AI_USER_PROFILE;
      }
      return {
        ...prev,
        gameMode: newMode,
        playerXProfile: pX,
        playerOProfile: pO,
      };
    });
    // Do not reset game directly here, as setup might not be complete (e.g., online lobby, single player symbol choice)
  };

  return {
    board,
    currentPlayer,
    gameStatus,
    winner,
    winningCells,
    scoreX,
    scoreO,
    difficulty,
    gameMode,
    isAITurn,
    playerXProfile,
    playerOProfile,
    lastMove,
    handleCellClick,
    resetGame,
    setDifficulty,
    setGameMode,
  };
};

export default useGame;
