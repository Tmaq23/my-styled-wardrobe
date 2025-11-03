'use client';

import Link from 'next/link';

export default function VerificationCancelPage() {
  return (
    <div className="home-page" style={{ 
      minHeight: '100vh', 
      paddingTop: '140px',
      paddingBottom: '2rem',
      paddingLeft: '1rem',
      paddingRight: '1rem'
    }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        {/* Cancelled Message */}
        <div style={{
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: 'white',
          padding: '2.5rem 2rem',
          borderRadius: '16px',
          textAlign: 'center',
          boxShadow: '0 8px 24px rgba(239, 68, 68, 0.3)',
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚠️</div>
          <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem', fontWeight: '700' }}>
            Payment Cancelled
          </h1>
          <p style={{ margin: 0, opacity: 0.95, fontSize: '1.1rem', lineHeight: '1.6' }}>
            Your verification request was not completed. No charges were made to your account.
          </p>
        </div>

        {/* Information Box */}
        <div style={{
          marginTop: '2rem',
          padding: '2rem',
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '16px',
          border: '1px solid rgba(0, 0, 0, 0.1)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        }}>
          <h2 style={{ 
            margin: '0 0 1.5rem 0', 
            fontSize: '1.5rem',
            fontWeight: '600',
            color: '#1a1a1a'
          }}>
            What would you like to do?
          </h2>
          <ul style={{ 
            paddingLeft: '1.5rem', 
            lineHeight: '2',
            color: '#374151',
            fontSize: '1.05rem',
            margin: 0,
            listStyle: 'none'
          }}>
            <li style={{ marginBottom: '0.75rem' }}>
              ✨ <strong style={{ color: '#1a1a1a' }}>Try Again:</strong> Return to the style interface and request verification when you&apos;re ready
            </li>
            <li style={{ marginBottom: '0.75rem' }}>
              💬 <strong style={{ color: '#1a1a1a' }}>Have Questions?</strong> Contact our support team for assistance
            </li>
            <li>
              📊 <strong style={{ color: '#1a1a1a' }}>View Your Results:</strong> Your AI analysis results are still available in your account
            </li>
          </ul>
        </div>

        {/* Back Button */}
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <Link
            href="/style-interface"
            style={{
              display: 'inline-block',
              padding: '1rem 2.5rem',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '10px',
              fontWeight: '600',
              fontSize: '1.05rem',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.3)';
            }}
          >
            Back to Style Interface
          </Link>
        </div>
      </div>
    </div>
  );
}

