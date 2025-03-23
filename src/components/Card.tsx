import React from 'react';
import { Card as CardType } from '../models/model';
import { LEVEL_COLORS } from '../constants/colors';
import './Card.css';

interface CardProps {
  card: CardType;
  isTracked: boolean;
  count?: number;
  onTrackToggle: (cardName: string) => void;
}

const Card: React.FC<CardProps> = ({ card, isTracked, count, onTrackToggle }) => {
  const borderColor = LEVEL_COLORS[card.phase as keyof typeof LEVEL_COLORS] || '#ffffff';

  return (
    <div 
      className="card-item"
      style={{
        borderColor: borderColor
      }}
    >
      <div className="card-level">Lv.{card.phase}</div>
      <div 
        className="card-image"
        style={{
          backgroundImage: `url(/images/${card.name}.png)`
        }}
      />
      <div className="card-name">{card.name}</div>
      {isTracked && count !== undefined && (
        <div className="card-count">Count: {count}</div>
      )}
      {/* <button
        className={`track-button ${isTracked ? 'tracked' : ''}`}
        onClick={() => onTrackToggle(card.name)}
      >
        {isTracked ? 'Untrack' : 'Track'}
      </button> */}
    </div>
  );
};

export default Card; 