'use client';

import { useState, useEffect } from 'react';

interface VerificationRequestProps {
  bodyShape: string;
  colorPalette: string;
  bodyImageUrl?: string;
  faceImageUrl?: string;
  onVerificationComplete?: () => void;
}

export default function VerificationRequest({
  bodyShape,
  colorPalette,
  bodyImageUrl,
  faceImageUrl,
  onVerificationComplete,
}: VerificationRequestProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<'none' | 'pending' | 'in_review' | 'verified'>('none');
  const [verificationData, setVerificationData] = useState<any>(null);

  // Debug: Log props on mount/update
  useEffect(() => {
    console.log('VerificationRequest props:', { bodyShape, colorPalette });
  }, [bodyShape, colorPalette]);

  // Check existing verification status
  useEffect(() => {
    checkVerificationStatus();
  }, []);

  const checkVerificationStatus = async () => {
    try {
      const response = await fetch('/api/verification/list');
      if (response.ok) {
        const data = await response.json();
        const matchingVerification = data.verifications?.find(
          (v: any) => v.bodyShape === bodyShape && v.colorPalette === colorPalette
        );
        if (matchingVerification) {
          setVerificationStatus(matchingVerification.status as any);
          setVerificationData(matchingVerification);
        }
      } else if (response.status === 401) {
        // User not logged in - this is fine, just means no verifications to show
        console.log('User not authenticated - no existing verifications to display');
      }
    } catch (err) {
      console.error('Error checking verification status:', err);
    }
  };

  const handleRequestVerification = async () => {
    setIsLoading(true);
    setError(null);

    // Validate that we have the required values (check for undefined, null, empty string, or whitespace)
    const trimmedBodyShape = bodyShape?.trim();
    const trimmedColorPalette = colorPalette?.trim();
    
    if (!trimmedBodyShape || trimmedBodyShape.length === 0) {
      setError(`Body shape is required but received: "${bodyShape}". Please ensure your AI analysis has completed successfully.`);
      setIsLoading(false);
      return;
    }

    if (!trimmedColorPalette || trimmedColorPalette.length === 0) {
      setError(`Color palette is required but received: "${colorPalette}". Please ensure your AI analysis has completed successfully.`);
      setIsLoading(false);
      return;
    }

    try {
      // Debug logging
      console.log('Requesting verification with:', { 
        bodyShape: trimmedBodyShape, 
        colorPalette: trimmedColorPalette,
        originalBodyShape: bodyShape,
        originalColorPalette: colorPalette
      });

      // Create Stripe Checkout Session directly
      const checkoutResponse = await fetch('/api/verification/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bodyShape: trimmedBodyShape,
          colorPalette: trimmedColorPalette,
          bodyImageUrl,
          faceImageUrl,
        }),
      });

      const checkoutData = await checkoutResponse.json();

      if (!checkoutResponse.ok) {
        // Handle authentication error specifically
        if (checkoutResponse.status === 401) {
          setError('Please log in or create an account to request verification. Click the "Sign In" button in the navigation menu.');
          setIsLoading(false);
          return;
        }
        throw new Error(checkoutData.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      if (checkoutData.url) {
        window.location.href = checkoutData.url;
      } else {
        throw new Error('No checkout URL received');
      }

    } catch (err: any) {
      console.error('Verification request error:', err);
      setError(err.message || 'Failed to process verification request');
      setIsLoading(false);
    }
  };

  if (verificationStatus === 'verified' && verificationData) {
    return (
      <div style={{
        marginTop: '1.5rem',
        padding: '1.5rem',
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        borderRadius: '12px',
        color: 'white',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <span style={{ fontSize: '1.5rem' }}>✓</span>
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600' }}>
            Verified by Qualified Stylist
          </h3>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.2)', padding: '1rem', borderRadius: '8px' }}>
          <div style={{ marginBottom: '0.75rem' }}>
            <strong>Verified Body Shape:</strong> {verificationData.verifiedBodyShape}
          </div>
          <div style={{ marginBottom: '0.75rem' }}>
            <strong>Verified Colour Palette:</strong> {verificationData.verifiedColorPalette}
          </div>
          {verificationData.stylistNotes && (
            <div>
              <strong>Stylist Notes:</strong>
              <p style={{ marginTop: '0.5rem', lineHeight: '1.6' }}>{verificationData.stylistNotes}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (verificationStatus === 'in_review') {
    return (
      <div style={{
        marginTop: '1.5rem',
        padding: '1.5rem',
        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        borderRadius: '12px',
        color: 'white',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.5rem' }}>⏳</span>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600' }}>
              Verification in Review
            </h3>
            <p style={{ margin: '0.5rem 0 0 0', opacity: 0.9 }}>
              Your analysis is being reviewed by a qualified stylist. You&apos;ll receive the verified results soon.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      marginTop: '1.5rem',
      padding: '1.5rem',
      background: 'white',
      borderRadius: '12px',
      border: '2px solid #e5e7eb',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    }}>
      <div style={{ marginBottom: '1rem' }}>
        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: '600', color: '#1a1a1a' }}>
          Get Verified by a Qualified Stylist
        </h3>
        <p style={{ margin: 0, color: '#374151', fontSize: '0.875rem', lineHeight: '1.6' }}>
          Have your AI analysis reviewed and verified by a professional stylist for £30.
          You&apos;ll receive verified results and personalized styling recommendations.
        </p>
      </div>

      {error && (
        <div style={{
          padding: '0.75rem',
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          color: '#991b1b',
          marginBottom: '1rem',
          fontSize: '0.875rem',
          lineHeight: '1.6',
        }}>
          {error}
          {error.includes('log in or create an account') && (
            <div style={{ marginTop: '0.75rem' }}>
              <a 
                href="/auth/signin" 
                style={{
                  display: 'inline-block',
                  padding: '0.5rem 1rem',
                  background: '#6366f1',
                  color: 'white',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                }}
              >
                Sign In / Create Account
              </a>
            </div>
          )}
        </div>
      )}

      <button
        onClick={handleRequestVerification}
        disabled={isLoading}
        style={{
          width: '100%',
          padding: '0.875rem 1.5rem',
          background: isLoading 
            ? '#9ca3af' 
            : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '1rem',
          fontWeight: '600',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s',
          boxShadow: isLoading ? 'none' : '0 4px 12px rgba(99, 102, 241, 0.4)',
        }}
        onMouseEnter={(e) => {
          if (!isLoading) {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(99, 102, 241, 0.5)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isLoading) {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.4)';
          }
        }}
      >
        {isLoading ? 'Processing...' : `Get Verified - £30`}
      </button>

      <div style={{
        marginTop: '1rem',
        padding: '0.75rem',
        background: '#f9fafb',
        borderRadius: '8px',
        fontSize: '0.75rem',
        color: '#374151',
      }}>
        <strong style={{ color: '#1a1a1a' }}>What you&apos;ll get:</strong>
        <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.25rem' }}>
          <li>Professional verification of your body shape</li>
          <li>Expert-confirmed color palette</li>
          <li>Personalized styling recommendations</li>
          <li>Detailed notes from a qualified stylist</li>
        </ul>
      </div>
    </div>
  );
}

