'use client'

import { useState, useCallback } from 'react'
import { RouletteTable } from '@/components/games/roulette/roulette-table'
import { RouletteWheel } from '@/components/games/roulette/roulette-wheel'
import { BettingControls } from '@/components/games/roulette/betting-controls'
import { DealerMessages } from '@/components/games/roulette/dealer-messages'
import type { RouletteState, Bet } from '@/components/games/roulette/types'

const DEALER_MESSAGES = {
    waiting: "Place your bets please",
    spinning: "No more bets!",
    result: (num: number) => {
        if (num === undefined || num === null) return "Invalid spin!"
        return `Number ${num}! ${getResultDescription(num)}`
    },
}

function getResultDescription(num: number): string {
    if (num === undefined || num === null) return "Invalid result"
    
    if (num === 0) return "Zero"
    
    const descriptions = []
    
    descriptions.push(num % 2 === 0 ? "Even" : "Odd")
    
    if ([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36].includes(num)) {
        descriptions.push("Red")
    } else {
        descriptions.push("Black")
    }
    
    descriptions.push(num <= 18 ? "1-18" : "19-36")
    
    return descriptions.join(", ")
}

export function RouletteGame() {
    const [gameState, setGameState] = useState<RouletteState>({
        currentNumber: null,
        previousNumbers: [],
        bets: [],
        isSpinning: false,
        balance: 1000,
    })

    const [selectedChip, setSelectedChip] = useState<number>(10)
    const [dealerMessage, setDealerMessage] = useState(DEALER_MESSAGES.waiting)

    const handleBetPlaced = useCallback((bet: Bet) => {
        if (gameState.balance >= bet.amount) {
            setGameState(prev => ({
                ...prev,
                bets: [...prev.bets, bet],
                balance: prev.balance - bet.amount
            }))
        }
    }, [gameState.balance])

    const handleSpinComplete = useCallback((result: number) => {
        setGameState(prev => {
            const winnings = calculateWinnings(prev.bets, result)
            setDealerMessage(DEALER_MESSAGES.result(result))

            return {
                ...prev,
                currentNumber: result,
                previousNumbers: [result, ...prev.previousNumbers].slice(0, 10),
                isSpinning: false,
                balance: prev.balance + winnings,
                bets: []
            }
        })
    }, [])

    const handleSpin = async () => {
        if (gameState.bets.length === 0) return

        setGameState(prev => ({ ...prev, isSpinning: true }))
        setDealerMessage(DEALER_MESSAGES.spinning)
    }

    return (
        <div className="flex flex-col items-center gap-2 p-2">
            <div className="w-full max-w-[1200px] mx-auto px-4">
                <div className="flex flex-col items-center gap-4">
                    <RouletteWheel
                        spinning={gameState.isSpinning}
                        number={gameState.currentNumber}
                        onSpinComplete={handleSpinComplete}
                    />
                    <DealerMessages
                        message={dealerMessage}
                        previousNumbers={gameState.previousNumbers}
                    />
                </div>

                <div className="space-y-6 w-full">
                    <div className="flex justify-between items-center">
                        <div className="text-xl font-bold">
                            Balance: ${gameState.balance}
                        </div>
                        <button
                            className="px-6 py-2 bg-yellow-500 text-black font-bold rounded-full disabled:opacity-50"
                            onClick={handleSpin}
                            disabled={gameState.isSpinning || gameState.bets.length === 0}
                        >
                            SPIN
                        </button>
                    </div>

                    <BettingControls
                        selectedChip={selectedChip}
                        onChipSelect={setSelectedChip}
                    />

                    <div className="overflow-x-auto">
                        <RouletteTable
                            onBetPlaced={handleBetPlaced}
                            selectedChip={selectedChip}
                            disabled={gameState.isSpinning}
                            currentBets={gameState.bets}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

function calculateWinnings(bets: Bet[], result: number): number {
    return bets.reduce((total, bet) => {
        if (bet.numbers.includes(result)) {
            switch (bet.type) {
                case 'straight': return total + bet.amount * 35
                case 'split': return total + bet.amount * 17
                case 'street': return total + bet.amount * 11
                case 'corner': return total + bet.amount * 8
                case 'line': return total + bet.amount * 5
                case 'dozen':
                case 'column': return total + bet.amount * 2
                case 'red':
                case 'black':
                case 'even':
                case 'odd':
                case '1-18':
                case '19-36': return total + bet.amount
                default: return total
            }
        }
        return total
    }, 0)
} 