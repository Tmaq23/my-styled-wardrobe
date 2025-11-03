'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [redirect, setRedirect] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Get redirect parameter from URL
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setRedirect(params.get('redirect'));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/simple-auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Redirect to specified page or default to style interface
        const redirectPath = redirect || '/style-interface';
        router.push(redirectPath);
        router.refresh();
      } else {
        setError(data.error || 'Invalid email or password');
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
              <h1 className="auth-title">Sign In</h1>
              <p className="auth-subtitle">Welcome back to your style journey</p>
              <div style={{ marginTop: '1.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>
                <div style={{ marginBottom: '0.75rem', color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.95rem' }}>Or</div>
                <button
                  type="button"
                  onClick={() => router.push('/auth/signup')}
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
                  Create a New Account
                </button>
              </div>
              {error && <div className="auth-error">{error}</div>}
              <form onSubmit={handleSubmit} className="auth-form" noValidate>
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
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="auth-input"
                    placeholder="••••••••"
                    aria-label="Password"
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
                    {isLoading ? 'Signing in…' : 'Sign In'}
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
