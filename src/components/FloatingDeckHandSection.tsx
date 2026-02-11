import React, { useEffect, useMemo, useState } from 'react';
import './FloatingMatch.css';
import { Card as CardType } from '../models/model';
import Card from './Card';
import cardLibData from '../data/card_lib.json';
import specialCardLibData from '../data/special_card_lib.json';
import { calculateRemainingCount } from '../utils/cardCalculation';

interface CardCountData {
  count: number;
}

type FloatingDeckData = {
  cards: Record<string, CardCountData>;
};

const FloatingDeckHandSection: React.FC = () => {
  const [handCardData, setHandCardData] = useState<FloatingDeckData>({ cards: {} });
  const [deckUsedData, setDeckUsedData] = useState<FloatingDeckData>({ cards: {} });

  // Build a card index to fetch CardType by name easily
  const cardMap = useMemo(() => {
    const map: Record<string, CardType> = {};

    const addLib = (libData: Record<string, any>) => {
      Object.entries(libData).forEach(([name, card]) => {
        map[name] = {
          ...card,
          name,
          level: -1,
          isTracking_match: false,
          isTracking_deck: false
        };
      });
    };

    addLib(cardLibData);
    addLib(specialCardLibData);

    return map;
  }, []);

  // Read ConvertedHandCard.json and ConvertedCardOperationLog.json
  useEffect(() => {
    let removeListener: (() => void) | undefined;

    const loadData = async () => {
      try {
        if (!window.electron) return;

        const gamePath = await window.electron.getUserDataPath();
        
        // Load hand cards
        const handCardPath = `${gamePath}/ConvertedHandCard.json`;
        const handCardContent = await window.electron.readFile(handCardPath);
        const parsedHandCard: FloatingDeckData = JSON.parse(handCardContent || '{"cards":{}}');
        setHandCardData(parsedHandCard);

        // Load deck used data for calculating remaining count
        const deckUsedPath = `${gamePath}/ConvertedCardOperationLog.json`;
        const deckUsedContent = await window.electron.readFile(deckUsedPath);
        const parsedDeckUsed: FloatingDeckData = JSON.parse(deckUsedContent || '{"cards":{}}');
        setDeckUsedData(parsedDeckUsed);
      } catch (error) {
        console.error('Failed to load hand card data:', error);
      }
    };

    loadData();

    if (window.electron?.onFloatingDeckUpdated) {
      removeListener = window.electron.onFloatingDeckUpdated(() => {
        loadData();
      });
    }

    return () => {
      if (removeListener) removeListener();
    };
  }, []);

  // Convert hand cards data to array with remaining deck count
  const cardsWithCount = useMemo(() => {
    const entries = Object.entries(handCardData.cards || {});
    return entries
      .map(([name, _]) => {
        const card = cardMap[name];
        if (!card) return null;
        
        // Calculate remaining count in deck
        const usedCount = deckUsedData.cards[name]?.count || 0;
        const remainingInDeck = calculateRemainingCount(name, card.phase, usedCount);
        
        return {
          card,
          count: remainingInDeck
        };
      })
      .filter((item): item is { card: CardType; count: number } => item !== null)
      .sort((a, b) => {
        // Sort by phase first, then by name
        if (a.card.phase !== b.card.phase) {
          return a.card.phase - b.card.phase;
        }
        return a.card.name.localeCompare(b.card.name);
      });
  }, [handCardData, deckUsedData, cardMap]);

  return (
    <div className="floating-match-container" style={{ marginBottom: '10px' }}>
      <div className="floating-match-title">手牌</div>
      <div className="list-container">
        <div className="floating-card-scroll-view">
          {cardsWithCount.length === 0 ? (
            <div className="no-cards-message">暂无手牌</div>
          ) : (
            cardsWithCount.map(({ card, count }) => (
              <Card
                key={card.name}
                card={card}
                inHistory={false}
                tail={
                  <div className="card-tail">
                    <div>{count}</div>
                  </div>
                }
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default FloatingDeckHandSection;
