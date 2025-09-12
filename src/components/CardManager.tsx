import React, { useEffect, useCallback } from 'react';
import { Card, Player } from '../models/model';
import { usePlayer } from '../contexts/PlayerContext';
import cardLibData from '../data/card_lib.json';
import specialCardLibData from '../data/special_card_lib.json';
import { findCardInfo } from '../utils/cardNameUtils';

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
      // get all used cards
      const allUsedCards: {name: string, level: number}[] = [];
      const cardNameSet = new Set<string>();
      
      selectedPlayer.used_card.forEach(card => {
        const cardKey = `${card.name}-${card.level}`;
        if (!cardNameSet.has(cardKey)) {
          allUsedCards.push(card);
          cardNameSet.add(cardKey);
        }
      });
      
      if (selectedPlayer.match_history) {
        Object.values(selectedPlayer.match_history).forEach(history => {
          history.used_card.forEach(card => {
            const cardKey = `${card.name}-${card.level}`;
            if (!cardNameSet.has(cardKey)) {
              allUsedCards.push({name: card.name, level: card.level});
              cardNameSet.add(cardKey);
            }
          });
        });
      }

      const cardsWithDetails = allUsedCards
        .map(usedCard => {
          const cardInfo = findCardInfo(
            usedCard.name,
            cardLibData as Record<string, Omit<Card, 'level'>>,
            specialCardLibData as Record<string, Omit<Card, 'level'>>
          );
          if (cardInfo) {
            let type = cardInfo.type;
            if (type === 'side-jobs') {
              type = 'side job';
            } else if (type === 'fortune') {
              type = 'opportunity';
            }
            
            const card: Card = {
              ...cardInfo,
              name: usedCard.name,
              level: usedCard.level,
              type: type
            };
            return card;
          }
          
          return {
            name: usedCard.name,
            level: usedCard.level,
            phase: 1,
            type: 'unknown',
            category: 'unknown',
            "match-recommend": false
          } as Card;
        });

      onDisplayCardsUpdate(cardsWithDetails);

      // calculate remaining cards
      const allCards = [
        ...Object.entries(cardLibData),
        ...Object.entries(specialCardLibData)
      ].map(([name, card]) => ({
        ...card,
        name,
        level: -1
      }));

      const usedCardNames = new Set(allUsedCards.map(card => card.name));
      const remainingCards = allCards.filter(card => !usedCardNames.has(card.name));

      memoizedUpdateRemainingCards(remainingCards);
    }
  }, [selectedPlayer, onDisplayCardsUpdate, memoizedUpdateRemainingCards]);

  return null;
};

export default CardManager; 