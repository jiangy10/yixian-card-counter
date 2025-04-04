import React, { useState, useEffect } from 'react';
import PlayerSelector from './components/PlayerSelector';
import PlayerInfoContainer from './components/PlayerInfoContainer';
import TrackingCardContainer from './components/TrackingCardContainer';
import ManageTrackingContainer from './components/ManageTrackingContainer';
import MatchHistoryContainer from './components/MatchHistoryContainer';
import CardLibraryContainer from './components/CardLibraryContainer';
import sampleData from './data/sample.json';
import cardLibData from './data/card_lib.json';
import { Player, RoundData, TrackingCard, Card, CardType, MatchHistory } from './models/model';
import './App.css';

const App: React.FC = () => {
  const roundData = sampleData as unknown as RoundData;
  const latestRound = Math.max(...Object.keys(roundData.rounds).map(Number));
  const [selectedPlayer, setSelectedPlayer] = useState<Player>(() => {
    // construct match_history
    const player = roundData.rounds[latestRound].players[0];
    const matchHistory: Record<number, MatchHistory> = {};
    
    // iterate all rounds, find the player's match history
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

    return {
      ...player,
      match_history: matchHistory
    };
  });
  const [displayCards, setDisplayCards] = useState<Card[]>([]);
  const [isManaging, setIsManaging] = useState(false);
  // Load tracking card data from the game directory
  const loadTrackingCards = async () => {
    if (typeof window.electron === 'undefined') {
      console.error('Not running in Electron environment');
      return;
    }

    try {
      const gamePath = await window.electron.ipcRenderer.invoke('getUserDataPath');
      const trackingFilePath = `${gamePath}/tracking_cards.json`;
      const content = await window.electron.ipcRenderer.invoke('readFile', trackingFilePath);
      const trackingCards = JSON.parse(content);
      return trackingCards;
    } catch (error) {
      console.error('Failed to load tracking card data:', error);
      return {};
    }
  };

  // Update displayed cards
  useEffect(() => {
    const updateDisplayCards = async () => {
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

        // Load tracking card data
        const trackingCards = await loadTrackingCards();
        const trackedCardNames = Object.keys(trackingCards);

        // Set tracking status for all cards
        const cardsWithTracking = cardsWithDetails.map(card => ({
          ...card,
          isTracking: trackedCardNames.includes(card.name)
        }));

        setDisplayCards(cardsWithTracking);
      }
    };

    updateDisplayCards();
  }, [selectedPlayer]);

  const handlePlayerSelect = (player: Player) => {
    // 为新选择的玩家构建match_history
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

  return (
    <div className="app-container">
      <div className="counter-container">
        {!isManaging ? (
          <>
            <PlayerSelector 
              players={roundData.rounds[latestRound].players} 
              onPlayerSelect={handlePlayerSelect} 
            />
            <PlayerInfoContainer player={selectedPlayer} />
            <TrackingCardContainer 
              cards={displayCards}
            />
            <MatchHistoryContainer matchHistory={selectedPlayer?.match_history} />
          </>
        ) : (
          <CardLibraryContainer />
        )}
        <ManageTrackingContainer onManageClick={handleManageClick} />
      </div>
    </div>
  );
};

export default App;
