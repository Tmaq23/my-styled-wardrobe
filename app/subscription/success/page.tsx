'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isConfirming, setIsConfirming] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const confirmSubscription = async () => {
      const sessionId = searchParams.get('session_id');
      
      if (!sessionId) {
        setError('No session ID found');
        setIsConfirming(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/subscription/confirm-checkout?session_id=${sessionId}`
        );

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to confirm subscription');
        }

        setIsConfirming(false);
      } catch (err) {
        console.error('Confirmation error:', err);
        setError(err instanceof Error ? err.message : 'Failed to confirm subscription');
        setIsConfirming(false);
      }
    };

    confirmSubscription();
  }, [searchParams]);

  if (isConfirming) {
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
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid #f3f4f6',
            borderTop: '4px solid #667eea',
            borderRadius: '50%',
            margin: '0 auto 1.5rem',
            animation: 'spin 1s linear infinite',
          }} />
          <h1 style={{ color: '#1e293b', marginBottom: '1rem', fontSize: '1.75rem' }}>
            Confirming Your Subscription...
          </h1>
          <p style={{ color: '#64748b', lineHeight: '1.6' }}>
            Please wait while we activate your premium features.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
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
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚠️</div>
          <h1 style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '1.75rem' }}>
            Confirmation Error
          </h1>
          <p style={{ color: '#64748b', marginBottom: '2rem', lineHeight: '1.6' }}>
            {error}
          </p>
          <Link
            href="/pricing"
            style={{
              display: 'inline-block',
              padding: '0.875rem 2rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: '600',
            }}
          >
            Back to Pricing
          </Link>
        </div>
      </div>
    );
  }

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
        maxWidth: '600px',
        textAlign: 'center',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
        <h1 style={{
          color: '#1e293b',
          marginBottom: '1rem',
          fontSize: '2rem',
          fontWeight: '700',
        }}>
          Welcome to Premium!
        </h1>
        <p style={{
          color: '#64748b',
          marginBottom: '2rem',
          lineHeight: '1.6',
          fontSize: '1.125rem',
        }}>
          Your subscription has been activated successfully. You now have access to:
        </p>
        
        <div style={{
          background: '#f8fafc',
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '2rem',
          textAlign: 'left',
        }}>
          <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ color: '#10b981', fontSize: '1.5rem' }}>✓</span>
            <span style={{ color: '#1e293b', fontWeight: '500' }}>
              Unlimited AI outfit Combination Generator
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ color: '#10b981', fontSize: '1.5rem' }}>✓</span>
            <span style={{ color: '#1e293b', fontWeight: '500' }}>
              Access to Style Blog
            </span>
          </div>
        </div>

        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}>
          <Link
            href="/style-interface"
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
            Start Creating Outfits
          </Link>
          <Link
            href="/blog"
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
            Read the Blog
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SubscriptionSuccessPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}>
        <div style={{ color: 'white', fontSize: '1.5rem' }}>Loading...</div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}

