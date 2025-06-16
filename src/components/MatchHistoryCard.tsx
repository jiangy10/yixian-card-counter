import React from 'react';
import { Card as CardType } from '../models/model';
import './MatchHistoryCard.css';

interface MatchHistoryCardProps {
  card: CardType;
}

const MatchHistoryCard: React.FC<MatchHistoryCardProps> = ({ card }) => {
  const imageType = card.type === 'side job' ? 'side-jobs' : card.type.replace(/\s+/g, '_');
  const isNormalAttack = card.name === '普通攻击';
  const imageSrc = isNormalAttack
    ? `${process.env.PUBLIC_URL}/images/普通攻击.png`
    : `${process.env.PUBLIC_URL}/images/${imageType}/${card.category}/${imageType === 'personal' ? '' : `${card.phase}/`}${card.name}${card.level + 1}.png`;

  return (
    <div className="match-history-card">
      <img 
        src={imageSrc}
        alt={card.name}
        className="card-image"
      />
    </div>
  );
};

export default MatchHistoryCard;
