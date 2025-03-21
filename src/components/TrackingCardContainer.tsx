import React, { useState } from 'react';
import './TrackingCardContainer.css';

interface Tab {
  id: string;
  label: string;
}

const tabs: Tab[] = [
  { id: 'all', label: '全部' },
  { id: 'sect', label: '门派' },
  { id: 'subclass', label: '副职' },
  { id: 'opportunity', label: '机缘' }
];

const TrackingCardContainer: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');

  return (
    <div className="tracking-card-container">
      <h2 className="tracking-card-title">追踪中的卡牌</h2>
      
      <div className="tab-container">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="list-container">
        <div className="tracking-card-scroll-view">
          {/* 这里后续会添加卡牌列表 */}
        </div>
      </div>
    </div>
  );
};

export default TrackingCardContainer; 