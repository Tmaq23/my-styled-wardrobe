'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    // Check if user is signed in
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/simple-auth/session', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        });
        if (response.ok) {
          const data = await response.json();
          setIsSignedIn(!!data.user);
        } else {
          setIsSignedIn(false);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        setIsSignedIn(false);
      }
    };

    checkAuth();

    // Re-check auth when page becomes visible (after navigation)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkAuth();
      }
    };

    // Re-check auth when focus returns to window
    const handleFocus = () => {
      checkAuth();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const handleGetStarted = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    router.push(isSignedIn ? '/style-interface' : '/auth/signin');
  };

  return (
  <div className="home-page compact-home">

  {/* Hero Section (compressed) */}
  <div className="hero-section hero-compressed">
        <div className="hero-background">
          <div className="hero-image">
            <div className="image-overlay"></div>
          </div>
        </div>
        
        <div className="hero-content">
          <div className="hero-text-overlay">
            <h1>Embrace your style</h1>
            <p className="hero-subtitle">
              Empower yourself with the confidence that comes from looking and feeling your best every day.
            </p>
            <Link 
              href={isSignedIn ? "/style-interface" : "/auth/signin"} 
              onClick={handleGetStarted} 
              className="cta-button"
            >
              GET STARTED
            </Link>
          </div>
        </div>
      </div>

      {/* Services & Core Interface in compressed grid */}
      <div className="main-compressed-grid">
        <div className="services-section compact-block">
        <div className="section-header">
          <p>Fashion guidance to help you look and feel your best</p>
        </div>
        <div className="services-grid">
          <div className="service-card">
            <div className="service-icon"><Image src="/icons/target.svg" alt="Target icon" width={48} height={48} /></div>
            <h3>Style Analysis</h3>
            <p>Discover your body shape and perfect colour palette through AI-powered analysis</p>
          </div>
          <div className="service-card">
            <div className="service-icon"><Image src="/icons/dress.svg" alt="Dress icon" width={48} height={48} /></div>
            <h3>Personalised Outfits</h3>
            <p>Get AI-curated outfit combinations and shopping recommendations tailored to you</p>
          </div>
        </div>
        </div>
        {/* Jump In section removed */}
      </div>

      {/* Testimonials section removed */}

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>My Styled Wardrobe</h4>
            <p>Empowering you to embrace your unique style with AI-powered fashion recommendations.</p>
          </div>
          <div className="footer-section">
            <h4>Services</h4>
            <ul>
              <li>Body Shape Analysis</li>
              <li>Colour Palette Discovery</li>
              <li>Personalised Outfits</li>
              <li>Shopping Recommendations</li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Support</h4>
            <ul>
              <li><Link href="/faq">Help Center</Link></li>
              <li><Link href="/contact">Contact Us</Link></li>
              <li><Link href="/privacy">Privacy Policy</Link></li>
              <li><Link href="/terms">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} My Styled Wardrobe. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
