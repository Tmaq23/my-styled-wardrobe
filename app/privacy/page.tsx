import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy | My Styled Wardrobe',
  description: 'How My Styled Wardrobe collects, uses, and protects your data.',
};

export default function PrivacyPage() {
  return (
    <div className="faq-page">
      <div className="page-hero">
        <div className="hero-content">
          <h1>Privacy Policy</h1>
          <p>Last updated: July 2026</p>
        </div>
      </div>

      <div className="faq-section">
        <div className="container">
          <div className="faq-category">
            <h2>1. Information We Collect</h2>
            <div className="faq-items">
              <div className="faq-item">
                <p>When you create an account we collect your name, email address, and a securely hashed password. When you use our styling tools we process the photos you upload and the style preferences you select (such as occasion, budget, and body shape). If you purchase a subscription or service, payment details are handled by Stripe and never stored on our servers.</p>
              </div>
            </div>
          </div>

          <div className="faq-category">
            <h2>2. How We Use Your Photos</h2>
            <div className="faq-items">
              <div className="faq-item">
                <p>Photos you upload are used solely to generate your styling analysis. They are processed securely and are not used to train AI models, sold, or shared with advertisers.</p>
              </div>
            </div>
          </div>

          <div className="faq-category">
            <h2>3. How We Use Your Information</h2>
            <div className="faq-items">
              <div className="faq-item">
                <p>We use your account information to operate the service, remember your styling profile, enforce fair-use limits on free analyses, process payments and subscriptions, and respond to support requests. We do not sell your personal data to third parties.</p>
              </div>
            </div>
          </div>

          <div className="faq-category">
            <h2>4. Third-Party Services</h2>
            <div className="faq-items">
              <div className="faq-item">
                <p>We use trusted third-party providers to power parts of the service, including AI analysis, database hosting, and payment processing (Stripe). These providers process data on our behalf under their own privacy and security commitments. Shopping links take you to retailer websites governed by their own privacy policies.</p>
              </div>
            </div>
          </div>

          <div className="faq-category">
            <h2>5. Data Retention and Deletion</h2>
            <div className="faq-items">
              <div className="faq-item">
                <p>We retain your account information for as long as your account is active. You can request deletion of your account and associated data at any time by contacting support@mystyledwardrobe.com, and we will action your request within 30 days.</p>
              </div>
            </div>
          </div>

          <div className="faq-category">
            <h2>6. Cookies</h2>
            <div className="faq-items">
              <div className="faq-item">
                <p>We use a single essential session cookie to keep you signed in. We do not use advertising or cross-site tracking cookies.</p>
              </div>
            </div>
          </div>

          <div className="faq-category">
            <h2>7. Your Rights</h2>
            <div className="faq-items">
              <div className="faq-item">
                <p>Depending on your location, you may have rights to access, correct, export, or delete your personal data. To exercise any of these rights, <Link href="/contact">contact us</Link>.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
