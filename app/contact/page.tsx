'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      
      // Reset success message after 5 seconds
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pricing-page">
      {/* Hero Section */}
      <div className="page-hero">
        <div className="hero-content">
          <h1>Get In Touch</h1>
          <p>Have questions? We'd love to hear from you.</p>
        </div>
      </div>

      {/* Contact Form Section */}
      <div className="pricing-section">
        <div className="container">
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            
            {/* Success Message */}
            {submitted && (
              <div style={{
                padding: '1.5rem',
                background: 'rgba(34, 197, 94, 0.2)',
                border: '1px solid rgba(34, 197, 94, 0.5)',
                borderRadius: '12px',
                color: '#22c55e',
                marginBottom: '2rem',
                textAlign: 'center',
              }}>
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#22c55e' }}>✓ Thank you!</h3>
                <p style={{ margin: 0 }}>Your message has been sent successfully. We'll get back to you soon!</p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div style={{
                padding: '1.5rem',
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.5)',
                borderRadius: '12px',
                color: '#ef4444',
                marginBottom: '2rem',
                textAlign: 'center',
              }}>
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#ef4444' }}>✗ Error</h3>
                <p style={{ margin: 0 }}>{error}</p>
              </div>
            )}

            {/* Contact Form */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              padding: '2rem',
            }}>
              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                  {/* Name */}
                  <div>
                    <label style={{
                      display: 'block',
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontWeight: '600',
                      marginBottom: '0.5rem',
                    }}>
                      Your Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        borderRadius: '8px',
                        color: 'white',
                        fontSize: '1rem',
                      }}
                      placeholder="John Doe"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label style={{
                      display: 'block',
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontWeight: '600',
                      marginBottom: '0.5rem',
                    }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        borderRadius: '8px',
                        color: 'white',
                        fontSize: '1rem',
                      }}
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                {/* Subject */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block',
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontWeight: '600',
                    marginBottom: '0.5rem',
                  }}>
                    Subject
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '1rem',
                    }}
                    placeholder="How can we help?"
                  />
                </div>

                {/* Message */}
                <div style={{ marginBottom: '2rem' }}>
                  <label style={{
                    display: 'block',
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontWeight: '600',
                    marginBottom: '0.5rem',
                  }}>
                    Message
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '1rem',
                      resize: 'vertical',
                      minHeight: '120px',
                    }}
                    placeholder="Tell us more about your inquiry..."
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    background: loading 
                      ? 'rgba(99, 102, 241, 0.5)' 
                      : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.6 : 1,
                    transition: 'all 0.3s',
                  }}
                >
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>

            {/* Contact Info */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              padding: '1.5rem',
              marginTop: '2rem',
              textAlign: 'center',
            }}>
              <h3 style={{ color: 'white', marginBottom: '1rem' }}>Other Ways to Reach Us</h3>
              <p style={{ color: 'rgba(255, 255, 255, 0.8)', margin: 0 }}>
                Email us directly at{' '}
                <a 
                  href="mailto:info@mystyledwardrobe.com" 
                  style={{ 
                    color: '#6366f1', 
                    textDecoration: 'none', 
                    fontWeight: '600' 
                  }}
                >
                  info@mystyledwardrobe.com
                </a>
              </p>
              <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem', marginTop: '0.5rem', marginBottom: 0 }}>
                We typically respond within 24 hours
              </p>
            </div>

            {/* Back to Home */}
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <Link 
                href="/" 
                style={{
                  display: 'inline-block',
                  padding: '0.75rem 1.5rem',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '8px',
                  color: 'white',
                  textDecoration: 'none',
                  fontWeight: '500',
                  transition: 'all 0.3s',
                }}
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}