'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Verification {
  id: string;
  userId: string;
  bodyShape: string;
  colorPalette: string;
  verifiedBodyShape: string | null;
  verifiedColorPalette: string | null;
  stylistNotes: string | null;
  status: string;
  paymentStatus: string;
  createdAt: string;
  verifiedAt: string | null;
  user: {
    id: string;
    email: string | null;
    name: string | null;
  };
}

export default function VerificationsAdminPage() {
  // Add responsive CSS
  if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = `
      @media (max-width: 1024px) {
        .verification-grid {
          grid-template-columns: 1fr !important;
        }
      }
    `;
    if (!document.getElementById('verification-responsive-styles')) {
      style.id = 'verification-responsive-styles';
      document.head.appendChild(style);
    }
  }

  const router = useRouter();
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVerification, setSelectedVerification] = useState<Verification | null>(null);
  const [formData, setFormData] = useState({
    verifiedBodyShape: '',
    verifiedColorPalette: '',
    stylistNotes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchVerifications();
  }, []);

  const fetchVerifications = async () => {
    try {
      const response = await fetch('/api/verification/list?admin=true');
      const data = await response.json();
      if (response.ok) {
        setVerifications(data.verifications || []);
      }
    } catch (error) {
      console.error('Error fetching verifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectVerification = (verification: Verification) => {
    setSelectedVerification(verification);
    setFormData({
      verifiedBodyShape: verification.verifiedBodyShape || verification.bodyShape,
      verifiedColorPalette: verification.verifiedColorPalette || verification.colorPalette,
      stylistNotes: verification.stylistNotes || '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVerification) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/verification/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verificationId: selectedVerification.id,
          verifiedBodyShape: formData.verifiedBodyShape,
          verifiedColorPalette: formData.verifiedColorPalette,
          stylistNotes: formData.stylistNotes,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Verification submitted successfully!');
        setSelectedVerification(null);
        fetchVerifications();
      } else {
        alert(data.error || 'Failed to submit verification');
      }
    } catch (error) {
      alert('Error submitting verification');
    } finally {
      setIsSubmitting(false);
    }
  };

  const pendingVerifications = verifications.filter(v => v.status === 'in_review');
  const completedVerifications = verifications.filter(v => v.status === 'verified');

  return (
    <div className="home-page" style={{ 
      minHeight: '100vh', 
      paddingTop: '140px', 
      paddingLeft: '2rem', 
      paddingRight: '2rem', 
      paddingBottom: '2rem' 
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <h1 style={{ 
            margin: 0, 
            color: 'white', 
            fontSize: '2rem', 
            fontWeight: '700' 
          }}>
            Stylist Verification Dashboard
          </h1>
          <button
            onClick={() => router.push('/admin')}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'background 0.3s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
          >
            ← Back to Admin
          </button>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', 
          gap: '2rem',
        }}
        className="verification-grid"
        >
        {/* Pending Verifications */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          padding: '1.5rem',
        }}>
          <h2 style={{ 
            marginBottom: '1rem', 
            color: '#a78bfa',
            fontSize: '1.5rem',
            fontWeight: '600'
          }}>
            Pending Reviews ({pendingVerifications.length})
          </h2>
          {isLoading ? (
            <p style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Loading...</p>
          ) : pendingVerifications.length === 0 ? (
            <p style={{ color: 'rgba(255, 255, 255, 0.5)' }}>No pending verifications</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {pendingVerifications.map((verification) => (
                <div
                  key={verification.id}
                  onClick={() => handleSelectVerification(verification)}
                  style={{
                    padding: '1rem',
                    background: selectedVerification?.id === verification.id 
                      ? 'rgba(139, 92, 246, 0.3)' 
                      : 'rgba(255, 255, 255, 0.05)',
                    border: `2px solid ${selectedVerification?.id === verification.id ? '#a78bfa' : 'rgba(255, 255, 255, 0.2)'}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    if (selectedVerification?.id !== verification.id) {
                      e.currentTarget.style.borderColor = '#a78bfa';
                      e.currentTarget.style.background = 'rgba(139, 92, 246, 0.15)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedVerification?.id !== verification.id) {
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    }
                  }}
                >
                  <div style={{ marginBottom: '0.5rem', color: 'white', fontWeight: '600' }}>
                    <strong>User:</strong> {verification.user.email || verification.user.name || 'Unknown'}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.8)' }}>
                    <div><strong>AI Body Shape:</strong> {verification.bodyShape}</div>
                    <div><strong>AI Color Palette:</strong> {verification.colorPalette}</div>
                    <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                      Requested: {new Date(verification.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Verification Form */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          padding: '1.5rem',
          minHeight: '300px',
        }}>
          {selectedVerification ? (
            <>
              <h2 style={{ 
                marginBottom: '1rem',
                color: '#fbbf24',
                fontSize: '1.5rem',
                fontWeight: '600'
              }}>
                Review & Verify
              </h2>
              
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'white' }}>
                    Original AI Body Shape:
                  </label>
                  <div style={{ padding: '0.75rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '6px', color: 'rgba(255, 255, 255, 0.9)' }}>
                    {selectedVerification.bodyShape}
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'white' }}>
                    Verified Body Shape: *
                  </label>
                  <select
                    value={formData.verifiedBodyShape}
                    onChange={(e) => setFormData({ ...formData, verifiedBodyShape: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '1rem',
                    }}
                  >
                    <option value="">Select...</option>
                    <option value="Hourglass">Hourglass</option>
                    <option value="Triangle">Triangle</option>
                    <option value="Inverted Triangle">Inverted Triangle</option>
                    <option value="Rectangle">Rectangle</option>
                    <option value="Round">Round</option>
                  </select>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'white' }}>
                    Original AI Color Palette:
                  </label>
                  <div style={{ padding: '0.75rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '6px', color: 'rgba(255, 255, 255, 0.9)' }}>
                    {selectedVerification.colorPalette}
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'white' }}>
                    Verified Color Palette: *
                  </label>
                  <select
                    value={formData.verifiedColorPalette}
                    onChange={(e) => setFormData({ ...formData, verifiedColorPalette: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '1rem',
                    }}
                  >
                    <option value="">Select...</option>
                    <option value="Spring">Spring</option>
                    <option value="Summer">Summer</option>
                    <option value="Autumn">Autumn</option>
                    <option value="Winter">Winter</option>
                  </select>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'white' }}>
                    Stylist Notes & Recommendations:
                  </label>
                  <textarea
                    value={formData.stylistNotes}
                    onChange={(e) => setFormData({ ...formData, stylistNotes: e.target.value })}
                    rows={6}
                    placeholder="Add personalized styling recommendations, notes about fit, color combinations, etc."
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '6px',
                      fontSize: '1rem',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: 'white',
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    width: '100%',
                    padding: '0.875rem',
                    background: isSubmitting
                      ? '#9ca3af'
                      : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Verification'}
                </button>
              </form>
            </>
          ) : (
            <div style={{
              textAlign: 'center',
              color: 'rgba(255, 255, 255, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '250px',
            }}>
              <p style={{ fontSize: '1.1rem' }}>Select a verification request to review</p>
            </div>
          )}
        </div>
      </div>

      {/* Completed Verifications */}
      {completedVerifications.length > 0 && (
        <div style={{ marginTop: '3rem' }}>
          <h2 style={{ 
            marginBottom: '1rem', 
            color: '#10b981',
            fontSize: '1.5rem',
            fontWeight: '600'
          }}>
            Completed Verifications
          </h2>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {completedVerifications.map((verification) => (
              <div
                key={verification.id}
                style={{
                  padding: '1rem',
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '8px',
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)' }}>User</div>
                    <div style={{ color: 'white', fontWeight: '500' }}>{verification.user.email || verification.user.name}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)' }}>Verified Body Shape</div>
                    <div style={{ color: 'white', fontWeight: '500' }}>{verification.verifiedBodyShape}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)' }}>Verified Color Palette</div>
                    <div style={{ color: 'white', fontWeight: '500' }}>{verification.verifiedColorPalette}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)' }}>Verified Date</div>
                    <div style={{ color: 'white', fontWeight: '500' }}>{verification.verifiedAt ? new Date(verification.verifiedAt).toLocaleDateString() : '-'}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
    </div>
  );
}

