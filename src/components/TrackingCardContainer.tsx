import React, { useState } from 'react';
import './TrackingCardContainer.css';
import { Card as CardType, TrackingCard, TrackingCardContainerProps } from '../models/model';
import Card from './Card';

interface Tab {
  id: string;
  label: string;
}

const tabs: Tab[] = [
  { id: 'all', label: '全部' },
  { id: 'sect', label: '门派' },
  { id: 'side', label: '副职' },
  { id: 'opportunity', label: '机缘' }
];

const TrackingCardContainer: React.FC<TrackingCardContainerProps> = ({ cards, trackingCards, onCardTrack, onCardUntrack }) => {
  const [activeTab, setActiveTab] = useState('all');

  const filteredCards = activeTab === 'all' 
    ? cards 
    : cards.filter(card => card.type.toLowerCase() === activeTab);

  const isCardTracked = (cardName: string) => {
    return trackingCards.some(trackedCard => trackedCard.name === cardName);
  };

  const handleTrackToggle = (cardName: string) => {
    if (isCardTracked(cardName)) {
      onCardUntrack(cardName);
    } else {
      onCardTrack(cardName);
    }
  };

  return (
    <div className="tracking-card-container">
      <h2 className="tracking-card-title">Tracking Cards</h2>
      
      <div className="tab-container">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="list-container">
        <div className="tracking-card-scroll-view">
          {filteredCards.map(card => {
            const isTracked = isCardTracked(card.name);
            const trackedCard = trackingCards.find(tc => tc.name === card.name);
            
            return (
              <Card
                key={card.name}
                card={card}
                isTracked={isTracked}
                onTrackToggle={handleTrackToggle}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TrackingCardContainer; 