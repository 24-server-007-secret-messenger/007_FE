import React, { useEffect, useRef, useState } from 'react';
import './ChatRoom.css';
import PropTypes from 'prop-types';
import { v4 as uuidv4 } from 'uuid';

function ChatRoom({ username, room, socket, isPrivate }) {
  const [message, setMessage] = useState('');
  const [password, setPassword] = useState('');
  const [isSecret, setIsSecret] = useState(false);
  const [messages, setMessages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [modalPassword, setModalPassword] = useState('');
  const [modalMessage, setModalMessage] = useState(null);
  const modalPasswordInputRef = useRef(null);
  const chatBoxRef = useRef(null);

  const handleModalSubmit = (e) => {
    e.preventDefault();
    if (!selectedImage || !modalPassword) return;
    console.log(selectedImage.sender, selectedImage.time, modalPassword);

    fetch('http://192.168.30.14:8000/chat/decrypt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender: selectedImage.sender,
        sent_at: selectedImage.time,
        key: modalPassword,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if(data.error){
          setModalMessage(data.error);
          setSelectedImage(null);
        }        
        else {
          setModalMessage(data.secret);
          setSelectedImage(null);
          console.error('무슨에러?',data.secret,selectedImage);
        }
      })
      .catch((error) => {
        console.error('비밀 메시지 요청 실패:', error);
        setModalMessage('요청 중 오류가 발생했습니다.');
      });
  };

  const closeModal = () => {
    setSelectedImage(null);
    setModalPassword('');
    setModalMessage(null);
  };

  useEffect(() => {
    if (selectedImage && modalPasswordInputRef.current) {
      modalPasswordInputRef.current.focus();
    }
  }, [selectedImage]);

  const formatTime = (date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const ws = useRef(null);

  useEffect(() => {
    ws.current = new WebSocket('ws://192.168.30.14:8001/ws');

    ws.current.onopen = () => {
      console.log('WebSocket 연결 성공');
    };

    ws.current.onmessage = (event) => {
      
      const msg = JSON.parse(event.data);

        // 메시지가 "Connection established"이면 무시
      if (msg.message === "Connection established") {
        console.log("연결 메시지 무시");
        return;
      }
      
      console.log('수신한 메시지:', msg, selectedImage);

      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: uuidv4(),
          sender: msg.from,
          message: msg.message || '',
          time: formatTime(new Date()),
          isSecret: msg.encrypt || false,
        },
      ]);
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket 오류:', error);
    };

    ws.current.onclose = () => {
      console.log('WebSocket 연결 종료');
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [selectedImage, room]);

  useEffect(() => {
    fetch('http://192.168.30.14:8000/chat/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user1: room,
        user2: username,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.chat_history) {
          setMessages(
            data.chat_history.map((msg) => ({
              id: uuidv4(),
              sender: msg.sender,
              base64: msg.base64 || '',
              message: msg.message || '',
              time: msg.sent_at,
              isSecret: msg.base64 ? true : false,
            }))
          );
        }
      })
      .catch((error) => {
        console.error('채팅 기록 가져오기 실패:', error);
      });
  }, [room, username]);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (msgObject) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      const messageToSend = JSON.stringify({
        from: username,
        to: room,
        message: msgObject.message,
        encrypt: msgObject.isSecret,
        key: msgObject.isSecret ? msgObject.password : null,
      });

      ws.current.send(messageToSend);
      console.log(messageToSend);
    } else {
      console.error('WebSocket이 연결되지 않았습니다.');
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const trimmedMessage = message.trim();
    if (trimmedMessage === '') return;

    const now = new Date();
    const formattedTime = formatTime(now);

    const msgObject = {
      id: uuidv4(),
      sender: username,
      message: trimmedMessage,
      room,
      time: formattedTime,
      isSecret,
      password: isSecret ? password : null,
    };

    handleSendMessage(msgObject);
    setMessage('');
    setPassword('');
  };

  const openModal = (message) => {
    setSelectedImage({
      sender: message.sender,
      time: message.time,
      base64: message.base64,
    });
  };

  return (
    <div className="chatroom">
      <h2 style={{ marginTop: 0 }}>{room} 채팅방</h2>
      <div className="chat-box" ref={chatBoxRef}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`message ${msg.sender === username ? 'own-message' : 'other-message'}`}
          >
            <span className="message-sender">{msg.sender}</span>
            {msg.base64 ? (
              <img
                src={msg.base64}
                alt="미리보기"
                className="image-preview"
                onClick={() => openModal(msg)}
              />
            ) : (
              <span>{msg.message || '메시지가 없습니다.'}</span>
            )}
            <span className="message-time">{msg.time || '시간 오류'}</span>
          </div>
        ))}
      </div>
      <form onSubmit={handleFormSubmit} className="message-form">
        <div className="secret-toggle">
          <input
            type="checkbox"
            id="secret-toggle"
            checked={isSecret}
            onChange={() => setIsSecret(!isSecret)}
          />
          <label htmlFor="secret-toggle"></label>
        </div>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="메시지를 입력하세요..."
        />
        <button type="submit" className="send-button">
          &gt;
        </button>
        {isSecret && (
          <input
            type="password"
            value={password}
            className="password-input"
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호를 입력하세요..."
            required
          />
        )}
      </form>

      {selectedImage && (
        <div className="modal" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {modalMessage ? (
              <div className="modal-message">
                <p>{modalMessage}</p>
                <button className="modal-close" onClick={closeModal}>
                  닫기
                </button>
              </div>
            ) : (
              <>
                <img src={selectedImage.base64} alt="확대된 이미지" className="modal-image" />
                <form onSubmit={handleModalSubmit} className="modal-form" style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}>
                  <input
                    type="password"
                    value={modalPassword}
                    onChange={(e) => setModalPassword(e.target.value)}
                    placeholder="비밀번호를 입력하세요..."
                    className="modal-password-input"
                    ref={modalPasswordInputRef}
                  />
                  <button type="submit" className="modal-submit">
                    확인
                  </button>
                </form>

              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

ChatRoom.propTypes = {
  username: PropTypes.string.isRequired,
  room: PropTypes.string.isRequired,
  socket: PropTypes.object.isRequired,
  isPrivate: PropTypes.bool.isRequired,
};

export default ChatRoom;
