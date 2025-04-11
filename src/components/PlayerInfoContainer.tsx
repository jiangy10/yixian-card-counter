import React from 'react';
import { Player } from '../models/model';
import { usePlayer } from '../contexts/PlayerContext';
import './PlayerInfoContainer.css';

interface PlayerInfoContainerProps {
  player: Player;
}

const PlayerInfoContainer: React.FC<PlayerInfoContainerProps> = ({ player }) => {
  const { sideJobs } = usePlayer();

  return (
    <div className="player-info-container">
      <div className="player-information">
        <div className="player-info-label-container">
          <span className="username-label">{player.player_username}</span>
          <span className="player-info-label">修为：{player.cultivation}</span>
          <span className="player-info-label">生命上限：{player.health}</span>
          <span className="player-info-label">命元：{player.destiny}</span>
          <span className="player-info-label">副职：{sideJobs && sideJobs.length > 0 ? sideJobs.join('、') : '未知'}</span>
        </div>
      </div>
    </div>
  );
};

export default PlayerInfoContainer; 