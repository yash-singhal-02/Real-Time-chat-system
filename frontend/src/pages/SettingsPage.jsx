import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './SettingsPage.css';

const SettingsPage = () => {
  const [theme, setTheme] = useState(localStorage.getItem('chat-theme') || 'green');
  const [notifications, setNotifications] = useState(true);
  const [readReceipts, setReadReceipts] = useState(true);
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  const navigate = useNavigate();

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
    }
    localStorage.setItem('chat-theme', theme);
  }, [theme, userInfo, navigate]);

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
  };

  const logoutHandler = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  return (
    <div className={`settings-page-container theme-${theme}`}>
      <div className="background-bubbles-wrapper">
        <div className="floating-bubble bubble-1"></div>
        <div className="floating-bubble bubble-2"></div>
      </div>

      <div className="settings-card">
        <div className="settings-header">
          <button className="back-btn" onClick={() => navigate('/dashboard')}>← Back</button>
          <h2>Settings</h2>
        </div>

        <div className="settings-content">
          {/* Section: Profile */}
          <div className="settings-section">
            <h3 className="section-title">Profile Information</h3>
            <div className="setting-item profile-display">
              <div className="settings-avatar">{userInfo?.name?.charAt(0).toUpperCase()}</div>
              <div className="profile-details">
                <div className="detail-row">
                  <span className="detail-label">User</span>
                  <span className="detail-value">{userInfo?.name}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Email</span>
                  <span className="detail-value">{userInfo?.email}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Appearance */}
          <div className="settings-section">
            <h3 className="section-title">Appearance</h3>
            <div className="setting-item">
              <div className="setting-info">
                <h4>Theme</h4>
                <p>Personalize your workspace</p>
              </div>
              <div className="theme-options-grid">
                <div className={`theme-dot ${theme === 'red' ? 'active' : ''}`} style={{backgroundColor: '#d32f2f'}} onClick={() => handleThemeChange('red')} title="Red"></div>
                <div className={`theme-dot ${theme === 'green' ? 'active' : ''}`} style={{backgroundColor: '#2e7d32'}} onClick={() => handleThemeChange('green')} title="Green"></div>
                <div className={`theme-dot ${theme === 'blue' ? 'active' : ''}`} style={{backgroundColor: '#1976d2'}} onClick={() => handleThemeChange('blue')} title="Blue"></div>
                <div className={`theme-dot ${theme === 'purple' ? 'active' : ''}`} style={{backgroundColor: '#7b1fa2'}} onClick={() => handleThemeChange('purple')} title="Purple"></div>
                <div className={`theme-dot ${theme === 'orange' ? 'active' : ''}`} style={{backgroundColor: '#f57c00'}} onClick={() => handleThemeChange('orange')} title="Orange"></div>
              </div>
            </div>
          </div>

          {/* Section: Account & Security */}
          <div className="settings-section">
            <h3 className="section-title">Account & Security</h3>
            <button className="setting-action-row" onClick={() => navigate('/forgot-password')}>
              <div className="setting-info">
                <h4>Change password</h4>
              </div>
              <span className="arrow">→</span>
            </button>
          </div>

          {/* Section: Privacy & Notifications */}
          <div className="settings-section">
            <h3 className="section-title">Privacy & Notifications</h3>
            <div className="setting-toggle-item">
              <div className="setting-info">
                <h4>Desktop Notifications</h4>
                <p>Get notified of new messages</p>
              </div>
              <label className="switch">
                <input type="checkbox" checked={notifications} onChange={() => setNotifications(!notifications)} />
                <span className="slider round"></span>
              </label>
            </div>
            <div className="setting-toggle-item">
              <div className="setting-info">
                <h4>Read Receipts</h4>
                <p>Allow others to see when you read their messages</p>
              </div>
              <label className="switch">
                <input type="checkbox" checked={readReceipts} onChange={() => setReadReceipts(!readReceipts)} />
                <span className="slider round"></span>
              </label>
            </div>
          </div>

          {/* Section: Support */}
          <div className="settings-section">
            <h3 className="section-title">Support</h3>
            <div className="setting-item">
              <div className="setting-info">
                <h4>Version</h4>
                <p>Build 1.2.4</p>
              </div>
            </div>
          </div>

          {/* Logout */}
          <button className="logout-full-btn" onClick={logoutHandler}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
