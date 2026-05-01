import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import MarkdownRenderer from '../utils/MarkdownRenderer';
import Sidebar from '../components/Sidebar';
import './Dashboard.css';

const ENDPOINT = ["localhost", "127.0.0.1"].includes(window.location.hostname) ? "http://127.0.0.1:5001" : "https://my-realtime-backend.onrender.com";
var socket, selectedChatCompare;

const PeerChatPage = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState('');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  const [smartReplies, setSmartReplies] = useState([]);
  const [mediaFile, setMediaFile] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [showChatMenu, setShowChatMenu] = useState(false);
  const [showOptionsId, setShowOptionsId] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem('chat-theme') || 'green');
  
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, smartReplies]);

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
    } else {
      fetchChats();
      socket = io(ENDPOINT);
      socket.emit("setup", userInfo);
      socket.on("connected", () => setSocketConnected(true));
      socket.on("typing", () => setIsTyping(true));
      socket.on("stop typing", () => setIsTyping(false));
    }
    
    const handleGlobalClick = () => {
      setShowOptionsId(null);
      setShowChatMenu(false);
    };
    document.addEventListener('click', handleGlobalClick);
    return () => {
      document.removeEventListener('click', handleGlobalClick);
      if(socket) socket.disconnect();
    }
  }, []);

  const fetchChats = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get(`/api/chat`, config);
      setChats(data);
    } catch (error) { console.error(error); }
  };

  const fetchUsers = async (searchQuery = '') => {
    if (!searchQuery) { setUsers([]); return; }
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get(`/api/user?search=${searchQuery}`, config);
      setUsers(data);
    } catch (error) { console.error(error); }
  };

  const accessChat = async (userId) => {
    try {
      const config = { headers: { "Content-type": "application/json", Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.post(`/api/chat`, { userId }, config);
      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
      setSelectedChat(data);
      setSearch(''); setUsers([]);
    } catch (error) { console.error(error); }
  };

  const fetchMessages = async () => {
    if (!selectedChat) return;
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get(`/api/message/${selectedChat._id}`, config);
      setMessages(data);
      socket.emit("join chat", selectedChat._id);
      selectedChatCompare = selectedChat;
    } catch (error) { console.error(error); }
  };

  useEffect(() => {
    if (selectedChat) {
      fetchMessages();
      setSmartReplies([]);
    }
  }, [selectedChat]);

  useEffect(() => {
    if(!socket) return;
    socket.on("message received", (newMessageReceived) => {
      if (!selectedChatCompare || selectedChatCompare._id !== newMessageReceived.chat._id) {
        // Notification logic
      } else {
        setMessages(prev => [...prev, newMessageReceived]);
      }
    });
  }, [socketConnected]);

  const sendMessage = async (e) => {
    if ((e.type === 'click' || e.key === "Enter") && (newMessage.trim() || mediaFile) && !isSending) {
      const messageToSubmit = newMessage;
      const mediaToSubmit = mediaFile;
      setNewMessage("");
      setMediaFile(null);
      setIsSending(true);

      socket.emit("stop typing", selectedChat._id);
      try {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        let sentMessageData;
        if (mediaToSubmit) {
           const formData = new FormData();
           formData.append("content", messageToSubmit);
           formData.append("chatId", selectedChat._id);
           formData.append("media", mediaToSubmit);
           config.headers['Content-type'] = 'multipart/form-data';
           const { data } = await axios.post(`/api/message/media`, formData, config);
           sentMessageData = data;
        } else {
           config.headers['Content-type'] = 'application/json';
           const { data } = await axios.post(`/api/message`, { content: messageToSubmit, chatId: selectedChat._id }, config);
           sentMessageData = data;
        }
        socket.emit("new message", sentMessageData);
        setMessages(prev => [...prev, sentMessageData]);
        setIsSending(false);
      } catch (error) { 
        console.error(error); 
        setIsSending(false);
      }
    }
  };

  const typingHandler = (e) => {
    setNewMessage(e.target.value);
    if (!socketConnected) return;
    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }
    let lastTypingTime = new Date().getTime();
    setTimeout(() => {
      if (new Date().getTime() - lastTypingTime >= 3000 && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, 3000);
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    fetchUsers(e.target.value);
  };

  return (
    <div className={`dashboard-container theme-${theme} ${selectedChat ? 'chat-active' : ''}`}>
      <Sidebar />
      
      <div className="sidebar" style={{ background: 'rgba(15, 23, 42, 0.4)' }}>
        <div className="search-bar">
          <input type="text" placeholder="Search users..." value={search} onChange={handleSearch} />
        </div>
        <div className="user-list">
          {search ? users.map(user => (
            <div key={user._id} className="user-item" onClick={() => accessChat(user._id)}>
              <div className="user-avatar">{user.name[0]}</div>
              <div className="user-info"><h4>{user.name}</h4><p>{user.email}</p></div>
            </div>
          )) : chats.map(chat => {
            const sender = chat.users.find(u => u._id !== userInfo._id);
            return (
              <div key={chat._id} className={`user-item ${selectedChat?._id === chat._id ? 'active' : ''}`} onClick={() => setSelectedChat(chat)}>
                <div className="user-avatar">{sender?.name[0]}</div>
                <div className="user-info"><h4>{sender?.name}</h4><p>{chat.latestMessage?.content}</p></div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="chat-window">
        {selectedChat ? (
          <div className="active-chat">
            <div className="chat-header">
              <h3>{selectedChat.users.find(u => u._id !== userInfo._id)?.name}</h3>
            </div>
            <div className="chat-messages">
              {messages.map((m, i) => (
                <div key={m._id || i} className={`message-wrapper ${m.sender._id === userInfo._id ? 'own-wrapper' : 'other-wrapper'}`}>
                  <div className={`message ${m.sender._id === userInfo._id ? 'own-message' : 'other-message'}`}>
                    {m.mediaUrl && <img src={`http://127.0.0.1:5001${m.mediaUrl}`} className="media-image" />}
                    <MarkdownRenderer content={m.content} />
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="input-area-wrapper">
              <div className="chat-input-row">
                <input className="chat-input" value={newMessage} onChange={typingHandler} onKeyDown={sendMessage} placeholder="Type a message..." />
                <button className="send-btn" onClick={sendMessage}>{isSending ? '...' : '➤'}</button>
              </div>
            </div>
          </div>
        ) : (
          <div className="no-chat-selected">
            <h3>Peer Practice</h3>
            <p>Select a peer to start a mock interview session.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PeerChatPage;
