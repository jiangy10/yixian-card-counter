import React, { useState, useEffect } from 'react';
import PlayerSelector from './components/PlayerSelector';
import PlayerInfoContainer from './components/PlayerInfoContainer';
import TrackingCardContainer from './components/TrackingCardContainer';
import ManageTrackingContainer from './components/ManageTrackingContainer';
import MatchHistoryContainer from './components/MatchHistoryContainer';
import CardLibraryContainer from './components/CardLibraryContainer';
import { TrackingProvider } from './contexts/TrackingContext';
import { PlayerProvider } from './contexts/PlayerContext';
import cardLibData from './data/card_lib.json';
import { Player, RoundData, TrackingCard, Card, CardType, MatchHistory } from './models/model';
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
    };
  }
}

const App: React.FC = () => {
  const [roundData, setRoundData] = useState<RoundData | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [displayCards, setDisplayCards] = useState<Card[]>([]);
  const [isManaging, setIsManaging] = useState(false);

  useEffect(() => {
    const loadBattleLog = async () => {
      try {
        const gamePath = await window.electron.getUserDataPath();
        const battleLogContent = await window.electron.readFile(`${gamePath}/ConvertedBattleLog.json`);
        const data = JSON.parse(battleLogContent) as RoundData;
        setRoundData(data);

        // 设置初始选中玩家
        const latestRound = Math.max(...Object.keys(data.rounds).map(Number));
        const initialPlayer = data.rounds[latestRound].players[0];
        const matchHistory: Record<number, MatchHistory> = {};
        
        Object.entries(data.rounds).forEach(([roundNumber, round]) => {
          const playerInRound = round.players.find(p => p.player_username === initialPlayer.player_username);
          if (playerInRound) {
            matchHistory[parseInt(roundNumber)] = {
              cultivation: playerInRound.cultivation.toString(),
              health: playerInRound.health,
              destiny: playerInRound.destiny,
              destiny_diff: playerInRound.destiny_diff,
              opponent_username: playerInRound.opponent_username,
              used_card: playerInRound.used_card.map(card => ({
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
      } catch (error) {
        console.error('Error loading battle log:', error);
      }
    };

    loadBattleLog();
    
    // 设置定时器每秒刷新一次数据
    const timer = setInterval(loadBattleLog, 1000);
    return () => clearInterval(timer);
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
      const playerInRound = round.players.find(p => p.player_username === player.player_username);
      if (playerInRound) {
        matchHistory[parseInt(roundNumber)] = {
          cultivation: playerInRound.cultivation.toString(),
          health: playerInRound.health,
          destiny: playerInRound.destiny,
          destiny_diff: playerInRound.destiny_diff,
          opponent_username: playerInRound.opponent_username,
          used_card: playerInRound.used_card.map(card => ({
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
    return <div>Loading...</div>;
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
                <TrackingCardContainer cards={displayCards} />
                <MatchHistoryContainer matchHistory={selectedPlayer?.match_history} />
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
