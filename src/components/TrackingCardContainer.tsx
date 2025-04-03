import React, { useState } from 'react';
import './TrackingCardContainer.css';
import { Card as CardType } from '../models/model';
import Card from './Card';

interface Tab {
  id: string;
  label: string;
}

interface TrackingCardContainerProps {
  cards: CardType[];
}

const tabs: Tab[] = [
  { id: 'all', label: '全部' },
  { id: 'sect', label: '门派' },
  { id: 'side-jobs', label: '副职' },
  { id: 'opportunity', label: '机缘' }
];

const TrackingCardContainer: React.FC<TrackingCardContainerProps> = ({ cards }) => {
  const [activeTab, setActiveTab] = useState('all');

  const filteredCards = activeTab === 'all' 
    ? cards 
    : cards.filter(card => {
        if (activeTab === 'side-jobs') {
          return card.type === 'side job';
        }
        return card.type.toLowerCase() === activeTab;
      });

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
          {filteredCards.map(card => (
            <Card
              key={card.name}
              card={card}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrackingCardContainer; 