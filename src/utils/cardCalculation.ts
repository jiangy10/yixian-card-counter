/**
 * Special cards with limited count (4 instead of 8/6)
 */
const SPECIAL_LIMITED_CARDS = new Set(['锻体丹', '还魂丹', '锻体玄丹']);

/**
 * Card interface for hand calculation
 */
export interface CardInfo {
  name: string | null;
  level: number;
  rarity: number;
}

/**
 * Card operation interface
 */
export interface CardOperation {
  operation: number;
  round: number;
  srcCard: CardInfo;
  dstCard: CardInfo;
  cards: CardInfo[] | null;
}

/**
 * Calculate the base count for a card in the deck
 * @param cardName - Name of the card
 * @param phase - Phase of the card (1-5)
 * @returns Base count (4 for special cards, 6 for phase 5, 8 for others)
 */
export function calculateBaseCount(cardName: string, phase: number): number {
  if (SPECIAL_LIMITED_CARDS.has(cardName)) {
    return 4;
  }
  return phase === 5 ? 6 : 8;
}

/**
 * Calculate remaining count of a card in the deck
 * @param cardName - Name of the card
 * @param phase - Phase of the card (1-5)
 * @param usedCount - Number of cards already used (default 0)
 * @returns Remaining count (never negative)
 */
export function calculateRemainingCount(
  cardName: string,
  phase: number,
  usedCount: number = 0
): number {
  const baseCount = calculateBaseCount(cardName, phase);
  return Math.max(0, baseCount - usedCount);
}

/**
 * Calculate current hand cards from card operations
 * @param operations - Array of card operations
 * @returns Record of card names to their counts in hand
 * 
 * Operation types:
 * - 0 (draw cards 抽牌): Draw cards from deck to hand, cards array added to hand
 * - 1 (replace card 换牌): Exchange card, srcCard -1 from hand, dstCard +1 to hand
 * - 2 (use card 炼化): Use card, srcCard -1 from hand
 */
export function calculateHandCards(operations: CardOperation[]): Record<string, number> {
  const handCards: Record<string, number> = {};

  operations.forEach((op) => {
    if (op.operation === 0) {
      // draw cards: cards array added to hand
      op.cards?.forEach(card => {
        if (card.name) {
          handCards[card.name] = (handCards[card.name] || 0) + 1;
        }
      });
    }

    if (op.operation === 1) {
      // replace card: srcCard -1, dstCard +1
      if (op.dstCard.name && !op.dstCard.name.includes('梦•')) { // SEASONAL EFFECT
        if (op.srcCard.name) {
          handCards[op.srcCard.name] = (handCards[op.srcCard.name] || 0) - 1;
        }
        if (op.dstCard.name) {
          handCards[op.dstCard.name] = (handCards[op.dstCard.name] || 0) + 1;
        }
      }
    }

    if (op.operation === 2) {
      // use card: srcCard -1
      if (op.srcCard.name) {
        handCards[op.srcCard.name] = (handCards[op.srcCard.name] || 0) - 1;
      }
    }
  });

  // filter out cards with count 0 or negative
  return Object.fromEntries(
    Object.entries(handCards).filter(([_, count]) => count > 0)
  );
}
