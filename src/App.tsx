import React, { useState, useEffect } from 'react';
import PlayerSelector from './components/PlayerSelector';
import PlayerInfoContainer from './components/PlayerInfoContainer';
import TrackingCardContainer from './components/TrackingCardContainer';
import ManageTrackingContainer from './components/ManageTrackingContainer';
import MatchHistoryContainer from './components/MatchHistoryContainer';
import CardLibraryContainer from './components/CardLibraryContainer';
import { TrackingProvider } from './contexts/TrackingContext';
import sampleData from './data/sample.json';
import cardLibData from './data/card_lib.json';
import { Player, RoundData, TrackingCard, Card, CardType, MatchHistory } from './models/model';
import './App.css';

const App: React.FC = () => {
  const roundData = sampleData as unknown as RoundData;
  const latestRound = Math.max(...Object.keys(roundData.rounds).map(Number));
  const [selectedPlayer, setSelectedPlayer] = useState<Player>(() => {
    const player = roundData.rounds[latestRound].players[0];
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

    return {
      ...player,
      match_history: matchHistory
    };
  });
  const [displayCards, setDisplayCards] = useState<Card[]>([]);
  const [isManaging, setIsManaging] = useState(false);

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
  );
};

export default App;
