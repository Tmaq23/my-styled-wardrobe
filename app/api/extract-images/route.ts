import { NextRequest, NextResponse } from 'next/server';
import { extractProductImages } from '../../../lib/imageExtractor';

export async function POST(request: NextRequest) {
  try {
    const { url, retailer } = await request.json();

    if (!url) {
      return NextResponse.json({ 
        error: 'URL is required' 
      }, { status: 400 });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ 
        error: 'Invalid URL format' 
      }, { status: 400 });
    }

    console.log(`🚀 Starting image extraction for: ${url}`);
    console.log(`🏪 Retailer: ${retailer || 'Auto-detected'}`);

    // Extract images using the robust multi-layered approach
    const result = await extractProductImages(url, retailer);

    console.log(`✅ Extraction completed. Source: ${result.source}`);
    console.log(`📸 Found ${result.images.length} images`);

    return NextResponse.json({
      success: true,
      url: url,
      retailer: retailer || 'Auto-detected',
      extractionSource: result.source,
      images: result.images,
      title: result.title,
      description: result.description,
      totalImages: result.images.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Image extraction API error:', error);
    
    return NextResponse.json({ 
      error: 'Image extraction failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  // Return information about the enhanced image extraction system
  return NextResponse.json({
    name: 'Enhanced Image Extraction API',
    description: 'Robust multi-layered approach for extracting product images from retailer websites',
    version: '1.0.0',
    features: [
      'Official retailer API integration',
      'Schema.org JSON-LD parsing',
      'Open Graph image extraction',
      'Meta tag image extraction',
      'JavaScript variable image extraction',
      'Fallback to <img> elements',
      'Rate limiting and user agent rotation',
      'Retailer-specific optimizations'
    ],
    supportedRetailers: [
      'ASOS',
      'Zara', 
      'H&M',
      'Next',
      'River Island',
      'M&S'
    ],
    extractionMethods: [
      {
        priority: 1,
        method: 'Official API',
        description: 'Use retailer\'s official API when available'
      },
      {
        priority: 2,
        method: 'JSON-LD Schema',
        description: 'Parse schema.org Product structured data'
      },
      {
        priority: 3,
        method: 'Open Graph',
        description: 'Extract og:image and twitter:image meta tags'
      },
      {
        priority: 4,
        method: 'Meta Tags',
        description: 'Search for various image meta tags'
      },
      {
        priority: 5,
        method: 'JavaScript Variables',
        description: 'Find high-resolution images in JS variables'
      },
      {
        priority: 6,
        method: 'IMG Elements',
        description: 'Fallback to <img> tags on the page'
      },
      {
        priority: 7,
        method: 'Placeholder',
        description: 'Generate placeholder image if all else fails'
      }
    ],
    usage: {
      method: 'POST',
      endpoint: '/api/extract-images',
      body: {
        url: 'string (required) - Product page URL',
        retailer: 'string (optional) - Retailer name for optimization'
      },
      response: {
        success: 'boolean',
        extractionSource: 'string - Method used for extraction',
        images: 'string[] - Array of image URLs',
        title: 'string - Product title if found',
        description: 'string - Product description if found'
      }
    }
  });
}

