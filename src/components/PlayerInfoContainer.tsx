import React from 'react';
import { Player } from '../models/model';
import { usePlayer } from '../contexts/PlayerContext';
import './PlayerInfoContainer.css';

const SIDE_JOB_NAMES: Record<string, string> = {
  'elixirist': '炼丹师',
  'fuluist': '符咒师',
  'formation-master': '阵法师',
  'painter': '画师',
  'musician': '琴师',
  'plant-master': '灵植师',
  'fortune-teller': '命理师',
};

interface PlayerInfoContainerProps {
  player: Player;
}

const PlayerInfoContainer: React.FC<PlayerInfoContainerProps> = ({ player }) => {
  const { sideJobs } = usePlayer();
  return (
    <div className="player-info-container">
      <div className="player-information">
        <div className="player-info-label-container">
          <img src={`${process.env.PUBLIC_URL}/images/avatars/${player.character}.png`} alt={player.character} className="character-avatar"/>
          <span className="username-label">{player.player_username}</span>
          <span className="player-info-label">修为：{player.cultivation}</span>
          <span className="player-info-label">生命上限：{player.health}</span>
          {player.physique && <span className="player-info-label">体魄：{player.physique}</span>}
          <span className="player-info-label">命元：{player.destiny}</span>
          <span className="player-info-label">副职：{sideJobs && sideJobs.length > 0 ? sideJobs.map(job => SIDE_JOB_NAMES[job] || job).join('、') : '未知'}</span>
        </div>
      </div>
    </div>
  );
};

export default PlayerInfoContainer; 