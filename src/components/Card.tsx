import React, { useState } from 'react';
import { Card as CardType } from '../models/model';
import { LEVEL_COLORS } from '../constants/colors';
import { useTracking } from '../contexts/TrackingContext';
import './Card.css';

interface CardProps {
  card: CardType;
  isTracked?: boolean;
  inHistory?: boolean;
  tail?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ 
  card, 
  isTracked = false, 
  inHistory = false,
  tail
}) => {
  const borderColor = LEVEL_COLORS[card.phase as keyof typeof LEVEL_COLORS] || '#ffffff';
  const cardClass = inHistory ? 'card-item history-card' : 'card-item';
  const imageType = card.type === 'side job' ? 'side-jobs' : card.type.replace(/\s+/g, '_');
  const isNormalAttack = card.name === '普通攻击';

  return (
    <div 
      className={cardClass}
      style={{
        borderColor: borderColor,
        position: 'relative'
      }}
    >
      {card.level > -1 && <div className="card-level">Lv.{card.level + 1}</div>}
      <div 
        className="card-image"
        style={{
          backgroundImage: isNormalAttack
            ? `url(${process.env.PUBLIC_URL}/images/普通攻击.png)`
            : `url(${process.env.PUBLIC_URL}/images/${imageType}/${card.category}/${imageType === 'personal' ? '' : `${card.phase}/`}${card.name}.png)`
        }}
      />
      <div className="card-footer">
        <div className="card-name">{card.name}</div>
        {tail && <div className="card-tail">{tail}</div>}
      </div>
    </div>
  );
};

export const TrackButton: React.FC<{ card: CardType }> = ({ card }) => {
  const { trackedCards, updateTracking } = useTracking();
  const isTracking = trackedCards[card.name] || false;
  const [isUpdating, setIsUpdating] = useState(false);

  const handleTrackingClick = async () => {
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      await updateTracking(card.name, !isTracking);
    } catch (error) {
      console.error('Error updating tracking card:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const buttonStyle = {
    backgroundColor: 'transparent',
    color: isTracking ? '#3498db' : '#2ecc71',
    border: `1.5px solid ${isTracking ? '#3498db' : '#2ecc71'}`,
    borderRadius: '5px',
    cursor: isUpdating ? 'wait' : 'pointer',
    fontSize: '12px',
    transition: 'all 0.3s ease',
    opacity: isUpdating ? 0.7 : 1,
  };

  return (
    <button 
      onClick={handleTrackingClick}
      style={buttonStyle}
      disabled={isUpdating}
    >
      {isUpdating ? 'Updating...' : (isTracking ? '追踪中' : '追踪')}
    </button>
  );
};

export const RecommendLabel: React.FC = () => {
  return (
    <span style={{
      color: '#4CAF50',
      fontWeight: 'bold',
      fontSize: '12px',
      marginRight: '8px'
    }}>
      推荐
    </span>
  );
};

export default Card; 