import React, { useState, useMemo } from 'react';
import './TrackingCardContainer.css';
import { Card as CardType } from '../models/model';
import Card, { TrackButton, RecommendLabel } from './Card';
import { useTracking } from '../contexts/TrackingContext';

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
  const { trackedCards } = useTracking();

  const trackedFilteredCards = useMemo(() => {
    const tracked = cards.filter(card => trackedCards[card.name]);
    
    const cardGroups = tracked.reduce<Record<string, CardType>>((groups, card) => {
      if (!groups[card.name] || groups[card.name].level < card.level) {
        groups[card.name] = card;
      }
      return groups;
    }, {});

    return Object.values(cardGroups);
  }, [cards, trackedCards]);

  const filteredCards = useMemo(() => {
    if (activeTab === 'all') {
      return trackedFilteredCards;
    }

    return trackedFilteredCards.filter(card => {
      const cardType = card.type.toLowerCase();
      switch (activeTab) {
        case 'side-jobs':
          return cardType === 'side job' || cardType === 'side-jobs';
        case 'opportunity':
          return cardType === 'opportunity' || cardType === 'fortune';
        case 'sect':
          return cardType === 'sect';
        default:
          return false;
      }
    });
  }, [activeTab, trackedFilteredCards]);

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
              inHistory={false}
              tail={
                <div className="card-tail">
                  {card.recommend && <RecommendLabel />}
                  <TrackButton card={card} />
                </div>
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrackingCardContainer; 