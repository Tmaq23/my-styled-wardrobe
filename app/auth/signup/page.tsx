'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/simple-auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Registration successful, redirect to homepage (they're auto-logged in)
        router.push('/');
        router.refresh();
      } else {
        setError(data.error || 'Registration failed. Please try again.');
      }
    } catch (error) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="home-page compact-home">
      <div className="hero-section hero-compressed auth-full-height">
        <div className="hero-background">
          <div className="hero-image">
            <div className="image-overlay" />
          </div>
        </div>
        <div className="hero-content auth-hero-flex">
          <div className="hero-text-overlay auth-hero-width">
            <div className="auth-panel-glass">
              <h1 className="auth-title">Create Account</h1>
              <p className="auth-subtitle">Start your personalised style journey</p>
              <div style={{ marginTop: '1.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>
                <div style={{ marginBottom: '0.75rem', color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.95rem' }}>Or</div>
                <button
                  type="button"
                  onClick={() => router.push('/auth/signin')}
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.15)',
                    border: '2px solid rgba(255, 255, 255, 0.4)',
                    borderRadius: '12px',
                    padding: '0.875rem 1.5rem',
                    color: 'white',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    textTransform: 'none',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.6)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  Sign In to Your Existing Account
                </button>
              </div>
              {error && <div className="auth-error">{error}</div>}

              <form onSubmit={handleSubmit} className="auth-form" noValidate>
                <div className="auth-field-group">
                  <label className="auth-label" htmlFor="name">Full Name</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="auth-input"
                    placeholder="Enter your full name"
                    aria-label="Full name"
                  />
                </div>

                <div className="auth-field-group">
                  <label className="auth-label" htmlFor="email">Email address</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="auth-input"
                    placeholder="you@example.com"
                    aria-label="Email address"
                  />
                </div>

                <div className="auth-field-group">
                  <label className="auth-label" htmlFor="password">Password</label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="auth-input"
                    placeholder="••••••••"
                    aria-label="Password"
                  />
                </div>

                <div className="auth-field-group">
                  <label className="auth-label" htmlFor="confirmPassword">Confirm Password</label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="auth-input"
                    placeholder="••••••••"
                    aria-label="Confirm password"
                  />
                </div>

                <div className="auth-actions">
                  <button 
                    type="submit" 
                    disabled={isLoading}
                    style={{
                      width: '100%',
                      padding: '1rem 1.5rem',
                      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                      border: 'none',
                      borderRadius: '12px',
                      color: 'white',
                      fontSize: '1rem',
                      fontWeight: '600',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s ease',
                      textAlign: 'center',
                      opacity: isLoading ? 0.6 : 1,
                      boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
                    }}
                    onMouseEnter={(e) => {
                      if (!isLoading) {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(99, 102, 241, 0.5)';
                        e.currentTarget.style.background = 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isLoading) {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(99, 102, 241, 0.4)';
                        e.currentTarget.style.background = 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)';
                      }
                    }}
                  >
                    {isLoading ? 'Creating account…' : 'Create Account'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
