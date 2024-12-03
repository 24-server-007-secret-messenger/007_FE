import React, { useState } from 'react';
import './Sidebar.css';
import Settings from './components/Settings';

function Sidebar({ rooms, currentRoom, onJoinRoom, onCreateRoom }) {
  const [newRoom, setNewRoom] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleCreateRoom = (e) => {
    e.preventDefault();
    if (newRoom.trim() === '') return;
    onCreateRoom(newRoom);
    setNewRoom('');
  };

  const toggleDarkMode = () => {
    setIsDarkMode(prevMode => !prevMode);
    document.body.classList.toggle('dark-mode', !isDarkMode);
  };

  return (
    <div className="sidebar">
      <h3>채팅방 목록</h3>
      <ul className="room-list">
        {rooms.map((room, index) => (
          <li
            key={index}
            className={room === currentRoom ? 'active' : ''}
            onClick={() => onJoinRoom(room)}
          >
            {room}
          </li>
        ))}
      </ul>
      <form onSubmit={handleCreateRoom} className="create-room-form">
        <input
          type="text"
          value={newRoom}
          onChange={(e) => setNewRoom(e.target.value)}
          placeholder="새 채팅방 이름"
        />
        <button type="submit">생성</button>
      </form>
      <button onClick={() => setShowSettings(!showSettings)}>
        설정
      </button>
      {showSettings && <Settings isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />}
    </div>
  );
}

export default Sidebar; 