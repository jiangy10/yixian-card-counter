import React from 'react';
import './PlayerInfoContainer.css';
import { Player, PlayerInfoContainerProps } from '../models/model';

const PlayerInfoContainer: React.FC<PlayerInfoContainerProps> = ({ player }) => {
  if (!player) {
    return (
      <div className="player-info-container">
        <div className="player-information">
          <div className="avatar" />
          <div className="player-info-label-container">
            <div className="username-label">请选择玩家</div>
            <div className="cultivation-label">-</div>
            <div className="health-label">生命上限: -</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="player-info-container">
      <div className="player-information">
        <div className="avatar" />
        <div className="player-info-label-container">
          <div className="username-label">{player.player_username}</div>
          <div className="player-info-label">修为: {player.cultivation}</div>
          <div className="player-info-label">生命上限: {player.health}</div>
          <div className="player-info-label">命元: {player.destiny}</div>
        </div>
      </div>
    </div>
  );
};

export default PlayerInfoContainer; 