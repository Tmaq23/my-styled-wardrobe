'use client';

import Link from 'next/link';

export default function PricingPage() {
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
                <h3>Basic</h3>
                <div className="price">
                  <span className="currency">£</span>
                  <span className="amount">0</span>
                  <span className="period">/month</span>
                </div>
              </div>
              <ul className="features">
                <li><span className="icon-inline small"><img src="/icons/check.svg" alt="Included" width={14} height={14} /></span>Body Shape Analysis</li>
                <li><span className="icon-inline small"><img src="/icons/check.svg" alt="Included" width={14} height={14} /></span>Color Palette Discovery</li>
                <li><span className="icon-inline small"><img src="/icons/check.svg" alt="Included" width={14} height={14} /></span>Basic Outfit Suggestions</li>
                <li><span className="icon-inline small"><img src="/icons/check.svg" alt="Included" width={14} height={14} /></span>Limited Shopping Links</li>
              </ul>
              <Link href="/" className="plan-button">
                Get Started Free
              </Link>
            </div>

            <div className="pricing-card featured">
              <div className="plan-header">
                <h3>Premium</h3>
                <div className="price">
                  <span className="currency">£</span>
                  <span className="amount">19.99</span>
                  <span className="period">/month</span>
                </div>
              </div>
              <ul className="features">
                <li><span className="icon-inline small"><img src="/icons/check.svg" alt="Included" width={14} height={14} /></span>Everything in Basic</li>
                <li><span className="icon-inline small"><img src="/icons/check.svg" alt="Included" width={14} height={14} /></span>Unlimited Outfit Combinations</li>
                <li><span className="icon-inline small"><img src="/icons/check.svg" alt="Included" width={14} height={14} /></span>Premium Shopping Recommendations</li>
                <li><span className="icon-inline small"><img src="/icons/check.svg" alt="Included" width={14} height={14} /></span>Seasonal Style Updates</li>
                <li><span className="icon-inline small"><img src="/icons/check.svg" alt="Included" width={14} height={14} /></span>Priority AI Analysis</li>
              </ul>
              <Link href="/" className="plan-button featured">
                Start Premium
              </Link>
            </div>

            <div className="pricing-card">
              <div className="plan-header">
                <h3>Pro</h3>
                <div className="price">
                  <span className="currency">£</span>
                  <span className="amount">39.99</span>
                  <span className="period">/month</span>
                </div>
              </div>
              <ul className="features">
                <li><span className="icon-inline small"><img src="/icons/check.svg" alt="Included" width={14} height={14} /></span>Everything in Premium</li>
                <li><span className="icon-inline small"><img src="/icons/check.svg" alt="Included" width={14} height={14} /></span>Personal Style Consultation</li>
                <li><span className="icon-inline small"><img src="/icons/check.svg" alt="Included" width={14} height={14} /></span>Wardrobe Planning</li>
                <li><span className="icon-inline small"><img src="/icons/check.svg" alt="Included" width={14} height={14} /></span>Exclusive Retailer Access</li>
                <li><span className="icon-inline small"><img src="/icons/check.svg" alt="Included" width={14} height={14} /></span>24/7 Style Support</li>
              </ul>
              <Link href="/" className="plan-button">
                Go Pro
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
    </div>
  );
}

