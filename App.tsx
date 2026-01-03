
import React, { useState, useEffect } from 'react';
import useGame from './hooks/useGame';
import Board from './components/Board';
import Button from './components/Button';
import Modal from './components/Modal';
import GameModeSelector from './components/GameModeSelector';
import DifficultySelector from './components/DifficultySelector';
import CoinTossSelector from './components/CoinTossSelector';
import Header from './components/Header';
import OnlineLobby from './components/OnlineLobby';
import UserProfile from './components/UserProfile';
import Scoreboard from './components/Scoreboard';
import ChatWindow from './components/ChatWindow';
import {
  GameStatus,
  GameMode,
  AIDifficulty,
  PlayerSymbol,
  UserProfile as UserProfileType, // Renamed to avoid conflict
} from './types';
import { PLAYER_COLORS, DEFAULT_USER_PROFILE, AI_USER_PROFILE } from './constants';
import { webSocketService } from './services/webSocketService';

function App() {
  const [activeGameMode, setActiveGameMode] = useState<GameMode | null>(null);
  const [activeDifficulty, setActiveDifficulty] = useState<AIDifficulty>(AIDifficulty.Hard);
  const [chosenHumanSymbol, setChosenHumanSymbol] = useState<PlayerSymbol | null>(null); // State for human player's symbol
  const [showResultModal, setShowResultModal] = useState(false);
  const [onlineRoomId, setOnlineRoomId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfileType>(DEFAULT_USER_PROFILE); // Mock current user
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isGameSetupComplete, setIsGameSetupComplete] = useState(false);


  // Initialize current user (mock login)
  useEffect(() => {
    webSocketService.login('GuestPlayer').then(user => {
      setCurrentUser(user);
    });
  }, []);

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
    handleCellClick,
    resetGame,
    setDifficulty,
    setGameMode,
  } = useGame({
    initialMode: activeGameMode || undefined,
    initialDifficulty: activeDifficulty,
    onlineRoomId: onlineRoomId,
    currentUser: currentUser,
    chosenHumanSymbol: chosenHumanSymbol, // Pass chosen human symbol to hook
  });


  useEffect(() => {
    if (gameStatus === GameStatus.Won || gameStatus === GameStatus.Draw) {
      setShowResultModal(true);
    } else if (gameStatus === GameStatus.Playing) {
        setShowResultModal(false);
    }
  }, [gameStatus]);

  const handleModeSelection = (mode: GameMode) => {
    setActiveGameMode(mode);
    setGameMode(mode); // Update useGame hook's mode
    setChosenHumanSymbol(null); // Reset symbol choice on mode change
    if (mode === GameMode.OnlineMultiplayer) {
      setIsGameSetupComplete(false); // Online mode requires lobby UI first
    } else if (mode === GameMode.LocalMultiplayer) {
        setIsGameSetupComplete(true); // Local multiplayer starts immediately
        resetGame(false);
    } else if (mode === GameMode.SinglePlayer) {
        setIsGameSetupComplete(false); // Single player needs symbol & difficulty selection first
    }
  };

  const handleDifficultySelection = (newDifficulty: AIDifficulty) => {
    setActiveDifficulty(newDifficulty);
    setDifficulty(newDifficulty);
    setIsGameSetupComplete(true); // Now setup is truly complete
    resetGame(false); // Start the game with selected difficulty and symbol
  };

  const handleSymbolSelection = (symbol: PlayerSymbol) => {
    setChosenHumanSymbol(symbol);
    // Do NOT set isGameSetupComplete to true here, difficulty selection is next
    // Do NOT call resetGame here, it will be called after difficulty selection
  };

  const handleBackToModes = () => {
    setActiveGameMode(null);
    setActiveDifficulty(AIDifficulty.Hard); // Reset difficulty to default
    setChosenHumanSymbol(null); // Reset symbol choice
    setIsGameSetupComplete(false);
    setOnlineRoomId(null);
  };

  // NEW: Handler to go back from Difficulty to Symbol selection
  const handleBackToSymbolSelection = () => {
    setActiveDifficulty(AIDifficulty.Hard); // Reset difficulty when going back
    setChosenHumanSymbol(null); // Crucial: Reset chosen symbol to show CoinTossSelector again
    setIsGameSetupComplete(false); // Ensure difficulty selector is shown again
  };

  const handleReplay = () => {
    setShowResultModal(false);
    resetGame(true); // Keep scores
  };

  const handleExitGame = () => {
    setShowResultModal(false);
    handleBackToModes();
  };

  const handleStartOnlineGame = (roomId: string) => {
    setOnlineRoomId(roomId);
    setActiveGameMode(GameMode.OnlineMultiplayer);
    setGameMode(GameMode.OnlineMultiplayer);
    setIsGameSetupComplete(true);
    resetGame(false); // Start a new game with online context
    console.log(`Starting online game in room: ${roomId}`);
    // Simulate setting player profiles for online game
    if (currentUser.id === DEFAULT_USER_PROFILE.id) {
        // If current user is P1, other user becomes P2, else vice-versa.
        // This is simplified and in a real app would come from server matchmaking.
        // For now, hardcode P2 as AI_USER_PROFILE for demo.
        // In a real online game, playerOProfile would be the other human player.
        setGameMode(GameMode.OnlineMultiplayer); // Forces hook to re-evaluate player profiles.
    }
  };

  const handleUpdateCurrentUserProfile = (updatedUser: UserProfileType) => {
    setCurrentUser(updatedUser);
    // Optionally, if playerXProfile or playerOProfile uses currentUser, you might need to
    // re-trigger useGame's profile setting or pass updatedUser directly.
    // For now, a simple setCurrentUser should suffice as playerXProfile is init with currentUser.
  };

  const getPlayerName = (symbol: PlayerSymbol): string => {
    if (symbol === PlayerSymbol.X) return playerXProfile.username;
    if (symbol === PlayerSymbol.O) return playerOProfile.username;
    return 'Unknown Player';
  };

  // Animation for main content based on game status
  const mainContentAnimationClass =
    activeGameMode && isGameSetupComplete ? 'animate-fade-in-up' : 'opacity-0';

  // Determine the win message for the modal
  let displayWinMessage: string;
  // If single player AND AI wins
  if (activeGameMode === GameMode.SinglePlayer && winner !== null && (
        (chosenHumanSymbol === PlayerSymbol.X && winner === PlayerSymbol.O) ||
        (chosenHumanSymbol === PlayerSymbol.O && winner === PlayerSymbol.X)
    )) {
    displayWinMessage = "Opponent Wins!";
  } else {
    displayWinMessage = getPlayerName(winner!) + ' Wins!';
  }


  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-100 to-indigo-200">
      <Header
        title="X/O Master"
        onProfileClick={() => setShowProfileModal(true)}
        userProfile={currentUser}
      />

      <main className="flex flex-col items-center justify-center flex-grow w-full max-w-5xl pt-24 pb-8">
        {!activeGameMode && (
          <GameModeSelector onSelectMode={handleModeSelection} />
        )}

        {/* NEW ORDER: Coin Toss Selector for Single Player first */}
        {activeGameMode === GameMode.SinglePlayer && !chosenHumanSymbol && !isGameSetupComplete && (
          <CoinTossSelector
            onSelectSymbol={handleSymbolSelection}
            onBack={handleBackToModes} // Back to modes from here
          />
        )}

        {/* Difficulty Selector comes after symbol selection */}
        {activeGameMode === GameMode.SinglePlayer && chosenHumanSymbol && !isGameSetupComplete && (
          <DifficultySelector
            onSelectDifficulty={handleDifficultySelection}
            onBack={handleBackToSymbolSelection} // Back to symbol selection from here
            currentDifficulty={activeDifficulty}
          />
        )}

        {activeGameMode === GameMode.OnlineMultiplayer && !isGameSetupComplete && (
          <OnlineLobby
            onBackToModes={handleBackToModes}
            onStartOnlineGame={handleStartOnlineGame}
            currentUser={currentUser}
          />
        )}

        {activeGameMode && isGameSetupComplete && (
          <div className={`flex flex-col items-center space-y-6 w-full ${mainContentAnimationClass}`}>
            <Scoreboard
              playerX={playerXProfile}
              playerO={playerOProfile}
              scoreX={scoreX}
              scoreO={scoreO}
              currentPlayer={currentPlayer}
              gameMode={gameMode}
            />

            <p className={`text-xl font-semibold mb-4 animate-fade-in ${isAITurn ? 'text-gray-600' : 'text-gray-800'}`}>
              Current Turn:
              <span className={`ml-2 ${PLAYER_COLORS[currentPlayer]} ${isAITurn ? 'animate-pulse' : ''}`}>
                 {isAITurn ? 'AI' : getPlayerName(currentPlayer)} ({currentPlayer})
              </span>
            </p>

            <Board
              board={board}
              onCellClick={handleCellClick}
              winningCells={winningCells}
              disabled={gameStatus !== GameStatus.Playing || isAITurn} // Disable board if game is over or AI's turn
            />

            <div className="flex space-x-4 mt-6">
              <Button onClick={handleReplay} variant="primary" size="lg">
                Replay
              </Button>
              <Button onClick={handleExitGame} variant="secondary" size="lg">
                Change Mode
              </Button>
            </div>

            {gameMode === GameMode.OnlineMultiplayer && (
              <div className="w-full max-w-sm mt-8">
                <ChatWindow currentUser={currentUser} roomId={onlineRoomId || 'mock-room'} />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Game Result Modal */}
      <Modal isOpen={showResultModal} onClose={() => setShowResultModal(false)} title="Game Over!">
        {gameStatus === GameStatus.Won && (
          <div className="flex flex-col items-center">
            <p className={`text-5xl font-extrabold mb-4 animate-bounce ${PLAYER_COLORS[winner!]}`}>
              {displayWinMessage}
            </p>
            <img
              src={`https://picsum.photos/200/200?random=${winner}`}
              alt="Winner"
              className="rounded-full shadow-md mb-6 animate-fade-in"
            />
          </div>
        )}
        {gameStatus === GameStatus.Draw && (
          <div className="flex flex-col items-center">
            <p className="text-5xl font-extrabold text-gray-700 mb-4 animate-shake">
              It's a Draw!
            </p>
            <img
              src="https://picsum.photos/200/200?random=draw"
              alt="Draw"
              className="rounded-full shadow-md mb-6 animate-fade-in"
            />
          </div>
        )}
        <div className="flex space-x-4">
          <Button onClick={handleReplay} variant="primary" size="lg">
            Play Again
          </Button>
          <Button onClick={handleExitGame} variant="secondary" size="lg">
            Back to Modes
          </Button>
        </div>
      </Modal>

      {/* User Profile Modal */}
      <Modal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} title="My Profile">
        <UserProfile user={currentUser} onClose={() => setShowProfileModal(false)} isEditable={true} onUpdateProfile={handleUpdateCurrentUserProfile} />
      </Modal>
    </div>
  );
}

export default App;