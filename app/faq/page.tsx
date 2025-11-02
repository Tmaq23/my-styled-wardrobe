'use client';

import Link from 'next/link';

export default function FAQPage() {
  return (
    <div className="faq-page">
      {/* Hero Section */}
      <div className="page-hero">
        <div className="hero-content">
          <h1>Frequently Asked Questions</h1>
          <p>Find answers to common questions about our styling services</p>
        </div>
      </div>

      {/* FAQ Categories */}
      <div className="faq-section">
        <div className="container">
          <div className="faq-category">
            <h2>Getting Started</h2>
            <div className="faq-items">
              <div className="faq-item">
                <h3>How do I get started with My Styled Wardrobe?</h3>
                <p>Simply click &quot;Get Started&quot; on our homepage, upload a full-body photo, and our AI will analyse your body shape and colour palette to provide personalised recommendations.</p>
              </div>
              <div className="faq-item">
                <h3>What type of photo should I upload?</h3>
                <p>Upload a clear, full-body photo with good lighting. Avoid group photos, blurry images, or photos with inappropriate content for best results.</p>
              </div>
              <div className="faq-item">
                <h3>Is the service really free?</h3>
                <p>Yes! Our basic styling analysis is completely free. We also offer premium plans with additional features for those who want more.</p>
              </div>
            </div>
          </div>

          <div className="faq-category">
            <h2>AI Analysis</h2>
            <div className="faq-items">
              <div className="faq-item">
                <h3>How accurate is the AI analysis?</h3>
                <p>Our AI has been trained on thousands of fashion profiles and provides highly accurate body shape and colour palette analysis. Results typically have 90%+ accuracy.</p>
              </div>
              <div className="faq-item">
                <h3>Can I re-analyse my profile?</h3>
                <p>Absolutely! You can use the &quot;Re-analyse with AI&quot; button anytime to get fresh insights or if you want to update your analysis.</p>
              </div>
              <div className="faq-item">
                <h3>What body shapes do you support?</h3>
                <p>We analyse all major body shapes including Hourglass, Triangle, Inverted Triangle, Rectangle, and Round.</p>
              </div>
            </div>
          </div>

          <div className="faq-category">
            <h2>Style Recommendations</h2>
            <div className="faq-items">
              <div className="faq-item">
                <h3>How many outfit combinations can I get?</h3>
                <p>Free users get basic outfit suggestions, while premium users receive unlimited outfit combinations and seasonal updates.</p>
              </div>
              <div className="faq-item">
                <h3>Do you provide shopping links?</h3>
                <p>Yes! We provide direct links to products from major retailers like ASOS, H&M, Zara, and more, making it easy to purchase your recommended items.</p>
              </div>
              <div className="faq-item">
                <h3>Can I upload my existing clothes?</h3>
                <p>Yes! You can upload photos of your existing wardrobe (up to 12 items) to get personalised outfit suggestions using what you already own.</p>
              </div>
            </div>
          </div>

          <div className="faq-category">
            <h2>Account & Privacy</h2>
            <div className="faq-items">
              <div className="faq-item">
                <h3>How do I create an account?</h3>
                <p>Currently, you can use our service without creating an account. Simply upload your photo and start styling!</p>
              </div>
              <div className="faq-item">
                <h3>Is my photo data secure?</h3>
                <p>Yes, we take privacy seriously. Your photos are processed securely and are not stored permanently. We only use them for analysis purposes.</p>
              </div>
              <div className="faq-item">
                <h3>Can I delete my data?</h3>
                <p>Yes, you can request deletion of your data at any time by contacting our support team.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="contact-section">
        <div className="container">
          <h2>Still Have Questions?</h2>
          <p>Can&apos;t find what you&apos;re looking for? Our support team is here to help!</p>
          <div className="contact-methods">
            <div className="contact-method">
              <h3>📧 Email Support</h3>
              <p>support@mystyledwardrobe.com</p>
            </div>
            <div className="contact-method">
              <h3>💬 Live Chat</h3>
              <p>Available during business hours</p>
            </div>
            <div className="contact-method">
              <h3>📱 Social Media</h3>
              <p>Follow us for style tips and updates</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="cta-section">
        <div className="container">
          <h2>Ready to Discover Your Style?</h2>
          <p>Start your personalised styling journey today</p>
          <Link href="/" className="cta-button">
            Get Started
          </Link>
        </div>
      </div>
    </div>
  );
}

