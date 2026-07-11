import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service | My Styled Wardrobe',
  description: 'The terms and conditions for using My Styled Wardrobe.',
};

export default function TermsPage() {
  return (
    <div className="faq-page">
      <div className="page-hero">
        <div className="hero-content">
          <h1>Terms of Service</h1>
          <p>Last updated: July 2026</p>
        </div>
      </div>

      <div className="faq-section">
        <div className="container">
          <div className="faq-category">
            <h2>1. Acceptance of Terms</h2>
            <div className="faq-items">
              <div className="faq-item">
                <p>By accessing or using My Styled Wardrobe, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the service.</p>
              </div>
            </div>
          </div>

          <div className="faq-category">
            <h2>2. The Service</h2>
            <div className="faq-items">
              <div className="faq-item">
                <p>My Styled Wardrobe provides AI-powered styling analysis, including body shape and colour palette assessment, outfit suggestions, and shopping recommendations. Recommendations are provided for guidance only and results may vary.</p>
              </div>
            </div>
          </div>

          <div className="faq-category">
            <h2>3. Your Account</h2>
            <div className="faq-items">
              <div className="faq-item">
                <p>You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. You must provide accurate information when registering and be at least 16 years old to use the service.</p>
              </div>
            </div>
          </div>

          <div className="faq-category">
            <h2>4. Photos and Content You Upload</h2>
            <div className="faq-items">
              <div className="faq-item">
                <p>You retain ownership of the photos you upload. By uploading photos, you grant us permission to process them solely to provide the styling analysis you request. Do not upload photos of other people without their consent, or any unlawful or inappropriate content.</p>
              </div>
            </div>
          </div>

          <div className="faq-category">
            <h2>5. Paid Services and Subscriptions</h2>
            <div className="faq-items">
              <div className="faq-item">
                <p>Some features require payment, including subscriptions, professional reviews, and custom shop requests. Payments are processed securely by Stripe. Subscriptions renew automatically until cancelled; you can cancel at any time and retain access until the end of the billing period.</p>
              </div>
            </div>
          </div>

          <div className="faq-category">
            <h2>6. Shopping Links</h2>
            <div className="faq-items">
              <div className="faq-item">
                <p>Product links may direct you to third-party retailer websites. We are not responsible for the availability, pricing, quality, or delivery of products sold by third parties. Purchases are made directly with the retailer under their own terms.</p>
              </div>
            </div>
          </div>

          <div className="faq-category">
            <h2>7. Limitation of Liability</h2>
            <div className="faq-items">
              <div className="faq-item">
                <p>The service is provided &quot;as is&quot; without warranties of any kind. To the maximum extent permitted by law, My Styled Wardrobe shall not be liable for any indirect, incidental, or consequential damages arising from your use of the service.</p>
              </div>
            </div>
          </div>

          <div className="faq-category">
            <h2>8. Changes to These Terms</h2>
            <div className="faq-items">
              <div className="faq-item">
                <p>We may update these terms from time to time. Continued use of the service after changes take effect constitutes acceptance of the revised terms.</p>
              </div>
            </div>
          </div>

          <div className="faq-category">
            <h2>9. Contact</h2>
            <div className="faq-items">
              <div className="faq-item">
                <p>Questions about these terms? <Link href="/contact">Contact us</Link> or email support@mystyledwardrobe.com.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
