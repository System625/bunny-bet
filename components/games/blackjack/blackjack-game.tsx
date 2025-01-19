"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card as CardType, GameState, BlackjackProps, ChipValue } from './types';
import { createDeck, dealCards, createHand, shouldDealerHit } from './game-logic';
import { toast } from 'sonner';

const CHIP_VALUES: ChipValue[] = [1, 5, 25, 50, 100, 500];

export const BlackjackGame = ({ onWin, onLose, balance, minBet = 1, maxBet = 100 }: BlackjackProps) => {
  const [gameState, setGameState] = useState<GameState>({
    deck: [],
    playerHand: { cards: [], value: 0, isBusted: false, isBlackjack: false },
    dealerHand: { cards: [], value: 0, isBusted: false, isBlackjack: false },
    currentBet: 0,
    selectedChip: 1,
    bank: balance,
    gamePhase: 'betting',
    gameResult: null,
    message: 'Place your bet to start the game',
    canDouble: false,
  });

  useEffect(() => {
    initializeGame();
  }, []);

  useEffect(() => {
    setGameState(prev => ({ ...prev, bank: balance }));
  }, [balance]);

  const initializeGame = () => {
    const newDeck = createDeck();
    setGameState(prev => ({
      ...prev,
      deck: newDeck,
      playerHand: { cards: [], value: 0, isBusted: false, isBlackjack: false },
      dealerHand: { cards: [], value: 0, isBusted: false, isBlackjack: false },
      currentBet: 0,
      gamePhase: 'betting',
      gameResult: null,
      message: 'Place your bet to start the game',
      canDouble: false,
    }));
  };

  const addBet = (amount: number) => {
    if (gameState.bank < amount) {
      toast.error("Insufficient balance");
      return;
    }
    if (gameState.currentBet + amount > maxBet) {
      toast.error(`Maximum bet is ${maxBet}`);
      return;
    }
    setGameState(prev => ({
      ...prev,
      currentBet: prev.currentBet + amount,
      bank: prev.bank - amount
    }));
  };

  const clearBet = () => {
    setGameState(prev => ({
      ...prev,
      currentBet: 0,
      bank: prev.bank + prev.currentBet
    }));
  };

  const startNewHand = () => {
    if (gameState.currentBet < minBet) {
      toast.error(`Minimum bet is ${minBet}`);
      return;
    }

    const [playerCards, deck1] = dealCards(gameState.deck, 2, true);
    const [dealerCards, remainingDeck] = dealCards(deck1, 2);
    dealerCards[1].faceUp = false;

    const playerHand = createHand(playerCards);
    const dealerHand = createHand([dealerCards[0]]);

    setGameState(prev => ({
      ...prev,
      deck: remainingDeck,
      playerHand,
      dealerHand: { ...dealerHand, cards: dealerCards },
      gamePhase: 'playerTurn',
      message: 'Your turn: Hit or Stand?',
      canDouble: prev.bank >= prev.currentBet,
    }));
  };

  const double = () => {
    if (!gameState.canDouble) return;

    const [newCards, remainingDeck] = dealCards(gameState.deck, 1);
    const updatedHand = createHand([...gameState.playerHand.cards, ...newCards]);
    
    setGameState(prev => ({
      ...prev,
      currentBet: prev.currentBet * 2,
      bank: prev.bank - prev.currentBet,
      deck: remainingDeck,
      playerHand: updatedHand,
    }));

    if (updatedHand.isBusted) {
      onLose?.(gameState.currentBet * 2);
      setGameState(prev => ({
        ...prev,
        gamePhase: 'gameOver',
        gameResult: 'dealerWin',
        message: 'Bust! Dealer wins!',
      }));
    } else {
      void stand();
    }
  };

  const hit = () => {
    const [newCards, remainingDeck] = dealCards(gameState.deck, 1);
    const updatedHand = createHand([...gameState.playerHand.cards, ...newCards]);

    if (updatedHand.isBusted) {
      onLose?.(gameState.currentBet);
      setGameState(prev => ({
        ...prev,
        deck: remainingDeck,
        playerHand: updatedHand,
        gamePhase: 'gameOver',
        gameResult: 'dealerWin',
        message: 'Bust! Dealer wins!',
      }));
    } else {
      setGameState(prev => ({
        ...prev,
        deck: remainingDeck,
        playerHand: updatedHand,
        canDouble: false,
        message: 'Hit or Stand?',
      }));
    }
  };

  const stand = async () => {
    let currentDealerHand = { ...gameState.dealerHand };
    currentDealerHand.cards[1].faceUp = true;
    currentDealerHand = createHand(currentDealerHand.cards);
    let currentDeck = [...gameState.deck];

    setGameState(prev => ({
      ...prev,
      dealerHand: currentDealerHand,
      gamePhase: 'dealerTurn',
      message: 'Dealer\'s turn',
    }));

    while (shouldDealerHit(currentDealerHand)) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const [newCards, remainingDeck] = dealCards(currentDeck, 1);
      currentDeck = remainingDeck;
      currentDealerHand = createHand([...currentDealerHand.cards, ...newCards]);

      setGameState(prev => ({
        ...prev,
        deck: currentDeck,
        dealerHand: currentDealerHand,
      }));
    }

    const dealerValue = currentDealerHand.value;
    const playerValue = gameState.playerHand.value;

    let result: GameState['gameResult'];
    let message: string;

    if (currentDealerHand.isBusted) {
      result = 'playerWin';
      message = 'Dealer busts! You win!';
      onWin?.(gameState.currentBet * 2);
    } else if (dealerValue > playerValue) {
      result = 'dealerWin';
      message = 'Dealer wins!';
      onLose?.(gameState.currentBet);
    } else if (dealerValue < playerValue) {
      result = 'playerWin';
      message = 'You win!';
      onWin?.(gameState.currentBet * 2);
    } else {
      result = 'push';
      message = 'Push!';
      // Return the bet on push
      setGameState(prev => ({
        ...prev,
        bank: prev.bank + prev.currentBet
      }));
    }

    setGameState(prev => ({
      ...prev,
      gamePhase: 'gameOver',
      gameResult: result,
      message,
    }));
  };

  const renderCard = (card: CardType) => {
    if (!card.faceUp) {
      return (
        <div className="w-24 h-36 card-back-pattern rounded-lg border-2 border-white/50 shadow-xl 
          transform rotate-3 relative overflow-hidden">
          <div className="absolute inset-2 border border-white/20 rounded-md"></div>
        </div>
      );
    }

    const suitColor = card.suit === 'hearts' || card.suit === 'diamonds' ? 'text-red-600' : 'text-black';
    return (
      <div className="w-24 h-36 bg-white rounded-lg border-2 border-gray-200 shadow-xl flex flex-col items-center 
        justify-between p-2 transform rotate-3 relative hover:shadow-2xl transition-shadow">
        <div className={`text-xl font-bold ${suitColor} self-start`}>{card.rank}</div>
        <div className={`text-4xl ${suitColor} transform -rotate-3`}>
          {card.suit === 'hearts' ? '♥' : 
           card.suit === 'diamonds' ? '♦' : 
           card.suit === 'clubs' ? '♣' : '♠'}
        </div>
        <div className={`text-xl font-bold ${suitColor} self-end rotate-180`}>{card.rank}</div>
      </div>
    );
  };

  const renderChip = (value: ChipValue, onClick?: () => void) => {
    const isSelected = gameState.selectedChip === value;
    const chipColors: Record<ChipValue, string> = {
      1: 'from-gray-100 to-white',
      5: 'from-red-600 to-red-500',
      25: 'from-green-600 to-green-500',
      50: 'from-blue-600 to-blue-500',
      100: 'from-gray-900 to-gray-800',
      500: 'from-purple-600 to-purple-500'
    };

    return (
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className={`w-16 h-16 rounded-full border-4 border-gray-300 flex items-center justify-center cursor-pointer
          bg-gradient-to-b ${chipColors[value]} relative
          ${isSelected ? 'ring-4 ring-yellow-400 ring-opacity-50' : ''} 
          shadow-[0_0_10px_rgba(0,0,0,0.3)] hover:shadow-[0_0_15px_rgba(0,0,0,0.4)]
          before:content-[''] before:absolute before:inset-2 before:rounded-full before:border-2 
          before:border-white/30 before:border-t-white/10 before:border-l-white/10`}
        onClick={onClick}
      >
        <div className="font-bold text-white relative z-10" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
          ${value}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-[600px] w-full max-w-4xl mx-auto p-4 felt-pattern rounded-xl shadow-2xl relative overflow-hidden">
      <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
        <div className="text-white font-bold">Bank:</div>
        <div className="bg-black/80 text-yellow-500 px-4 py-2 rounded-lg font-mono backdrop-blur-sm">${gameState.bank}</div>
      </div>

      <div className="text-center mb-4 relative z-10">
        <h2 className="text-2xl font-bold text-white mb-2 text-shadow">Blackjack</h2>
        <p className="text-yellow-300 text-shadow">{gameState.message}</p>
      </div>

      {/* Dealer's Hand */}
      <div className="mb-8 relative z-10">
        <h3 className="text-white mb-2 text-shadow">Dealer's Hand ({gameState.dealerHand.value})</h3>
        <div className="flex gap-2 flex-wrap justify-center">
          <AnimatePresence>
            {gameState.dealerHand.cards.map((card, index) => (
              <motion.div
                key={`${card.suit}-${card.rank}-${index}`}
                initial={{ scale: 0, y: -100 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0 }}
                transition={{ duration: 0.3 }}
              >
                {renderCard(card)}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Player's Hand */}
      <div className="mb-8">
        <h3 className="text-white mb-2">Your Hand ({gameState.playerHand.value})</h3>
        <div className="flex gap-2 flex-wrap justify-center">
          <AnimatePresence>
            {gameState.playerHand.cards.map((card, index) => (
              <motion.div
                key={`${card.suit}-${card.rank}-${index}`}
                initial={{ scale: 0, y: 100 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0 }}
                transition={{ duration: 0.3 }}
              >
                {renderCard(card)}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center gap-4 relative z-10">
        {gameState.gamePhase === 'betting' && (
          <>
            <div className="flex gap-4 flex-wrap justify-center mb-4">
              {CHIP_VALUES.map((value) => (
                <div key={value}>
                  {renderChip(value, () => addBet(value))}
                </div>
              ))}
            </div>
            <div className="flex gap-4 items-center">
              <div className="bg-black text-yellow-500 px-4 py-2 rounded-lg font-mono">
                Current Bet: ${gameState.currentBet}
              </div>
              <Button 
                variant="destructive" 
                onClick={clearBet}
                disabled={gameState.currentBet === 0}
              >
                Clear Bet
              </Button>
              <Button 
                onClick={() => addBet(gameState.bank)}
                disabled={gameState.bank === 0}
              >
                All In
              </Button>
              <Button 
                onClick={startNewHand}
                disabled={gameState.currentBet < minBet}
              >
                Deal
              </Button>
            </div>
          </>
        )}

        {gameState.gamePhase === 'playerTurn' && (
          <div className="flex gap-4">
            <Button onClick={hit}>Hit</Button>
            <Button onClick={stand}>Stand</Button>
            {gameState.canDouble && (
              <Button onClick={double}>Double</Button>
            )}
          </div>
        )}

        {gameState.gamePhase === 'gameOver' && (
          <Button onClick={initializeGame}>New Game</Button>
        )}
      </div>
    </div>
  );
}; 