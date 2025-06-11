import React, { useState, useEffect, useRef, useCallback } from 'react';
import PlayerSelector from './components/PlayerSelector';
import PlayerInfoContainer from './components/PlayerInfoContainer';
import TrackingCardContainer from './components/TrackingCardContainer';
import ManageTrackingContainer from './components/ManageTrackingContainer';
import MatchHistoryContainer from './components/MatchHistoryContainer';
import CardLibraryContainer from './components/CardLibraryContainer';
import { TrackingProvider } from './contexts/TrackingContext';
import { PlayerProvider } from './contexts/PlayerContext';
import cardLibData from './data/card_lib.json';
import { Player, RoundData, Card, MatchHistory } from './models/model';
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
      onBattleLogUpdated: (callback: () => void) => void;
    };
  }
}

const App: React.FC = () => {
  const [roundData, setRoundData] = useState<RoundData | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [displayCards, setDisplayCards] = useState<Card[]>([]);
  const [isManaging, setIsManaging] = useState(false);
  const selectedPlayerRef = useRef<Player | null>(null);
  
  const [trackingHeight, setTrackingHeight] = useState<number>(300);
  const isDraggingRef = useRef<boolean>(false);
  const startYRef = useRef<number>(0);
  const startHeightRef = useRef<number>(0);

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
    const newHeight = Math.max(100, Math.min(800, startHeightRef.current + deltaY));
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
        const battleLogContent = await window.electron.readFile(`${gamePath}/ConvertedBattleLog.json`);
        const data = JSON.parse(battleLogContent);
        if (data.status === 'waiting') {
          setRoundData(null);
          setSelectedPlayer(null);
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
                  recommend: false
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
                    recommend: false
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
                    recommend: false
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
    if (selectedPlayer) {
      const usedCards = selectedPlayer.used_card;
      const cardsWithDetails = usedCards
        .map(usedCard => {
          const cardInfo = (cardLibData as Record<string, Omit<Card, 'level'>>)[usedCard.name];
          if (cardInfo) {
            const card: Card = {
              ...cardInfo,
              level: usedCard.level
            };
            return card;
          }
          return null;
        })
        .filter((card): card is NonNullable<typeof card> => card !== null);

      setDisplayCards(cardsWithDetails);
    }
  }, [selectedPlayer]);

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
            recommend: false
          }))
        };
      }
    });

    setSelectedPlayer({
      ...player,
      match_history: matchHistory
    });
  };

  const handleManageClick = () => {
    setIsManaging(!isManaging);
  };

  if (!roundData || !selectedPlayer) {
    return <div>等待对战数据中...</div>;
  }

  const latestRound = Math.max(...Object.keys(roundData.rounds).map(Number));

  return (
    <PlayerProvider>
      <TrackingProvider>
        <div className="app-container">
          <div className="counter-container">
            {!isManaging ? (
              <>
                <PlayerSelector 
                  players={roundData.rounds[latestRound].players} 
                  onPlayerSelect={handlePlayerSelect} 
                />
                <PlayerInfoContainer player={selectedPlayer} />
                <div className="container-wrapper">
                  <div className="tracking-container" style={{ height: trackingHeight }}>
                    <TrackingCardContainer cards={displayCards} />
                  </div>
                  <div 
                    className="resizer"
                    onMouseDown={handleMouseDown}
                  />
                  <div className="history-container">
                    <MatchHistoryContainer matchHistory={selectedPlayer?.match_history} />
                  </div>
                </div>
              </>
            ) : (
              <CardLibraryContainer />
            )}
            <ManageTrackingContainer onManageClick={handleManageClick} />
          </div>
        </div>
      </TrackingProvider>
    </PlayerProvider>
  );
};

export default App;
