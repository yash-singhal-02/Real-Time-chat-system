import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Auth.css'; // Reuse auth styles for glassmorphism

const OnboardingPage = () => {
  const [goal, setGoal] = useState('');
  const [skillLevel, setSkillLevel] = useState('Beginner');
  const [dailyTime, setDailyTime] = useState(60);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  const handleOnboarding = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.put('/api/user/onboard', { goal, skillLevel, dailyTime }, config);
      
      // Update local storage
      const updatedInfo = { ...userInfo, careerGoal: goal, onboarded: true };
      localStorage.setItem('userInfo', JSON.stringify(updatedInfo));
      
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="glass-bubble" style={{ width: '400px', height: '400px', top: '-10%', left: '-5%' }}></div>
      <div className="glass-bubble" style={{ width: '300px', height: '300px', bottom: '-5%', right: '-5%' }}></div>
      
      <div className="auth-card" style={{ maxWidth: '500px' }}>
        <h2>Setup Your Copilot</h2>
        <p className="auth-subtitle">Let's tailor your career roadmap</p>
        
        <form onSubmit={handleOnboarding}>
          <div className="input-group">
            <label>Career Goal</label>
            <input 
              type="text" 
              placeholder="e.g. Software Engineer, Data Scientist" 
              value={goal}
              onChange={(e) => setGoal(e.target.value)} 
              required 
            />
          </div>
          
          <div className="input-group">
            <label>Current Skill Level</label>
            <select 
              value={skillLevel}
              onChange={(e) => setSkillLevel(e.target.value)}
              style={{ width: '100%', padding: '14px', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Expert">Expert/Senior</option>
            </select>
          </div>
          
          <div className="input-group">
            <label>Daily Time Commitment (minutes)</label>
            <input 
              type="number" 
              value={dailyTime}
              onChange={(e) => setDailyTime(e.target.value)}
              min="15"
              step="15"
              required 
            />
          </div>
          
          <button className="auth-btn" type="submit" disabled={isLoading}>
            {isLoading ? "Generating Roadmap..." : "Generate My Roadmap"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default OnboardingPage;
