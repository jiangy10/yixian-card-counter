import React, { useState, useMemo } from 'react';
import { Card as CardType } from '../models/model';
import Card from './Card';
import cardLibData from '../data/card_lib.json';
import trackingCardsData from '../data/tracking_cards.json';
import './CardLibraryContainer.css';

interface Tab {
  id: string;
  label: string;
}

const typeFilters: Tab[] = [
  { id: 'sect', label: '门派' },
  { id: 'side-jobs', label: '副职' },
  { id: 'fortune', label: '机缘' }
];

const categoryFilters = {
  sect: [
    { id: 'cloud-spirit', label: '云灵剑宗' },
    { id: 'heptastar', label: '七星阁' },
    { id: 'five-element', label: '五行道盟' },
    { id: 'duan-xuan', label: '锻玄宗' }
  ],
  'side-jobs': [
    { id: 'elixirist', label: '炼丹师' },
    { id: 'fuluist', label: '符咒师' },
    { id: 'musician', label: '琴师' },
    { id: 'painter', label: '画师' },
    { id: 'formation-master', label: '阵法师' },
    { id: 'plant-master', label: '灵植师' },
    { id: 'fortune-teller', label: '命理师' }
  ],
  fortune: [
    { id: 'talisman', label: '法宝' },
    { id: 'spiritual-pet', label: '灵宠' },
    { id: 'cloud-spirit', label: '云灵剑宗秘术' },
    { id: 'heptastar', label: '七星阁秘术' },
    { id: 'five-element', label: '五行道盟秘术' },
    { id: 'duan-xuan', label: '锻玄宗秘术' }
  ]
};

const phaseFilters: Tab[] = [
  { id: 'all', label: '全部' },
  { id: '1', label: '炼气' },
  { id: '2', label: '筑基' },
  { id: '3', label: '金丹' },
  { id: '4', label: '元婴' },
  { id: '5', label: '化神' }
];

const fortunePhaseFilters: Tab[] = [
  { id: 'all', label: '全部' },
  { id: '1', label: '炼气' },
  { id: '2', label: '筑基' },
  { id: '3', label: '金丹' },
  { id: '4', label: '元婴' },
  { id: '5', label: '化神' },
  { id: '6', label: '返虚' }
];

const CardLibraryContainer: React.FC = () => {
  const [activeType, setActiveType] = useState<string>('sect');
  const [activeCategory, setActiveCategory] = useState<string>('cloud-spirit');
  const [activePhase, setActivePhase] = useState<string>('all');

  const cards = useMemo(() => {
    const allCards: CardType[] = [];
    const trackedCardNames = Object.keys(trackingCardsData);
    
    Object.entries(cardLibData).forEach(([name, card]) => {
      if (
        (activeType === 'side-jobs' ? card.type === 'side-jobs' : card.type === activeType) &&
        card.category === activeCategory &&
        (activePhase === 'all' || card.phase.toString() === activePhase)
      ) {
        allCards.push({
          ...card,
          name,
          level: 0,
          isTracking: trackedCardNames.includes(name)
        });
      }
    });
    return allCards;
  }, [activeType, activeCategory, activePhase]);

  return (
    <div className="card-library-container">
      <div className="filters-container">
        <div className="filter-group">
          {typeFilters.map(filter => (
            <button
              key={filter.id}
              className={`filter-button ${activeType === filter.id ? 'active' : ''}`}
              onClick={() => {
                setActiveType(filter.id);
                setActiveCategory(categoryFilters[filter.id as keyof typeof categoryFilters][0].id);
              }}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="filter-group">
          {categoryFilters[activeType as keyof typeof categoryFilters].map(filter => (
            <button
              key={filter.id}
              className={`filter-button ${activeCategory === filter.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(filter.id)}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="filter-group">
          {(activeType === 'fortune' ? fortunePhaseFilters : phaseFilters).map(filter => (
            <button
              key={filter.id}
              className={`filter-button ${activePhase === filter.id ? 'active' : ''}`}
              onClick={() => setActivePhase(filter.id)}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="cards-container">
        <div className="cards-grid">
          {activePhase === 'all' ? (
            [1, 2, 3, 4, 5, ...(activeType === 'fortune' ? [6] : [])].map(phase => {
              const phaseCards = cards.filter(card => card.phase === phase);
              if (phaseCards.length === 0) return null;
              
              return (
                <React.Fragment key={phase}>
                  <div className="phase-divider" />
                  {phaseCards.map(card => (
                    <Card
                      key={card.name}
                      card={card}
                      inHistory={false}
                      showRecommend={true}
                    />
                  ))}
                </React.Fragment>
              );
            })
          ) : (
            cards.map(card => (
              <Card
                key={card.name}
                card={card}
                inHistory={false}
                showRecommend={true}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CardLibraryContainer; 