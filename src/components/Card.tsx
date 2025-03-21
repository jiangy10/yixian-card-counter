import React from 'react';
import { Card as CardType } from '../models/model';
import './Card.css';

interface CardProps {
  card: CardType;
  isTracked: boolean;
  count?: number;
  onTrackToggle: (cardName: string) => void;
}

const Card: React.FC<CardProps> = ({ card, isTracked, count, onTrackToggle }) => {
  return (
    <div className="card-item">
      <div className="card-info">
        <div className="card-name">{card.name}</div>
        <div className="card-type">{card.type}</div>
        <div className="card-phase">Phase: {card.phase}</div>
        {isTracked && count !== undefined && (
          <div className="card-count">Count: {count}</div>
        )}
      </div>
      <button
        className={`track-button ${isTracked ? 'tracked' : ''}`}
        onClick={() => onTrackToggle(card.name)}
      >
        {isTracked ? 'Untrack' : 'Track'}
      </button>
    </div>
  );
};

export default Card; 