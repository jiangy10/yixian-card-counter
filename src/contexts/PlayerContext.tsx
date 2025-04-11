import React, { createContext, useContext, useState, useCallback } from 'react';

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
  sideJobs: string[] | undefined;
  updateSideJobs: (newSideJobs: string[]) => void;
  resetSideJobs: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sideJobs, setSideJobs] = useState<string[] | undefined>(undefined);

  const updateSideJobs = useCallback((newSideJobs: string[]) => {
    // Convert category names to display names
    const displayNames = newSideJobs.map(job => SIDE_JOB_NAMES[job] || job);
    setSideJobs(displayNames);
  }, []);

  const resetSideJobs = useCallback(() => {
    setSideJobs(undefined);
  }, []);

  return (
    <PlayerContext.Provider value={{ sideJobs, updateSideJobs, resetSideJobs }}>
      {children}
    </PlayerContext.Provider>
  );
}; 