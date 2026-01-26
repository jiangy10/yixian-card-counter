import React, { useState, useEffect, useRef, useCallback } from 'react';
import MatchRecord from './components/MatchRecord';
import MenuTabContainer from './components/MenuTabContainer';
import CardLibraryContainer from './components/CardLibraryContainer';
import CardDeck from './components/CardDeck';
import CardManager from './components/CardManager';
import { TrackingProvider } from './contexts/TrackingContext';
import { PlayerProvider } from './contexts/PlayerContext';
import cardLibData from './data/card_lib.json';
import { Player, RoundData, Card, MatchHistory, CardOperationLog, CardCount } from './models/model';
import './App.css';

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
      onFloatingMatchUpdated: (callback: () => void) => () => void;
      onFloatingDeckUpdated?: (callback: () => void) => () => void;
      onTrackingCardsUpdated: (callback: () => void) => () => void;
    };
    electronAPI?: {
      closeFloatingWindow: () => Promise<void>;
      toggleFloatingWindow: () => Promise<boolean>;
      findAndCreateFloatingWindow: () => Promise<{ success: boolean; message: string }>;
    };
  }
}

const App: React.FC = () => {
  const [roundData, setRoundData] = useState<RoundData | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | undefined>(undefined);
  const [displayCards, setDisplayCards] = useState<Card[]>([]);
  const [activeTab, setActiveTab] = useState<string>('match-record');
  const selectedPlayerRef = useRef<Player | undefined>(undefined);
  
  const [trackingHeight, setTrackingHeight] = useState<number>(200);
  const isDraggingRef = useRef<boolean>(false);
  const startYRef = useRef<number>(0);
  const startHeightRef = useRef<number>(0);

  const [cardOperationLog, setCardOperationLog] = useState<CardOperationLog>({ cards: {} });

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isDraggingRef.current = true;
    startYRef.current = e.clientY;
    startHeightRef.current = trackingHeight;
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
  }, [trackingHeight]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDraggingRef.current) return;
    const deltaY = e.clientY - startYRef.current;
    const newHeight = Math.max(250, Math.min(800, startHeightRef.current + deltaY));
    setTrackingHeight(newHeight);
  }, []);

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  useEffect(() => {
    selectedPlayerRef.current = selectedPlayer;
  }, [selectedPlayer]);

  useEffect(() => {
    const loadBattleLog = async () => {
      try {
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
        if (!selectedPlayerRef.current) {
          const initialPlayer = data.rounds[latestRound].players[0];
          const matchHistory: Record<number, MatchHistory> = {};
          Object.entries(data.rounds).forEach(([roundNumber, round]) => {
            const playerInRound = (round as { players: Player[] }).players.find((p: Player) => p.player_username === initialPlayer.player_username);
            if (playerInRound) {
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
          setSelectedPlayer({
            ...initialPlayer,
            match_history: matchHistory
          });
        } else {
          const playerStillExists = data.rounds[latestRound].players.some(
            (p: Player) => p.player_username === selectedPlayerRef.current!.player_username
          );
          if (!playerStillExists) {
            const initialPlayer = data.rounds[latestRound].players[0];
            const matchHistory: Record<number, MatchHistory> = {};
            Object.entries(data.rounds).forEach(([roundNumber, round]) => {
              const playerInRound = (round as { players: Player[] }).players.find((p: Player) => p.player_username === initialPlayer.player_username);
              if (playerInRound) {
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
            setSelectedPlayer({
              ...initialPlayer,
              match_history: matchHistory
            });
          } else {
            const updatedMatchHistory: Record<number, MatchHistory> = {};
            Object.entries(data.rounds).forEach(([roundNumber, round]) => {
              const playerInRound = (round as { players: Player[] }).players.find((p: Player) => p.player_username === selectedPlayerRef.current!.player_username);
              if (playerInRound) {
                updatedMatchHistory[parseInt(roundNumber)] = {
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
            
            const currentPlayerInLatestRound = data.rounds[latestRound].players.find(
              (p: Player) => p.player_username === selectedPlayerRef.current!.player_username
            );
            
            if (currentPlayerInLatestRound) {
              setSelectedPlayer({
                ...currentPlayerInLatestRound,
                match_history: updatedMatchHistory
              });
            }
          }
        }
      } catch (error) {
        console.error('Error loading battle log:', error);
      }
    };

    loadBattleLog();
    const removeListener = window.electron.onBattleLogUpdated(() => {
      loadBattleLog();
    });
    return removeListener;
  }, []);

  useEffect(() => {
    const loadCardOperationLog = async () => {
      try {
        if (window.electron) {
          const gamePath = await window.electron.getUserDataPath();
          const logPath = `${gamePath}/ConvertedCardOperationLog.json`;
          const content = await window.electron.readFile(logPath);
          setCardOperationLog(JSON.parse(content));
        }
      } catch (error) {
        console.error('Error loading card operation log:', error);
      }
    };

    loadCardOperationLog();

    if (window.electron?.onCardOperationLogUpdated) {
      window.electron.onCardOperationLogUpdated(loadCardOperationLog);
    }
  }, []);

  const handlePlayerSelect = (player: Player) => {
    if (!roundData) return;

    const matchHistory: Record<number, MatchHistory> = {};
    
    Object.entries(roundData.rounds).forEach(([roundNumber, round]) => {
      const playerInRound = (round as { players: Player[] }).players.find((p: Player) => p.player_username === player.player_username);
      if (playerInRound) {
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

    setSelectedPlayer({
      ...player,
      match_history: matchHistory
    });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'match-record':
        return (
          <MatchRecord
            players={roundData?.rounds[latestRound]?.players}
            selectedPlayer={selectedPlayer}
            displayCards={displayCards}
            trackingHeight={trackingHeight}
            onPlayerSelect={handlePlayerSelect}
            onMouseDown={handleMouseDown}
          />
        );  
      case 'card-library':
        return <CardLibraryContainer />;
      case 'card-deck':
        return (
          <CardDeck cardOperationLog={cardOperationLog} />
        );
      default:
        return null;
    }
  };

  const latestRound = roundData ? Math.max(...Object.keys(roundData.rounds).map(Number)) : 0;

  return (
    <PlayerProvider>
      <TrackingProvider>
        <div className="app-container">
          <div className="counter-container">
            <div className="content-area">
              <CardManager
                selectedPlayer={selectedPlayer}
                onDisplayCardsUpdate={setDisplayCards}
              />
              {renderContent()}
            </div>
            <MenuTabContainer
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </div>
        </div>
      </TrackingProvider>
    </PlayerProvider>
  );
};

export default App;
