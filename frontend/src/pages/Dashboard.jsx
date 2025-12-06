import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';
import { useEffect, useState, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [isLoaded, setIsLoaded] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState([]);
  
  const heroRef = useRef(null);
  const card1Ref = useRef(null);
  const card2Ref = useRef(null);
  const featuresRef = useRef(null);
  const statsRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Generate particles
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      duration: Math.random() * 20 + 10,
      delay: Math.random() * 5
    }));
    
    const timer = setTimeout(() => setParticles(newParticles), 0);

    // Mouse move effect
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    // Hero animations
    gsap.fromTo(heroRef.current, 
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }
    );

    // Card 1 animation - Simple fade and slide
    gsap.fromTo(card1Ref.current,
      { opacity: 0, y: 60 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 0.8, 
        delay: 0.3, 
        ease: 'power2.out'
      }
    );

    // Card 2 animation - Simple fade and slide
    gsap.fromTo(card2Ref.current,
      { opacity: 0, y: 60 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 0.8, 
        delay: 0.5, 
        ease: 'power2.out'
      }
    );

    // Continuous gentle float animation for both cards
    gsap.to([card1Ref.current, card2Ref.current], {
      y: -10,
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: 1.3
    });

    // Features scroll animation
    if (featuresRef.current?.children) {
      gsap.fromTo(featuresRef.current.children,
        { opacity: 0, y: 60 },
        {
          scrollTrigger: {
            trigger: featuresRef.current,
            start: 'top 80%',
          },
          opacity: 1,
          y: 0,
          stagger: 0.2,
          duration: 0.8,
          ease: 'power2.out'
        }
      );
    }

    // Stats animation
    if (statsRef.current?.children) {
      gsap.fromTo(statsRef.current.children,
        { opacity: 0, scale: 0.5 },
        {
          scrollTrigger: {
            trigger: statsRef.current,
            start: 'top 80%',
          },
          opacity: 1,
          scale: 1,
          stagger: 0.15,
          duration: 0.6,
          ease: 'back.out(2)'
        }
      );
    }

  }, [isLoaded]);

  return (
    <div className="dashboard-container">
      <div className="animated-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
        
        {/* Particles */}
        <div className="particles-container">
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="particle"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                animationDuration: `${particle.duration}s`,
                animationDelay: `${particle.delay}s`
              }}
            />
          ))}
        </div>

        {/* Grid Pattern */}
        <div className="grid-pattern"></div>

        {/* Mouse Follower Light */}
        <div 
          className="mouse-light" 
          style={{
            left: `${mousePosition.x}%`,
            top: `${mousePosition.y}%`
          }}
        ></div>

        {/* Animated Lines */}
        <svg className="animated-lines" width="100%" height="100%">
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#ec4899" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          <path className="animated-path path-1" d="M0,100 Q250,50 500,100 T1000,100" stroke="url(#lineGradient)" fill="none" strokeWidth="2" />
          <path className="animated-path path-2" d="M0,200 Q300,150 600,200 T1200,200" stroke="url(#lineGradient)" fill="none" strokeWidth="2" />
          <path className="animated-path path-3" d="M0,300 Q400,250 800,300 T1600,300" stroke="url(#lineGradient)" fill="none" strokeWidth="2" />
        </svg>
      </div>

      <nav className="navbar">
        <div className="navbar-brand">
          <h2 className="logo-text">
            <span className="logo-icon">✨</span>
            LexiDraft
          </h2>
        </div>
        <div className="navbar-menu">
          <span className="user-name">Hello, {user?.name} 👋</span>
          <button onClick={logout} className="logout-btn">
            <span>Logout</span>
            <span className="logout-icon">→</span>
          </button>
        </div>
      </nav>

      <div className="dashboard-content">
        <div ref={heroRef} className="welcome-section fade-in">
          <div className="welcome-badge">
            <span className="badge-icon">🚀</span>
            <span>AI-Powered Writing Assistant</span>
          </div>
          <h1 className="welcome-title">
            Welcome to <span className="gradient-text">LexiDraft</span>
          </h1>
          <p className="welcome-subtitle">
            Transform your ideas into professional content with the power of AI
          </p>
          
          {/* Floating Tech Elements */}
          <div className="floating-tech-elements">
            <div className="tech-ring ring-1"></div>
            <div className="tech-ring ring-2"></div>
            <div className="tech-ring ring-3"></div>
            <div className="tech-hexagon hex-1"></div>
            <div className="tech-hexagon hex-2"></div>
            <div className="tech-hexagon hex-3"></div>
          </div>
        </div>

        {/* Main Feature Cards - Completely Redesigned */}
        <div className="main-features-section">
          
          {/* Project Card */}
          <Link to="/projects" ref={card1Ref} className="mega-card project-card">
            <div className="card-shine"></div>
            <div className="card-pattern"></div>
            
            <div className="mega-card-header">
              <div className="mega-icon-container">
                <div className="mega-icon-bg"></div>
                <svg className="mega-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
                </svg>
              </div>
              <div className="mega-card-title-section">
                <h2 className="mega-card-title">Project Bullet Points</h2>
                <p className="mega-card-subtitle">AI-Powered Resume Enhancement</p>
              </div>
            </div>

            <div className="mega-card-content">
              <p className="mega-card-description">
                Create compelling, professional bullet points for your projects that capture attention and showcase your achievements. Our AI understands technical depth and professional communication.
              </p>
              
              <div className="feature-highlights">
                <div className="highlight-item">
                  <div className="highlight-icon">⚡</div>
                  <div className="highlight-text">
                    <strong>Instant Generation</strong>
                    <span>Get results in seconds</span>
                  </div>
                </div>
                <div className="highlight-item">
                  <div className="highlight-icon">🎨</div>
                  <div className="highlight-text">
                    <strong>5 Professional Tones</strong>
                    <span>Match your industry style</span>
                  </div>
                </div>
                <div className="highlight-item">
                  <div className="highlight-icon">🎯</div>
                  <div className="highlight-text">
                    <strong>ATS Optimized</strong>
                    <span>Beat applicant tracking systems</span>
                  </div>
                </div>
              </div>

              <div className="tone-badges">
                <span className="tone-badge">Confident</span>
                <span className="tone-badge">Professional</span>
                <span className="tone-badge">Technical</span>
                <span className="tone-badge">Creative</span>
                <span className="tone-badge">Hiring-Friendly</span>
              </div>
            </div>

            <div className="mega-card-footer">
              <span className="mega-card-cta">
                Start Creating
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"/>
                </svg>
              </span>
            </div>
          </Link>

          {/* Email Card */}
          <Link to="/emails" ref={card2Ref} className="mega-card email-card">
            <div className="card-shine"></div>
            <div className="card-pattern"></div>
            
            <div className="mega-card-header">
              <div className="mega-icon-container">
                <div className="mega-icon-bg"></div>
                <svg className="mega-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
              </div>
              <div className="mega-card-title-section">
                <h2 className="mega-card-title">Email Polisher</h2>
                <p className="mega-card-subtitle">Professional Communication Made Easy</p>
              </div>
            </div>

            <div className="mega-card-content">
              <p className="mega-card-description">
                Transform your draft emails into polished, professional messages that make the right impression on HR and recruiters. Perfect tone, structure, and impact every time.
              </p>
              
              <div className="feature-highlights">
                <div className="highlight-item">
                  <div className="highlight-icon">✨</div>
                  <div className="highlight-text">
                    <strong>Smart Polish</strong>
                    <span>AI refines your message</span>
                  </div>
                </div>
                <div className="highlight-item">
                  <div className="highlight-icon">📧</div>
                  <div className="highlight-text">
                    <strong>Perfect Subject Lines</strong>
                    <span>Grab attention instantly</span>
                  </div>
                </div>
                <div className="highlight-item">
                  <div className="highlight-icon">✏️</div>
                  <div className="highlight-text">
                    <strong>Edit & Regenerate</strong>
                    <span>Full control over output</span>
                  </div>
                </div>
              </div>

              <div className="use-cases">
                <div className="use-case">Job Applications</div>
                <div className="use-case">Follow-ups</div>
                <div className="use-case">Thank You Notes</div>
                <div className="use-case">Networking</div>
              </div>
            </div>

            <div className="mega-card-footer">
              <span className="mega-card-cta">
                Polish Your Email
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"/>
                </svg>
              </span>
            </div>
          </Link>

        </div>

        {/* Additional Content Section */}
        <div className="why-lexidraft-section">
          <h2 className="section-title">
            Why Choose <span className="gradient-text">LexiDraft</span>?
          </h2>
          
          <div ref={featuresRef} className="why-features-grid">
            <div className="why-card">
              <div className="why-icon">🤖</div>
              <h3>Powered by Gemini AI</h3>
              <p>Leveraging Google's most advanced AI model for superior content generation and understanding of professional communication nuances.</p>
            </div>
            
            <div className="why-card">
              <div className="why-icon">⚡</div>
              <h3>Lightning Fast</h3>
              <p>Get professional results in seconds, not hours. Our AI processes your content instantly and delivers polished output immediately.</p>
            </div>
            
            <div className="why-card">
              <div className="why-icon">🎯</div>
              <h3>Industry-Specific</h3>
              <p>Choose from multiple professional tones tailored to your industry. From tech startups to corporate environments, we've got you covered.</p>
            </div>
            
            <div className="why-card">
              <div className="why-icon">🔒</div>
              <h3>Secure & Private</h3>
              <p>Your content is processed securely and never stored. We respect your privacy and protect your professional information.</p>
            </div>
            
            <div className="why-card">
              <div className="why-icon">♾️</div>
              <h3>Unlimited Usage</h3>
              <p>Generate as many bullet points and polish as many emails as you need. No limits, no restrictions, just pure productivity.</p>
            </div>
            
            <div className="why-card">
              <div className="why-icon">🎨</div>
              <h3>Full Customization</h3>
              <p>Edit, regenerate, and refine until it's perfect. Complete control over the final output with one-click regeneration.</p>
            </div>
          </div>
        </div>

        <div ref={statsRef} className="stats-section fade-in-delayed">
          <div className="stat-card">
            <div className="stat-number">5+</div>
            <div className="stat-label">Tone Options</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">AI</div>
            <div className="stat-label">Powered</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">∞</div>
            <div className="stat-label">Possibilities</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
