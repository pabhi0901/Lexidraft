import { useState } from 'react';
import { Link } from 'react-router-dom';
import { emailAPI } from '../services/api';
import { toast } from 'react-toastify';
import './Emails.css';

const Emails = () => {
  const [formData, setFormData] = useState({
    recipientEmail: '',
    recipientName: '',
    companyName: '',
    position: '',
    userContent: '',
    tone: 'professional',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [currentEmailId, setCurrentEmailId] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editedContent, setEditedContent] = useState({ subject: '', body: '' });

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
    setEditMode(false);
    
    console.log('=== EMAIL FORM SUBMISSION ===');
    console.log('Form Data:', formData);
    console.log('Token:', localStorage.getItem('token'));
    
    try {
      console.log('Calling API: POST /api/emails/generate');
      const response = await emailAPI.generateEmail(formData);
      console.log('API Response:', response.data);
      
      setResult(response.data);
      setCurrentEmailId(response.data.data._id);
      setEditedContent({
        subject: response.data.email.subject,
        body: response.data.email.body,
      });
      toast.success('Email generated successfully!');
    } catch (error) {
      console.error('=== API ERROR ===');
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      console.error('Full error:', error);
      toast.error(error.response?.data?.message || 'Failed to generate email');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    if (!currentEmailId) return;
    setLoading(true);
    setEditMode(false);
    try {
      const response = await emailAPI.regenerateEmail(currentEmailId, {
        tone: formData.tone,
      });
      setResult(response.data);
      setEditedContent({
        subject: response.data.email.subject,
        body: response.data.email.body,
      });
      toast.success('Email regenerated!');
    } catch (error) {
      toast.error('Failed to regenerate');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleSaveEdit = () => {
    setResult({
      ...result,
      email: {
        subject: editedContent.subject,
        body: editedContent.body,
      },
    });
    setEditMode(false);
    toast.success('Changes saved!');
  };

  const handleCopySubject = () => {
    navigator.clipboard.writeText(editedContent.subject);
    toast.success('Subject copied to clipboard!');
  };

  const handleCopyBody = () => {
    navigator.clipboard.writeText(editedContent.body);
    toast.success('Email body copied to clipboard!');
  };

  const handleCopyAll = () => {
    const text = `Subject: ${editedContent.subject}\n\n${editedContent.body}`;
    navigator.clipboard.writeText(text);
    toast.success('Email copied to clipboard!');
  };

  const handleReset = () => {
    setFormData({
      recipientEmail: '',
      recipientName: '',
      companyName: '',
      position: '',
      userContent: '',
      tone: 'professional',
    });
    setResult(null);
    setCurrentEmailId(null);
    setEditMode(false);
  };

  return (
    <div className="page-container">
      <nav className="navbar">
        <div className="navbar-brand">
          <Link to="/dashboard">
            <h2>LexiDraft</h2>
          </Link>
        </div>
        <Link to="/dashboard" className="back-btn">
          ← Back to Dashboard
        </Link>
      </nav>

      <div className="page-content">
        <div className="page-header">
          <h1>Professional Email Polisher</h1>
          <p>Transform your draft into a polished, professional email</p>
        </div>

        <div className="content-grid">
          <div className="form-section">
            <form onSubmit={handleSubmit} className="email-form">
              <div className="form-group">
                <label>Recipient Email *</label>
                <input
                  type="email"
                  name="recipientEmail"
                  value={formData.recipientEmail}
                  onChange={handleChange}
                  required
                  placeholder="hr@company.com"
                />
              </div>

              <div className="form-group">
                <label>Recipient Name</label>
                <input
                  type="text"
                  name="recipientName"
                  value={formData.recipientName}
                  onChange={handleChange}
                  placeholder="E.g., John Smith"
                />
              </div>

              <div className="form-group">
                <label>Company Name</label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="E.g., Tech Corp"
                />
              </div>

              <div className="form-group">
                <label>Position/Purpose</label>
                <input
                  type="text"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  placeholder="E.g., Full Stack Developer Position"
                />
              </div>

              <div className="form-group">
                <label>Your Draft Email *</label>
                <textarea
                  name="userContent"
                  value={formData.userContent}
                  onChange={handleChange}
                  required
                  rows="6"
                  placeholder="Write your draft email here. Don't worry about the format or tone - just get your message down..."
                />
              </div>

              <div className="form-group">
                <label>Tone</label>
                <select name="tone" value={formData.tone} onChange={handleChange}>
                  {toneOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <button type="submit" className="primary-btn" disabled={loading}>
                {loading ? 'Generating...' : 'Polish Email'}
              </button>
            </form>
          </div>

          {result && (
            <div className="result-section">
              <div className="result-card">
                <h3>Polished Email</h3>

                {!editMode ? (
                  <>
                    <div className="email-preview">
                      <div className="email-field">
                        <div className="field-header">
                          <strong>Subject:</strong>
                          <button onClick={handleCopySubject} className="copy-icon-btn">
                            📋
                          </button>
                        </div>
                        <div className="field-content">{editedContent.subject}</div>
                      </div>

                      <div className="email-field">
                        <div className="field-header">
                          <strong>Body:</strong>
                          <button onClick={handleCopyBody} className="copy-icon-btn">
                            📋
                          </button>
                        </div>
                        <div className="field-content email-body">
                          {editedContent.body}
                        </div>
                      </div>
                    </div>

                    <div className="result-actions">
                      <button onClick={handleCopyAll} className="secondary-btn">
                        📋 Copy All
                      </button>
                      <button onClick={handleEdit} className="secondary-btn">
                        ✏️ Edit
                      </button>
                      <button onClick={handleRegenerate} className="secondary-btn" disabled={loading}>
                        🔄 Regenerate
                      </button>
                      <button onClick={handleReset} className="secondary-btn">
                        ✨ New Email
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="email-edit">
                      <div className="form-group">
                        <label>Subject:</label>
                        <input
                          type="text"
                          value={editedContent.subject}
                          onChange={(e) =>
                            setEditedContent({ ...editedContent, subject: e.target.value })
                          }
                        />
                      </div>

                      <div className="form-group">
                        <label>Body:</label>
                        <textarea
                          value={editedContent.body}
                          onChange={(e) =>
                            setEditedContent({ ...editedContent, body: e.target.value })
                          }
                          rows="15"
                        />
                      </div>
                    </div>

                    <div className="result-actions">
                      <button onClick={handleSaveEdit} className="primary-btn">
                        💾 Save Changes
                      </button>
                      <button onClick={() => setEditMode(false)} className="secondary-btn">
                        ❌ Cancel
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Emails;
