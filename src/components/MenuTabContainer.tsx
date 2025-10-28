import React, { useState } from 'react';
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
  const [floatingWindowStatus, setFloatingWindowStatus] = useState<string>('');

  const handleFloatingWindow = async () => {
    try {
      if (window.electronAPI && window.electronAPI.findAndCreateFloatingWindow) {
        const result = await window.electronAPI.findAndCreateFloatingWindow();
        setFloatingWindowStatus(result.message);
        
        // clear status message
        setTimeout(() => {
          setFloatingWindowStatus('');
        }, 3000);
      } else {
        setFloatingWindowStatus('floating window functionality unavailable');
        setTimeout(() => {
          setFloatingWindowStatus('');
        }, 3000);
      }
    } catch (error) {
      console.error('error creating floating window:', error);
      setFloatingWindowStatus('error creating floating window');
      setTimeout(() => {
        setFloatingWindowStatus('');
      }, 3000);
    }
  };

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
      {/* TODO： developing */}
      <button
        className="menu-tab-button floating-window-btn"
        onClick={handleFloatingWindow}
      >
        悬浮窗
      </button>
      {floatingWindowStatus && (
        <div className="floating-window-status">
          {floatingWindowStatus}
        </div>
      )}
    </div>
  );
};

export default MenuTabContainer; 