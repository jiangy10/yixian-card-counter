import React, { useEffect, useMemo, useState } from 'react';
import './FloatingMatch.css';
import { Card as CardType } from '../models/model';
import Card from './Card';
import cardLibData from '../data/card_lib.json';
import specialCardLibData from '../data/special_card_lib.json';

interface CardCountData {
  count: number;
}

type FloatingDeckData = {
  cards: Record<string, CardCountData>;
};

const FloatingDeckHandCardContainer: React.FC = () => {
  const [deckData, setDeckData] = useState<FloatingDeckData>({ cards: {} });

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

  // Read FloatingDeck_one.json from GAME_PATH and subscribe to updates
  useEffect(() => {
    let removeListener: (() => void) | undefined;

    const loadFloatingDeck = async () => {
      try {
        if (!window.electron) return;

        const gamePath = await window.electron.getUserDataPath();
        const floatingDeckPath = `${gamePath}/FloatingDeck_one.json`;
        const content = await window.electron.readFile(floatingDeckPath);
        const parsed: FloatingDeckData = JSON.parse(content || '{"cards":{}}');
        setDeckData(parsed);
      } catch (error) {
        console.error('Failed to load FloatingDeck_one.json:', error);
      }
    };

    loadFloatingDeck();

    if (window.electron?.onFloatingDeckUpdated) {
      removeListener = window.electron.onFloatingDeckUpdated(() => {
        loadFloatingDeck();
      });
    }

    return () => {
      if (removeListener) removeListener();
    };
  }, []);

  // Convert cards data to array and sort by phase
  const cardsWithCount = useMemo(() => {
    const entries = Object.entries(deckData.cards || {});
    return entries
      .map(([name, data]) => {
        const card = cardMap[name];
        if (!card) return null;
        return {
          card,
          count: data.count
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
  }, [deckData, cardMap]);

  return (
    <div className="floating-match-container">
      <div className="floating-match-title">少于2张</div>
      <div className="list-container">
        <div className="floating-card-scroll-view">
          {cardsWithCount.length === 0 ? (
            <div className="no-cards-message">暂无少于2张的卡牌</div>
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

export default FloatingDeckHandCardContainer;
