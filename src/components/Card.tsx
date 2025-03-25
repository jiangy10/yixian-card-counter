import React from 'react';
import { Card as CardType } from '../models/model';
import './Card.css';

interface CardProps {
  card: CardType;
  isTracked?: boolean;
  inHistory?: boolean;
}

const LEVEL_COLORS = {
  2: 'rgb(180, 207, 127)', 
  3: 'rgb(123, 218, 221)',
  4: 'rgb(137, 115, 236)',
  5: 'rgb(247, 222, 121)'
};

const Card: React.FC<CardProps> = ({ 
  card, 
  isTracked = false, 
  inHistory = false
}) => {
  const borderColor = LEVEL_COLORS[card.phase as keyof typeof LEVEL_COLORS] || '#ffffff';
  
  const cardClass = inHistory ? 'card-item history-card' : 'card-item';

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
          backgroundImage: `url(/images/${card.type}/${card.category}/${card.name}.png)`
        }}
      />
      <div className="card-name">{card.name}</div>
    </div>
  );
};

export default Card; 