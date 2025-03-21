import React, { useState, useEffect } from 'react';
import PlayerSelector from './components/PlayerSelector';
import PlayerInfoContainer from './components/PlayerInfoContainer';
import TrackingCardContainer from './components/TrackingCardContainer';
import ManageTrackingContainer from './components/ManageTrackingContainer';
import sampleData from './data/sample.json';
import trackingCardsData from './data/tracking_cards.json';
import { Player, RoundData, TrackingCard, Card } from './models/model';
import { TrackingCardManager } from './services/trackingCardManager';
import './App.css';

const App: React.FC = () => {
  const roundData = sampleData as unknown as RoundData;
  const [selectedPlayer, setSelectedPlayer] = useState<Player>(roundData.players[0]);
  const [trackingCards, setTrackingCards] = useState<TrackingCard[]>([]);
  const cards = trackingCardsData as Card[];
  const trackingCardManager = TrackingCardManager.getInstance();

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
          cards={cards}
          trackingCards={trackingCards}
          onCardTrack={handleCardTrack}
          onCardUntrack={handleCardUntrack}
        />
        <ManageTrackingContainer />
      </div>
    </div>
  );
};

export default App;
