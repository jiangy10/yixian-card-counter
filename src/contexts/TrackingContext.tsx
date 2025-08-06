import React, { createContext, useContext, useState, useCallback } from 'react';
import { Card } from '../models/model';

interface TrackingContextType {
  trackedCards: Record<string, boolean>;
  updateTracking: (cardName: string, isTracking: boolean) => Promise<void>;
  refreshTracking: () => Promise<void>;
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

  const refreshTracking = useCallback(async () => {
    const trackingCards = await loadTrackingCards();
    const trackedCardNames = Object.keys(trackingCards);
    const newTrackedCards: Record<string, boolean> = {};
    trackedCardNames.forEach(name => {
      newTrackedCards[name] = true;
    });
    setTrackedCards(newTrackedCards);
  }, []);

  const updateTracking = useCallback(async (cardName: string, isTracking: boolean) => {
    if (typeof window.electron === 'undefined') {
      console.error('Not running in Electron environment');
      return;
    }

    try {
      const gamePath = await window.electron.getUserDataPath();
      const trackingFilePath = `${gamePath}/match_tracking_cards.json`;
      const trackingCards = await loadTrackingCards();

      if (isTracking) {
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

  React.useEffect(() => {
    refreshTracking();
  }, [refreshTracking]);

  const value = {
    trackedCards,
    updateTracking,
    refreshTracking
  };

  return (
    <TrackingContext.Provider value={value}>
      {children}
    </TrackingContext.Provider>
  );
}; 