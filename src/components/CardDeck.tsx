import React, { useState, useMemo, useEffect } from 'react';
import { Card as CardType, CardOperationLog, Tab, CardLib } from '../models/model';
import Card from './Card';
import './CardDeck.css';
import cardLibData from '../data/card_lib.json';

interface CardDeckProps {
  cardOperationLog: CardOperationLog;
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

const CardDeck: React.FC<CardDeckProps> = ({ cardOperationLog }) => {
  const [activeSect, setActiveSect] = useState<string>('cloud-spirit');
  const [activeSideJob, setActiveSideJob] = useState<string>('elixirist');
  const [activePhases, setActivePhases] = useState<string[]>(['all']);
  const [isPhaseMultiSelect, setIsPhaseMultiSelect] = useState<boolean>(false);

useEffect(() => {
  // Initialize sect and side job
  const cardEntries = Object.entries(cardOperationLog.cards);
  if (cardEntries.length === 0) return;

  // Find the most used sect
  const sectCounts: Record<string, number> = {};
  const sideJobCounts: Record<string, number> = {};

  cardEntries.forEach(([cardName, cardCount]) => {
    const cardInfo = (cardLibData as Record<string, CardLib>)[cardName];
    if (!cardInfo) return;

    if (cardInfo.type === 'sect') {
      sectCounts[cardInfo.category] = (sectCounts[cardInfo.category] || 0) + cardCount.count;
    } else if (cardInfo.type === 'side-jobs') {
      sideJobCounts[cardInfo.category] = (sideJobCounts[cardInfo.category] || 0) + cardCount.count;
    }
  });

  // Set the most used sect
  if (Object.keys(sectCounts).length > 0) {
    const mostUsedSect = Object.entries(sectCounts).reduce((a, b) => a[1] > b[1] ? a : b)[0];
    setActiveSect(mostUsedSect);
  }

  // Set the most used side job
  if (Object.keys(sideJobCounts).length > 0) {
    const mostUsedSideJob = Object.entries(sideJobCounts).reduce((a, b) => a[1] > b[1] ? a : b)[0];
    setActiveSideJob(mostUsedSideJob);
  }
}, [cardOperationLog]);

  const handlePhaseClick = (phaseId: string) => {
    if (phaseId === 'all') {
      setActivePhases(['all']);
      return;
    }

    if (!isPhaseMultiSelect) {
      setActivePhases([phaseId]);
      return;
    }

    setActivePhases(prev => {
      const withoutAll = prev.filter(p => p !== 'all');
      
      if (withoutAll.includes(phaseId)) {
        const result = withoutAll.filter(p => p !== phaseId);
        return result.length === 0 ? ['all'] : result;
      }
      
      return [...withoutAll, phaseId];
    });
  };

  const filteredCards = useMemo(() => {
    const allCards = Object.entries(cardLibData).map(([name, card]) => ({
      ...card,
      name,
      level: -1
    }));

    return allCards.filter(card => 
      ((card.type === 'sect' && card.category === activeSect) ||
      (card.type === 'side-jobs' && card.category === activeSideJob)) &&
      (activePhases.includes('all') || activePhases.includes(card.phase.toString()))
    );
  }, [activeSect, activeSideJob, activePhases]);

  const renderCardsByPhase = (phases: number[]) => {
    return phases.map(phase => {
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
              tail={
                <div className="card-tail">
                  <div>
                    {Math.max(
                      0,
                      (card.name === '锻体丹' || card.name === '还魂丹' || card.name === '锻体玄丹' ? 4 : (card.phase === 5 ? 6 : 8)) - 
                      (cardOperationLog.cards[card.name]?.count || 0)
                    )}
                  </div>
                </div>
              }
            />
          ))}
        </React.Fragment>
      );
    });
  };

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
              className={`filter-button ${activePhases.includes(tab.id) ? 'active' : ''}`}
              onClick={() => handlePhaseClick(tab.id)}
            >
              {tab.label}
            </button>
          ))}
          <label className="multi-select-label">
            <input
              type="checkbox"
              checked={isPhaseMultiSelect}
              onChange={(e) => setIsPhaseMultiSelect(e.target.checked)}
            />
            多选
          </label>
        </div>
      </div>

      <div className="cards-container">
        <div className="card-deck-grid">
          {activePhases.includes('all') ? (
            renderCardsByPhase([1, 2, 3, 4, 5])
          ) : (
            renderCardsByPhase(
              activePhases
                .map(phase => parseInt(phase))
                .sort((a, b) => a - b)
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default CardDeck;