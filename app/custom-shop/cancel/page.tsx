'use client';

import Link from 'next/link';

export default function CustomShopCancelPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
      <div style={{ maxWidth: '600px', padding: '50px', background: 'white', borderRadius: '20px', boxShadow: '0 25px 70px rgba(0,0,0,0.3)' }}>
        <div style={{ fontSize: '72px', textAlign: 'center', marginBottom: '25px' }}>😔</div>
        <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '20px', textAlign: 'center', color: '#1a1a1a' }}>
          Payment Cancelled
        </h1>
        <p style={{ fontSize: '18px', color: '#374151', textAlign: 'center', marginBottom: '30px', lineHeight: '1.7' }}>
          Your custom shop request payment was cancelled. No charges have been made to your account.
        </p>

        <div style={{ background: '#fffbeb', padding: '25px', borderRadius: '12px', marginBottom: '30px', borderLeft: '4px solid #f59e0b' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '15px', color: '#78350f' }}>
            💡 What You Can Do
          </h3>
          <ul style={{ color: '#92400e', paddingLeft: '20px', margin: 0, lineHeight: '2' }}>
            <li>Return to the style interface and try again</li>
            <li>Review your styling preferences before proceeding</li>
            <li>Contact us if you experienced any issues</li>
          </ul>
        </div>

        <div style={{ textAlign: 'center', display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            href="/style-interface"
            style={{
              display: 'inline-block',
              padding: '14px 28px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '600',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
            }}
          >
            Return to Style Interface
          </Link>
          <a
            href="mailto:admin@mystyledwardrobe.com"
            style={{
              display: 'inline-block',
              padding: '14px 28px',
              background: 'white',
              color: '#667eea',
              border: '2px solid #667eea',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '600',
            }}
          >
            Contact Support
          </a>
        </div>

        <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #e5e7eb', textAlign: 'center' }}>
          <p style={{ color: '#9ca3af', fontSize: '14px' }}>
            Need help? We&apos;re here for you at{' '}
            <a href="mailto:admin@mystyledwardrobe.com" style={{ color: '#667eea', textDecoration: 'none' }}>
              admin@mystyledwardrobe.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}


