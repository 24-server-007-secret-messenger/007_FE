import React, { useState, useEffect } from 'react';
import './FriendsList.css';
import PropTypes from 'prop-types';

function FriendsList({ onSelectFriend, friendRequests = [], onRespondRequest, username }) {
    const [friends, setFriends] = useState([]);
    const [activeUsers, setActiveUsers] = useState([]);
    const [requestedList, setRequestedList] = useState([]);
    const [newFriendId, setNewFriendId] = useState('');

    useEffect(() => {
        if (!username) {
            console.error('username이 필요합니다.');
            return;
        }

        // 친구 목록 가져오기
        fetch(`http://192.168.30.14:8000/friend/list`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username }),
        })
        .then(response => response.json())
        .then(data => setFriends(data.friends || []))
        .catch(error => alert(error.message));

        // 활동 중인 유저 목록 가져오기
        fetch(`http://192.168.30.14:8000/friend/active_list`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username }),
        })
        .then(response => response.json())
        .then(data => setActiveUsers(data.activeUsers || []))
        .catch(error => alert(error.message));
        

        // 친구 요청 목록 가져오기
        fetch(`http://192.168.30.14:8000/friend/requested_list`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username }),
        })
        .then(response => response.json())
        .then(data => setRequestedList(data.requestedList || []))
        .catch(error => alert(error.message));
    }, [username]);

    const handleAddFriend = () => {
        if (newFriendId.trim() === '') {
            alert('친구 아이디를 입력하세요.');
            return;
        }
        fetch('http://192.168.30.14:8000/friend/request', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ from: username, to: newFriendId }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('친구 추가 요청 실패');
            }
            return response.json();
        })
        .then(data => {
            alert(data.message);
            setNewFriendId('');
        })
        .catch(error => alert(error.message));
    };

    const handleAcceptRequest = (sender) => {
        fetch('http://192.168.30.14:8000/friend/accept', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ from: sender, to: username }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('친구 요청 수락 실패');
            }
            return response.json();
        })
        .then(data => {
            alert(data.message);
            setRequestedList(requestedList.filter(request => request.sender !== sender));
        })
        .catch(error => alert(error.message));
    };

    const handleRejectRequest = (sender) => {
        fetch('http://192.168.30.14:8000/friend/reject', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ from: sender, to: username }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('친구 요청 거절 실패');
            }
            return response.json();
        })
        .then(data => {
            alert(data.message);
            setRequestedList(requestedList.filter(request => request.sender !== sender));
        })
        .catch(error => alert(error.message));
    };

    return (
        <div className="friends-list">
            <h3>친구 목록</h3>
            <ul>
    {friends.length > 0 ? (
        friends.map((friend, index) => (
            <li key={index} onClick={() => onSelectFriend(friend.username)}>
                {friend.username}
                <span 
                    className={`status-dot ${activeUsers.some(user => user.username === friend.username) ? 'active' : 'inactive'}`}
                ></span>
            </li>
        ))
    ) : (
        <li>친구가 없습니다.</li>
    )}
</ul>


            <div style={{ display: 'flex', flexDirection: 'row' }}>
                <input
                    type="text"
                    value={newFriendId}
                    onChange={(e) => setNewFriendId(e.target.value)}
                    placeholder="친구 아이디 입력"
                />
                <button onClick={handleAddFriend}>친구 추가</button>
            </div>

            <h3>친구 추가 요청</h3>
            <ul>
                {requestedList.length > 0 ? (
                    requestedList.map((request, index) => (
                        <li key={index}>
                            {request.sender}
                            <button onClick={() => handleAcceptRequest(request.sender)}>수락</button>
                            <button onClick={() => handleRejectRequest(request.sender)}>거절</button>
                        </li>
                    ))
                ) : (
                    <li>친구 요청이 없습니다.</li>
                )}
            </ul>
        </div>
    );
}

FriendsList.propTypes = {
    onSelectFriend: PropTypes.func.isRequired,
    friendRequests: PropTypes.array,
    onRespondRequest: PropTypes.func.isRequired,
    username: PropTypes.string.isRequired,
};

export default FriendsList;
