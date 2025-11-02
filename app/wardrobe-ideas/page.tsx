'use client';

import { useState } from 'react';
import Image from 'next/image';
import WardrobeUploader from '../../components/WardrobeUploader';

export default function WardrobeIdeasPage() {
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
              
              <WardrobeUploader />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

