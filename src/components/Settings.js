import React from 'react';
import './Settings.css';

const Settings = ({ handleLogout, username }) => {
  const handleLogoutClick = () => {
    fetch('http://192.168.30.14:8000/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }), // JSON 데이터로 사용자 이름 전송
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('로그아웃 실패'); // HTTP 에러 발생 시 예외 처리
        }
        return response.text(); // 응답이 텍스트일 경우 처리
      })
      .then((message) => {
        alert(message); // 서버 응답 메시지 표시
        handleLogout(); // 로그아웃 후 추가 작업 처리 (예: 페이지 이동)
      })
      .catch((error) => {
        alert(error.message); // 에러 메시지 표시
      });
  };

  return (
    <div className="settings">
      <h3>설정</h3>
      <div>
        <button onClick={handleLogoutClick} className="logout">
          로그아웃
        </button>
      </div>
    </div>
  );
};

export default Settings;
