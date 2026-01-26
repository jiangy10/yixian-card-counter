import React, { useEffect, useMemo, useState } from 'react';
import './FloatingMatch.css';
import { Card as CardType } from '../models/model';
import Card from './Card';
import cardLibData from '../data/card_lib.json';
import specialCardLibData from '../data/special_card_lib.json';

declare global {
  interface Window {
    electron: {
      getUserDataPath: () => Promise<string>;
      readFile: (path: string) => Promise<string>;
      writeFile: (path: string, data: string) => Promise<void>;
      ipcRenderer: {
        invoke: (channel: string, ...args: any[]) => Promise<any>;
      };
      onBattleLogUpdated: (callback: () => void) => () => void;
      onCardOperationLogUpdated: (callback: () => void) => () => void;
      onTrackingCardsUpdated: (callback: () => void) => () => void;
      onFloatingMatchUpdated: (callback: () => void) => () => void;
      onFloatingDeckUpdated?: (callback: () => void) => () => void;
    };
    electronAPI?: {
      closeFloatingWindow: () => Promise<void>;
      toggleFloatingWindow: () => Promise<boolean>;
      findAndCreateFloatingWindow: () => Promise<{ success: boolean; message: string }>;
    };
  }
}

type FloatingMatchData = Record<string, { cards: string[] }>;

const FloatingMatch: React.FC = () => {
  const [floatingData, setFloatingData] = useState<FloatingMatchData>({});
  const [selectedPlayerName, setSelectedPlayerName] = useState<string>('');

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

  // Read FloatingMatch.json from GAME_PATH and subscribe to updates
  useEffect(() => {
    let removeListener: (() => void) | undefined;

    const loadFloatingMatch = async () => {
      try {
        if (!window.electron) return;

        const gamePath = await window.electron.getUserDataPath();
        const floatingMatchPath = `${gamePath}/FloatingMatch.json`;
        const content = await window.electron.readFile(floatingMatchPath);
        const parsed: FloatingMatchData = JSON.parse(content || '{}');
        setFloatingData(parsed);
      } catch (error) {
        console.error('Failed to load FloatingMatch.json:', error);
      }
    };

    loadFloatingMatch();

    if (window.electron?.onFloatingMatchUpdated) {
      removeListener = window.electron.onFloatingMatchUpdated(() => {
        loadFloatingMatch();
      });
    }

    return () => {
      if (removeListener) removeListener();
    };
  }, []);

  const playerNames = useMemo(() => Object.keys(floatingData), [floatingData]);

  // Automatically select the first player when data changes
  useEffect(() => {
    if (playerNames.length === 0) {
      setSelectedPlayerName('');
      return;
    }
    if (!selectedPlayerName || !playerNames.includes(selectedPlayerName)) {
      setSelectedPlayerName(playerNames[0]);
    }
  }, [playerNames, selectedPlayerName]);

  const selectedPlayerCards = useMemo(() => {
    if (!selectedPlayerName) return [];
    const cardNames = floatingData[selectedPlayerName]?.cards || [];
    return cardNames
      .map(name => cardMap[name])
      .filter((card): card is CardType => Boolean(card));
  }, [floatingData, selectedPlayerName, cardMap]);

  const handlePlayerChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const playerName = event.target.value;
    setSelectedPlayerName(playerName);
  };

  return (
    <div className="floating-match-container">
      <div className="player-selector-wrapper">
        <select
          className="player-dropdown"
          value={selectedPlayerName}
          onChange={handlePlayerChange}
          disabled={playerNames.length === 0}
        >
          {playerNames.length === 0 ? (
            <option value="">Waiting for match data...</option>
          ) : (
            playerNames.map(playerName => (
              <option key={playerName} value={playerName}>
                {playerName}
              </option>
            ))
          )}
        </select>
      </div>

      <div className="list-container">
        <div className="floating-card-scroll-view">
          {selectedPlayerCards.length === 0 ? (
            <div></div>
          ) : (
            selectedPlayerCards.map(card => (
              <Card
                key={card.name}
                card={card}
                inHistory={false}
                tail={<></>}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default FloatingMatch;

