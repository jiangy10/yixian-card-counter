import React, { useState, useEffect } from 'react';
import { Card as CardType } from '../models/model';
import { LEVEL_COLORS } from '../constants/colors';
import './Card.css';

interface CardProps {
  card: CardType;
  isTracked?: boolean;
  inHistory?: boolean;
  showRecommend?: boolean;
}

interface TrackingCard {
  name: string;
  tracking: boolean;
}

interface TrackingCards {
  [key: string]: TrackingCard;
}

const Card: React.FC<CardProps> = ({ 
  card, 
  isTracked = false, 
  inHistory = false,
  showRecommend = false
}) => {
  const [isTracking, setIsTracking] = useState(card.isTracking || false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Check tracking status on initialization
  useEffect(() => {
    const checkTrackingStatus = async () => {
      if (typeof window.electron === 'undefined') return;

      try {
        const userDataPath = await window.electron.ipcRenderer.invoke('getUserDataPath');
        const trackingFilePath = `${userDataPath}/tracking_cards.json`;
        const content = await window.electron.ipcRenderer.invoke('readFile', trackingFilePath);
        const trackingCards: TrackingCards = JSON.parse(content);
        
        const isCurrentlyTracked = !!trackingCards[card.name];
        setIsTracking(isCurrentlyTracked);
        card.isTracking = isCurrentlyTracked;
      } catch (error) {
        console.error('Error checking tracking status:', error);
      }
    };

    checkTrackingStatus();
  }, [card]);

  const borderColor = LEVEL_COLORS[card.phase as keyof typeof LEVEL_COLORS] || '#ffffff';
  const cardClass = inHistory ? 'card-item history-card' : 'card-item';
  const imageType = card.type === 'side job' ? 'side-jobs' : card.type.replace(/\s+/g, '_');

  const handleTrackingClick = async () => {
    if (isUpdating) return;
    
    console.log(`Tracking status of card ${card.name}:`, isTracking);
    
    // Check if in Electron environment
    if (typeof window.electron === 'undefined') {
      console.error('Not running in Electron environment');
      return;
    }

    setIsUpdating(true);
    try {
      // Get user data directory
      const userDataPath = await window.electron.ipcRenderer.invoke('getUserDataPath');
      const trackingFilePath = `${userDataPath}/tracking_cards.json`;
      
      // Read existing tracking card data
      let trackingCards: TrackingCards = {};
      try {
        const content = await window.electron.ipcRenderer.invoke('readFile', trackingFilePath);
        trackingCards = JSON.parse(content);
        console.log('Current tracking card data:', trackingCards);
      } catch (error) {
        console.log('No existing tracking card file found, creating a new one');
      }

      // Update tracking status
      const newTrackingState = !isTracking;
      if (newTrackingState) {
        trackingCards[card.name] = {
          name: card.name,
          tracking: true
        };
      } else {
        delete trackingCards[card.name];
      }

      console.log('Data prepared for writing:', trackingCards);

      // Write updated data
      try {
        await window.electron.ipcRenderer.invoke('writeFile', trackingFilePath, JSON.stringify(trackingCards, null, 2));
        console.log('Tracking card update successful:', trackingCards);
        // Update state
        setIsTracking(newTrackingState);
        card.isTracking = newTrackingState;
      } catch (error) {
        console.error('Failed to update tracking card:', error);
      }
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
      <div style={{ display: 'flex', alignItems: 'center', flex: 'auto', margin: '5px' }}>
        <div className="card-name">{card.name}</div>
        {showRecommend && card.recommend && <span style={recommendStyle}>推荐</span>}
      </div>
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

export default Card; 