import React, { useState } from 'react';
import './TrackingCardContainer.css';
import { Card, TrackingCard, TrackingCardContainerProps } from '../models/model';

interface Tab {
  id: string;
  label: string;
}

const tabs: Tab[] = [
  { id: 'all', label: 'All' },
  { id: 'sect', label: 'Sect' },
  { id: 'subclass', label: 'Subclass' },
  { id: 'opportunity', label: 'Opportunity' }
];

const TrackingCardContainer: React.FC<TrackingCardContainerProps> = ({ cards, trackingCards, onCardTrack, onCardUntrack }) => {
  const [activeTab, setActiveTab] = useState('all');

  const filteredCards = activeTab === 'all' 
    ? cards 
    : cards.filter(card => card.type.toLowerCase() === activeTab);

  const isCardTracked = (cardName: string) => {
    return trackingCards.some(trackedCard => trackedCard.name === cardName);
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
              <div key={card.name} className="card-item">
                <div className="card-info">
                  <div className="card-name">{card.name}</div>
                  <div className="card-type">{card.type}</div>
                  <div className="card-phase">Phase: {card.phase}</div>
                  {isTracked && (
                    <div className="card-count">Count: {trackedCard?.count}</div>
                  )}
                </div>
                <button
                  className={`track-button ${isTracked ? 'tracked' : ''}`}
                  onClick={() => isTracked ? onCardUntrack(card.name) : onCardTrack(card.name)}
                >
                  {isTracked ? 'Untrack' : 'Track'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TrackingCardContainer; 