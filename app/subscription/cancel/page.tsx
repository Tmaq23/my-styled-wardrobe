'use client';

import Link from 'next/link';

export default function SubscriptionCancelPage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem',
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '3rem',
        maxWidth: '500px',
        textAlign: 'center',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>💭</div>
        <h1 style={{
          color: '#1e293b',
          marginBottom: '1rem',
          fontSize: '2rem',
          fontWeight: '700',
        }}>
          Subscription Cancelled
        </h1>
        <p style={{
          color: '#64748b',
          marginBottom: '2rem',
          lineHeight: '1.6',
          fontSize: '1.125rem',
        }}>
          Your subscription payment was cancelled. No charges have been made.
        </p>
        
        <div style={{
          background: '#f8fafc',
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '2rem',
          textAlign: 'left',
        }}>
          <p style={{ color: '#475569', marginBottom: '0.75rem', fontWeight: '500' }}>
            You can still enjoy our free features:
          </p>
          <ul style={{ color: '#64748b', paddingLeft: '1.5rem', margin: 0 }}>
            <li style={{ marginBottom: '0.5rem' }}>1 Free AI body shape and color analysis</li>
            <li style={{ marginBottom: '0.5rem' }}>Basic outfit recommendations</li>
            <li>Professional stylist verification (£30 one-off)</li>
          </ul>
        </div>

        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}>
          <Link
            href="/pricing"
            style={{
              padding: '0.875rem 2rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
            }}
          >
            View Pricing Plans
          </Link>
          <Link
            href="/"
            style={{
              padding: '0.875rem 2rem',
              background: 'white',
              color: '#667eea',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              border: '2px solid #667eea',
            }}
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}

