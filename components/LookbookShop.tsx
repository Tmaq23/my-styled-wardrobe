'use client';

import { useState, useEffect } from 'react';
import type { Lookbook } from '../lib/lookbooks';

interface LookbookShopProps {
  bodyShape?: string;
  season?: string;
}

export default function LookbookShop({ bodyShape, season }: LookbookShopProps) {
  const [lookbooks, setLookbooks] = useState<Lookbook[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => {
    fetchLookbooks();
  }, [bodyShape, season]);

  const fetchLookbooks = async () => {
    try {
      const params = new URLSearchParams();
      if (bodyShape) params.append('bodyShape', bodyShape);
      if (season) params.append('season', season);
      
      const response = await fetch(`/api/lookbooks?${params}`);
      const data = await response.json();
      setLookbooks(data.lookbooks || []);
    } catch (error) {
      console.error('Failed to fetch lookbooks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (lookbookId: string) => {
    setPurchasing(lookbookId);
    
    try {
      // In a real app, you'd integrate with Stripe here
      // const stripe = await stripePromise;
      // const { error } = await stripe.redirectToCheckout({ ... });
      
      // For demo purposes, simulate successful purchase
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const response = await fetch('/api/lookbooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lookbookId,
          userId: 'demo-user', // In real app, get from auth
          paymentIntentId: 'demo-payment'
        })
      });
      
      const result = await response.json();
      if (result.success) {
        // Open download or show success message
        window.open(result.downloadUrl, '_blank');
        alert('Purchase successful! Your lookbook is downloading.');
      }
      
    } catch (error) {
      console.error('Purchase failed:', error);
      alert('Purchase failed. Please try again.');
    } finally {
      setPurchasing(null);
    }
  };

  if (loading) {
    return <div className="lookbook-loading">Loading personalized lookbooks...</div>;
  }

  return (
    <div className="lookbook-shop">
      <div className="shop-header">
        <h3>Personalized Style Lookbooks</h3>
        {bodyShape && (
          <p>Curated specifically for {bodyShape} body shapes</p>
        )}
      </div>
      
      <div className="lookbooks-grid">
        {lookbooks.map((lookbook) => (
          <div key={lookbook.id} className="lookbook-card">
            <div className="lookbook-preview">
              <div className="preview-images">
                {lookbook.previewImages.slice(0, 3).map((img, idx) => (
                  <img key={idx} src={img} alt={`${lookbook.title} preview ${idx + 1}`} />
                ))}
              </div>
              <div className="lookbook-badge">{lookbook.outfits.length} Outfits</div>
            </div>
            
            <div className="lookbook-info">
              <h4>{lookbook.title}</h4>
              <p className="lookbook-description">{lookbook.description}</p>
              
              <div className="lookbook-details">
                <span className="body-shape-tag">{lookbook.bodyShape}</span>
                <span className="season-tag">{lookbook.season}</span>
              </div>
              
              <div className="outfit-preview">
                <strong>Sample outfits:</strong>
                <ul>
                  {lookbook.outfits.slice(0, 2).map((outfit, idx) => (
                    <li key={idx}>
                      <strong>{outfit.title}</strong> - {outfit.description}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="purchase-section">
                <div className="price">£{lookbook.price}</div>
                <button 
                  className="purchase-btn"
                  onClick={() => handlePurchase(lookbook.id)}
                  disabled={purchasing === lookbook.id}
                >
                  {purchasing === lookbook.id ? 'Processing...' : 'Buy Lookbook'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {lookbooks.length === 0 && (
        <div className="no-lookbooks">
          <p>No lookbooks available for your profile yet. Check back soon for new collections!</p>
        </div>
      )}
    </div>
  );
}
