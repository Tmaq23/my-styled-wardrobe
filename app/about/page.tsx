'use client';

import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="about-page">
      {/* Hero Section */}
      <div className="page-hero">
        <div className="hero-content">
          <h1>About My Styled Wardrobe</h1>
          <p>Empowering you to embrace your unique style with AI-powered fashion recommendations</p>
        </div>
      </div>

      {/* Mission Section */}
      <div className="mission-section">
        <div className="container">
          <div className="mission-content">
            <h2>Our Mission</h2>
            <p>
              The mass market often fails to cater to our unique bodies, personalities and goals. 
              Clothing affects our self-confidence, and mass market makes us lose our individuality. 
              At My Styled Wardrobe, we are determined to challenge this norm by creating tailored 
              monthly outfits that highlight each person&apos;s distinctive style.
            </p>
            <p>
              Our team of expert AI stylists meticulously review each profile, taking into account 
              lifestyle and specific concerns regarding appearance. By crafting personalised outfits, 
              we aim to accentuate each person&apos;s unique style, empowering them to reclaim their 
              individuality and exude self-assurance in expressing themselves confidently.
            </p>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="team-section">
        <div className="container">
          <h2>Our Team</h2>
          <p>
            We are not just a styling service; we are your partners in your style journey. 
            Our team is a collective of passionate fashion enthusiasts, tech innovators, and 
            experienced stylists who have come together to redefine the way you experience fashion.
          </p>
          <p>
            Book your session today and embark on a journey towards unlocking your full fashion 
            potential with the guidance of our talented AI stylists. Your dream wardrobe is just a click away.
          </p>
        </div>
      </div>

      {/* CTA Section */}
      <div className="cta-section">
        <div className="container">
          <h2>Ready to Start Your Style Journey?</h2>
          <p>Join thousands of people who have discovered their perfect style</p>
          <Link href="/" className="cta-button">
            Get Started
          </Link>
        </div>
      </div>
    </div>
  );
}

