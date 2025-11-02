'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function VerificationSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [verification, setVerification] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (sessionId) {
      confirmVerification(sessionId);
    } else {
      setIsLoading(false);
    }
  }, [searchParams]);

  const confirmVerification = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/verification/confirm-checkout?session_id=${sessionId}`);
      const data = await response.json();

      if (response.ok && data.success) {
        setVerification(data.verification);
      }
    } catch (error) {
      console.error('Error confirming verification:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
        <p>Processing your payment...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '2rem' }}>
      <div style={{
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        color: 'white',
        padding: '2rem',
        borderRadius: '12px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✓</div>
        <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem' }}>Payment Successful!</h1>
        <p style={{ margin: 0, opacity: 0.9 }}>
          Your verification request has been submitted. A qualified stylist will review your analysis.
        </p>
      </div>

      <div style={{
        marginTop: '2rem',
        padding: '1.5rem',
        background: 'white',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
      }}>
        <h2 style={{ margin: '0 0 1rem 0' }}>What happens next?</h2>
        <ol style={{ paddingLeft: '1.5rem', lineHeight: '1.8' }}>
          <li>A qualified stylist will review your analysis</li>
          <li>You'll receive an email notification when your verification is complete</li>
          <li>Verified results will appear in your style interface</li>
        </ol>
      </div>

      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
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

