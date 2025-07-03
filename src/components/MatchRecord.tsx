import React from 'react';
import PlayerSelector from './PlayerSelector';
import PlayerInfoContainer from './PlayerInfoContainer';
import TrackingCardContainer from './TrackingCardContainer';
import MatchHistoryContainer from './MatchHistoryContainer';
import { Player } from '../models/model';
import { Card } from '../models/model';
import './MatchRecord.css';

interface MatchRecordProps {
  players?: Player[];
  selectedPlayer?: Player;
  displayCards: Card[];
  trackingHeight: number;
  onPlayerSelect: (player: Player) => void;
  onMouseDown: (e: React.MouseEvent) => void;
}

const MatchRecord: React.FC<MatchRecordProps> = ({
  players,
  selectedPlayer,
  displayCards,
  trackingHeight,
  onPlayerSelect,
  onMouseDown,
}) => {
  if (!players || !selectedPlayer) {
    return <div className="match-record-loading">等待对战数据中...</div>;
  }

  return (
    <div className="match-record">
      <PlayerSelector 
        players={players} 
        onPlayerSelect={onPlayerSelect} 
      />
      <PlayerInfoContainer player={selectedPlayer} />
      <div className="container-wrapper">
        <div className="tracking-container" style={{ height: trackingHeight }}>
          <TrackingCardContainer cards={displayCards} />
        </div>
        <div 
          className="resizer"
          onMouseDown={onMouseDown}
        />
        <div className="history-container">
          <MatchHistoryContainer matchHistory={selectedPlayer?.match_history} />
        </div>
      </div>
    </div>
  );
};

export default MatchRecord;
