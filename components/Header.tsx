'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';

export default function Header() {
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);
  const router = useRouter();

  const checkSession = useCallback(async () => {
    try {
      const res = await fetch('/api/simple-auth/session', { cache: 'no-store' });
      const data = await res.json();
      setUser(data.user);
      setLoading(false);
    } catch (error) {
      console.error('Session check failed:', error);
      setUser(null);
      setLoading(false);
    }
  }, []);

  // Check session on mount and periodically
  useEffect(() => {
    checkSession();
    const interval = setInterval(checkSession, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, [checkSession]);

  // Listen for session updates (e.g., after admin login)
  useEffect(() => {
    const handleSessionUpdate = () => {
      checkSession();
    };

    // Listen for custom event
    window.addEventListener('sessionUpdated', handleSessionUpdate);
    
    // Check when page becomes visible (e.g., after admin login on another tab)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkSession();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', checkSession);

    return () => {
      window.removeEventListener('sessionUpdated', handleSessionUpdate);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', checkSession);
    };
  }, [checkSession]);

  const handleSignOut = async () => {
    if (signingOut) return;
    
    try {
      setSigningOut(true);
      
      const res = await fetch('/api/simple-auth/logout', {
        method: 'POST',
      });
      
      if (res.ok) {
        setUser(null);
        router.push('/');
        router.refresh();
      }
    } catch (error) {
      console.error('Sign out failed:', error);
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <nav className="navigation-header">
      <div className="nav-container">
        <Link href="/" className="nav-brand" style={{ textDecoration: 'none', cursor: 'pointer' }}>
          <div className="brand-logo">Li</div>
          <div className="brand-name">My Styled Wardrobe</div>
        </Link>
        <div className="nav-links">
          <Link href="/about" className="nav-link">About Us</Link>
          <Link href="/styling" className="nav-link">
            Styling
            <span className="dropdown-chevron">▼</span>
          </Link>
          <Link href="/blog" className="nav-link">Blog</Link>
          <Link href="/pricing" className="nav-link">Pricing</Link>
          <Link href="/faq" className="nav-link">FAQ</Link>
        </div>
        
        {/* Auth Section */}
        {loading ? (
          <button className="login-btn" disabled>Loading...</button>
        ) : user ? (
          <div className="nav-auth-section">
            <span className="nav-user-name">
              {user.name || user.email}
            </span>
            <button onClick={handleSignOut} className="login-btn" disabled={signingOut}>
              {signingOut ? '...' : 'SIGN OUT'}
            </button>
          </div>
        ) : (
          <Link href="/auth/signin" className="login-btn" style={{ textDecoration: 'none' }}>
            LOG IN
          </Link>
        )}
      </div>
    </nav>
  );
}
