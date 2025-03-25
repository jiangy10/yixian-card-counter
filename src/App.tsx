import React, { useState, useEffect } from 'react';
import PlayerSelector from './components/PlayerSelector';
import PlayerInfoContainer from './components/PlayerInfoContainer';
import TrackingCardContainer from './components/TrackingCardContainer';
import ManageTrackingContainer from './components/ManageTrackingContainer';
import MatchHistoryContainer from './components/MatchHistoryContainer';
import sampleData from './data/sample.json';
import cardLibData from './data/card_lib.json';
import trackingCardsData from './data/tracking_cards.json';
import { Player, RoundData, TrackingCard, Card, CardType, MatchHistory, UsedCard } from './models/model';
import { TrackingCardManager } from './services/trackingCardManager';
import './App.css';

const App: React.FC = () => {
  const roundData = sampleData as unknown as RoundData;
  const [selectedPlayer, setSelectedPlayer] = useState<Player>(roundData.players[0]);
  const [trackingCards, setTrackingCards] = useState<TrackingCard[]>([]);
  const [displayCards, setDisplayCards] = useState<Card[]>([]);
  const trackingCardManager = TrackingCardManager.getInstance();

  // Create mock match_history data
  useEffect(() => {
    // Add mock match_history for each player
    roundData.players.forEach(player => {
      if (!player.match_history) {
        // Create mock match records using the player's current cards as historical cards
        const mockHistory: Record<number, MatchHistory> = {};

        // Convert UsedCard to Card
        const convertUsedCardsToCards = (usedCards: UsedCard[]): Card[] => {
          return usedCards.map(usedCard => {
            const cardInfo = (cardLibData as Record<string, Omit<Card, 'level'>>)[usedCard.name];
            if (cardInfo) {
              return {
                ...cardInfo,
                level: usedCard.level
              };
            }
            // Default card when card_lib.json does not have the card
            return {
              name: usedCard.name,
              level: usedCard.level,
              phase: usedCard.phase || 0,
              type: 'unknown',
              category: 'unknown'
            };
          });
        };
        
        // Simulate round 1 match record
        mockHistory[-1] = {
          cultivation: player.cultivation.toString(),
          health: player.health,
          destiny: player.destiny,
          destiny_diff: player.destiny_diff,
          opponent_username: player.opponent_username,
          used_card: convertUsedCardsToCards(player.used_card)
        };
        
        player.match_history = mockHistory;
      }
    });
  }, []);

  // Extract all used cards from battle records and get detailed information from card_lib
  useEffect(() => {
    if (selectedPlayer) {
      const usedCards = selectedPlayer.used_card;
      const cardsWithDetails = usedCards
        .map(usedCard => {
          const cardInfo = (cardLibData as Record<string, Omit<Card, 'level'>>)[usedCard.name];
          if (cardInfo) {
            const card: Card = {
              ...cardInfo,
              level: usedCard.level // Use level directly from sample.json
            };
            return card;
          }
          return null;
        })
        .filter((card): card is NonNullable<typeof card> => card !== null);

      // Only display cards that exist in tracking_cards.json
      const trackedCardNames = Object.keys(trackingCardsData);
      const filteredCards = cardsWithDetails.filter(card => 
        trackedCardNames.includes(card.name)
      );

      setDisplayCards(filteredCards);
    }
  }, [selectedPlayer]);

  // Load saved tracking cards
  useEffect(() => {
    const loadTrackingCards = async () => {
      try {
        const cards = await trackingCardManager.loadTrackingCards();
        setTrackingCards(cards);
      } catch (error) {
        console.error('Failed to load tracking cards:', error);
      }
    };
    loadTrackingCards();
  }, []);

  const handlePlayerSelect = (player: Player) => {
    setSelectedPlayer(player);
  };

  const handleCardTrack = async (cardName: string) => {
    try {
      const newCard = await trackingCardManager.addTrackingCard(cardName);
      setTrackingCards(prev => [...prev, newCard]);
    } catch (error) {
      console.error('Failed to add tracking card:', error);
    }
  };

  const handleCardUntrack = async (cardName: string) => {
    try {
      await trackingCardManager.removeTrackingCard(cardName);
      setTrackingCards(prev => prev.filter(card => card.name !== cardName));
    } catch (error) {
      console.error('Failed to remove tracking card:', error);
    }
  };

  return (
    <div className="app-container">
      <div className="counter-container">
        <PlayerSelector 
          players={roundData.players} 
          onPlayerSelect={handlePlayerSelect} 
        />
        <PlayerInfoContainer player={selectedPlayer} />
        <TrackingCardContainer 
          cards={displayCards}
          trackingCards={trackingCards}
        />
        <MatchHistoryContainer matchHistory={selectedPlayer?.match_history} />
        <ManageTrackingContainer />
      </div>
    </div>
  );
};

export default App;
