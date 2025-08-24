import React, { createContext, useContext, useState, useCallback } from 'react';
import { Card } from '../models/model';

interface TrackingContextType {
  trackingCards: Record<string, boolean>;
  deckTrackingCards: Record<string, boolean>;
  updateTracking: (cardName: string, isTracking_match: boolean) => Promise<void>;
  updateDeckTracking: (cardName: string, isDeckTracking: boolean) => Promise<void>;
  refreshTracking: () => Promise<void>;
  refreshDeckTracking: () => Promise<void>;
}

const TrackingContext = createContext<TrackingContextType | undefined>(undefined);

export const useTracking = () => {
  const context = useContext(TrackingContext);
  if (!context) {
    throw new Error('useTracking must be used within a TrackingProvider');
  }
  return context;
};

export const TrackingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [trackingCards, setTrackingCards] = useState<Record<string, boolean>>({});
  const [deckTrackingCards, setDeckTrackingCards] = useState<Record<string, boolean>>({});

  const loadTrackingCards = async () => {
    if (typeof window.electron === 'undefined') {
      console.error('Not running in Electron environment');
      return {};
    }

    try {
      const gamePath = await window.electron.getUserDataPath();
      const trackingFilePath = `${gamePath}/match_tracking_cards.json`;
      const content = await window.electron.readFile(trackingFilePath);
      return JSON.parse(content);
    } catch (error) {
      console.error('Failed to load tracking card data:', error);
      return {};
    }
  };

  const loadDeckTrackingCards = async () => {
    if (typeof window.electron === 'undefined') {
      console.error('Not running in Electron environment');
      return {};
    }

    try {
      const gamePath = await window.electron.getUserDataPath();
      const deckTrackingFilePath = `${gamePath}/deck_tracking_cards.json`;
      const content = await window.electron.readFile(deckTrackingFilePath);
      return JSON.parse(content);
    } catch (error) {
      console.error('Failed to load deck tracking card data:', error);
      return {};
    }
  };

  const refreshTracking = useCallback(async () => {
    const trackingCardsData = await loadTrackingCards();
    const trackingCardNames = Object.keys(trackingCardsData);
    const newTrackingCards: Record<string, boolean> = {};
    trackingCardNames.forEach(name => {
      newTrackingCards[name] = true;
    });
    setTrackingCards(newTrackingCards);
  }, []);

  const refreshDeckTracking = useCallback(async () => {
    const deckTrackingCardsData = await loadDeckTrackingCards();
    const deckTrackingCardNames = Object.keys(deckTrackingCardsData);
    const newDeckTrackingCards: Record<string, boolean> = {};
    deckTrackingCardNames.forEach(name => {
      newDeckTrackingCards[name] = true;
    });
    setDeckTrackingCards(newDeckTrackingCards);
  }, []);

  const updateTracking = useCallback(async (cardName: string, isTracking_match: boolean) => {
    if (typeof window.electron === 'undefined') {
      console.error('Not running in Electron environment');
      return;
    }

    try {
      const gamePath = await window.electron.getUserDataPath();
      const trackingFilePath = `${gamePath}/match_tracking_cards.json`;
      const trackingCardsData = await loadTrackingCards();

      if (isTracking_match) {
        trackingCardsData[cardName] = {
          name: cardName,
          tracking: true
        };
      } else {
        delete trackingCardsData[cardName];
      }

      await window.electron.writeFile(trackingFilePath, JSON.stringify(trackingCardsData, null, 2));
      await refreshTracking();
    } catch (error) {
      console.error('Error updating tracking card:', error);
    }
  }, [refreshTracking]);

  const updateDeckTracking = useCallback(async (cardName: string, isDeckTracking: boolean) => {
    if (typeof window.electron === 'undefined') {
      console.error('Not running in Electron environment');
      return;
    }

    try {
      const gamePath = await window.electron.getUserDataPath();
      const deckTrackingFilePath = `${gamePath}/deck_tracking_cards.json`;
      const deckTrackingCardsData = await loadDeckTrackingCards();

      if (isDeckTracking) {
        deckTrackingCardsData[cardName] = {
          name: cardName,
          tracking: true
        };
      } else {
        delete deckTrackingCardsData[cardName];
      }

      await window.electron.writeFile(deckTrackingFilePath, JSON.stringify(deckTrackingCardsData, null, 2));
      await refreshDeckTracking();
    } catch (error) {
      console.error('Error updating deck tracking card:', error);
    }
  }, [refreshDeckTracking]);

  React.useEffect(() => {
    refreshTracking();
    refreshDeckTracking();
  }, [refreshTracking, refreshDeckTracking]);

  const value = {
    trackingCards,
    deckTrackingCards,
    updateTracking,
    updateDeckTracking,
    refreshTracking,
    refreshDeckTracking
  };

  return (
    <TrackingContext.Provider value={value}>
      {children}
    </TrackingContext.Provider>
  );
}; 