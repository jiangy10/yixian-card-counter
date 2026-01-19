/**
 * Special cards with limited count (4 instead of 8/6)
 */
const SPECIAL_LIMITED_CARDS = new Set(['锻体丹', '还魂丹', '锻体玄丹']);

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
