import React from 'react';
import { MatchHistory as MatchHistoryType, Card as CardType } from '../models/model';
import Card from './Card';
import './MatchHistory.css';

interface MatchHistoryItemProps {
  round: string;
  history: MatchHistoryType & { processedCards: CardType[] };
  isExpanded: boolean;
  onRoundClick: (roundNumber: number) => void;
}

const MatchHistory: React.FC<MatchHistoryItemProps> = ({
  round,
  history,
  isExpanded,
  onRoundClick,
}) => {
  const roundNumber = parseInt(round);
  const isWin = history.destiny_diff >= 0;

  return (
    <div key={round} className="match-history-item">
      <div 
        className="match-history-header"
        onClick={() => onRoundClick(roundNumber)}
      >
        <span className="round-label">第{roundNumber}回合</span>
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
};

export default MatchHistory; 