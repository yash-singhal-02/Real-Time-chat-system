import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import './Dashboard.css';

const ENDPOINT = "https://my-realtime-backend.onrender.com";
var socket, selectedChatCompare;

const DashboardPage = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState('');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  // New State for media and AI replies
  const [smartReplies, setSmartReplies] = useState([]);
  const [mediaFile, setMediaFile] = useState(null);
  const [aiChatMode, setAiChatMode] = useState(false);
  const [aiMessages, setAiMessages] = useState([{ _id: "welcome", content: "Hello! I'm your AI Assistant. How can I help you today?", sender: { _id: 'openai', name: 'AI Assistant' }, createdAt: new Date().toISOString() }]);
  const [showSettings, setShowSettings] = useState(false);
  const [theme, setTheme] = useState('green');
  const [showChatMenu, setShowChatMenu] = useState(false);
  const [showOptionsId, setShowOptionsId] = useState(null);
  
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const settingsRef = useRef(null);
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, smartReplies]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setShowSettings(false);
      }
    };
    if (showSettings) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showSettings]);

  useEffect(() => {
    const handleGlobalClick = () => {
      setShowOptionsId(null);
      setShowChatMenu(false);
    };
    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, []);

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
    } else {
      fetchUsers();
      fetchChats();
      socket = io(ENDPOINT);
      socket.emit("setup", userInfo);
      socket.on("connected", () => setSocketConnected(true));
      socket.on("typing", () => setIsTyping(true));
      socket.on("stop typing", () => setIsTyping(false));
    }
  }, [navigate]);

  useEffect(() => {
    if (aiChatMode) {
      setMessages(aiMessages);
      return;
    }
    if (selectedChat) {
      fetchMessages();
      selectedChatCompare = selectedChat;
      setSmartReplies([]); // reset smart replies when switching chat
    }
  }, [selectedChat, aiChatMode]);

  useEffect(() => {
    if(!socket) return;
    socket.on("message received", (newMessageReceived) => {
      if (!selectedChatCompare || selectedChatCompare._id !== newMessageReceived.chat._id) {
        // Here we could add a notification if the message is from someone else
      } else {
        setMessages(prev => [...prev, newMessageReceived]);
        if(newMessageReceived.sender._id !== userInfo._id) {
            fetchSmartReplies(newMessageReceived.content);
        }
      }
    });

    return () => {
      socket.off("message received");
      socket.off("typing");
      socket.off("stop typing");
    }
  }, [socketConnected]);

  const formatTime = (dateString, id) => {
    if (!dateString) {
      if (typeof id === 'number') return new Date(id).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const fetchUsers = async (searchQuery = '') => {
    if (!searchQuery) { setUsers([]); return; }
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get(`https://my-realtime-backend.onrender.com/api/user?search=${searchQuery}`, config);
      setUsers(data);
    } catch (error) { console.error(error); }
  };

  const fetchChats = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get(`https://my-realtime-backend.onrender.com/api/chat`, config);
      setChats(data);
    } catch (error) { console.error(error); }
  };

  const deleteChatRecord = async (chatId) => {
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.delete(`https://my-realtime-backend.onrender.com/api/chat/${chatId}`, config);
      setChats(chats.filter((c) => c._id !== chatId));
      if (selectedChat && selectedChat._id === chatId) {
         setSelectedChat(null);
      }
      setShowOptionsId(null);
    } catch (error) { 
      console.error(error); 
      alert("Failed to delete! Please restart your backend terminal (Ctrl+C then npm start) so your local server discovers the new backend deletion routes.");
    }
  };

  const clearChatHistory = async (chatId) => {
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.delete(`https://my-realtime-backend.onrender.com/api/message/clear/${chatId}`, config);
      setMessages([]);
    } catch (error) { 
      console.error(error); 
      alert("Failed to clear! Please restart your backend terminal (Ctrl+C then npm start) to activate the newly coded database clearing route.");
    }
  };

  const accessChat = async (userId) => {
    try {
      setAiChatMode(false);
      const config = { headers: { "Content-type": "application/json", Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.post(`https://my-realtime-backend.onrender.com/api/chat`, { userId }, config);
      
      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
      setSelectedChat(data);
      setSearch(''); setUsers([]);
    } catch (error) { console.error(error); }
  };

  const fetchMessages = async () => {
    if (!selectedChat) return;
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get(`https://my-realtime-backend.onrender.com/api/message/${selectedChat._id}`, config);
      setMessages(data);
      socket.emit("join chat", selectedChat._id);
    } catch (error) { console.error(error); }
  };

  const sendMessage = async (e) => {
    if (e.key === "Enter" && (newMessage || mediaFile)) {
      if (aiChatMode) {
        try {
          const userMsg = { _id: Date.now(), content: newMessage, sender: userInfo, createdAt: new Date().toISOString() };
          const updatedMessages = [...messages, userMsg];
          setMessages(updatedMessages);
          setAiMessages(updatedMessages);
          const currentPrompt = newMessage;
          setNewMessage("");
          
          setIsTyping(true);
          const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
          const { data } = await axios.post(`https://my-realtime-backend.onrender.com/api/chat/openai`, { prompt: currentPrompt }, config);
          setIsTyping(false);
          
          const aiMsg = { _id: Date.now() + 1, content: data.reply, sender: { _id: 'openai', name: 'AI Assistant' }, createdAt: new Date().toISOString() };
          setMessages(prev => { const newArr = [...prev, aiMsg]; setAiMessages(newArr); return newArr; });
        } catch (error) { 
           setIsTyping(false);
           const errorText = error.response?.data?.message || error.message;
           const aiMsg = { _id: Date.now() + 1, content: `Error: ${errorText}. Please check the console or your API key.`, sender: { _id: 'openai', name: 'AI Assistant' }, createdAt: new Date().toISOString() };
           setMessages(prev => { const newArr = [...prev, aiMsg]; setAiMessages(newArr); return newArr; });
           console.error(error); 
        }
        return;
      }

      socket.emit("stop typing", selectedChat._id);
      try {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        
        let sentMessageData;
        
        if (mediaFile) {
           const formData = new FormData();
           formData.append("content", newMessage);
           formData.append("chatId", selectedChat._id);
           formData.append("media", mediaFile);
           
           config.headers['Content-type'] = 'multipart/form-data';
           const { data } = await axios.post(`https://my-realtime-backend.onrender.com/api/message/media`, formData, config);
           sentMessageData = data;
        } else {
           config.headers['Content-type'] = 'application/json';
           const { data } = await axios.post(`https://my-realtime-backend.onrender.com/api/message`, { content: newMessage, chatId: selectedChat._id }, config);
           sentMessageData = data;
        }

        setNewMessage("");
        setMediaFile(null);
        socket.emit("new message", sentMessageData);
        setMessages(prev => [...prev, sentMessageData]);
        setSmartReplies([]);
        
      } catch (error) { console.error(error); }
    }
  };

  const fetchSmartReplies = async (content) => {
    try {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const { data } = await axios.post(`https://my-realtime-backend.onrender.com/api/chat/smart-replies`, { latestMessage: content }, config);
        if(data && data.replies) {
            setSmartReplies(data.replies);
        }
    } catch (error) {
        setSmartReplies(["Got it!", "Thanks", "I agree!"]);
    }
  };

  const applySmartReply = (reply) => {
    setNewMessage(reply);
    setSmartReplies([]);
  };

  const typingHandler = (e) => {
    setNewMessage(e.target.value);
    if (!socketConnected || aiChatMode) return;
    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }
    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    fetchUsers(e.target.value);
  };

  const logoutHandler = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  const handleMediaUploadClick = () => {
    fileInputRef.current.click();
  };
  
  const handleFileChange = (e) => {
    if(e.target.files && e.target.files[0]) {
      setMediaFile(e.target.files[0]);
    }
  };

  return (
    <div className={`dashboard-container ${theme !== 'red' ? `theme-${theme}` : ''}`}>
      <div className="background-bubbles-wrapper">
        <div className="floating-bubble bubble-1"></div>
        <div className="floating-bubble bubble-2"></div>
        <div className="floating-bubble bubble-3"></div>
      </div>
      <div className="sidebar">
        <div className="sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src="/logo.png" alt="Logo" className="app-logo" />
            <h2>Chats</h2>
          </div>
        </div>
        
        <div className="search-bar">
          <input 
            type="text" 
            placeholder="Search users to chat..." 
            value={search}
            onChange={handleSearch}
          />
        </div>
        
        <div style={{ padding: '0 1.2rem', marginBottom: '10px' }}>
          <button className="ai-chat-btn" onClick={() => { setAiChatMode(true); setSelectedChat(''); }}>
            Chat with AI
          </button>
        </div>
        
        <div className="user-list">
          {search ? users.map(user => (
            <div key={user._id} className="user-item" onClick={() => accessChat(user._id)}>
              <div className="user-avatar">{user.name.charAt(0).toUpperCase()}</div>
              <div className="user-info">
                <h4>{user.name}</h4>
                <p>{user.email}</p>
              </div>
            </div>
          )) : chats.map(chat => {
            const sender = chat.users.find(u => u._id !== userInfo._id);
            const isActive = !aiChatMode && selectedChat && selectedChat._id === chat._id;
            return (
              <div key={chat._id} className={`user-item ${isActive ? 'active' : ''}`} style={{ zIndex: showOptionsId === chat._id ? 100 : 1, position: 'relative' }} onClick={() => { setSelectedChat(chat); setAiChatMode(false); }}>
                <div className="user-avatar">{sender?.name?.charAt(0).toUpperCase()}</div>
                <div className="user-info" style={{ flex: 1, minWidth: 0 }}>
                  <h4>{sender?.name}</h4>
                  <p style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{chat.latestMessage?.content || "No messages yet"}</p>
                </div>
                <div className="user-item-actions" style={{ position: 'relative' }} onClick={(e) => { e.stopPropagation(); setShowOptionsId(showOptionsId === chat._id ? null : chat._id); }}>
                  <button className="chat-menu-btn" style={{ fontSize: '1.2rem', padding: '0 5px' }}>⋮</button>
                  {showOptionsId === chat._id && (
                    <div className="chat-menu-dropdown sidebar-chat-menu" onClick={(e) => e.stopPropagation()}>
                      <button onClick={(e) => { e.stopPropagation(); deleteChatRecord(chat._id); }} className="danger-text">Delete Chat</button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="chat-window">
        {!selectedChat && !aiChatMode ? (
          <div className="no-chat-selected">
            <img src="/logo.png" alt="Logo" className="app-logo-large" />
            <h3>Welcome, {userInfo?.name}!</h3>
            <p>Select a user or start a chat with our AI.</p>
          </div>
        ) : (
          <div className="active-chat">
            <div className="chat-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>{aiChatMode ? "AI Assistant" : selectedChat?.users?.find(u => u._id !== userInfo._id)?.name}</h3>
              <div style={{ position: 'relative' }}>
                <button className="chat-menu-btn" onClick={(e) => { e.stopPropagation(); setShowChatMenu(!showChatMenu); }}>⋮</button>
                {showChatMenu && (
                  <div className="chat-menu-dropdown" onClick={(e) => e.stopPropagation()}>
                     <button onClick={() => { setShowChatMenu(false); if(aiChatMode){ const resetMsg = {_id:'reset', content:'Chat cleared!', sender:{_id:'openai', name:'AI Assistant'}, createdAt: new Date().toISOString()}; setAiMessages([resetMsg]); setMessages([resetMsg]); } else { clearChatHistory(selectedChat._id); } }}>Clear chats</button>
                     <button onClick={() => { setShowChatMenu(false); setSelectedChat(null); setAiChatMode(false); }}>Hide chat</button>
                  </div>
                )}
              </div>
            </div>
            <div className="chat-messages">
              {messages.map((m, i) => (
                <div key={m._id || i} className={`message-wrapper ${m.sender._id === userInfo._id ? 'own-wrapper' : 'other-wrapper'}`} style={{ animationDelay: `${i * 0.05}s` }}>
                  <div className={`message ${m.sender._id === userInfo._id ? 'own-message' : 'other-message'}`}>
                    {m.mediaUrl && (
                      m.mediaUrl.endsWith('.mp4') ? (
                        <video src={`https://my-realtime-backend.onrender.com${m.mediaUrl}`} controls style={{maxWidth: '200px', borderRadius: '10px'}} />
                      ) : (
                        <img src={`https://my-realtime-backend.onrender.com${m.mediaUrl}`} alt="Attached media" className="media-image" />
                      )
                    )}
                    {m.content && <div>{m.content}</div>}
                    <span className="message-time">{formatTime(m.createdAt, m._id)}</span>
                  </div>
                </div>
              ))}
              {isTyping && (
                 <div className="typing-indicator-wrapper">
                   <div className="dot"></div><div className="dot"></div><div className="dot"></div>
                 </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            <div className="input-area-wrapper">
              {smartReplies.length > 0 && (
                <div className="smart-replies">
                  {smartReplies.map((reply, i) => (
                    <div key={i} className="reply-chip" onClick={() => applySmartReply(reply)} style={{ animationDelay: `${i * 0.1}s` }}>
                      ✨ {reply}
                    </div>
                  ))}
                </div>
              )}
              
              <div className="chat-input-row">
                <button className="attach-btn" onClick={handleMediaUploadClick} title="Attach Media">
                  {mediaFile ? '📎' : '+'}
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden-file-input" 
                  onChange={handleFileChange}
                  accept="image/*"
                />
                <input 
                  className="chat-input"
                  type="text" 
                  placeholder={mediaFile ? `Selected: ${mediaFile.name} (type message and hit Enter...)` : "Type a message and hit Enter..."} 
                  value={newMessage}
                  onChange={typingHandler}
                  onKeyDown={sendMessage}
                />
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="settings-container" ref={settingsRef}>
        {showSettings && (
          <div className="settings-menu">
            <div className="settings-profile">
              <div className="settings-avatar">{userInfo?.name?.charAt(0).toUpperCase()}</div>
              <div>
                 <h4>{userInfo?.name}</h4>
                 <p>{userInfo?.email}</p>
              </div>
            </div>
            <div className="settings-divider"></div>
            <div className="theme-selector">
              <p>Choose theme</p>
              <div className="theme-options">
                <div className={`theme-dot ${theme === 'red' ? 'active' : ''}`} style={{backgroundColor: '#d32f2f'}} onClick={() => setTheme('red')} title="Red"></div>
                <div className={`theme-dot ${theme === 'green' ? 'active' : ''}`} style={{backgroundColor: '#2e7d32'}} onClick={() => setTheme('green')} title="Green"></div>
                <div className={`theme-dot ${theme === 'blue' ? 'active' : ''}`} style={{backgroundColor: '#1976d2'}} onClick={() => setTheme('blue')} title="Blue"></div>
                <div className={`theme-dot ${theme === 'purple' ? 'active' : ''}`} style={{backgroundColor: '#7b1fa2'}} onClick={() => setTheme('purple')} title="Purple"></div>
                <div className={`theme-dot ${theme === 'orange' ? 'active' : ''}`} style={{backgroundColor: '#f57c00'}} onClick={() => setTheme('orange')} title="Orange"></div>
              </div>
            </div>
            <div className="settings-divider"></div>
            <div className="settings-actions">
              <button className="settings-action-btn" onClick={logoutHandler}>🚪 Logout</button>
            </div>
          </div>
        )}
        <button className="settings-fab" onClick={() => setShowSettings(!showSettings)}>
          ⚙️
        </button>
      </div>
    </div>
  );
};

export default DashboardPage;
