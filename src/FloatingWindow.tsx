import React from 'react';
import './FloatingWindow.css';

const FloatingWindow: React.FC = () => {
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
      
      <div className="floating-content">
        content here
      </div>
    </div>
  );
};

export default FloatingWindow;

