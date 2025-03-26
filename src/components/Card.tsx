import React from 'react';
import { Card as CardType } from '../models/model';
import { LEVEL_COLORS } from '../constants/colors';
import './Card.css';

interface CardProps {
  card: CardType;
  isTracked?: boolean;
  inHistory?: boolean;
}

const Card: React.FC<CardProps> = ({ 
  card, 
  isTracked = false, 
  inHistory = false
}) => {
  const borderColor = LEVEL_COLORS[card.phase as keyof typeof LEVEL_COLORS] || '#ffffff';
  
  const cardClass = inHistory ? 'card-item history-card' : 'card-item';
  const imageType = card.type === 'side job' ? 'side-jobs' : card.type.replace(/\s+/g, '_');

  return (
    <div 
      className={cardClass}
      style={{
        borderColor: borderColor
      }}
    >
      <div className="card-level">Lv.{card.level}</div> 
      <div 
        className="card-image"
        style={{
          backgroundImage: `url(/images/${imageType}/${card.category}/${card.name}.png)`
        }}
      />
      <div className="card-name">{card.name}</div>
    </div>
  );
};

export default Card; 