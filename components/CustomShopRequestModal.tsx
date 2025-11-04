'use client';

import { useState, useEffect } from 'react';

interface CustomShopRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: {
    bodyShape: string;
    colourPalette: string;
    occasion: string;
    budget: string;
    retailers?: string[];
  };
}

export default function CustomShopRequestModal({
  isOpen,
  onClose,
  userProfile
}: CustomShopRequestModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedRetailers, setSelectedRetailers] = useState<string[]>(userProfile.retailers || ['ASOS']);

  // Fetch user session data when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchUserData();
    }
  }, [isOpen]);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/simple-auth/session');
      const data = await response.json();
      
      if (data.user) {
        setName(data.user.name || '');
        setEmail(data.user.email || '');
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      console.log('🛒 Starting custom shop payment process...');
      
      // Create Stripe Checkout session
      const response = await fetch('/api/custom-shop/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userName: name,
          userEmail: email,
          bodyShape: userProfile.bodyShape,
          colourPalette: userProfile.colourPalette,
          occasion: userProfile.occasion,
          budget: userProfile.budget,
          retailers: selectedRetailers,
          preferences: additionalInfo,
        }),
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('❌ Payment error:', errorData);
        
        // Provide user-friendly error messages
        if (response.status === 401) {
          throw new Error('Please sign in to request a custom shop. Click the LOG IN button at the top of the page.');
        } else if (response.status === 500 && errorData.error?.includes('not configured')) {
          throw new Error('Payment system is currently unavailable. Please contact support at support@mystyledwardrobe.com');
        } else {
          throw new Error(errorData.error || `Payment failed (Error ${response.status}). Please try again.`);
        }
      }

      const data = await response.json();
      console.log('✅ Checkout session created:', data);
      
      // Redirect to Stripe Checkout
      if (data.checkoutUrl) {
        console.log('🔄 Redirecting to Stripe Checkout...');
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error('No payment URL received. Please contact support.');
      }
    } catch (err) {
      console.error('💥 Payment error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to start checkout. Please try again.';
      setError(errorMessage);
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '16px',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '2rem',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {!submitted ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.75rem', color: '#1e293b', margin: 0 }}>
                Request Customised Online Shop
              </h2>
              <button
                onClick={onClose}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#64748b',
                  padding: '0.25rem',
                }}
              >
                ×
              </button>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              color: 'white',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1rem',
              textAlign: 'center'
            }}>
              <p style={{ margin: 0, fontSize: '1.125rem', fontWeight: '600' }}>
                Service Fee: £120
              </p>
            </div>

            <p style={{ color: '#64748b', marginBottom: '1.5rem', lineHeight: '1.6' }}>
              Our styling team will create a personalised online shopping experience tailored to your:
            </p>

            <div style={{
              background: '#f8fafc',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1.5rem',
            }}>
              <p style={{ margin: '0.5rem 0', color: '#475569' }}>
                <strong>Body Shape:</strong> {userProfile.bodyShape}
              </p>
              <p style={{ margin: '0.5rem 0', color: '#475569' }}>
                <strong>Colour Season:</strong> {userProfile.colourPalette}
              </p>
              <p style={{ margin: '0.5rem 0', color: '#475569' }}>
                <strong>Occasion:</strong> {userProfile.occasion}
              </p>
              <p style={{ margin: '0.5rem 0', color: '#475569' }}>
                <strong>Budget:</strong> {userProfile.budget}
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: '600', color: '#1e293b' }}>
                  Preferred Retailers *
                </label>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                }}>
                  {['ASOS', 'M&S', 'River Island', 'John Lewis', 'Mint Velvet', 'Fat Face', 'White Stuff', 'Tu Sainsburys', 'H&M', 'Zara', 'Next'].map((retailer) => (
                    <button
                      key={retailer}
                      type="button"
                      onClick={() => {
                        if (selectedRetailers.includes(retailer)) {
                          setSelectedRetailers(selectedRetailers.filter(r => r !== retailer));
                        } else {
                          setSelectedRetailers([...selectedRetailers, retailer]);
                        }
                      }}
                      style={{
                        padding: '0.5rem 1rem',
                        background: selectedRetailers.includes(retailer)
                          ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                          : '#f1f5f9',
                        color: selectedRetailers.includes(retailer) ? 'white' : '#475569',
                        border: selectedRetailers.includes(retailer) ? 'none' : '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        if (!selectedRetailers.includes(retailer)) {
                          e.currentTarget.style.background = '#e2e8f0';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!selectedRetailers.includes(retailer)) {
                          e.currentTarget.style.background = '#f1f5f9';
                        }
                      }}
                    >
                      {retailer}
                    </button>
                  ))}
                </div>
                <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.5rem' }}>
                  Select one or more retailers (selected: {selectedRetailers.length})
                </p>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#1e293b' }}>
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '1rem',
                  }}
                  placeholder="Enter your full name"
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#1e293b' }}>
                  Your Email *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '1rem',
                  }}
                  placeholder="your@email.com"
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#1e293b' }}>
                  Additional Preferences (Optional)
                </label>
                <textarea
                  value={additionalInfo}
                  onChange={(e) => setAdditionalInfo(e.target.value)}
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    resize: 'vertical',
                  }}
                  placeholder="Any specific requirements, favourite retailers, style preferences, etc."
                />
              </div>

              {error && (
                <div style={{
                  padding: '0.75rem',
                  background: '#fee2e2',
                  border: '1px solid #ef4444',
                  borderRadius: '8px',
                  color: '#991b1b',
                  marginBottom: '1rem',
                }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || selectedRetailers.length === 0}
                style={{
                  width: '100%',
                  padding: '1rem',
                  background: (isSubmitting || selectedRetailers.length === 0)
                    ? '#9ca3af'
                    : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: (isSubmitting || selectedRetailers.length === 0) ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
                }}
              >
                {isSubmitting ? 'Processing...' : 'Proceed to Payment (£120)'}
              </button>
              
              <p style={{ 
                fontSize: '0.875rem', 
                color: '#64748b', 
                textAlign: 'center',
                marginTop: '0.75rem',
                marginBottom: 0 
              }}>
                Secure payment powered by Stripe
              </p>
            </form>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{
              fontSize: '4rem',
              marginBottom: '1rem',
            }}>
              ✉️
            </div>
            <h2 style={{ color: '#10b981', marginBottom: '1rem' }}>
              Request Submitted!
            </h2>
            <p style={{ color: '#64748b', marginBottom: '1.5rem', lineHeight: '1.6' }}>
              Thank you for your request! Our styling team will curate your personalised online shop and send it to{' '}
              <strong>{email}</strong> within 2-3 business days.
            </p>
            <button
              onClick={onClose}
              style={{
                padding: '0.875rem 2rem',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}


