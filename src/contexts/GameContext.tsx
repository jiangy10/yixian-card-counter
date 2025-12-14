import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Player, RoundData, MatchHistory } from '../models/model';

interface GameContextType {
  roundData: RoundData | null;
  selectedPlayer: Player | undefined;
  players: Player[];
  selectPlayer: (player: Player) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [roundData, setRoundData] = useState<RoundData | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | undefined>(undefined);
  const selectedPlayerRef = useRef<Player | undefined>(undefined);

  useEffect(() => {
    selectedPlayerRef.current = selectedPlayer;
  }, [selectedPlayer]);

  const loadBattleLog = useCallback(async () => {
    try {
      if (!window.electron) return;

      const gamePath = await window.electron.getUserDataPath();
      const battleLogPath = `${gamePath}/ConvertedBattleLog.json`;
      const battleLogContent = await window.electron.readFile(battleLogPath);
      const data = JSON.parse(battleLogContent);
      
      if (data.status === 'waiting') {
        setRoundData(null);
        setSelectedPlayer(undefined);
        return;
      }
      setRoundData(data);

      const latestRound = Math.max(...Object.keys(data.rounds).map(Number));
      
      // Auto-select logic (simplified from App.tsx)
      if (!selectedPlayerRef.current) {
        // Initial load: select first player
        const initialPlayer = data.rounds[latestRound].players[0];
        updateSelectedPlayerWithHistory(data, initialPlayer.player_username);
      } else {
        // Update existing selection
        const playerStillExists = data.rounds[latestRound].players.some(
          (p: Player) => p.player_username === selectedPlayerRef.current!.player_username
        );
        
        if (!playerStillExists) {
           // Player gone, reset to first
           const initialPlayer = data.rounds[latestRound].players[0];
           updateSelectedPlayerWithHistory(data, initialPlayer.player_username);
        } else {
           // Player exists, update history
           updateSelectedPlayerWithHistory(data, selectedPlayerRef.current!.player_username);
        }
      }
    } catch (error) {
      console.error('Error loading battle log:', error);
    }
  }, []);

  const updateSelectedPlayerWithHistory = (data: RoundData, username: string) => {
      const matchHistory: Record<number, MatchHistory> = {};
      
      let basePlayer: Player | undefined;

      Object.entries(data.rounds).forEach(([roundNumber, round]) => {
        const playerInRound = (round as { players: Player[] }).players.find((p: Player) => p.player_username === username);
        if (playerInRound) {
            // Keep reference to the player object from the latest round (or any round) to get base props
            if (!basePlayer || parseInt(roundNumber) === Math.max(...Object.keys(data.rounds).map(Number))) {
                basePlayer = playerInRound;
            }

            matchHistory[parseInt(roundNumber)] = {
                cultivation: playerInRound.cultivation.toString(),
                health: playerInRound.health,
                destiny: playerInRound.destiny,
                destiny_diff: playerInRound.destiny_diff,
                opponent_username: playerInRound.opponent_username,
                used_card: playerInRound.used_card.map((card: any) => ({
                ...card,
                phase: 2,
                type: 'unknown',
                category: 'unknown',
                "match-recommend": false
                }))
            };
        }
      });

      if (basePlayer) {
          setSelectedPlayer({
              ...basePlayer,
              match_history: matchHistory
          });
      }
  };

  useEffect(() => {
    loadBattleLog();
    if (window.electron && window.electron.onBattleLogUpdated) {
        const removeListener = window.electron.onBattleLogUpdated(() => {
            loadBattleLog();
        });
        return removeListener;
    }
  }, [loadBattleLog]);

  const players = roundData ? roundData.rounds[Math.max(...Object.keys(roundData.rounds).map(Number))].players : [];

  const handlePlayerSelect = (player: Player) => {
      if (!roundData) return;
      updateSelectedPlayerWithHistory(roundData, player.player_username);
  };

  return (
    <GameContext.Provider value={{
        roundData, 
        selectedPlayer, 
        players, 
        selectPlayer: handlePlayerSelect 
    }}>
      {children}
    </GameContext.Provider>
  );
};

