import React, { useState, useMemo } from 'react';
import { usePlayer } from '../contexts/PlayerContext';
import { Card as CardType } from '../models/model';
import Card from './Card';
import './CardDeck.css';

interface Tab {
  id: string;
  label: string;
}

const sectTabs: Tab[] = [
  { id: 'cloud-spirit', label: '云灵剑宗' },
  { id: 'heptastar', label: '七星阁' },
  { id: 'five-element', label: '五行道盟' },
  { id: 'duan-xuan', label: '锻玄宗' }
];

const sideJobTabs: Tab[] = [
  { id: 'elixirist', label: '炼丹师' },
  { id: 'fuluist', label: '符咒师' },
  { id: 'musician', label: '琴师' },
  { id: 'painter', label: '画师' },
  { id: 'formation-master', label: '阵法师' },
  { id: 'plant-master', label: '灵植师' },
  { id: 'fortune-teller', label: '命理师' }
];

const phaseTabs: Tab[] = [
  { id: 'all', label: '全部' },
  { id: '1', label: '炼气' },
  { id: '2', label: '筑基' },
  { id: '3', label: '金丹' },
  { id: '4', label: '元婴' },
  { id: '5', label: '化神' }
];

const CardDeck: React.FC = () => {
  const { remainingCards } = usePlayer();
  const [activeSect, setActiveSect] = useState<string>('cloud-spirit');
  const [activeSideJob, setActiveSideJob] = useState<string>('elixirist');
  const [activePhase, setActivePhase] = useState<string>('all');

  const filteredCards = useMemo(() => {
    if (!remainingCards) return [];
    return remainingCards.filter(card => 
      ((card.type === 'sect' && card.category === activeSect) ||
      (card.type === 'side-jobs' && card.category === activeSideJob)) &&
      (activePhase === 'all' || card.phase.toString() === activePhase)
    );
  }, [remainingCards, activeSect, activeSideJob, activePhase]);

  if (!remainingCards || remainingCards.length === 0) {
    return (
      <div className="card-deck-container">
        <div className="card-deck-empty">
          暂无剩余牌库信息
        </div>
      </div>
    );
  }

  return (
    <div className="card-deck-container">
      <div className="card-deck-tabs">
        <div className="tab-row">
          {sectTabs.map(tab => (
            <button
              key={tab.id}
              className={`filter-button ${activeSect === tab.id ? 'active' : ''}`}
              onClick={() => setActiveSect(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="tab-row">
          {sideJobTabs.map(tab => (
            <button
              key={tab.id}
              className={`filter-button ${activeSideJob === tab.id ? 'active' : ''}`}
              onClick={() => setActiveSideJob(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="tab-row">
          {phaseTabs.map(tab => (
            <button
              key={tab.id}
              className={`filter-button ${activePhase === tab.id ? 'active' : ''}`}
              onClick={() => setActivePhase(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="card-deck-grid">
        {activePhase === 'all' ? (
          [1, 2, 3, 4, 5].map(phase => {
            const phaseCards = filteredCards.filter(card => card.phase === phase);
            if (phaseCards.length === 0) return null;
            
            return (
              <React.Fragment key={phase}>
                <div className="phase-divider" />
                {phaseCards.map(card => (
                  <Card
                    key={`${card.name}-${card.level}`}
                    card={card}
                    inHistory={false}
                    showRecommend={true}
                  />
                ))}
              </React.Fragment>
            );
          })
        ) : (
          filteredCards.map(card => (
            <Card
              key={`${card.name}-${card.level}`}
              card={card}
              inHistory={false}
              showRecommend={true}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default CardDeck;