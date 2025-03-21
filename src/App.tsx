import React, { useState, useEffect } from 'react';
import PlayerSelector from './components/PlayerSelector';
import PlayerInfoContainer from './components/PlayerInfoContainer';
import TrackingCardContainer from './components/TrackingCardContainer';
import ManageTrackingContainer from './components/ManageTrackingContainer';
import sampleData from './data/sample.json';
import { Player, RoundData, TrackingCard } from './models/model';
import { TrackingCardManager } from './services/trackingCardManager';
import './App.css';

const App: React.FC = () => {
  const roundData = sampleData as RoundData;
  const [selectedPlayer, setSelectedPlayer] = useState<Player>(roundData.players[0]);
  const [trackingCards, setTrackingCards] = useState<TrackingCard[]>([]);
  const trackingCardManager = TrackingCardManager.getInstance();

  // 加载保存的追踪卡牌
  useEffect(() => {
    const loadTrackingCards = async () => {
      try {
        const cards = await trackingCardManager.loadTrackingCards();
        setTrackingCards(cards);
      } catch (error) {
        console.error('加载追踪卡牌失败:', error);
      }
    };
    loadTrackingCards();
  }, []);

  const handlePlayerSelect = (player: Player) => {
    setSelectedPlayer(player);
  };

  const handleCardTrack = async (cardId: string) => {
    try {
      const newCard = await trackingCardManager.addTrackingCard(cardId);
      setTrackingCards(prev => [...prev, newCard]);
    } catch (error) {
      console.error('添加追踪卡牌失败:', error);
    }
  };

  const handleCardUntrack = async (cardId: string) => {
    try {
      await trackingCardManager.removeTrackingCard(cardId);
      setTrackingCards(prev => prev.filter(card => card.cardId !== cardId));
    } catch (error) {
      console.error('移除追踪卡牌失败:', error);
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
          cards={[]}
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
