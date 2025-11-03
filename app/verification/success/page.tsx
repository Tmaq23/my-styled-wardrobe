'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function VerificationSuccessContent() {
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
      <div className="home-page" style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        paddingTop: '120px'
      }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
          <p style={{ fontSize: '1.2rem' }}>Processing your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="home-page" style={{ 
      minHeight: '100vh', 
      paddingTop: '140px',
      paddingBottom: '2rem',
      paddingLeft: '1rem',
      paddingRight: '1rem'
    }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        {/* Success Message */}
        <div style={{
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: 'white',
          padding: '2.5rem 2rem',
          borderRadius: '16px',
          textAlign: 'center',
          boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)',
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✓</div>
          <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem', fontWeight: '700' }}>
            Payment Successful!
          </h1>
          <p style={{ margin: 0, opacity: 0.95, fontSize: '1.1rem', lineHeight: '1.6' }}>
            Your verification request has been submitted. A qualified stylist will review your analysis.
          </p>
        </div>

        {/* What Happens Next Box */}
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
            What happens next?
          </h2>
          <ol style={{ 
            paddingLeft: '1.5rem', 
            lineHeight: '2',
            color: '#374151',
            fontSize: '1.05rem',
            margin: 0
          }}>
            <li style={{ marginBottom: '0.75rem' }}>
              <strong style={{ color: '#1a1a1a' }}>Professional Review:</strong> A qualified stylist will carefully review your AI analysis
            </li>
            <li style={{ marginBottom: '0.75rem' }}>
              <strong style={{ color: '#1a1a1a' }}>Email Notification:</strong> You&apos;ll receive an email when your verification is complete
            </li>
            <li>
              <strong style={{ color: '#1a1a1a' }}>Verified Results:</strong> Your verified body shape, color palette, and styling recommendations will appear in your style interface
            </li>
          </ol>
        </div>

        {/* Expected Timeline */}
        <div style={{
          marginTop: '1.5rem',
          padding: '1.5rem',
          background: 'rgba(99, 102, 241, 0.1)',
          borderRadius: '12px',
          border: '1px solid rgba(99, 102, 241, 0.3)',
        }}>
          <p style={{ 
            margin: 0, 
            color: 'white',
            fontSize: '0.95rem',
            lineHeight: '1.6'
          }}>
            <strong>⏰ Expected Timeline:</strong> Most verifications are completed within 24-48 hours. 
            You can check the status anytime in your style interface.
          </p>
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

export default function VerificationSuccessPage() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>Loading...</div>}>
      <VerificationSuccessContent />
    </Suspense>
  );
}

