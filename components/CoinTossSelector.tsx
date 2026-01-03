
import React, { useState } from 'react';
import Button from './Button';
import { PlayerSymbol } from '../types';
import { PLAYER_COLORS } from '../constants';

interface CoinTossSelectorProps {
  onSelectSymbol: (symbol: PlayerSymbol) => void;
  onBack: () => void;
}

const CoinTossSelector: React.FC<CoinTossSelectorProps> = ({ onSelectSymbol, onBack }) => {
  const [isTossing, setIsTossing] = useState(false);
  const [tossResult, setTossResult] = useState<PlayerSymbol | null>(null);
  const [finalChosenSymbol, setFinalChosenSymbol] = useState<PlayerSymbol | null>(null); // NEW: To track the chosen symbol permanently

  const handleCoinToss = () => {
    if (isTossing || finalChosenSymbol) return; // Prevent multiple tosses or tossing after selection
    setIsTossing(true);
    setTossResult(null); // Clear previous result
    setFinalChosenSymbol(null); // Clear final choice during toss

    setTimeout(() => {
      const result = Math.random() > 0.5 ? PlayerSymbol.X : PlayerSymbol.O;
      setTossResult(result); // Show the intermediate toss result
      setIsTossing(false);

      // Short delay for result animation to be appreciated, then set final choice and trigger parent callback
      setTimeout(() => {
        setFinalChosenSymbol(result); // Set the final chosen symbol
        onSelectSymbol(result); // Trigger parent to proceed
      }, 700); // Animation reveal delay
    }, 1500); // Duration of the tossing animation
  };

  const handleManualSelect = (symbol: PlayerSymbol) => {
    if (isTossing) return;
    setFinalChosenSymbol(symbol); // Set the final chosen symbol
    setTossResult(symbol); // Also show it in the coin display instantly
    onSelectSymbol(symbol); // Trigger parent to proceed
  };

  const currentCoinContent = () => {
    if (isTossing) {
      return '?';
    }
    if (tossResult) {
      return tossResult;
    }
    return 'Ready to Toss?'; // Initial state text
  };

  const getCoinBgClass = () => {
    if (isTossing) {
      return 'bg-gradient-to-br from-gray-300 to-gray-500 text-gray-800'; // Metallic look for tossing
    }
    if (tossResult) {
      return tossResult === PlayerSymbol.X ? 'bg-blue-100' : 'bg-red-100';
    }
    return 'bg-gray-200 text-gray-500'; // Default idle background
  };

  return (
    <div className="flex flex-col space-y-4 w-full max-w-xs md:max-w-sm p-6 glass-card animate-fade-in">
      <h2 className="text-3xl font-bold text-gray-800 mb-4 text-center">Choose Your Symbol</h2>

      <p className="text-center text-gray-600 text-sm -mt-2 mb-4">Make your choice or let fate decide!</p>

      <div className="flex flex-col justify-center items-center h-28 mb-4">
        <div
          className={`
            w-24 h-24 rounded-full flex items-center justify-center text-5xl font-extrabold
            shadow-lg transition-all duration-300 ease-out
            ${getCoinBgClass()}
            ${isTossing ? 'animate-coin-flip' : ''}
            ${tossResult && !isTossing ? 'animate-pop-in' : ''}
          `}
        >
          <span className={`${tossResult ? PLAYER_COLORS[tossResult] : 'text-gray-800'}`}>
            {currentCoinContent()}
          </span>
        </div>
        {tossResult && !isTossing && (
          <p className={`mt-3 text-lg font-semibold ${PLAYER_COLORS[tossResult]} animate-fade-in`}>
            You play as {tossResult}!
          </p>
        )}
      </div>

      <Button onClick={handleCoinToss} fullWidth size="lg" variant="primary" disabled={isTossing || !!finalChosenSymbol}>
        {isTossing ? 'Tossing...' : 'Toss Coin for Me'}
      </Button>

      <div className="flex items-center my-2">
        <div className="flex-grow border-t border-gray-300"></div>
        <span className="mx-4 text-gray-500 text-sm">OR</span>
        <div className="flex-grow border-t border-gray-300"></div>
      </div>

      <Button
        onClick={() => handleManualSelect(PlayerSymbol.X)}
        fullWidth
        size="lg"
        variant={finalChosenSymbol === PlayerSymbol.X ? 'primary' : 'secondary'}
        disabled={isTossing || !!finalChosenSymbol}
      >
        Play as X
      </Button>
      <Button
        onClick={() => handleManualSelect(PlayerSymbol.O)}
        fullWidth
        size="lg"
        variant={finalChosenSymbol === PlayerSymbol.O ? 'primary' : 'secondary'}
        disabled={isTossing || !!finalChosenSymbol}
      >
        Play as O
      </Button>
      <div className="pt-4">
        <Button onClick={onBack} fullWidth variant="ghost" size="md" disabled={isTossing}>
          Back to Modes
        </Button>
      </div>
    </div>
  );
};

export default CoinTossSelector;
