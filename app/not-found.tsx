import Link from 'next/link';

export default function NotFound() {
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
          404
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.25rem', margin: '0.75rem 0 1rem', color: '#1c1a17' }}>
          This page has gone out of style
        </h1>
        <p style={{ color: '#6b655d', lineHeight: 1.7, margin: '0 0 2rem' }}>
          We couldn&apos;t find the page you were looking for. It may have moved, or the link may be out of date.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/" className="cta-button" style={{ padding: '0.9rem 2rem' }}>
            Back to Home
          </Link>
          <Link
            href="/style-interface"
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
            Open Styling Studio
          </Link>
        </div>
      </div>
    </div>
  );
}
