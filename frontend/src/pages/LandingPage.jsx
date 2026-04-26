import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal');
        }
      });
    }, observerOptions);

    document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="landing-container">
      <nav className="landing-nav">
        <div className="logo-section" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="logo-icon">
            <i className="fas fa-comment-dots"></i>
          </div>
          <span className="logo-text">ChatTalk</span>
        </div>
        
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </div>

        <div className="nav-actions">
          <button className="nav-btn-text" onClick={() => navigate('/login')}>Login</button>
          <button className="nav-btn-primary" onClick={() => navigate('/signup')}>Get Started</button>
        </div>
      </nav>

      <header className="hero-section">
        <div className="hero-content animate-on-scroll">
          <div className="hero-badge">Next-Gen Messaging</div>
          <h1 className="hero-title">
            The Future of <span className="gradient-text">Human-AI</span> Connection
          </h1>
          <p className="hero-description">
            Experience lightning-fast messaging with an integrated AI assistant. Secure, encrypted, and designed for the modern world.
          </p>
          <div className="hero-cta-group">
            <button className="cta-btn primary" onClick={() => navigate('/signup')}>
              Start Chatting Now <i className="fas fa-chevron-right"></i>
            </button>
            <button className="cta-btn secondary" onClick={() => navigate('/login')}>
              <i className="fas fa-play"></i> Watch Demo
            </button>
          </div>
          <div className="hero-trust">
            <div className="trust-avatars">
              <img src="https://i.pravatar.cc/40?u=1" alt="User" />
              <img src="https://i.pravatar.cc/40?u=2" alt="User" />
              <img src="https://i.pravatar.cc/40?u=3" alt="User" />
              <div className="trust-plus">+5k</div>
            </div>
            <span>Trusted by over 5,000+ active users worldwide</span>
          </div>
        </div>

        <div className="hero-visual animate-on-scroll">
          <div className="visual-wrapper">
             <div className="mockup-container">
                <div className="mockup-header">
                  <div className="mockup-user">
                    <div className="mockup-avatar">A</div>
                    <span>AI Assistant</span>
                  </div>
                  <div className="mockup-status">Online</div>
                </div>
                <div className="mockup-chat">
                  <div className="mockup-msg other">Welcome! How can I help you today?</div>
                  <div className="mockup-msg own">Help me write a professional email.</div>
                  <div className="mockup-msg other highlight"><i className="fas fa-magic" style={{ fontSize: '0.8rem', marginRight: '5px' }}></i> Certainly! Here's a draft...</div>
                </div>
             </div>
             <div className="floating-elements">
                <div className="float-icon ai-icon"><i className="fas fa-robot"></i></div>
                <div className="float-icon secure-icon"><i className="fas fa-lock"></i></div>
                <div className="float-icon fast-icon"><i className="fas fa-bolt"></i></div>
             </div>
          </div>
        </div>
      </header>

      <section id="trust" className="trust-section animate-on-scroll">
        <div className="trust-grid">
           <div className="trust-item">
             <i className="fas fa-shield-alt"></i>
             <h3>Secure Chats</h3>
             <p>End-to-end encryption for your private conversations.</p>
           </div>
           <div className="trust-item">
             <i className="fas fa-bolt"></i>
             <h3>Lightning Fast</h3>
             <p>Socket-powered messaging with zero latency.</p>
           </div>
           <div className="trust-item">
             <i className="fas fa-magic"></i>
             <h3>AI-Enhanced</h3>
             <p>Smart replies and summaries powered by OpenAI.</p>
           </div>
        </div>
      </section>

      <section id="how-it-works" className="how-it-works animate-on-scroll">
        <h2 className="section-title">How It Works</h2>
        <div className="steps-container">
          <div className="step">
            <div className="step-number">01</div>
            <h3>Create Account</h3>
            <p>Sign up in seconds and verify your email to start your journey.</p>
          </div>
          <div className="step">
            <div className="step-number">02</div>
            <h3>Start Chatting</h3>
            <p>Connect with friends or search for new users in real-time.</p>
          </div>
          <div className="step">
            <div className="step-number">03</div>
            <h3>Leverage AI</h3>
            <p>Use our smart assistant to enhance your conversations and productivity.</p>
          </div>
        </div>
      </section>

      <section id="features" className="features-section animate-on-scroll">
        <div className="section-header">
          <h2 className="section-title">Powerful Features</h2>
          <p className="section-subtitle">Everything you need for seamless communication in one place.</p>
        </div>
        <div className="features-modern-grid">
          <div className="modern-feature-card">
            <div className="card-icon"><i className="fas fa-comments"></i></div>
            <h3>Real-time Sync</h3>
            <p>Messages sync instantly across all your devices.</p>
          </div>
          <div className="modern-feature-card">
            <div className="card-icon"><i className="fas fa-file-image"></i></div>
            <h3>Media Sharing</h3>
            <p>Share photos, videos, and files without compression loss.</p>
          </div>
          <div className="modern-feature-card">
            <div className="card-icon"><i className="fas fa-user-friends"></i></div>
            <h3>Global Search</h3>
            <p>Find and connect with users anywhere in the world instantly.</p>
          </div>
          <div className="modern-feature-card">
            <div className="card-icon"><i className="fas fa-palette"></i></div>
            <h3>Custom Themes</h3>
            <p>Personalize your experience with vibrant, dynamic themes.</p>
          </div>
        </div>
      </section>

      <section className="cta-section animate-on-scroll">
        <div className="cta-card">
          <h2>Ready to transform your chat experience?</h2>
          <p>Join thousands of users who are already using ChatTalk.</p>
          <button className="cta-btn primary large" onClick={() => navigate('/signup')}>
            Get Started Now
          </button>
        </div>
      </section>

      <footer className="footer-modern">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="logo-section">
              <div className="logo-icon small"><i className="fas fa-comment-dots"></i></div>
              <span className="logo-text small">ChatTalk</span>
            </div>
            <p>Redefining real-time communication with the power of AI.</p>
          </div>
          <div className="footer-links">
            <h4>Product</h4>
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#trust">Security</a>
          </div>
          <div className="footer-links">
            <h4>Company</h4>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
            <a href="#">Privacy</a>
          </div>
          <div className="footer-links">
            <h4>Social</h4>
            <a href="#"><i className="fab fa-twitter"></i> Twitter</a>
            <a href="#"><i className="fab fa-github"></i> GitHub</a>
            <a href="#"><i className="fab fa-discord"></i> Discord</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 ChatTalk. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
