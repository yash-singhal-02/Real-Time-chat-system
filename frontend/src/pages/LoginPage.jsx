import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { 'Content-Type': 'application/json' } };
      // Attempting to post to local backend server running on port 5000
      const { data } = await axios.post('https://my-realtime-backend.onrender.com/api/auth/login', { email, password }, config);
      localStorage.setItem('userInfo', JSON.stringify(data));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed, please check your credentials.');
    }
  };

  return (
    <div className="auth-container">
      {/* Dynamic Glass Bubbles specifically built for Dark Theme */}
      <div className="glass-bubble" style={{ width: '400px', height: '400px', top: '-10%', left: '-5%', animationDuration: '20s' }}></div>
      <div className="glass-bubble" style={{ width: '300px', height: '300px', bottom: '-5%', right: '-5%', animationDuration: '15s', animationDelay: '2s' }}></div>
      <div className="glass-bubble" style={{ width: '150px', height: '150px', top: '40%', left: '15%', animationDuration: '18s', animationDelay: '5s' }}></div>
      
      <div className="auth-card">
        <h2>Welcome Back</h2>
        <p className="auth-subtitle">Login to your account</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>Email Address</label>
            <input 
              type="email" 
              placeholder="Enter your email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input 
              type="password" 
              placeholder="Enter your password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
          <div style={{ textAlign: 'right', marginTop: '-10px', marginBottom: '15px' }}>
            <Link to="/forgot-password" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', textDecoration: 'none' }}>Forgot Password?</Link>
          </div>
          <button className="auth-btn" type="submit">Login</button>
        </form>
        
        <p className="auth-footer">
          Don't have an account? <Link to="/signup">Sign up here</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
