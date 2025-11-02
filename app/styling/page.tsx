'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function StylingPage() {
  return (
    <div className="styling-page">
      {/* Hero Section */}
      <div className="page-hero">
        <div className="hero-content">
          <h1>Our Styling Services</h1>
          <p>Explore our personalized styling sessions to level up your style and confidence</p>
        </div>
      </div>

      {/* Services Grid */}
      <div className="services-section">
        <div className="container">
          <div className="section-header">
            <span className="section-kicker">What we offer</span>
            <h2>Tailored styling support, powered by AI</h2>
            <p>Every tool is designed to help you understand your shape, refine your palette, and build outfits that feel effortlessly you.</p>
          </div>
          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon"><Image src="/icons/target.svg" alt="Target icon" width={48} height={48} /></div>
              <h3>Body Shape Analysis</h3>
              <p>Discover your unique body proportions and learn how to dress to flatter your figure</p>
            </div>
            
            <div className="service-card">
              <div className="service-icon"><Image src="/icons/palette.svg" alt="Color palette icon" width={48} height={48} /></div>
              <h3>Color Palette Discovery</h3>
              <p>Find your perfect color season and learn which hues make you glow</p>
            </div>
            
            <div className="service-card">
              <div className="service-icon"><Image src="/icons/dress.svg" alt="Dress icon" width={48} height={48} /></div>
              <h3>Personalized Outfits</h3>
              <p>Get AI-curated outfit combinations tailored to your style preferences</p>
            </div>
            
            <div className="service-card">
              <div className="service-icon"><Image src="/icons/shopping-bag.svg" alt="Shopping bag icon" width={48} height={48} /></div>
              <h3>Shopping Recommendations</h3>
              <p>Discover perfect pieces from your favorite retailers with direct links</p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="how-it-works">
        <div className="container">
          <h2>How It Works</h2>
          <div className="steps-grid">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Upload Your Photo</h3>
              <p>Share a full-body photo for AI analysis</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>Get Your Analysis</h3>
              <p>Receive personalized body shape and color palette insights</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Discover Your Style</h3>
              <p>Get curated outfit recommendations and shopping links</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="cta-section">
        <div className="container">
          <h2>Ready to Transform Your Style?</h2>
          <p>Start your personalized styling journey today</p>
          <Link href="/style-interface" className="cta-button">
            Begin Styling
          </Link>
        </div>
      </div>
    </div>
  );
}

