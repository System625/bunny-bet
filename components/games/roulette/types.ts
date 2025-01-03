export type BetType = 'straight' | 'split' | 'street' | 'corner' | 'line' | 'dozen' | 'column' | 'even' | 'odd' | 'red' | 'black' | '1-18' | '19-36'

export interface Bet {
  type: BetType
  amount: number
  numbers: number[]
}

export interface RouletteState {
  currentNumber: number | null
  previousNumbers: number[]
  bets: Bet[]
  isSpinning: boolean
  balance: number
} 