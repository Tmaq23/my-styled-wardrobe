'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import WardrobeUploader from '../../components/WardrobeUploader';

export default function WardrobeIdeasPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/simple-auth/session');
        const data = await res.json();
        if (!data.user) {
          router.push('/auth/signin?redirect=/wardrobe-ideas');
        } else {
          setIsAuthenticated(true);
        }
      } catch (error) {
        router.push('/auth/signin?redirect=/wardrobe-ideas');
      }
    };
    checkAuth();
  }, [router]);

  const handleWardrobeFilesChange = (files: File[]) => {
    // Handle the uploaded files here if needed
    // The WardrobeUploader component manages its own state and outfit generation
    console.log('Wardrobe files updated:', files.length);
  };

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

  return (
    <div className="style-interface-page">
      {/* Main Content */}
      <div className="main-content">
        {/* Wardrobe Upload Section */}
        <div className="content-grid" style={{ gridTemplateColumns: '1fr', maxWidth: '1200px', margin: '0 auto' }}>
          <div className="wardrobe-section">
            <div className="wardrobe-card">
              <h3>
                <span className="icon-inline">
                  <Image src="/icons/palette.svg" alt="Wardrobe revamp" width={24} height={24} />
                </span> 
                🌍 Wardrobe Ideas
              </h3>
              <p className="upload-instruction">Upload your clothing items to see AI-generated outfit combinations</p>
              
              <WardrobeUploader onChange={handleWardrobeFilesChange} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

