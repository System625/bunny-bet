export interface SlotSymbol {
  id: string;
  name: string;
  value: number;
  image: string;
}

export interface PayLine {
  positions: number[];
  multiplier: number;
}

export interface SlotResult {
  symbols: SlotSymbol[];
  winningLines: number[];
  totalWin: number;
  serverSeed: string;
  clientSeed: string;
  nonce: number;
}

export interface SlotState {
  isSpinning: boolean;
  lastResult: SlotResult | null;
  betAmount: number;
  selectedPayLines: number;
}

export const SYMBOLS: SlotSymbol[] = [
  { id: "BUNNY", name: "Bunny", value: 500, image: "/symbols/bunny.png" },
  { id: "DIAMOND", name: "Diamond", value: 200, image: "/symbols/diamond.png" },
  { id: "SEVEN", name: "Seven", value: 100, image: "/symbols/seven.png" },
  { id: "BELL", name: "Bell", value: 50, image: "/symbols/bell.png" },
  { id: "CHERRY", name: "Cherry", value: 20, image: "/symbols/cherry.png" },
  { id: "LEMON", name: "Lemon", value: 10, image: "/symbols/lemon.png" },
];

export const PAYLINES: PayLine[] = [
  { positions: [0, 0, 0], multiplier: 1 }, // Top row
  { positions: [1, 1, 1], multiplier: 1 }, // Middle row
  { positions: [2, 2, 2], multiplier: 1 }, // Bottom row
]; 