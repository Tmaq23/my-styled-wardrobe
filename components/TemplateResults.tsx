'use client';

import { useState } from 'react';

// Mood board fashion items for each body shape - will display as a grid
function getBodyShapeMoodBoardItems(bodyShape: string): string[] {
  // Normalize the body shape name
  const normalizedShape = bodyShape.trim();
  
  const moodBoards: Record<string, string[]> = {
    'Hourglass': [
      '/moodboards/hourglass-coat1.jpg',
      '/moodboards/hourglass-coat2.jpg',
      '/moodboards/hourglass-coat3.jpg',
      '/moodboards/hourglass-trousers1.jpg',
      '/moodboards/hourglass-trousers2.jpg',
      '/moodboards/hourglass-trousers3.jpg',
      '/moodboards/hourglass-skirts1.jpg',
      '/moodboards/hourglass-skirts2.jpg',
      '/moodboards/hourglass-skirts3.jpg',
      '/moodboards/hourglass-dress1.jpg',
      '/moodboards/hourglass-dress2.jpg',
      '/moodboards/hourglass-dress3.jpg',
      '/moodboards/hourglass-top1.jpg',
      '/moodboards/hourglass-top2.png',
      '/moodboards/hourglass-top3.jpg',
      '/moodboards/hourglass-shoes.jpg',
      '/moodboards/hourglass-necklace.jpg',
      '/moodboards/hourglass-bag.jpg',
    ],
    'Triangle': [
      '/moodboards/triangle-coat.jpg',
      '/moodboards/triangle-coat1.jpg',
      '/moodboards/triangle-coat2.jpg',
      '/moodboards/triangle-trousers.jpg',
      '/moodboards/triangle-trousers1.jpg',
      '/moodboards/triangle-trousers2.jpg',
      '/moodboards/triangle-skirt.jpg',
      '/moodboards/triangle-skirt1.jpg',
      '/moodboards/triangle-skirt2.jpg',
      '/moodboards/triangle-dress.jpg',
      '/moodboards/triangle-dress1.jpg',
      '/moodboards/triangle-dress2.jpg',
      '/moodboards/triangle-top.jpg',
      '/moodboards/triangle-top1.jpg',
      '/moodboards/triangle-top2.jpg',
      '/moodboards/triangle-accessories.jpg',
      '/moodboards/triangle-accessories1.jpg',
      '/moodboards/triangle-accessories2.jpg',
      '/moodboards/triangle-accessories3.jpg',
      '/moodboards/triangle-accessories4.jpg',
    ],
    'Pear': [
      '/moodboards/triangle-coat.jpg',
      '/moodboards/triangle-coat1.jpg',
      '/moodboards/triangle-coat2.jpg',
      '/moodboards/triangle-trousers.jpg',
      '/moodboards/triangle-trousers1.jpg',
      '/moodboards/triangle-trousers2.jpg',
      '/moodboards/triangle-skirt.jpg',
      '/moodboards/triangle-skirt1.jpg',
      '/moodboards/triangle-skirt2.jpg',
      '/moodboards/triangle-dress.jpg',
      '/moodboards/triangle-dress1.jpg',
      '/moodboards/triangle-dress2.jpg',
      '/moodboards/triangle-top.jpg',
      '/moodboards/triangle-top1.jpg',
      '/moodboards/triangle-top2.jpg',
      '/moodboards/triangle-accessories.jpg',
      '/moodboards/triangle-accessories1.jpg',
      '/moodboards/triangle-accessories2.jpg',
      '/moodboards/triangle-accessories3.jpg',
      '/moodboards/triangle-accessories4.jpg',
    ],
    'Inverted Triangle': [
      '/moodboards/inverted%20triangle-coat.jpg',
      '/moodboards/inverted%20triangle-coat1.jpg',
      '/moodboards/inverted%20triangle-coat2.jpg',
      '/moodboards/inverted%20triangle-trousers.jpg',
      '/moodboards/inverted%20triangle-trousers1.jpg',
      '/moodboards/inverted%20triangle-trousers2.jpg',
      '/moodboards/inverted%20triangle-skirt.jpg',
      '/moodboards/inverted%20triangle-skirt1.jpg',
      '/moodboards/inverted%20triangle-skirt2.jpg',
      '/moodboards/inverted%20triangle-dress.jpg',
      '/moodboards/inverted%20triangle-dress1.jpg',
      '/moodboards/inverted%20triangle-dress2.jpg',
      '/moodboards/inverted%20triangle-top.jpg',
      '/moodboards/inverted%20triangle-top1.jpg',
      '/moodboards/inverted%20triangle-top2.jpg',
      '/moodboards/inverted%20triangle-accessories.jpg',
      '/moodboards/inverted%20triangle-accessories1.jpg',
      '/moodboards/inverted%20triangle-accessories2.jpg',
      '/moodboards/inverted%20triangle-accessories3.jpg',
      '/moodboards/inverted%20triangle-accessories4.jpg',
      '/moodboards/inverted%20triangle-accessories5.jpg',
    ],
    'Rectangle': [
      '/moodboards/rectangle-coat.jpg',
      '/moodboards/rectangle-coat1.jpg',
      '/moodboards/rectangle-coat2.jpg',
      '/moodboards/rectangle-trousers.jpg',
      '/moodboards/rectangle-trousers1.jpg',
      '/moodboards/rectangle-trousers2.jpg',
      '/moodboards/rectangle-skirt.jpg',
      '/moodboards/rectangle-skirt1.jpg',
      '/moodboards/rectangle-skirt2.jpg',
      '/moodboards/rectangle-dress.jpg',
      '/moodboards/rectangle-dress1.jpg',
      '/moodboards/rectangle-dress2.jpg',
      '/moodboards/rectangle-top.jpg',
      '/moodboards/rectangle-top1.jpg',
      '/moodboards/rectangle-top2.jpg',
      '/moodboards/rectangle-accessories.jpg',
      '/moodboards/rectangle-accessories1.jpg',
      '/moodboards/rectangle-accessories2.jpg',
      '/moodboards/rectangle-accessories3.jpg',
      '/moodboards/rectangle-accessories4.jpg',
    ],
    'Round': [
      '/moodboards/round-coat.jpg',
      '/moodboards/round-coat1.jpg',
      '/moodboards/round-coat2.jpg',
      '/moodboards/round-trousers.jpg',
      '/moodboards/round-trousers1.jpg',
      '/moodboards/round-trousers2.jpg',
      '/moodboards/round-skirt.jpg',
      '/moodboards/round-skirt1.jpg',
      '/moodboards/round-skirt2.jpg',
      '/moodboards/round-dress.jpg',
      '/moodboards/round-dress1.jpg',
      '/moodboards/round-dress2.jpg.png',
      '/moodboards/round-top.jpg',
      '/moodboards/round-top1.jpg',
      '/moodboards/round-top2.jpg',
      '/moodboards/round-accessories.jpg',
      '/moodboards/round-accessories1.jpg',
      '/moodboards/round-accessories2.jpg',
      '/moodboards/round-accessories3.jpg',
      '/moodboards/round-accessories4.jpg',
    ],
    'Apple': [
      '/moodboards/round-coat.jpg',
      '/moodboards/round-coat1.jpg',
      '/moodboards/round-coat2.jpg',
      '/moodboards/round-trousers.jpg',
      '/moodboards/round-trousers1.jpg',
      '/moodboards/round-trousers2.jpg',
      '/moodboards/round-skirt.jpg',
      '/moodboards/round-skirt1.jpg',
      '/moodboards/round-skirt2.jpg',
      '/moodboards/round-dress.jpg',
      '/moodboards/round-dress1.jpg',
      '/moodboards/round-dress2.jpg.png',
      '/moodboards/round-top.jpg',
      '/moodboards/round-top1.jpg',
      '/moodboards/round-top2.jpg',
      '/moodboards/round-accessories.jpg',
      '/moodboards/round-accessories1.jpg',
      '/moodboards/round-accessories2.jpg',
      '/moodboards/round-accessories3.jpg',
      '/moodboards/round-accessories4.jpg',
    ],
  };
  
  const result = moodBoards[normalizedShape] || [];
  
  // Debug logging
  if (result.length === 0) {
    console.log(`No mood board images found for body shape: "${normalizedShape}"`);
    console.log('Available body shapes:', Object.keys(moodBoards));
  } else {
    console.log(`Found ${result.length} mood board images for body shape: "${normalizedShape}"`);
  }
  
  return result;
}

// Capsule wardrobe imagery for each colour season, in that season's palette
function getSeasonCapsuleImage(season: string): string | null {
  const normalized = season.trim().toLowerCase();
  const seasons = ['spring', 'summer', 'autumn', 'winter'];
  return seasons.includes(normalized) ? `/palettes/${normalized}.jpg` : null;
}

interface Template {
  id: string;
  name: string;
  occasion: string;
  description: string;
  items: Array<{
    category: string;
    description: string;
    styling: string;
  }>;
  image: string;
  personalisedStyling: {
    bodyShapeTips: string[];
    colourPaletteTips: string[];
    budgetNote: string;
  };
}

interface TemplateResultsProps {
  templates: Template[];
  stylingGuidance: {
    bodyShape: {
      type: string;
      tips: string[];
    };
    colourPalette: {
      season: string;
      tips: string[];
    };
  };
  personalisation: {
    bodyShape: string;
    colourPalette: string;
    occasion: string;
    budget: string;
  };
  message: string;
  onRequestCustomShop: () => void;
}

export default function TemplateResults({
  templates,
  stylingGuidance,
  personalisation,
  message,
  onRequestCustomShop
}: TemplateResultsProps) {
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const seasonCapsuleImage = getSeasonCapsuleImage(stylingGuidance.colourPalette.season);

  return (
    <div className="template-results">
      {/* Message Banner */}
      <div className="template-message" style={{
        background: 'rgba(28, 26, 23, 0.05)',
        border: '2px solid rgba(28, 26, 23, 0.12)',
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '2rem',
        textAlign: 'center'
      }}>
        <p style={{ fontSize: '1rem', lineHeight: '1.6', marginBottom: '1rem' }}>
          {message}
        </p>
        <button
          onClick={onRequestCustomShop}
          style={{
            background: '#1c1a17',
            color: 'white',
            border: 'none',
            padding: '0.875rem 2rem',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(28, 26, 23, 0.15)',
            transition: 'all 0.3s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(28, 26, 23, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(28, 26, 23, 0.15)';
          }}
        >
          Request Customised Online Shop
        </button>
      </div>

      {/* Main Content Layout: Full-width sections stacked vertically */}
      
      {/* Top Section: Combined Body Shape and Color Season Card */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        marginBottom: '2rem'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.5rem',
          background: '#1c1a17',
          color: 'white'
        }}>
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', fontWeight: '700' }}>
            {stylingGuidance.bodyShape.type} Body Shape
          </h3>
          <p style={{ margin: 0, fontSize: '1rem', opacity: 0.9 }}>
            Your Colour Season: {stylingGuidance.colourPalette.season}
          </p>
        </div>
        
        {/* Combined Styling Tips */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem',
          padding: '1.5rem',
          background: 'white'
        }}>
          {/* Body Shape Tips */}
          <div>
            <h4 style={{ 
              marginBottom: '1rem', 
              color: '#1c1a17', 
              fontSize: '1.1rem',
              fontWeight: '700',
              borderBottom: '2px solid #1c1a17',
              paddingBottom: '0.5rem'
            }}>
              Body Shape Styling Tips
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {stylingGuidance.bodyShape.tips.map((tip, index) => (
                <li key={index} style={{ marginBottom: '0.75rem', lineHeight: '1.5', color: '#000000', fontSize: '0.875rem' }}>
                  • {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* Color Season Tips */}
          <div>
            <h4 style={{ 
              marginBottom: '1rem', 
              color: '#403c36', 
              fontSize: '1.1rem',
              fontWeight: '700',
              borderBottom: '2px solid #403c36',
              paddingBottom: '0.5rem'
            }}>
              Colour Season Tips
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {stylingGuidance.colourPalette.tips.map((tip, index) => (
                <li key={index} style={{ marginBottom: '0.75rem', lineHeight: '1.5', color: '#000000', fontSize: '0.875rem' }}>
                  • {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Season capsule wardrobe visual */}
        {seasonCapsuleImage && (
          <div style={{ padding: '0 1.5rem 1.5rem' }}>
            <h4 style={{
              marginBottom: '1rem',
              color: '#1c1a17',
              fontSize: '1.1rem',
              fontWeight: '700',
              borderBottom: '2px solid #1c1a17',
              paddingBottom: '0.5rem'
            }}>
              Your {stylingGuidance.colourPalette.season} Capsule Colours
            </h4>
            <img
              src={seasonCapsuleImage}
              alt={`Capsule wardrobe in ${stylingGuidance.colourPalette.season} palette colours`}
              onClick={() => setLightboxImage(seasonCapsuleImage)}
              style={{
                width: '100%',
                maxHeight: '420px',
                objectFit: 'cover',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'block'
              }}
            />
            <p style={{ margin: '0.75rem 0 0', fontSize: '0.85rem', color: '#6b655d', textAlign: 'center' }}>
              An example capsule wardrobe in your {stylingGuidance.colourPalette.season} season colours — these are the tones that will flatter you most.
            </p>
          </div>
        )}
      </div>

      {/* Middle Section: Style Templates */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.75rem', textAlign: 'center' }}>Your Style Templates</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1.5rem'
        }}>
      {templates.map((template) => (
        <div
          key={template.id}
          style={{
            background: 'white',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            transition: 'transform 0.3s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
          }}
        >
          {/* Template Header */}
          <div style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '0.5rem', fontSize: '1.25rem', color: '#1c1a17' }}>
              {template.name}
            </h3>
            <p style={{ color: '#6b655d', fontSize: '0.875rem', marginBottom: '1rem' }}>
              {template.description}
            </p>
          </div>

          {/* Template Items */}
          <div style={{ padding: '0 1.5rem 1.5rem' }}>
            <h4 style={{ marginBottom: '0.75rem', fontSize: '1rem', color: '#403c36' }}>
              Outfit Components:
            </h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {template.items.map((item, index) => (
                <li
                  key={index}
                  style={{
                    marginBottom: '0.75rem',
                    padding: '0.75rem',
                    background: '#f5f2ec',
                    borderRadius: '8px',
                    borderLeft: '3px solid #1c1a17'
                  }}
                >
                  <strong style={{ color: '#1c1a17' }}>{item.category}:</strong>
                  <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#403c36' }}>
                    {item.description}
                  </p>
                </li>
              ))}
            </ul>

            {/* Personalised Tips Toggle */}
          </div>
        </div>
      ))}
        </div>
      </div>

      {/* Bottom Section: Mood Board */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        marginTop: '2rem'
      }}>
        {/* Mood Board Header */}
        <div style={{
          padding: '1.5rem',
          background: '#1c1a17',
          color: 'white',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>
            Fashion Inspiration for {stylingGuidance.bodyShape.type}
          </h3>
        </div>
        
        {/* Mood Board Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
          gap: '0.75rem',
          padding: '1.5rem',
          background: '#f5f2ec'
        }}>
          {getBodyShapeMoodBoardItems(stylingGuidance.bodyShape.type).map((imageUrl, index) => (
            <div
              key={index}
              onClick={() => setLightboxImage(imageUrl)}
              style={{
                width: '100%',
                height: '150px',
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                background: 'white',
                border: '1px solid #e5dfd4',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(28, 26, 23, 0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
              }}
            >
              <img
                src={imageUrl}
                alt={`Fashion item ${index + 1}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  padding: '0.25rem'
                }}
                onError={(e) => {
                  // Hide tiles whose image fails to load instead of showing a broken icon
                  const tile = (e.target as HTMLImageElement).closest('div');
                  if (tile) (tile as HTMLElement).style.display = 'none';
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '2rem',
            cursor: 'pointer'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '90vh',
              background: 'white',
              borderRadius: '12px',
              padding: '1rem',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
            }}
          >
            <button
              onClick={() => setLightboxImage(null)}
              style={{
                position: 'absolute',
                top: '-1rem',
                right: '-1rem',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'white',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#403c36',
                fontWeight: '700'
              }}
            >
              ×
            </button>
            <img
              src={lightboxImage}
              alt="Fashion item detail"
              style={{
                maxWidth: '100%',
                maxHeight: '85vh',
                objectFit: 'contain',
                display: 'block'
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}


