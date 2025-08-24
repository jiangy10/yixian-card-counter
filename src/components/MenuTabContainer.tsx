import React from 'react';
import './MenuTabContainer.css';

interface MenuTabContainerProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const tabs = [
  {id: 'match-record', label: '对战记录'},
  {id: 'card-deck', label: '剩余牌库'},
  {id: 'card-library', label: '管理追踪卡牌'}
]

const MenuTabContainer: React.FC<MenuTabContainerProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="menu-tab-container">
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`menu-tab-button ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default MenuTabContainer; 