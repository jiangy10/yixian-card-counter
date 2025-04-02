import React, { useState } from 'react';
import './TrackingCardContainer.css';
import { Card as CardType, TrackingCard, TrackingCardContainerProps } from '../models/model';
import Card from './Card';
import trackingCardsData from '../data/tracking_cards.json';

interface Tab {
  id: string;
  label: string;
}

const tabs: Tab[] = [
  { id: 'all', label: '全部' },
  { id: 'sect', label: '门派' },
  { id: 'side-jobs', label: '副职' },
  { id: 'opportunity', label: '机缘' }
];

const TrackingCardContainer: React.FC<TrackingCardContainerProps> = ({ cards, trackingCards }) => {
  const [activeTab, setActiveTab] = useState('all');

  const filteredCards = activeTab === 'all' 
    ? cards 
    : cards.filter(card => {
        if (activeTab === 'side-jobs') {
          return card.type === 'side job';
        }
        return card.type.toLowerCase() === activeTab;
      });

  const isCardTracked = (cardName: string) => {
    return trackingCards.some(trackedCard => trackedCard.name === cardName);
  };

  const trackedCardNames = Object.keys(trackingCardsData);
  const cardsWithTracking = filteredCards.map(card => ({
    ...card,
    isTracking: trackedCardNames.includes(card.name)
  }));

  return (
    <div className="tracking-card-container">
      <h2 className="tracking-card-title">追踪中的卡牌</h2>
      
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
          {cardsWithTracking.map(card => {
            const isTracked = isCardTracked(card.name);
            
            return (
              <Card
                key={card.name}
                card={card}
                isTracked={isTracked}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TrackingCardContainer; 