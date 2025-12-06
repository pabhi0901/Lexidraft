import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { projectAPI } from '../services/api';
import { toast } from 'react-toastify';
import { gsap } from 'gsap';
import './Projects.css';

const Projects = () => {
  const [formData, setFormData] = useState({
    projectTitle: '',
    projectDescription: '',
    technologies: '',
    role: '',
    keyFeatures: '',
    tone: 'professional',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [currentProjectId, setCurrentProjectId] = useState(null);
  
  const headerRef = useRef(null);
  const formRef = useRef(null);
  const resultRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(headerRef.current,
      { opacity: 0, y: -30 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }
    );
    
    gsap.fromTo(formRef.current,
      { opacity: 0, x: -50 },
      { opacity: 1, x: 0, duration: 0.8, delay: 0.2, ease: 'power2.out' }
    );
  }, []);

  useEffect(() => {
    if (result && resultRef.current) {
      gsap.fromTo(resultRef.current,
        { opacity: 0, x: 50, scale: 0.95 },
        { opacity: 1, x: 0, scale: 1, duration: 0.6, ease: 'back.out(1.2)' }
      );
    }
  }, [result]);

  const toneOptions = [
    { value: 'professional', label: 'Professional' },
    { value: 'confident', label: 'Confident' },
    { value: 'hiring-friendly', label: 'Hiring-Friendly' },
    { value: 'technical', label: 'Technical' },
    { value: 'creative', label: 'Creative' },
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    console.log('=== PROJECT FORM SUBMISSION ===');
    console.log('Form Data:', formData);
    console.log('Token:', localStorage.getItem('token'));
    
    try {
      console.log('Calling API: POST /api/projects/generate');
      const response = await projectAPI.generateBulletPoints(formData);
      console.log('API Response:', response.data);
      
      setResult(response.data);
      setCurrentProjectId(response.data.data._id);
      toast.success('Bullet points generated successfully!');
    } catch (error) {
      console.error('=== API ERROR ===');
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      console.error('Full error:', error);
      toast.error(error.response?.data?.message || 'Failed to generate bullet points');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    if (!currentProjectId) return;
    setLoading(true);
    try {
      const response = await projectAPI.regenerateBulletPoints(currentProjectId, {
        tone: formData.tone,
      });
      setResult(response.data);
      toast.success('Bullet points regenerated!');
    } catch (error) {
      toast.error('Failed to regenerate');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (result?.bulletPoints) {
      const text = result.bulletPoints.join('\n');
      navigator.clipboard.writeText(text);
      toast.success('Bullet points copied to clipboard!');
    }
  };

  const handleReset = () => {
    setFormData({
      projectTitle: '',
      projectDescription: '',
      technologies: '',
      role: '',
      keyFeatures: '',
      tone: 'professional',
    });
    setResult(null);
    setCurrentProjectId(null);
  };

  return (
    <div className="page-container">
      {/* Animated Background */}
      <div className="page-animated-background">
        <div className="page-gradient-orb page-orb-1"></div>
        <div className="page-gradient-orb page-orb-2"></div>
        <div className="page-grid-pattern"></div>
      </div>

      <nav className="navbar">
        <div className="navbar-brand">
          <Link to="/dashboard" className="logo-link">
            <span className="logo-icon">✨</span>
            <h2>LexiDraft</h2>
          </Link>
        </div>
        <Link to="/dashboard" className="back-btn">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"/>
          </svg>
          Back to Dashboard
        </Link>
      </nav>

      <div className="page-content">
        <div ref={headerRef} className="page-header">
          <div className="header-badge">
            <span className="badge-icon">📝</span>
            <span>AI-Powered Content Generation</span>
          </div>
          <h1>Project Bullet Points Generator</h1>
          <p>Transform your project details into compelling, professional bullet points</p>
        </div>

        <div className="content-grid">
          <div ref={formRef} className="form-section">
            <div className="section-title-wrapper">
              <div className="section-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
              </div>
              <h2>Project Details</h2>
            </div>
            <form onSubmit={handleSubmit} className="project-form">
              <div className="form-group">
                <label>Project Title *</label>
                <input
                  type="text"
                  name="projectTitle"
                  value={formData.projectTitle}
                  onChange={handleChange}
                  required
                  placeholder="E.g., E-commerce Platform"
                />
              </div>

              <div className="form-group">
                <label>Project Description *</label>
                <textarea
                  name="projectDescription"
                  value={formData.projectDescription}
                  onChange={handleChange}
                  required
                  rows="4"
                  placeholder="Describe your project in detail..."
                />
              </div>

              <div className="form-group">
                <label>Technologies Used</label>
                <input
                  type="text"
                  name="technologies"
                  value={formData.technologies}
                  onChange={handleChange}
                  placeholder="E.g., React, Node.js, MongoDB"
                />
              </div>

              <div className="form-group">
                <label>Your Role</label>
                <input
                  type="text"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  placeholder="E.g., Full Stack Developer"
                />
              </div>

              <div className="form-group">
                <label>Key Features</label>
                <textarea
                  name="keyFeatures"
                  value={formData.keyFeatures}
                  onChange={handleChange}
                  rows="3"
                  placeholder="List the main features of your project..."
                />
              </div>

              <div className="form-group">
                <label>
                  <span className="label-icon">🎯</span>
                  Tone Style
                </label>
                <div className="tone-selector">
                  {toneOptions.map((option) => (
                    <label key={option.value} className="tone-option">
                      <input
                        type="radio"
                        name="tone"
                        value={option.value}
                        checked={formData.tone === option.value}
                        onChange={handleChange}
                      />
                      <span className="tone-label">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button type="submit" className="primary-btn" disabled={loading}>
                {loading ? (
                  <>
                    <span className="btn-spinner"></span>
                    Generating Magic...
                  </>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                    </svg>
                    Generate Bullet Points
                  </>
                )}
              </button>
            </form>
          </div>

          {result && (
            <div ref={resultRef} className="result-section">
              <div className="result-card">
                <div className="result-header">
                  <div className="result-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                  <h3>Generated Bullet Points</h3>
                </div>
                <div className="bullet-points">
                  {result.bulletPoints.map((point, index) => (
                    <div key={index} className="bullet-point">
                      <span className="bullet-icon">✓</span>
                      <span className="bullet-text">{point}</span>
                    </div>
                  ))}
                </div>
                <div className="result-actions">
                  <button onClick={handleCopy} className="action-btn copy-btn">
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"/>
                      <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"/>
                    </svg>
                    Copy All
                  </button>
                  <button onClick={handleRegenerate} className="action-btn regenerate-btn" disabled={loading}>
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"/>
                    </svg>
                    Regenerate
                  </button>
                  <button onClick={handleReset} className="action-btn reset-btn">
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"/>
                    </svg>
                    New Project
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Projects;
