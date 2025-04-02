import React from 'react';
import { Card as CardType } from '../models/model';
import { LEVEL_COLORS } from '../constants/colors';
import './Card.css';

interface CardProps {
  card: CardType;
  isTracked?: boolean;
  inHistory?: boolean;
  showRecommend?: boolean;
}

const Card: React.FC<CardProps> = ({ 
  card, 
  isTracked = false, 
  inHistory = false,
  showRecommend = false
}) => {
  const borderColor = LEVEL_COLORS[card.phase as keyof typeof LEVEL_COLORS] || '#ffffff';
  
  const cardClass = inHistory ? 'card-item history-card' : 'card-item';
  const imageType = card.type === 'side job' ? 'side-jobs' : card.type.replace(/\s+/g, '_');

  const handleTrackingClick = () => {
    console.log(`card ${card.name} isTracking:`, card.isTracking);
  };

  return (
    <div 
      className={cardClass}
      style={{
        borderColor: borderColor,
        position: 'relative'
      }}
    >
      {card.level > 0 && <div className="card-level">Lv.{card.level}</div>}
      <div 
        className="card-image"
        style={{
          backgroundImage: `url(/images/${imageType}/${card.category}/${card.phase}/${card.name}.png)`
        }}
      />
      <div className="card-name">{card.name}</div>
      {showRecommend && card.recommend && <div className="card-recommend">推荐</div>}
      <button 
        onClick={handleTrackingClick}
        style={{
          position: 'absolute',
          right: '5px',
          top: '5px',
          padding: '4px 8px',
          backgroundColor: '#4a4a4a',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        追踪
      </button>
    </div>
  );
};

export default Card; 