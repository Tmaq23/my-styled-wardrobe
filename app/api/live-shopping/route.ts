import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { retailer, occasion, budget, gender, palette, shape } = await request.json();

    if (!retailer || !occasion || !budget || !gender) {
      return NextResponse.json({ 
        error: 'Missing required parameters: retailer, occasion, budget, gender' 
      }, { status: 400 });
    }

    console.log(`🛍️ LIVE SHOPPING: Searching ${retailer} for ${occasion} ${budget} ${gender} items...`);

    // Build intelligent search query based on user preferences
    const searchQuery = buildLiveSearchQuery({ occasion, palette, shape, budget, gender });
    const searchUrl = getRetailerSearchUrl(retailer, searchQuery);
    
    console.log(`🔗 Searching: ${searchUrl}`);

    // For now, return simulated live results with real retailer URLs
    // In production, this would actually scrape the retailer websites
    const liveProducts = generateLiveShoppingResults(retailer, searchQuery, { occasion, budget, gender, palette, shape });

    return NextResponse.json({
      success: true,
      retailer,
      searchUrl,
      searchQuery,
      totalProducts: liveProducts.length,
      products: liveProducts,
      timestamp: new Date().toISOString(),
      note: 'Live shopping results with real retailer URLs. In production, this would scrape actual inventory.',
      nextSteps: [
        'Implement actual web scraping of retailer websites',
        'Add real-time inventory checking',
        'Integrate with retailer APIs where available',
        'Add price comparison across retailers'
      ]
    });

  } catch (error) {
    console.error('❌ Live shopping API error:', error);
    
    return NextResponse.json({ 
      error: 'Live shopping failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// Build intelligent search queries based on user preferences
function buildLiveSearchQuery(preferences: { occasion: string; palette: string; shape: string; budget: string; gender: string }): string {
  const { occasion, palette, shape, budget, gender } = preferences;
  
  let query = '';
  
  // Add occasion-specific terms
  if (occasion === 'Sport') {
    query += 'athletic wear activewear performance ';
  } else if (occasion === 'Work') {
    query += 'professional office business ';
  } else if (occasion === 'Casual') {
    query += 'casual everyday comfortable ';
  }
  
  // Add gender
  query += `${gender.toLowerCase()} `;
  
  // Add body shape appropriate styles
  if (shape === 'Rectangle') {
    query += 'peplum ruffled ruched layered structured ';
  } else if (shape === 'Hourglass') {
    query += 'fitted structured wrap belted tailored ';
  } else if (shape === 'Pear') {
    query += 'A-line wide-leg flare wrap empire-waist ';
  }
  
  // Add color palette
  if (palette === 'Winter') {
    query += 'deep black icy pink cool blue pure white ';
  } else if (palette === 'Summer') {
    query += 'warm yellow soft purple light blue ';
  } else if (palette === 'Spring') {
    query += 'bright red bright yellow bright green ';
  } else if (palette === 'Autumn') {
    query += 'deep brown warm orange rich burgundy ';
  }
  
  // Add budget indicators
  if (budget === '£££') {
    query += 'premium luxury high-end designer ';
  } else if (budget === '£') {
    query += 'affordable budget-friendly value ';
  }
  
  return query.trim();
}

// Get actual retailer search URLs
function getRetailerSearchUrl(retailer: string, searchQuery: string): string {
  const encodedQuery = encodeURIComponent(searchQuery);
  
  const retailerUrls = {
    'ASOS': `https://www.asos.com/search/?q=${encodedQuery}`,
    'Zara': `https://www.zara.com/uk/en/search?searchTerm=${encodedQuery}`,
    'H&M': `https://www2.hm.com/en_gb/search-results.html?q=${encodedQuery}`,
    'Next': `https://www.next.co.uk/search?w=${encodedQuery}`,
    'M&S': `https://www.marksandspencer.com/search?searchTerm=${encodedQuery}`,
    'River Island': `https://www.riverisland.com/womens`, // Use main category page instead of broken search
    'Topshop': `https://www.topshop.com/en/tsuk/search?q=${encodedQuery}`
  };
  
  return retailerUrls[retailer as keyof typeof retailerUrls] || retailerUrls['ASOS'];
}

// Generate live shopping results with real retailer URLs
function generateLiveShoppingResults(retailer: string, searchQuery: string, preferences: { occasion: string; budget: string; gender: string; palette: string; shape: string }) {
  const products = [];
  
  // Generate realistic product data based on preferences
  const productTypes = ['tops', 'bottoms'];
  const colors = getColorsForPalette(preferences.palette);
  const styles = getStylesForBodyShape(preferences.shape);
  
  for (let i = 0; i < 2; i++) {
    const type = productTypes[i];
    const color = colors[Math.floor(Math.random() * colors.length)] || 'black';
    const style = styles[Math.floor(Math.random() * styles.length)] || 'casual';
    
    // Generate realistic price based on budget
    const price = generateRealisticPrice(preferences.budget, type, retailer);
    
    // Create a simple, reliable image using a placeholder URL instead of base64
    const imageUrl = `https://via.placeholder.com/300x200/${getColorHex(color).replace('#', '')}/ffffff?text=${encodeURIComponent(`${retailer} ${color} ${style}`)}`;
    
    const product = {
      id: `live-${retailer.toLowerCase()}-${i + 1}`,
      title: `${color} ${style} ${type}`,
      brand: retailer,
      retailer: retailer,
      price: price,
      currency: 'GBP',
      image: imageUrl, // Use placeholder URL instead of base64
      url: getRetailerSearchUrl(retailer, `${color} ${style} ${type}`),
      link: getRetailerSearchUrl(retailer, `${color} ${style} ${type}`),
      rating: (Math.random() * 2 + 3).toFixed(1), // 3.0 - 5.0
      reviewCount: Math.floor(Math.random() * 500) + 50,
      inStock: Math.random() > 0.2, // 80% chance of being in stock
      tags: [color, style, type, preferences.occasion, preferences.budget],
      color: color,
      style: style,
      type: type,
      material: getMaterialForType(type),
      occasion: preferences.occasion,
      budget: preferences.budget,
      gender: preferences.gender
    };
    
    // Add appropriate tags based on occasion and budget
    if (preferences.occasion === 'Sport') {
      product.tags.push('Athletic', 'Performance', 'Activewear');
    } else if (preferences.occasion === 'Work') {
      product.tags.push('Professional', 'Office', 'Business');
    } else if (preferences.occasion === 'Casual') {
      product.tags.push('Everyday', 'Comfort', 'Versatile');
    }
    
    if (preferences.budget === '£££') {
      product.tags.push('Premium', 'High-End', 'Luxury');
    } else if (preferences.budget === '£') {
      product.tags.push('Affordable', 'Budget-Friendly');
    }
    
    products.push(product);
  }
  
  return products;
}

// Helper functions
function getColorsForPalette(palette: string): string[] {
  const colorMap = {
    'Winter': ['deep black', 'icy pink', 'cool blue', 'pure white'],
    'Summer': ['warm yellow', 'soft purple', 'light blue'],
    'Spring': ['bright red', 'bright yellow', 'bright green'],
    'Autumn': ['deep brown', 'warm orange', 'rich burgundy']
  };
  return colorMap[palette as keyof typeof colorMap] || colorMap['Winter'];
}

function getStylesForBodyShape(shape: string): string[] {
  const styleMap = {
    'Rectangle': ['peplum', 'ruffled', 'ruched', 'layered', 'structured'],
    'Hourglass': ['fitted', 'structured', 'wrap', 'belted', 'tailored'],
    'Pear': ['A-line', 'wide-leg', 'flare', 'wrap', 'empire-waist']
  };
  return styleMap[shape as keyof typeof styleMap] || styleMap['Rectangle'];
}

function generateRealisticPrice(budget: string, type: string, retailer: string): number {
  const basePrices = {
    'tops': { '£': 25, '££': 75, '£££': 200 },
    'bottoms': { '£': 35, '££': 85, '£££': 250 }
  };
  
  const basePrice = basePrices[type as keyof typeof basePrices]?.[budget as keyof typeof basePrices[keyof typeof basePrices]] || 75;
  
  const retailerMultiplier = {
    'ASOS': 1.0,
    'Zara': 1.1,
    'H&M': 0.9,
    'Next': 1.0,
    'River Island': 0.95,
    'Topshop': 1.05,
    'M&S': 1.2
  };
  
  const multiplier = retailerMultiplier[retailer as keyof typeof retailerMultiplier] || 1.0;
  return Math.round(basePrice * multiplier);
}

// Helper function to get hex colors for placeholder images
function getColorHex(color: string): string {
  const colorMap: { [key: string]: string } = {
    'deep black': '000000',
    'icy pink': 'FFB6C1',
    'cool blue': '87CEEB',
    'pure white': 'F5F5F5',
    'warm yellow': 'FFD700',
    'soft purple': 'DDA0DD',
    'light blue': 'ADD8E6',
    'bright red': 'FF0000',
    'bright yellow': 'FFFF00',
    'bright green': '00FF00',
    'deep brown': '8B4513',
    'warm orange': 'FFA500',
    'rich burgundy': '800020'
  };
  
  return colorMap[color.toLowerCase()] || '007BFF';
}

// Helper function to get material based on clothing type
function getMaterialForType(type: string): string {
  const materialMap: { [key: string]: string } = {
    'dress': 'Cotton Blend',
    'top': 'Cotton',
    'blouse': 'Silk',
    'shirt': 'Cotton',
    'trousers': 'Cotton Blend',
    'jeans': 'Denim',
    'skirt': 'Cotton',
    'jacket': 'Polyester Blend',
    'coat': 'Wool Blend',
    'jumper': 'Wool',
    'cardigan': 'Cotton',
    'hoodie': 'Cotton Blend',
    't-shirt': 'Cotton',
    'shorts': 'Cotton',
    'leggings': 'Polyester Blend'
  };
  return materialMap[type.toLowerCase()] || 'Cotton';
}
