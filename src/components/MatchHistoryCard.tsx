import React, { useState } from 'react';
import { Card as CardType } from '../models/model';
import { useTracking } from '../contexts/TrackingContext';
import './MatchHistoryCard.css';

interface MatchHistoryCardProps {
  card: CardType;
}

const MatchHistoryCard: React.FC<MatchHistoryCardProps> = ({ card }) => {
  const { trackedCards, updateTracking } = useTracking();
  const isTracking = trackedCards[card.name] || false;
  const [isUpdating, setIsUpdating] = useState(false);

  const imageType = card.type === 'side job' ? 'side-jobs' : card.type.replace(/\s+/g, '_');
  const isNormalAttack = card.name === '普通攻击';
  const imageSrc = isNormalAttack
    ? `${process.env.PUBLIC_URL}/images/普通攻击1.png`
    : `${process.env.PUBLIC_URL}/images/${imageType}/${card.category}/${imageType === 'personal' ? '' : `${card.phase}/`}${card.name}${card.level + 1}.png`;

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
    marginTop: '8px',
  };

  return (
    <div className="match-history-card">
      <img 
        src={imageSrc}
        alt={card.name}
        className="match-history-card-image"
      />
      <button 
        onClick={handleTrackingClick}
        style={buttonStyle}
        disabled={isUpdating}
      >
        {isUpdating ? 'Updating...' : (isTracking ? '追踪中' : '追踪')}
      </button>
    </div>
  );
};

export default MatchHistoryCard;
