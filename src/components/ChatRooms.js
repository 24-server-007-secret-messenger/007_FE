import React, { useState, useEffect } from 'react';
import './ChatRooms.css';
import PropTypes from 'prop-types';

function ChatRooms({ username, currentRoom, onJoinRoom }) {
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    // username이 비어 있으면 early return
    if (!username) {
      console.error('username이 필요합니다.');
      return;
    }

    // 참여한 채팅방 가져오기
    fetch('http://192.168.30.14:8000/chat/room_list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    })
      .then((response) => response.json())
      .then((data) => {
        // 응답 데이터를 처리하여 partner 목록을 채팅방으로 변환
        if (data.partners && Array.isArray(data.partners)) {
          const formattedRooms = data.partners.map((partner) => ({
            name: partner.username,
          }));
          setRooms(formattedRooms);
        } else {
          setRooms([]); // partner 정보가 없을 경우 빈 배열로 설정
        }
      })
      .catch((error) => {
        console.error('채팅방 목록을 가져오는 데 실패했습니다:', error);
        alert(error.message);
      });
  }, [username]); // username이 변경될 때마다 effect 실행

  return (
    <div className="chatrooms">
      <h3>내 채팅방 목록</h3>
      <ul className="room-list">
        {rooms.length > 0 ? (
          rooms.map((room, index) => (
            <li
              key={index}
              className={room.name === currentRoom ? 'active' : ''}
              onClick={() => onJoinRoom(room.name)}
            >
              {room.name}
            </li>
          ))
        ) : (
          <li>참여 중인 채팅방이 없습니다.</li>
        )}
      </ul>
    </div>
  );
}

ChatRooms.propTypes = {
  username: PropTypes.string.isRequired,
  currentRoom: PropTypes.string.isRequired,
  onJoinRoom: PropTypes.func.isRequired,
};

export default ChatRooms;
