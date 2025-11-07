'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import ProfileCapture from '../../components/ProfileCapture';
import TemplateResults from '../../components/TemplateResults';
import CustomShopRequestModal from '../../components/CustomShopRequestModal';
import VerificationRequest from '../../components/VerificationRequest';
import dynamic from 'next/dynamic';
// WardrobeStats and WardrobeUploader imports removed

export default function StyleInterfacePage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [bodyShape, setBodyShape] = useState('');
  const [colorPalette, setColorPalette] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [shopResults, setShopResults] = useState<any>(null);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [occasion, setOccasion] = useState('Casual');
  const [budget, setBudget] = useState('££');
  const [gender, setGender] = useState('Women');
  const [retailers, setRetailers] = useState(['ASOS']);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentSuccessMessage, setPaymentSuccessMessage] = useState('');
  // mood selection removed

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/simple-auth/session');
        const data = await res.json();
        if (!data.user) {
          router.push('/auth/signin?redirect=/style-interface');
        } else {
          setIsAuthenticated(true);
        }
      } catch (error) {
        router.push('/auth/signin?redirect=/style-interface');
      }
    };
    checkAuth();
  }, [router]);

  // Check for payment success/cancel on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('custom_shop_success') === 'true') {
      const requestId = urlParams.get('request_id');
      setPaymentSuccessMessage(`✅ Payment successful! Your custom shop request (${requestId}) has been submitted. You'll receive your personalised online shop within 2-3 business days.`);
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
      // Auto-hide after 10 seconds
      setTimeout(() => setPaymentSuccessMessage(''), 10000);
    } else if (urlParams.get('custom_shop_cancelled') === 'true') {
      setPaymentSuccessMessage('Payment was cancelled. You can try again anytime.');
      window.history.replaceState({}, '', window.location.pathname);
      setTimeout(() => setPaymentSuccessMessage(''), 5000);
    }
  }, []);

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="style-interface-page" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <p>Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Don't render the page until authenticated
  if (!isAuthenticated) {
    return null;
  }

  const handleFilesChange = (newFiles: File[]) => {
    setFiles(newFiles);
  };

  const handleGetRecommendations = async () => {
    setIsLoading(true);
    setErrorMessage('');
    setShopResults(null);

    // Basic client-side validation / defaults
    const shape = bodyShape || 'Rectangle';
    const palette = colorPalette || 'Winter';

    try {
      // Step 1: Analyzing preferences
      setLoadingStep('Analysing your body shape and colour palette...');
      await new Promise(resolve => setTimeout(resolve, 1000));

          // Step 2: Searching retailers
          setLoadingStep('Searching online retailers for matching products...');
          await new Promise(resolve => setTimeout(resolve, 1500));

          // Step 2.5: Validating prices
          setLoadingStep('Validating prices against retailer websites...');
          await new Promise(resolve => setTimeout(resolve, 1000));

      const fd = new FormData();
      fd.append('occasion', occasion);
      fd.append('palette', palette);
      fd.append('shape', shape);
      fd.append('budget', budget);
      fd.append('gender', gender);
      fd.append('retailers', JSON.stringify(retailers));

      // Step 3: Getting template-based recommendations
      setLoadingStep('Loading your personalised style templates...');
      const response = await fetch('/api/recommend-template', {
        method: 'POST',
        body: fd
      });

      if (!response.ok) {
        let details = '';
        try { details = JSON.stringify(await response.json()); } catch {}
        throw new Error(details || 'Request failed');
      }

      const data = await response.json();
      
      // Step 4: Finalising your results
      setLoadingStep('Finalising your personalised style guide...');
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setShopResults(data);
      console.log('[recommendations] Shopping recommendations received', data);
    } catch (error:any) {
      console.error('[recommendations] API error', error);
      setErrorMessage('Failed to search online retailers');
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  return (
    <div className="style-interface-page">
      {/* Payment Success Message */}
      {paymentSuccessMessage && (
        <div style={{
          position: 'fixed',
          top: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: paymentSuccessMessage.includes('✅') ? '#10b981' : '#f59e0b',
          color: 'white',
          padding: '1rem 2rem',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 9999,
          maxWidth: '90%',
          textAlign: 'center',
          fontSize: '1rem',
          fontWeight: '600',
          animation: 'slideDown 0.3s ease-out',
        }}>
          {paymentSuccessMessage}
          <button
            onClick={() => setPaymentSuccessMessage('')}
            style={{
              marginLeft: '1rem',
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              padding: '0.25rem 0.75rem',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.875rem',
            }}
          >
            Dismiss
          </button>
        </div>
      )}
      
      {/* Header */}
      <header className="interface-header">
        <div className="header-content">
          <h1>My Styled Wardrobe</h1>
          <p>AI-Powered Personal Styling</p>
        </div>
      </header>

      {/* Main Content */}
      <div className="main-content">

        {/* Main Content Grid */}
        <div className="content-grid">
          {/* Left Column - AI-Powered Profile Analysis */}
          <div className="profile-section">
            <div className="analysis-card">
              <h3><span className="icon-inline"><Image src="/icons/target.svg" alt="AI camera" width={28} height={28} /></span> AI Body Shape and Season Generator</h3>
              <p className="upload-instruction">UPLOAD FULL-BODY PICTURE</p>
              
              <ProfileCapture 
                palette={colorPalette as 'Spring'|'Summer'|'Autumn'|'Winter'}
                shape={bodyShape as any}
                onPalette={(p) => setColorPalette(p)}
                onShape={(s) => setBodyShape(s)}
                onAiAnalysis={(analysis) => setAiAnalysis(analysis)}
              />
              
              <button 
                className="reanalyze-btn"
                onClick={async () => {
                  if (files.length > 0) {
                    setIsLoading(true);
                    try {
                      const formData = new FormData();
                      files.forEach(file => formData.append('images', file));
                      const response = await fetch('/api/analyze-body', {
                        method: 'POST',
                        body: formData
                      });
                      if (response.ok) {
                        const analysis = await response.json();
                        setAiAnalysis(analysis);
                        setBodyShape(analysis.bodyShape);
                        setColorPalette(analysis.colorPalette);
                      }
                    } catch (error) {
                      console.error('Re-analysis failed:', error);
                    } finally {
                      setIsLoading(false);
                    }
                  }
                }}
                disabled={files.length === 0 || isLoading}
              >
                {isLoading ? 'Analysing...' : 'Re-analyse with AI'}
              </button>
            </div>
          </div>
        </div>

        {/* Analysis Results Section */}
        {aiAnalysis && (
          <div className="analysis-results-section">
            <div className="results-card">
              <h3>AI Analysis Results</h3>
              <div className="results-grid">
                <div className="result-item">
                  <span className="result-label">Body Shape:</span>
                  <span className="result-value">{aiAnalysis.bodyShape}</span>
                </div>
                <div className="result-item">
                  <span className="result-label">Colour Palette:</span>
                  <span className="result-value">{aiAnalysis.colorPalette}</span>
                </div>
              </div>
              
              {/* Verification Request Component */}
              {aiAnalysis?.bodyShape && aiAnalysis?.colorPalette && (
                <VerificationRequest
                  bodyShape={aiAnalysis.bodyShape}
                  colorPalette={aiAnalysis.colorPalette}
                  bodyImageUrl={aiAnalysis.bodyImageUrl}
                  faceImageUrl={aiAnalysis.faceImageUrl}
                  onVerificationComplete={() => {
                    // Refresh or update UI after verification
                    console.log('Verification requested successfully');
                  }}
                />
              )}
            </div>
          </div>
        )}

        {/* Shop Preferences Section */}
        <div className="preferences-section">
          <div className="preferences-card">
            <h3>Shopping & Occasion Preferences</h3>
            
            <div className="preferences-grid">
              <div className="preference-group">
                <label>OCCASION</label>
                <div className="button-group">
                  {['Casual', 'Business', 'Formal', 'Sporty', 'Evening'].map((occ) => (
                    <button
                      key={occ}
                      className={`preference-btn ${occasion === occ ? 'active' : ''}`}
                      onClick={() => setOccasion(occ)}
                    >
                      {occ}
                    </button>
                  ))}
                </div>
              </div>

              <div className="preference-group">
                <label>BUDGET</label>
                <div className="button-group">
                  {['£', '££', '£££'].map((bud) => (
                    <button
                      key={bud}
                      className={`preference-btn ${budget === bud ? 'active' : ''}`}
                      onClick={() => setBudget(bud)}
                    >
                      {bud}
                    </button>
                  ))}
                </div>
              </div>

              <div className="preference-group">
                <label>GENDER</label>
                <div className="button-group">
                  {['Women', 'Men', 'Unisex'].map((gen) => (
                    <button
                      key={gen}
                      className={`preference-btn ${gender === gen ? 'active' : ''}`}
                      onClick={() => setGender(gen)}
                    >
                      {gen}
                    </button>
                  ))}
                </div>
              </div>

              {/* RETAILERS preference group moved to Custom Shop Request Modal */}
              {/* MOOD preference group removed */}
              {/* WEATHER & LOCATION preference groups removed */}
            </div>

            <button 
              onClick={handleGetRecommendations} 
              className="get-recommendations-btn"
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Get Recommendations'}
            </button>
            <button 
              onClick={() => {
                setShopResults(null);
                setErrorMessage('');
                console.log('🧹 Cleared shop results - ready for fresh recommendations');
              }} 
              className="clear-results-btn"
              type="button"
            >
              Clear Results
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="loading-section">
            <div className="loading-card">
              <div className="loading-spinner"></div>
              <h3>🛍️ Finding Your Perfect Style</h3>
              <p className="loading-step">{loadingStep}</p>
              <div className="loading-info">
                <p><strong>What we&apos;re doing:</strong></p>
                <ul>
                  <li>Analysing your body shape and colour palette</li>
                  <li>Searching online retailers for matching products</li>
                  <li>Validating prices against retailer websites</li>
                  <li>Getting personalised recommendations</li>
                  <li>Generating AI illustrations for each product</li>
                  <li>Generating AI illustrations for outfit combinations</li>
                  <li>Finalising your personalised recommendations</li>
                </ul>
                <p className="loading-note">This may take 90-120 seconds as we search multiple retailers and generate custom AI images for each product and outfit combination.</p>
              </div>
            </div>
          </div>
        )}

        {/* Shop Results Section */}
        {shopResults && shopResults.individualPieces && !isLoading && (
          <div className="shop-results-section">
            <div className="results-header">
              <h3>🛍️ Shopping Recommendations</h3>
              <p>Based on your {bodyShape} body shape, {colorPalette} colour palette, and {occasion} style preferences</p>
              <div className="image-disclaimer">
                <p><strong>📸 Image Disclaimer:</strong> The images shown are AI-generated illustrations for visual reference only. Click &quot;Shop Now&quot; to see the actual products on the retailer&apos;s website.</p>
              </div>
              {shopResults.reason && (
                <div className="ai-reasoning">
                  <strong>Personal stylist insights:</strong> <span>{shopResults.reason}</span>
                </div>
              )}
              {shopResults.styleTips && (
                <div className="style-tips">
                  <strong>Styling tips:</strong>
                  <ul>
                    {shopResults.styleTips.map((tip: string, idx: number) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <div className="products-grid">
              {shopResults.individualPieces.map((product: any, index: any) => (
                <div key={index} className="product-card">
                    <div className="product-image">
                      <img 
                        src={product.image?.includes('oaidalleapiprodscus.blob.core.windows.net') 
                          ? product.image 
                          : `/api/img?src=${encodeURIComponent(product.image)}`}
                        alt={product.name || product.title}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://via.placeholder.com/300x400?text=Fashion+Item';
                        }}
                      />
                    </div>
                  <div className="product-info">
                    <h4>{product.name || product.title}</h4>
                    <p className="product-description">{product.description || product.title}</p>
                        <div className="product-price-row">
                          <span className="product-price">{product.currency || '£'}{product.price}</span>
                          {product.priceValidated && (
                            <span className="price-validation">
                              ✓ Price verified from {product.priceSource}
                            </span>
                          )}
                        </div>
                    <div className="product-tags">
                      {product.tags.map((tag: any, tagIndex: any) => (
                        <span key={tagIndex} className="product-tag">{tag}</span>
                      ))}
                    </div>
                    <a 
                      href={product.link || product.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="shop-now-btn"
                    >
                      Shop Now
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Wardrobe Analytics section removed */}

        {/* Template-Based Results */}
        {shopResults && shopResults.templates && !isLoading && (
          <TemplateResults
            templates={shopResults.templates}
            stylingGuidance={shopResults.stylingGuidance}
            personalisation={shopResults.personalisation}
            message={shopResults.message}
            onRequestCustomShop={() => setIsModalOpen(true)}
          />
        )}

        {/* Legacy Outfit Combinations (kept for backwards compatibility) */}
        {shopResults && shopResults.outfits && shopResults.outfits.length > 0 && !isLoading && !shopResults.templates && (
          <div className="outfit-combinations-section">
            <div className="results-header">
              <h3><span className="icon-inline"><Image src="/icons/dress.svg" alt="Outfit combinations" width={24} height={24} /></span> Outfit Combinations</h3>
              <p>AI-curated looks that work perfectly together</p>
              {shopResults.reason && (
                <div className="ai-reasoning">
                  <strong>Personal stylist approach:</strong> <span>{shopResults.reason}</span>
                </div>
              )}
            </div>
            
            <div className="outfits-grid">
              {shopResults.outfits.map((outfit: any, index: any) => (
                <div key={index} className="outfit-card">
                  <h4>{outfit.title}</h4>
                  <p className="outfit-description">{outfit.description}</p>
                  <p className="flattery-reasoning"><strong>Why this works:</strong> {outfit.flatteryReasoning}</p>
                  <p className="occasion-note"><strong>Perfect for:</strong> {outfit.occasion}</p>
                  <div className="outfit-items">
                    {outfit.items.map((item: any, itemIndex: any) => (
                      <div key={itemIndex} className="outfit-item">
                        <img 
                          src={`/api/img?src=${encodeURIComponent(item.image)}`}
                          alt={item.name}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://via.placeholder.com/150x200?text=Item';
                          }}
                        />
                        <p>{item.name}</p>
                        {item.price && (
                          <span className="item-price">{item.currency || '£'}{item.price}</span>
                        )}
                      </div>
                    ))}
                  </div>
                  {outfit.newItemSuggestion && (
                    <div className="new-item-suggestion">
                      <strong>New piece to complete the look:</strong>
                      <div className="suggested-item">
                        <img src={`/api/img?src=${encodeURIComponent(outfit.newItemSuggestion.image)}`} alt={outfit.newItemSuggestion.name} />
                        <div>
                          <p>{outfit.newItemSuggestion.name}</p>
                          <p>{outfit.newItemSuggestion.price} at {outfit.newItemSuggestion.retailer}</p>
                          <a href={outfit.newItemSuggestion.url} target="_blank" rel="noopener noreferrer" className="shop-suggestion-btn">Shop Now</a>
                        </div>
                      </div>
                    </div>
                  )}
                  <p className="total-price"><strong>Total outfit cost:</strong> £{outfit.totalPrice.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="error-message">
            <p><span className="icon-inline small"><Image src="/icons/x.svg" alt="Error" width={18} height={18} /></span>{errorMessage}</p>
          </div>
        )}

        {/* Full Width Wardrobe Ideas Button */}
        <Link 
          href="/wardrobe-ideas"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            padding: '1.25rem 2rem',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '12px',
            fontWeight: '600',
            fontSize: '1.1rem',
            boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
            transition: 'all 0.3s',
            width: '100%',
            marginTop: '2rem',
            marginBottom: '2rem'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(99, 102, 241, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(99, 102, 241, 0.4)';
          }}
        >
          <span style={{ fontSize: '1.5rem' }}>👗</span>
          <span>Create Wardrobe Ideas & Outfit Combinations</span>
          <span>→</span>
        </Link>
      </div>

      {/* Footer */}
      <footer className="interface-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>My Styled Wardrobe</h4>
            <p>Empowering you to embrace your unique style with AI-powered fashion recommendations.</p>
          </div>
          <div className="footer-section">
            <h4>Services</h4>
            <ul>
              <li>Body Shape Analysis</li>
              <li>Colour Palette Discovery</li>
              <li>Personalised Outfits</li>
              <li>Shopping Recommendations</li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Support</h4>
            <ul>
              <li><Link href="/faq">Help Center</Link></li>
              <li>Contact Us</li>
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 My Styled Wardrobe. All rights reserved.</p>
        </div>
      </footer>

      {/* Custom Shop Request Modal */}
      <CustomShopRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userProfile={{
          bodyShape: bodyShape || 'Rectangle',
          colourPalette: colorPalette || 'Winter',
          occasion: occasion,
          budget: budget,
          retailers: retailers
        }}
      />
    </div>
  );
}

