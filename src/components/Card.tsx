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

  const buttonStyle = {
    backgroundColor: 'transparent',
    color: card.isTracking ? '#3498db' : '#2ecc71',
    border: `1.5px solid ${card.isTracking ? '#3498db' : '#2ecc71'}`,
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '12px',
    transition: 'all 0.3s ease',
  };

  const recommendStyle = {
    color: '#4CAF50',
    fontWeight: 'bold',
    fontSize: '12px',
    marginLeft: '8px'
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
      <div style={{ display: 'flex', alignItems: 'center',flex: 'auto', margin: '5px' }}>
        <div className="card-name">{card.name}</div>
        {showRecommend && card.recommend && <span style={recommendStyle}>推荐</span>}
      </div>
      <button 
        onClick={handleTrackingClick}
        style={buttonStyle}
      >
        {card.isTracking ? '追踪中' : '追踪'}
      </button>
      
    </div>
  );
};

export default Card; 