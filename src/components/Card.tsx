import React from 'react';
import { Card as CardType } from '../models/model';
import { LEVEL_COLORS, THEME_COLORS } from '../constants/colors';
import './Card.css';

interface CardProps {
  card: CardType;
  isTracked: boolean;
  onTrackToggle: (cardName: string) => void;
}

const Card: React.FC<CardProps> = ({ card, isTracked, onTrackToggle }) => {
  const borderColor = LEVEL_COLORS[card.phase as keyof typeof LEVEL_COLORS] || THEME_COLORS.text.primary;

  return (
    <div 
      className="card-item"
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