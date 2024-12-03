import React from 'react';
import './SidebarButtons.css';

const SidebarButtons = ({ currentView, setCurrentView }) => {

  const handleSettingsClick = () => {
    setCurrentView('settings');
  };

  return (
    <div className="sidebar-buttons">
      <button
        className={currentView === 'friends' ? 'active' : ''}
        onClick={() => setCurrentView('friends')}
      >
        친구
      </button>
      <button
        className={currentView === 'chatrooms' ? 'active' : ''}
        onClick={() => setCurrentView('chatrooms')}
      >
        채팅방
      </button>
      <button
        className={currentView === 'settings' ? 'active' : ''}
        onClick={handleSettingsClick}
      >
        설정
      </button>
    </div>
  );
};

export default SidebarButtons; 