import React, { useState } from 'react';
import './JoinPrivateRoom.css';
import PropTypes from 'prop-types';

function JoinPrivateRoom({ onJoin }) {
  const [roomName, setRoomName] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');

  const handleJoin = async (e) => {
    e.preventDefault();
    if (roomName.trim() === '' || password.trim() === '' || nickname.trim() === '') {
      alert('모든 필드를 입력하세요.');
      return;
    }
    try {
      const response = await fetch('http://192.168.30.14:8000/chat/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomName: roomName.trim(), password: password.trim(), nickname: nickname.trim() }),
      });

      if (!response.ok) {
        throw new Error('비공개 채팅방 입장 실패');
      }

      const data = await response.json();
      onJoin(data);
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="join-private-room">
      <h3>비공개 채팅방 입장</h3>
      <form onSubmit={handleJoin}>
        <input
          type="text"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          placeholder="채팅방 번호"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="비밀번호"
          required
        />
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="닉네임"
          required
        />
        <button type="submit">입장</button>
      </form>
    </div>
  );
}

JoinPrivateRoom.propTypes = {
  onJoin: PropTypes.func.isRequired,
};

export default JoinPrivateRoom; 