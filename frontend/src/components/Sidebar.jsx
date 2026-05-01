import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  const logoutHandler = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  return (
    <div className="app-sidebar">
      <div className="sidebar-brand">
        <img src="/logo.png" alt="Logo" className="sidebar-logo" />
        <h2>Talkify AI</h2>
      </div>
      
      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <span className="nav-icon">📊</span>
          <span className="nav-text">Dashboard</span>
        </NavLink>
        
        <NavLink to="/roadmap" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <span className="nav-icon">🧭</span>
          <span className="nav-text">Roadmap</span>
        </NavLink>
        
        <NavLink to="/mock-interview" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <span className="nav-icon">💬</span>
          <span className="nav-text">Mock Interview</span>
        </NavLink>
        
        <NavLink to="/peer-chat" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <span className="nav-icon">👥</span>
          <span className="nav-text">Peer Practice</span>
        </NavLink>
        
        <NavLink to="/settings" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <span className="nav-icon">⚙️</span>
          <span className="nav-text">Settings</span>
        </NavLink>
      </nav>
      
      <div className="sidebar-user">
        <div className="user-avatar">{userInfo?.name?.charAt(0).toUpperCase()}</div>
        <div className="user-details">
          <p className="user-name">{userInfo?.name}</p>
          <p className="user-role">{userInfo?.careerGoal || 'Member'}</p>
        </div>
        <button className="logout-btn" onClick={logoutHandler} title="Logout">🚪</button>
      </div>
    </div>
  );
};

export default Sidebar;
