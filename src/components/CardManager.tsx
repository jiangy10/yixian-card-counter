import React, { useEffect, useCallback } from 'react';
import { Card, Player } from '../models/model';
import { usePlayer } from '../contexts/PlayerContext';
import cardLibData from '../data/card_lib.json';
import specialCardLibData from '../data/special_card_lib.json';

interface CardManagerProps {
  selectedPlayer: Player | undefined;
  onDisplayCardsUpdate: (cards: Card[]) => void;
}

const CardManager: React.FC<CardManagerProps> = ({ selectedPlayer, onDisplayCardsUpdate }) => {
  const { updateRemainingCards } = usePlayer();

  const memoizedUpdateRemainingCards = useCallback((cards: Card[]) => {
    updateRemainingCards(cards);
  }, [updateRemainingCards]);

  useEffect(() => {
    if (selectedPlayer) {
      const usedCards = selectedPlayer.used_card;
      const cardsWithDetails = usedCards
        .map(usedCard => {
          const cardInfo = (cardLibData as Record<string, Omit<Card, 'level'>>)[usedCard.name] ||
                         (specialCardLibData as Record<string, Omit<Card, 'level'>>)[usedCard.name];
          if (cardInfo) {
            const card: Card = {
              ...cardInfo,
              level: usedCard.level
            };
            return card;
          }
          return null;
        })
        .filter((card): card is NonNullable<typeof card> => card !== null);

      onDisplayCardsUpdate(cardsWithDetails);

      // Calculate remaining cards
      const allCards = [
        ...Object.entries(cardLibData),
        ...Object.entries(specialCardLibData)
      ].map(([name, card]) => ({
        ...card,
        name,
        level: -1
      }));

      const usedCardNames = new Set(usedCards.map(card => card.name));
      const remainingCards = allCards.filter(card => !usedCardNames.has(card.name));

      // Update remaining cards in context
      memoizedUpdateRemainingCards(remainingCards);
    }
  }, [selectedPlayer, onDisplayCardsUpdate, memoizedUpdateRemainingCards]);

  return null;
};

export default CardManager; 