"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SYMBOLS, PAYLINES, type SlotState } from './types';
import { generateServerSeed, generateSpinResult, generateClientSeed } from './provably-fair';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import confetti from 'canvas-confetti';
import Image from 'next/image';

export function SlotsGame() {
  const [mockBalance, setMockBalance] = useState(1000);
  const [state, setState] = useState<SlotState>({
    isSpinning: false,
    lastResult: null,
    betAmount: 0.1,
    selectedPayLines: 5,
  });
  const [nonce, setNonce] = useState(0);
  const [clientSeed, setClientSeed] = useState('');
  const [serverSeed, setServerSeed] = useState('');
  const [winningAnimation, setWinningAnimation] = useState(false);
  const [isAutoSpin, setIsAutoSpin] = useState(false);
  const [spinningSymbols, setSpinningSymbols] = useState(Array(9).fill(SYMBOLS[0]));
  const [displayedSymbols, setDisplayedSymbols] = useState(Array(9).fill(SYMBOLS[0]));
  const [autoSpinTimeout, setAutoSpinTimeout] = useState<NodeJS.Timeout | null>(null);

  // Initialize seeds
  useEffect(() => {
    setClientSeed(generateClientSeed());
    setServerSeed(generateServerSeed());
  }, []);

  // Cleanup auto-spin on unmount
  useEffect(() => {
    return () => {
      if (autoSpinTimeout) {
        clearTimeout(autoSpinTimeout);
      }
    };
  }, [autoSpinTimeout]);

  // Handle auto-spin state changes
  useEffect(() => {
    if (!isAutoSpin && autoSpinTimeout) {
      clearTimeout(autoSpinTimeout);
      setAutoSpinTimeout(null);
    }
  }, [isAutoSpin, autoSpinTimeout]);

  // Sound effects
  useEffect(() => {
    const spinSound = new Audio('/sounds/spin.mp3');
    const winSound = new Audio('/sounds/win.mp3');
    
    // Preload sounds
    spinSound.load();
    winSound.load();

    return () => {
      spinSound.pause();
      winSound.pause();
    };
  }, []);

  const playSound = useCallback((type: 'spin' | 'win') => {
    const audio = new Audio(`/sounds/${type}.mp3`);
    audio.play().catch(e => console.log('Sound play failed:', e));
  }, []);

  // Function to trigger confetti
  const triggerWinAnimation = useCallback((amount: number) => {
    playSound('win');
    
    // Different confetti based on win amount
    if (amount > state.betAmount * 10) {
      // Big win
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti(Object.assign({}, defaults, { 
          particleCount,
          origin: { x: Math.random(), y: Math.random() - 0.2 }
        }));
      }, 250);
    } else {
      // Normal win
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [state.betAmount, playSound]);

  const updateSpinningSymbols = useCallback(() => {
    setSpinningSymbols(Array(9).fill(null).map(() => 
      SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
    ));
  }, []);

  const handleAutoSpinToggle = () => {
    const newAutoSpinState = !isAutoSpin;
    setIsAutoSpin(newAutoSpinState);
    
    // Reset spinning state when turning off auto-spin
    if (!newAutoSpinState) {
      setState(prev => ({ ...prev, isSpinning: false }));
      if (autoSpinTimeout) {
        clearTimeout(autoSpinTimeout);
        setAutoSpinTimeout(null);
      }
    }
  };

  const handleSpin = async () => {
    if (state.isSpinning || state.betAmount <= 0 || mockBalance < state.betAmount) return;

    // Reset winning animation state
    setWinningAnimation(false);
    
    // Clear any existing auto-spin timeout
    if (autoSpinTimeout) {
      clearTimeout(autoSpinTimeout);
      setAutoSpinTimeout(null);
    }

    setState(prev => ({ ...prev, isSpinning: true }));
    playSound('spin');
    
    try {
      // Generate new server seed for this spin
      const currentServerSeed = generateServerSeed();
      setServerSeed(currentServerSeed);

      // Deduct bet amount from balance
      setMockBalance(prev => prev - state.betAmount);

      // Generate result using the new server seed
      const result = generateSpinResult(currentServerSeed, clientSeed, nonce);
      const symbols = result.map(index => SYMBOLS[index]);
      
      // Create spinning interval with random symbols for each position
      let spinCount = 0;
      const spinInterval = setInterval(() => {
        spinCount++;
        updateSpinningSymbols();
      }, 100);
      
      // Increase spinning duration for better animation
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // Stop spinning animation and show final result
      clearInterval(spinInterval);
      setSpinningSymbols(symbols);
      setDisplayedSymbols(symbols);

      // Calculate winning lines
      const winningLines = PAYLINES.filter((line, index) => {
        if (index >= state.selectedPayLines) return false;
        // Only check first 3 paylines (horizontal rows)
        if (index >= 3) return false;
        
        // Get symbols for this line
        // Convert payline positions [col,row] to grid index [row * 3 + col]
        const lineSymbols = line.positions.map((row, col) => {
          const gridIndex = row * 3 + col;
          return symbols[gridIndex];
        });
        
        // Check if all symbols in the line match
        const firstSymbol = lineSymbols[0];
        return lineSymbols.every(symbol => symbol.id === firstSymbol.id);
      });

      // Calculate total win
      const totalWin = winningLines.reduce((sum, line) => {
        const lineSymbols = line.positions.map((row, col) => {
          const gridIndex = row * 3 + col;
          return symbols[gridIndex];
        });
        const symbolValue = lineSymbols[0].value;
        return sum + (symbolValue * line.multiplier * state.betAmount);
      }, 0);

      // Add winnings to balance
      setMockBalance(prev => prev + totalWin);

      // Update state with result
      setState(prev => ({
        ...prev,
        isSpinning: false,
        lastResult: {
          symbols,
          winningLines: winningLines.map(line => PAYLINES.indexOf(line)),
          totalWin,
          serverSeed,
          clientSeed,
          nonce,
        },
      }));

      // Trigger winning animation if there's a win
      if (totalWin > 0) {
        setWinningAnimation(true);
        triggerWinAnimation(totalWin);
      }

      // Update seeds and nonce
      setNonce(prev => prev + 1);
      setServerSeed(generateServerSeed());

      // Increase delay before next auto-spin
      if (isAutoSpin && mockBalance >= state.betAmount) {
        const timeout = setTimeout(handleSpin, 3000);
        setAutoSpinTimeout(timeout);
      }
    } catch (error) {
      console.error('Spin failed:', error);
      setState(prev => ({ ...prev, isSpinning: false }));
      setSpinningSymbols(Array(9).fill(SYMBOLS[0])); // Reset symbols on error
      // Clear auto-spin on error
      setIsAutoSpin(false);
      if (autoSpinTimeout) {
        clearTimeout(autoSpinTimeout);
        setAutoSpinTimeout(null);
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-8 p-8">
      <div className="bg-black/50 p-8 rounded-lg shadow-xl w-full max-w-3xl">
        {/* Quick Bet Buttons */}
        <div className="flex gap-2 mb-4">
          {[0.1, 0.5, 1, 5, 10].map((amount) => (
            <Button
              key={amount}
              onClick={() => setState(prev => ({ ...prev, betAmount: amount }))}
              disabled={state.isSpinning}
              className={`flex-1 ${state.betAmount === amount ? 'bg-yellow-500' : 'bg-yellow-500/50'}`}
            >
              {amount}
            </Button>
          ))}
        </div>

        {/* Slot Grid */}
        <div className="grid grid-cols-3 gap-2 mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/20 pointer-events-none" />
          {(state.isSpinning ? spinningSymbols : displayedSymbols).map((symbol, i) => {
            // Convert grid index to [row,col] format
            const row = Math.floor(i / 3);
            const col = i % 3;
            
            return (
              <motion.div
                key={i}
                className={`aspect-square bg-black/30 rounded-lg p-2 flex items-center justify-center overflow-hidden
                  ${winningAnimation && state.lastResult?.winningLines.some(lineIndex => 
                    // Only highlight if this position is part of a winning horizontal line
                    lineIndex < 3 && PAYLINES[lineIndex].positions[col] === row
                  ) ? 'ring-2 ring-yellow-500' : ''}`}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${state.isSpinning ? 'spinning' : 'static'}-${i}-${symbol.id}-${Date.now()}`}
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ 
                      y: 0, 
                      opacity: 1,
                      scale: winningAnimation && state.lastResult?.winningLines.some(lineIndex => 
                        // Only animate if this position is part of a winning horizontal line
                        lineIndex < 3 && PAYLINES[lineIndex].positions[col] === row
                      ) ? [1, 1.1, 1] : 1
                    }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ 
                      duration: state.isSpinning ? 0.2 : 0.5,
                      delay: state.isSpinning ? 0 : i * 0.1,
                      scale: { 
                        repeat: winningAnimation && state.lastResult?.winningLines.some(lineIndex => 
                          lineIndex < 3 && PAYLINES[lineIndex].positions[col] === row
                        ) ? Infinity : 0, 
                        duration: 0.5 
                      }
                    }}
                    className="w-full h-full"
                  >
                    <Image
                      src={symbol.image}
                      alt={symbol.name}
                      width={100}
                      height={100}
                      className="w-full h-full object-contain"
                    />
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-4">
          <div className="flex gap-4">
            <motion.div 
              className="flex-1"
              animate={{ scale: state.lastResult?.totalWin ? [1, 1.05, 1] : 1 }}
              transition={{ duration: 0.5 }}
            >
              <label className="text-sm text-yellow-500 mb-1 block">Balance</label>
              <Input
                type="number"
                value={mockBalance.toFixed(2)}
                disabled
                className="w-full"
              />
            </motion.div>
            <div className="flex-1">
              <label className="text-sm text-yellow-500 mb-1 block">Bet Amount</label>
              <Input
                type="number"
                min={0.1}
                step={0.1}
                value={state.betAmount}
                onChange={e => setState(prev => ({ ...prev, betAmount: parseFloat(e.target.value) }))}
                disabled={state.isSpinning}
                className="w-full"
              />
            </div>
            <div className="flex-1">
              <label className="text-sm text-yellow-500 mb-1 block">Pay Lines</label>
              <Input
                type="number"
                min={1}
                max={5}
                value={state.selectedPayLines.toString()}
                onChange={e => {
                  const value = parseInt(e.target.value);
                  if (!isNaN(value) && value >= 1 && value <= 5) {
                    setState(prev => ({ ...prev, selectedPayLines: value }));
                  }
                }}
                disabled={state.isSpinning}
                className="w-full"
              />
            </div>
          </div>

          <div className="flex gap-4">
          <Button
            onClick={handleSpin}
              disabled={state.isSpinning || mockBalance < state.betAmount}
              className={`flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3
                ${mockBalance < state.betAmount ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {state.isSpinning ? 'Spinning...' : mockBalance < state.betAmount ? 'Insufficient Balance' : 'SPIN'}
            </Button>

            <Button
              onClick={handleAutoSpinToggle}
              disabled={mockBalance < state.betAmount}
              className={`bg-yellow-500/50 hover:bg-yellow-600 text-black font-bold py-3
                ${isAutoSpin ? 'bg-yellow-500' : ''}`}
            >
              {isAutoSpin ? 'Stop Auto' : 'Auto Spin'}
          </Button>
          </div>
        </div>

        {/* Result */}
        <AnimatePresence>
        {state.lastResult && (
            <motion.div 
              className="mt-6 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <motion.h3 
                className="text-2xl font-bold text-yellow-500"
                animate={{ scale: state.lastResult.totalWin > 0 ? [1, 1.1, 1] : 1 }}
                transition={{ duration: 0.5, repeat: state.lastResult.totalWin > 0 ? 2 : 0 }}
              >
              {state.lastResult.totalWin > 0
                  ? `You won ${state.lastResult.totalWin.toFixed(2)}!`
                : 'Try again!'}
              </motion.h3>
            <p className="text-sm text-yellow-500/80 mt-2">
              Winning Lines: {state.lastResult.winningLines.length}
            </p>
            </motion.div>
        )}
        </AnimatePresence>
      </div>

      {/* Provably Fair Info */}
      <div className="bg-black/50 p-4 rounded-lg text-sm text-yellow-500/80 w-full max-w-3xl">
        <h4 className="font-bold mb-2">Provably Fair Information</h4>
        <p className='line-clamp-3'>Server Seed: {serverSeed}</p>
        <p className='line-clamp-3'>Client Seed: {clientSeed}</p>
        <p className='line-clamp-3'>Nonce: {nonce}</p>
      </div>
    </div>
  );
} 