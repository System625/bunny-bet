import { Card, Rank, Suit, Hand } from './types';

export const createDeck = (): Card[] => {
  const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
  const ranks: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const deck: Card[] = [];

  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({ suit, rank, faceUp: true });
    }
  }

  return shuffleDeck(deck);
};

export const shuffleDeck = (deck: Card[]): Card[] => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const calculateHandValue = (hand: Card[]): number => {
  let value = 0;
  let aces = 0;

  for (const card of hand) {
    if (!card.faceUp) continue;

    if (card.rank === 'A') {
      aces += 1;
      value += 11;
    } else if (['K', 'Q', 'J'].includes(card.rank)) {
      value += 10;
    } else {
      value += parseInt(card.rank);
    }
  }

  while (value > 21 && aces > 0) {
    value -= 10;
    aces -= 1;
  }

  return value;
};

export const isBlackjack = (hand: Card[]): boolean => {
  return hand.length === 2 && calculateHandValue(hand) === 21;
};

export const isBusted = (hand: Card[]): boolean => {
  return calculateHandValue(hand) > 21;
};

export const createHand = (cards: Card[]): Hand => {
  return {
    cards,
    value: calculateHandValue(cards),
    isBusted: isBusted(cards),
    isBlackjack: isBlackjack(cards),
  };
};

export const dealCards = (deck: Card[], numCards: number, faceUp: boolean = true): [Card[], Card[]] => {
  const cards = deck.slice(0, numCards).map(card => ({ ...card, faceUp }));
  const remainingDeck = deck.slice(numCards);
  return [cards, remainingDeck];
};

export const shouldDealerHit = (hand: Hand): boolean => {
  return hand.value < 17;
}; 