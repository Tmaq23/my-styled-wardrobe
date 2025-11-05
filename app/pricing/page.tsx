'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CustomShopRequestModal from '@/components/CustomShopRequestModal';

export default function PricingPage() {
  const router = useRouter();
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCustomShopModalOpen, setIsCustomShopModalOpen] = useState(false);

  useEffect(() => {
    // Check if user is signed in
    const checkAuth = async () => {
      setIsLoading(true);
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
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Re-check auth when page becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkAuth();
      }
    };

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
    if (isSignedIn) {
      router.push('/style-interface');
    } else {
      router.push('/auth/signin');
    }
  };

  const handleCustomShopClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (isSignedIn) {
      setIsCustomShopModalOpen(true);
    } else {
      router.push('/auth/signin?redirect=/pricing');
    }
  };

  const handleSubscribeClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    
    if (!isSignedIn) {
      router.push('/auth/signin?redirect=/pricing');
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('/api/subscription/create-checkout', {
        method: 'POST',
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (error) {
      console.error('Subscription error:', error);
      alert(error instanceof Error ? error.message : 'Failed to start subscription. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="pricing-page">
      {/* Hero Section */}
      <div className="page-hero">
        <div className="hero-content">
          <h1>Pricing Plans</h1>
          <p>Choose the perfect plan for your styling journey</p>
        </div>
      </div>

      {/* Pricing Plans */}
      <div className="pricing-section">
        <div className="container">
          <div className="pricing-grid">
            <div className="pricing-card">
              <div className="plan-header">
                <h3>Professional Review</h3>
                <div className="price">
                  <span className="currency">£</span>
                  <span className="amount">30</span>
                  <span className="period">one off payment</span>
                </div>
              </div>
              <ul className="features">
                <li><span className="icon-inline small"><img src="/icons/check.svg" alt="Included" width={14} height={14} /></span>Body Shape Analysis</li>
                <li><span className="icon-inline small"><img src="/icons/check.svg" alt="Included" width={14} height={14} /></span>Color Palette Discovery</li>
                <li><span className="icon-inline small"><img src="/icons/check.svg" alt="Included" width={14} height={14} /></span>Basic Outfit Suggestions</li>
              </ul>
              <Link href="#" onClick={handleGetStarted} className="plan-button">
                {isLoading ? 'Loading...' : 'Get Started'}
              </Link>
            </div>

            <div className="pricing-card featured">
              <div className="plan-header">
                <h3>Customised Online Shop</h3>
                <div className="price">
                  <span className="currency">£</span>
                  <span className="amount">120</span>
                  <span className="period">one off payment</span>
                </div>
              </div>
              <ul className="features">
                <li><span className="icon-inline small"><img src="/icons/check.svg" alt="Included" width={14} height={14} /></span>Outfit Combinations</li>
                <li><span className="icon-inline small"><img src="/icons/check.svg" alt="Included" width={14} height={14} /></span>Premium Shopping Recommendations</li>
                <li><span className="icon-inline small"><img src="/icons/check.svg" alt="Included" width={14} height={14} /></span>Priority AI Analysis</li>
              </ul>
              <Link href="#" onClick={handleCustomShopClick} className="plan-button featured">
                {isLoading ? 'Loading...' : 'Get Started'}
              </Link>
            </div>

            <div className="pricing-card">
              <div className="plan-header">
                <h3>Subscribe</h3>
                <div className="price">
                  <span className="currency">£</span>
                  <span className="amount">5.99</span>
                  <span className="period">/month</span>
                </div>
              </div>
              <ul className="features">
                <li><span className="icon-inline small"><img src="/icons/check.svg" alt="Included" width={14} height={14} /></span>Unlimited AI outfit Combination Generator</li>
                <li><span className="icon-inline small"><img src="/icons/check.svg" alt="Included" width={14} height={14} /></span>Access to Style Blog</li>
              </ul>
              <Link href="#" onClick={handleSubscribeClick} className="plan-button">
                {isLoading ? 'Processing...' : 'Subscribe'}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="faq-section">
        <div className="container">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-grid">
            <div className="faq-item">
              <h3>Can I cancel my subscription anytime?</h3>
              <p>Yes, you can cancel your subscription at any time with no cancellation fees.</p>
            </div>
            <div className="faq-item">
              <h3>Is there a free trial?</h3>
              <p>Yes, all plans start with a 7-day free trial to experience our services.</p>
            </div>
            <div className="faq-item">
              <h3>What payment methods do you accept?</h3>
              <p>We accept all major credit cards, PayPal, and Apple Pay.</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="cta-section">
        <div className="container">
          <h2>Ready to Start Your Style Journey?</h2>
          <p>Join thousands of people who have discovered their perfect style</p>
          <Link href="/" className="cta-button">
            Start Free Trial
          </Link>
        </div>
      </div>

      {/* Custom Shop Request Modal */}
      <CustomShopRequestModal
        isOpen={isCustomShopModalOpen}
        onClose={() => setIsCustomShopModalOpen(false)}
        userProfile={{
          bodyShape: '',
          colourPalette: '',
          occasion: '',
          budget: '',
          retailers: [],
        }}
      />
    </div>
  );
}

