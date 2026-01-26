import React from 'react';
import FloatingDeckTrackingContainer from './FloatingDeckTrackingContainer';
import FloatingDeckHandCardContainer from './FloatingDeckHandCardContainer';

const FloatingDeck: React.FC = () => {
  return (
    <div className="floating-deck-container">
      <FloatingDeckTrackingContainer />
      <FloatingDeckHandCardContainer />
    </div>
  );
};

export default FloatingDeck;

