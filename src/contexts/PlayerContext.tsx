import React, { createContext, useContext, useState } from 'react';
import { Card } from '../models/model';

const SIDE_JOB_NAMES: Record<string, string> = {
  'elixirist': '炼丹师',
  'fuluist': '符咒师',
  'formation-master': '阵法师',
  'painter': '画师',
  'musician': '琴师',
  'plant-master': '灵植师',
  'fortune-teller': '命理师',
};

interface PlayerContextType {
  sideJobs: string[];
  remainingCards: Card[];
  updateSideJobs: (jobs: string[]) => void;
  resetSideJobs: () => void;
  updateRemainingCards: (cards: Card[]) => void;
  resetRemainingCards: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sideJobs, setSideJobs] = useState<string[]>([]);
  const [remainingCards, setRemainingCards] = useState<Card[]>([]);

  const updateSideJobs = (jobs: string[]) => {
    setSideJobs(jobs);
  };

  const resetSideJobs = () => {
    setSideJobs([]);
  };

  const updateRemainingCards = (cards: Card[]) => {
    setRemainingCards(cards);
  };

  const resetRemainingCards = () => {
    setRemainingCards([]);
  };

  return (
    <PlayerContext.Provider
      value={{
        sideJobs,
        remainingCards,
        updateSideJobs,
        resetSideJobs,
        updateRemainingCards,
        resetRemainingCards,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}; 