export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export type ChipValue = 1 | 5 | 25 | 50 | 100 | 500;

export interface Card {
  suit: Suit;
  rank: Rank;
  faceUp: boolean;
}

export interface Hand {
  cards: Card[];
  value: number;
  isBusted: boolean;
  isBlackjack: boolean;
}

export interface GameState {
  deck: Card[];
  playerHand: Hand;
  dealerHand: Hand;
  currentBet: number;
  selectedChip: ChipValue;
  bank: number;
  gamePhase: 'betting' | 'playerTurn' | 'dealerTurn' | 'gameOver';
  gameResult: 'playerWin' | 'dealerWin' | 'push' | null;
  message: string;
  canDouble: boolean;
}

export interface BlackjackProps {
  onWin?: (amount: number) => void;
  onLose?: (amount: number) => void;
  balance: number;
  minBet?: number;
  maxBet?: number;
} 