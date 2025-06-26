import React from 'react';
import './ManageTrackingContainer.css';

interface ManageTrackingContainerProps {
  onManageClick: () => void;
}

const ManageTrackingContainer: React.FC<ManageTrackingContainerProps> = ({ onManageClick }) => {
  return (
    <div className="manage-tracking-container">
      <button className="manage-tracking-button" onClick={onManageClick}>
        管理追踪卡牌
      </button>
      <button className="manage-tracking-button" onClick={onManageClick}>
        牌库
      </button>
    </div>
  );
};

export default ManageTrackingContainer; 