/**
 * Card name normalization utility function
 * Resolves the inconsistency between · and • characters in game data
 */

/**
 * Normalize card name by converting · to • to match the format in card_lib.json
 * @param cardName Original card name
 * @returns Normalized card name
 */
export function normalizeCardName(cardName: string): string {
  if (!cardName) return cardName;
  
  // Convert middle dot · to bullet point •
  return cardName.replace(/·/g, '•');
}

/**
 * Find card information in the card library, supports name normalization
 * @param cardName Card name
 * @param cardLibData Main card library data
 * @param specialCardLibData Special card library data
 * @returns Found card information or undefined
 */
export function findCardInfo<T>(
  cardName: string,
  cardLibData: Record<string, T>,
  specialCardLibData: Record<string, T>
): T | undefined {
  const normalizedName = normalizeCardName(cardName);
  
  // First try the original name
  let cardInfo = cardLibData[cardName] || specialCardLibData[cardName];
  
  // If not found and the name has changed, try the normalized name
  if (!cardInfo && normalizedName !== cardName) {
    cardInfo = cardLibData[normalizedName] || specialCardLibData[normalizedName];
  }
  
  return cardInfo;
}
