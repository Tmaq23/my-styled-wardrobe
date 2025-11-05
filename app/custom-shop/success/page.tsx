'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isConfirming, setIsConfirming] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const confirmPayment = async () => {
      const sessionId = searchParams.get('session_id');
      
      if (!sessionId) {
        setError('No session ID found');
        setIsConfirming(false);
        return;
      }

      try {
        const response = await fetch(`/api/custom-shop/confirm-checkout?session_id=${sessionId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to confirm payment');
        }

        setIsConfirming(false);
      } catch (err) {
        console.error('Payment confirmation error:', err);
        setError(err instanceof Error ? err.message : 'Failed to confirm payment');
        setIsConfirming(false);
      }
    };

    confirmPayment();
  }, [searchParams]);

  if (isConfirming) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
          <h2 style={{ fontSize: '24px', marginBottom: '10px' }}>Confirming your payment...</h2>
          <p style={{ opacity: 0.9 }}>Please wait a moment</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
        <div style={{ maxWidth: '600px', padding: '40px', background: 'white', borderRadius: '16px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
          <div style={{ fontSize: '48px', textAlign: 'center', marginBottom: '20px' }}>❌</div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '15px', textAlign: 'center', color: '#1a1a1a' }}>
            Payment Confirmation Error
          </h1>
          <p style={{ fontSize: '16px', color: '#666', textAlign: 'center', marginBottom: '30px' }}>
            {error}
          </p>
          <div style={{ textAlign: 'center' }}>
            <Link
              href="/style-interface"
              style={{
                display: 'inline-block',
                padding: '12px 32px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: '600',
              }}
            >
              Return to Style Interface
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div style={{ maxWidth: '700px', padding: '50px', background: 'white', borderRadius: '20px', boxShadow: '0 25px 70px rgba(0,0,0,0.3)' }}>
        <div style={{ fontSize: '72px', textAlign: 'center', marginBottom: '25px' }}>✨</div>
        <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '20px', textAlign: 'center', color: '#1a1a1a' }}>
          Payment Successful!
        </h1>
        <p style={{ fontSize: '18px', color: '#374151', textAlign: 'center', marginBottom: '30px', lineHeight: '1.7' }}>
          Thank you for purchasing our Personalized Custom Shop Service! Your payment of <strong>£120</strong> has been confirmed.
        </p>

        <div style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', padding: '25px', borderRadius: '12px', marginBottom: '30px', borderLeft: '4px solid #f59e0b' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '15px', color: '#78350f' }}>
            🎨 What Happens Next?
          </h3>
          <ol style={{ color: '#92400e', paddingLeft: '20px', margin: 0, lineHeight: '2' }}>
            <li><strong>Stylist Review:</strong> Our professional styling team will review your preferences and profile</li>
            <li><strong>Personalized Curation:</strong> We&apos;ll hand-pick items that perfectly match your body shape, color palette, and occasion</li>
            <li><strong>Custom Shop Creation:</strong> You&apos;ll receive a personalized online shop with clickable purchase links</li>
            <li><strong>Email Delivery:</strong> Expect your custom shop within <strong>2-3 business days</strong></li>
          </ol>
        </div>

        <div style={{ background: '#f0fdf4', padding: '20px', borderRadius: '12px', marginBottom: '30px', borderLeft: '4px solid #10b981' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '10px', color: '#065f46' }}>
            📧 Confirmation Email
          </h3>
          <p style={{ color: '#047857', margin: 0, lineHeight: '1.7' }}>
            You&apos;ll receive a confirmation email shortly with your order details and estimated delivery time.
          </p>
        </div>

        <div style={{ textAlign: 'center', display: 'flex', gap: '15px', justifyContent: 'center' }}>
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
        </div>

        <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #e5e7eb', textAlign: 'center' }}>
          <p style={{ color: '#9ca3af', fontSize: '14px' }}>
            Questions? Contact us at{' '}
            <a href="mailto:admin@mystyledwardrobe.com" style={{ color: '#667eea', textDecoration: 'none' }}>
              admin@mystyledwardrobe.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CustomShopSuccessPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Loading...</p>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}

