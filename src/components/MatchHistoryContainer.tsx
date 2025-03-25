import React, { useState, useEffect } from 'react';
import { MatchHistory, Card as CardType, UsedCard } from '../models/model';
import Card from './Card';
import cardLibData from '../data/card_lib.json';
import './MatchHistoryContainer.css';

interface MatchHistoryContainerProps {
  matchHistory: Record<number, MatchHistory> | undefined;
}

const MatchHistoryContainer: React.FC<MatchHistoryContainerProps> = ({ matchHistory }) => {
  const [selectedRound, setSelectedRound] = useState<number | null>(null);
  const [processedHistory, setProcessedHistory] = useState<Record<number, MatchHistory & { processedCards: CardType[] }>>({});

  useEffect(() => {
    if (matchHistory) {
      const processed: Record<number, MatchHistory & { processedCards: CardType[] }> = {};
      
      Object.entries(matchHistory).forEach(([round, history]) => {
        const roundNumber = parseInt(round);
        
        const processedCards = history.used_card.map(usedCard => {
          const cardInfo = (cardLibData as Record<string, Omit<CardType, 'level'>>)[usedCard.name];
          if (cardInfo) {
            const card: CardType = {
              ...cardInfo,
              level: usedCard.level
            };
            return card;
          }

          return {
            name: usedCard.name,
            level: usedCard.level,
            phase: 2,
            type: 'unknown',
            category: 'unknown'
          } as CardType;
        });
        
        processed[roundNumber] = {
          ...history,
          processedCards
        };
      });
      
      setProcessedHistory(processed);
      
      if (Object.keys(processed).length > 0 && selectedRound === null) {
        setSelectedRound(parseInt(Object.keys(processed)[0]));
      }
    }
  }, [matchHistory]);

  const handleRoundClick = (round: number) => {
    setSelectedRound(selectedRound === round ? null : round);
  };

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
            .sort(([roundA], [roundB]) => parseInt(roundA) - parseInt(roundB))
            .map(([round, history]) => {
            const roundNumber = parseInt(round);
            const isExpanded = selectedRound === roundNumber;
            const isWin = history.destiny_diff >= 0;

            return (
              <div key={round} className="match-history-item">
                <div 
                  className="match-history-header"
                  onClick={() => handleRoundClick(roundNumber)}
                >
                  <span className="round-label">第{-roundNumber}回合</span>
                  <span className={`result-label ${isWin ? 'win' : 'lose'}`}>
                    {isWin ? '胜' : '负'}
                  </span>
                </div>
                
                {isExpanded && (
                  <div className="match-history-content">
                    <div className="match-info-container">
                      <div className="match-info-label">修为：{history.cultivation}</div>
                      <div className="match-info-label">生命上限：{history.health}</div>
                      <div className="match-info-label">命元：{history.destiny}({history.destiny_diff})</div>
                      <div className="match-info-label">对手：{history.opponent_username}</div>
                    </div>
                    
                    <div className="used-cards-container">
                      {history.processedCards.map((card, index) => (
                        <Card
                          key={`${card.name}-${index}`}
                          card={card}
                          inHistory={true}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MatchHistoryContainer; 