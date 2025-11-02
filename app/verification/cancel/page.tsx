'use client';

import Link from 'next/link';

export default function VerificationCancelPage() {
  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '2rem', textAlign: 'center' }}>
      <div style={{
        background: '#fef2f2',
        border: '2px solid #fecaca',
        color: '#991b1b',
        padding: '2rem',
        borderRadius: '12px',
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
        <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem' }}>Payment Cancelled</h1>
        <p style={{ margin: 0, opacity: 0.9 }}>
          Your verification request was not completed. No charges were made.
        </p>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <Link
          href="/style-interface"
          style={{
            display: 'inline-block',
            padding: '0.875rem 2rem',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '8px',
            fontWeight: '600',
          }}
        >
          Back to Style Interface
        </Link>
      </div>
    </div>
  );
}

