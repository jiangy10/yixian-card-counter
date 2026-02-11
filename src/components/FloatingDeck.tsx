import React from 'react';
import FloatingDeckHandSection from './FloatingDeckHandSection';
import FloatingDeckTrackingContainer from './FloatingDeckTrackingContainer';
import FloatingDeckHandCardContainer from './FloatingDeckHandCardContainer';

const FloatingDeck: React.FC = () => {
  return (
    <div className="floating-deck-container">
      <FloatingDeckHandSection />
      <FloatingDeckTrackingContainer />
      <FloatingDeckHandCardContainer />
    </div>
  );
};

export default FloatingDeck;

