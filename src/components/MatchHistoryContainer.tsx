import React, { useState, useEffect, useCallback } from 'react';
import { MatchHistory, Card as CardType, UsedCard } from '../models/model';
import Card from './Card';
import cardLibData from '../data/card_lib.json';
import specialCardLibData from '../data/special_card_lib.json';
import { usePlayer } from '../contexts/PlayerContext';
import MatchHistoryItem from './MatchHistory';
import './MatchHistoryContainer.css';

interface MatchHistoryContainerProps {
  matchHistory: Record<number, MatchHistory> | undefined;
}

// Move processCards function outside the component
const processCards = (history: MatchHistory) => {
  const detectedSideJobs = new Set<string>();
  
  const processedCards = history.used_card.map(usedCard => {
    const cardInfo = (cardLibData as Record<string, Omit<CardType, 'level'>>)[usedCard.name] || 
                    (specialCardLibData as Record<string, Omit<CardType, 'level'>>)[usedCard.name];
    if (cardInfo) {
      const card: CardType = {
        ...cardInfo,
        level: usedCard.level
      };
      // Detect side job cards
      if (cardInfo.type === 'side-jobs') {
        detectedSideJobs.add(cardInfo.category);
      }
      return card;
    }

    return {
      name: usedCard.name,
      level: usedCard.level,
      phase: 2,
      type: 'unknown',
      category: 'unknown',
      recommend: false
    } as CardType;
  });

  return { processedCards, detectedSideJobs };
};

const MatchHistoryContainer: React.FC<MatchHistoryContainerProps> = ({ matchHistory }) => {
  const [selectedRound, setSelectedRound] = useState<number | null>(() => {
    if (matchHistory && Object.keys(matchHistory).length > 0) {
      return Math.max(...Object.keys(matchHistory).map(Number));
    }
    return null;
  });
  const [processedHistory, setProcessedHistory] = useState<Record<number, MatchHistory & { processedCards: CardType[] }>>({});
  const { updateSideJobs, resetSideJobs } = usePlayer();

  useEffect(() => {
    if (!matchHistory) {
      resetSideJobs();
      setProcessedHistory({});
      return;
    }

    const processed: Record<number, MatchHistory & { processedCards: CardType[] }> = {};
    const allSideJobs = new Set<string>();

    Object.entries(matchHistory).forEach(([round, history]) => {
      const roundNumber = parseInt(round);
      const { processedCards, detectedSideJobs } = processCards(history);
      
      processed[roundNumber] = {
        ...history,
        processedCards
      };

      detectedSideJobs.forEach(job => allSideJobs.add(job));
    });

    setProcessedHistory(processed);

    // Update player's side jobs information
    if (allSideJobs.size > 0) {
      updateSideJobs(Array.from(allSideJobs));
    } else {
      resetSideJobs();
    }
  }, [matchHistory]);

  const handleRoundClick = useCallback((round: number) => {
    setSelectedRound(prev => prev === round ? null : round);
  }, []);

  if (!matchHistory || Object.keys(matchHistory).length === 0) {
    return (
      <div className="match-history-container">
        <h2 className="match-history-title">战绩</h2>
        <div className="match-history-scroll-view">
          <div className="match-history-list">
            <div className="match-history-item">
              <div className="match-history-header">
                <span className="round-label">暂无战绩记录</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="match-history-container">
      <h2 className="match-history-title">战绩</h2>
      <div className="match-history-list">
        <div className="match-history-scroll-view">
          {Object.entries(processedHistory)
            .sort(([roundA], [roundB]) => parseInt(roundB) - parseInt(roundA))
            .map(([round, history]) => (
              <MatchHistoryItem
                key={round}
                round={round}
                history={history}
                isExpanded={selectedRound === parseInt(round)}
                onRoundClick={handleRoundClick}
              />
            ))}
        </div>
      </div>
    </div>
  );
};

export default MatchHistoryContainer; 