import React from 'react';
import { usePlayer } from '../contexts/PlayerContext';
import { Card as CardType } from '../models/model';
import Card from './Card';
import './CardDeck.css';

const CardDeck: React.FC = () => {
  const { remainingCards } = usePlayer();

  if (!remainingCards || remainingCards.length === 0) {
    return (
      <div className="card-deck-container">
        <div className="card-deck-empty">
          暂无剩余牌库信息
        </div>
      </div>
    );
  }

  return (
    <div className="card-deck-container">
      <h2 className="card-deck-title">剩余牌库</h2>
      <div className="card-deck-grid">
        {remainingCards.map((card: CardType) => (
          <Card
            key={`${card.name}-${card.level}`}
            card={card}
            inHistory={false}
            showRecommend={true}
          />
        ))}
      </div>
    </div>
  );
};

export default CardDeck;