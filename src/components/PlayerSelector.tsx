import React from 'react';
import './PlayerSelector.css';
import { Player, PlayerSelectorProps } from '../models/model';

const PlayerSelector: React.FC<PlayerSelectorProps> = ({ players, onPlayerSelect }) => {
  return (
    <div className="player-selector-container">
      <div className="player-buttons">
        {players.map((player) => (
          <button
            key={player.player_username}
            className="player-button"
            onClick={() => onPlayerSelect(player)}
          >
            {player.player_username}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PlayerSelector; 