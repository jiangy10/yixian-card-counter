import React, { useState } from 'react';
import './FloatingWindow.css';
import FloatingMatch from './components/FloatingMatch';
import FloatingDeck from './components/FloatingDeck';

const FloatingWindow: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'match' | 'deck'>('match');

  const handleClose = () => {
    if (window.electronAPI && window.electronAPI.closeFloatingWindow) {
      window.electronAPI.closeFloatingWindow();
    } else {
      console.warn('Close floating window API not available');
    }
  };

  return (
    <div className="floating-window">
      <div className="floating-header">
        <div className="floating-title">弈仙牌记牌器</div>
        <div className="floating-close-btn" onClick={handleClose}>×</div>
      </div>
      
      <div className="floating-tabs">
        <div 
          className={`floating-tab ${activeTab === 'match' ? 'active' : ''}`}
          onClick={() => setActiveTab('match')}
        >
          对局
        </div>
        <div 
          className={`floating-tab ${activeTab === 'deck' ? 'active' : ''}`}
          onClick={() => setActiveTab('deck')}
        >
          牌库
        </div>
      </div>

      <div className="floating-content">
        {activeTab === 'match' ? <FloatingMatch /> : <FloatingDeck />}
      </div>
    </div>
  );
};

export default FloatingWindow;
