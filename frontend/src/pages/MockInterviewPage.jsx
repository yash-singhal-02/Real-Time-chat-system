import React from 'react';
import Sidebar from '../components/Sidebar';
import './Dashboard.css';

const MockInterviewPage = () => {
  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        <header className="content-header">
          <h1>AI Mock Interview</h1>
          <p>Practice your behavioral and technical skills with our AI Career Coach.</p>
        </header>
        
        <div className="interview-setup-card">
          <h3>Select Interview Topic</h3>
          <div className="topic-grid">
             <div className="topic-chip active">Behavioral Basics</div>
             <div className="topic-chip">Frontend Mastery</div>
             <div className="topic-chip">System Design</div>
          </div>
          <button className="primary-btn" style={{ marginTop: '20px' }}>Start AI Interview</button>
        </div>
        
        <div className="chat-placeholder-container">
           <div className="chat-placeholder-message">
              The Talkify AI Coach is ready. Select a topic above to begin.
           </div>
        </div>
      </div>
    </div>
  );
};

export default MockInterviewPage;
