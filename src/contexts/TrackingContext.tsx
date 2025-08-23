import React, { createContext, useContext, useState, useCallback } from 'react';
import { Card } from '../models/model';

interface TrackingContextType {
  trackedCards: Record<string, boolean>;
  deckTrackedCards: Record<string, boolean>;
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
  const [trackedCards, setTrackedCards] = useState<Record<string, boolean>>({});
  const [deckTrackedCards, setDeckTrackedCards] = useState<Record<string, boolean>>({});

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
    const trackingCards = await loadTrackingCards();
    const trackedCardNames = Object.keys(trackingCards);
    const newTrackedCards: Record<string, boolean> = {};
    trackedCardNames.forEach(name => {
      newTrackedCards[name] = true;
    });
    setTrackedCards(newTrackedCards);
  }, []);

  const refreshDeckTracking = useCallback(async () => {
    const deckTrackingCards = await loadDeckTrackingCards();
    const deckTrackedCardNames = Object.keys(deckTrackingCards);
    const newDeckTrackedCards: Record<string, boolean> = {};
    deckTrackedCardNames.forEach(name => {
      newDeckTrackedCards[name] = true;
    });
    setDeckTrackedCards(newDeckTrackedCards);
  }, []);

  const updateTracking = useCallback(async (cardName: string, isTracking_match: boolean) => {
    if (typeof window.electron === 'undefined') {
      console.error('Not running in Electron environment');
      return;
    }

    try {
      const gamePath = await window.electron.getUserDataPath();
      const trackingFilePath = `${gamePath}/match_tracking_cards.json`;
      const trackingCards = await loadTrackingCards();

      if (isTracking_match) {
        trackingCards[cardName] = {
          name: cardName,
          tracking: true
        };
      } else {
        delete trackingCards[cardName];
      }

      await window.electron.writeFile(trackingFilePath, JSON.stringify(trackingCards, null, 2));
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
      const deckTrackingCards = await loadDeckTrackingCards();

      if (isDeckTracking) {
        deckTrackingCards[cardName] = {
          name: cardName,
          tracking: true
        };
      } else {
        delete deckTrackingCards[cardName];
      }

      await window.electron.writeFile(deckTrackingFilePath, JSON.stringify(deckTrackingCards, null, 2));
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
    trackedCards,
    deckTrackedCards,
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