'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled application error:', error);
  }, [error]);

  return (
    <div className="home-page" style={{ alignItems: 'center', justifyContent: 'center', padding: '120px 1.5rem 4rem' }}>
      <div
        style={{
          maxWidth: '560px',
          width: '100%',
          textAlign: 'center',
          background: '#ffffff',
          border: '1px solid #e5dfd4',
          borderRadius: '6px',
          boxShadow: '0 2px 8px rgba(28,26,23,0.07)',
          padding: '3rem 2rem',
        }}
      >
        <p style={{ margin: 0, letterSpacing: '0.2em', fontSize: '0.8rem', color: '#9a9389', textTransform: 'uppercase' }}>
          Something went wrong
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.25rem', margin: '0.75rem 0 1rem', color: '#1c1a17' }}>
          We hit a snag
        </h1>
        <p style={{ color: '#6b655d', lineHeight: 1.7, margin: '0 0 2rem' }}>
          An unexpected error occurred while loading this page. Please try again; if it keeps happening, let us know at{' '}
          <a href="mailto:info@mystyledwardrobe.com" style={{ color: '#1c1a17', fontWeight: 600 }}>
            info@mystyledwardrobe.com
          </a>
          .
        </p>
        {error.digest && (
          <p style={{ color: '#9a9389', fontSize: '0.8rem', margin: '0 0 1.5rem', fontFamily: 'var(--font-geist-mono)' }}>
            Reference: {error.digest}
          </p>
        )}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button type="button" onClick={reset} className="cta-button" style={{ padding: '0.9rem 2rem', border: 'none', cursor: 'pointer' }}>
            Try Again
          </button>
          <Link
            href="/"
            style={{
              display: 'inline-block',
              padding: '0.9rem 2rem',
              border: '1px solid rgba(28,26,23,0.3)',
              borderRadius: '4px',
              color: '#1c1a17',
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
