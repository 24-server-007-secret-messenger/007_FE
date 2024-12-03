import React, { useState, useEffect, } from 'react';
import io from 'socket.io-client';
import './App.css';
import SidebarButtons from './components/SidebarButtons';
import ChatRooms from './components/ChatRooms';
import FriendsList from './components/FriendsList';
import Settings from './components/Settings';
import ChatRoom from './components/ChatRoom';

const socket = io('http://192.168.30.14:8001');

// forceUpdate 리듀서 함수 정의


function App() {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedin, setIsLoggedin] = useState(false);
  const [currentView, setCurrentView] = useState('chatrooms');
  const [room, setRoom] = useState('');
  const [rooms, setRooms] = useState([]);
  const [chatHistory, setChatHistory] = useState({});
  const [friends] = useState([]);
  const [username, setUsername] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // forceUpdate 상태를 관리하기 위한 useReducer


  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    try {
      const response = await fetch('http://192.168.30.14:8000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, password }),
      });
      console.log('로그인 응답:', response);
      console.log('username:', username);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || '로그인 실패');
      }

      const data = await response.json();
      setUsername(data.username);
      setIsLoggedin(true);
      setRoom('일반');
      socket.emit('joinRoom', { username: data.username, room: '일반', isPrivate: false });
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  // 로그아웃 함수
  const handleLogout = () => {
    setIsLoggedin(false);
    setUsername('');
    setRoom('');
    socket.emit('leaveRoom', { username, room });
  };



  useEffect(() => {
    socket.on('roomList', (roomList) => {
      console.log('받은 채팅방 목록:', roomList);
      if (Array.isArray(roomList)) {
        setRooms(roomList);
      } else {
        console.error('roomList가 배열이 아닙니다:', roomList);
        setRooms([]);
      }
    });

    socket.on('chatHistory', (history) => {
      console.log('받은 채팅 기록:', history);
      if (Array.isArray(history)) {
        setChatHistory((prevHistory) => ({
          ...prevHistory,
          [room]: history,
        }));
      } else {
        console.error('chatHistory가 배열이 아닙니다:', history);
      }
    });

    socket.on('receiveMessage', (msg) => {
      console.log('받은 메시지:', msg);
      if (room && typeof msg === 'object' && msg.sender && msg.message) {
        setChatHistory((prevHistory) => {
          const updatedHistory = { ...prevHistory };
          if (!updatedHistory[room]) {
            updatedHistory[room] = [];
          }
          updatedHistory[room].push(msg);
          return updatedHistory;
        });
// 새로운 메시지가 오면 강제 리렌더링
      } else {
        console.error('잘못된 메시지 형식:', msg);
      }
    });

    socket.on('successMessage', (message) => {
      console.log('성공 메시지:', message);
    });

    socket.on('errorMessage', (message) => {
      console.error('에러 메시지:', message);
      setErrorMessage(message);
    });

    return () => {
      socket.off('roomList');
      socket.off('chatHistory');
      socket.off('receiveMessage');
      socket.off('successMessage');
      socket.off('errorMessage');
    };
  }, [room, isLoggedin]);

  const handleSelectFriend = (friendUsername) => {
    setCurrentView('friends');
    setRoom(friendUsername);
    socket.emit('joinRoom', { username, room: friendUsername, isPrivate: true });
  };

  const handleSelectChatroom = (friendUsername) => {
    setCurrentView('chatrooms');
    setRoom(friendUsername);
    socket.emit('joinRoom', { username, room: friendUsername, isPrivate: true });
  };

  console.log('rooms:', rooms);
  console.log('chatHistory:', chatHistory);
  console.log('username:', username);

  return (
    <div className="App">
      <div className="container">
        <div className="sidebar">
          {isLoggedin ? (
            <SidebarButtons currentView={currentView} setCurrentView={setCurrentView} />
          ) : (
            <div className="login-container">
              <h2>로그인</h2>
              {errorMessage && <p className="error">{errorMessage}</p>}
              <form onSubmit={handleLogin}>
                <input
                  type="text"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  placeholder="아이디"
                  required
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호"
                  required
                />
                <button type="submit">로그인</button>
              </form>
            </div>
          )}
        </div>
        <div className="list-container">
          {isLoggedin && (
            <>
              {currentView === 'chatrooms' && (
                <ChatRooms
                username={username} // username을 제대로 전달합니다.
                currentRoom={room}
                onJoinRoom={handleSelectChatroom}
                />
              )}
              {currentView === 'friends' && (
                <FriendsList 
                    friends={friends} 
                    onSelectFriend={handleSelectFriend} 
                    username={username} // username이 제대로 전달되는지 확인
                />
              )}
              {currentView === 'settings' && (
                <Settings 
                  handleLogout={handleLogout}
                  username={username}
                />
              )}
            </>
          )}
        </div>
        <div className="chat-container">
          {isLoggedin && room && (
            <ChatRoom
              username={username}
              room={room}
              chatHistory={chatHistory[room] || []}
              socket={socket}
              isPrivate={rooms.find(r => r.name === room)?.isPrivate || false}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
