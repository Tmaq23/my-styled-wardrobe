export interface Retailer {
  id: string;
  name: string;
  domain: string;
  logo?: string;
  commission: number; // Percentage commission
  categories: string[];
  priceRange: 'budget' | 'mid-range' | 'high-end' | 'luxury';
  regions: string[];
  affiliateProgram: string;
  trackingId?: string;
  apiKey?: string;
  features: string[];
}

export interface AffiliateLink {
  retailerId: string;
  productId: string;
  url: string;
  commission: number;
  expiresAt?: Date;
}

export const UK_RETAILERS: Retailer[] = [
  // High Street Fashion
  {
    id: 'next',
    name: 'Next',
    domain: 'next.co.uk',
    logo: '/logos/next.png',
    commission: 8.0,
    categories: ['women', 'men', 'kids', 'home'],
    priceRange: 'mid-range',
    regions: ['UK', 'EU'],
    affiliateProgram: 'Next Affiliate Program',
    features: ['free-delivery', 'returns', 'size-guide', 'trending']
  },
  {
    id: 'marks-spencer',
    name: 'Marks & Spencer',
    domain: 'marksandspencer.com',
    logo: '/logos/marks-spencer.png',
    commission: 6.5,
    categories: ['women', 'men', 'kids', 'home', 'food'],
    priceRange: 'mid-range',
    regions: ['UK', 'EU'],
    affiliateProgram: 'M&S Affiliate Program',
    features: ['premium-quality', 'sustainable', 'returns', 'loyalty-program']
  },
  {
    id: 'zara',
    name: 'Zara',
    domain: 'zara.com',
    logo: '/logos/zara.png',
    commission: 7.0,
    categories: ['women', 'men', 'kids', 'home'],
    priceRange: 'mid-range',
    regions: ['UK', 'EU', 'Global'],
    affiliateProgram: 'Zara Affiliate Program',
    features: ['fast-fashion', 'trending', 'sustainable-collection', 'returns']
  },
  {
    id: 'river-island',
    name: 'River Island',
    domain: 'riverisland.com',
    logo: '/logos/river-island.png',
    commission: 8.5,
    categories: ['women', 'men', 'kids'],
    priceRange: 'budget',
    regions: ['UK', 'EU'],
    affiliateProgram: 'River Island Affiliate Program',
    features: ['trending', 'affordable', 'returns', 'size-guide']
  },
  
  // Online Fashion Retailers
  {
    id: 'asos',
    name: 'ASOS',
    domain: 'asos.com',
    logo: '/logos/asos.png',
    commission: 10.0,
    categories: ['women', 'men', 'kids', 'beauty'],
    priceRange: 'budget',
    regions: ['UK', 'EU', 'Global'],
    affiliateProgram: 'ASOS Affiliate Program',
    features: ['huge-selection', 'student-discount', 'returns', 'trending']
  },
  {
    id: 'boohoo',
    name: 'Boohoo',
    domain: 'boohoo.com',
    logo: '/logos/boohoo.png',
    commission: 12.0,
    categories: ['women', 'men', 'kids', 'beauty'],
    priceRange: 'budget',
    regions: ['UK', 'EU', 'Global'],
    affiliateProgram: 'Boohoo Affiliate Program',
    features: ['ultra-affordable', 'fast-fashion', 'trending', 'returns']
  },
  {
    id: 'pretty-little-thing',
    name: 'PrettyLittleThing',
    domain: 'prettylittlething.com',
    logo: '/logos/pretty-little-thing.png',
    commission: 12.5,
    categories: ['women', 'beauty'],
    priceRange: 'budget',
    regions: ['UK', 'EU', 'Global'],
    affiliateProgram: 'PLT Affiliate Program',
    features: ['trending', 'affordable', 'celebrity-collabs', 'returns']
  },
  
  // Premium & Sustainable
  {
    id: 'reformation',
    name: 'Reformation',
    domain: 'reformation.com',
    logo: '/logos/reformation.png',
    commission: 15.0,
    categories: ['women'],
    priceRange: 'high-end',
    regions: ['UK', 'EU', 'US'],
    affiliateProgram: 'Reformation Affiliate Program',
    features: ['sustainable', 'eco-friendly', 'premium-quality', 'returns']
  },
  {
    id: 'veja',
    name: 'Veja',
    domain: 'veja-store.com',
    logo: '/logos/veja.png',
    commission: 12.0,
    categories: ['women', 'men', 'kids'],
    priceRange: 'high-end',
    regions: ['UK', 'EU', 'Global'],
    affiliateProgram: 'Veja Affiliate Program',
    features: ['sustainable', 'eco-friendly', 'premium-quality', 'returns']
  },
  
  // Department Stores
  {
    id: 'john-lewis',
    name: 'John Lewis',
    domain: 'johnlewis.com',
    logo: '/logos/john-lewis.png',
    commission: 5.0,
    categories: ['women', 'men', 'kids', 'home', 'electronics'],
    priceRange: 'high-end',
    regions: ['UK'],
    affiliateProgram: 'John Lewis Affiliate Program',
    features: ['premium-quality', 'excellent-service', 'returns', 'loyalty-program']
  },
  {
    id: 'debenhams',
    name: 'Debenhams',
    domain: 'debenhams.com',
    logo: '/logos/debenhams.png',
    commission: 6.0,
    categories: ['women', 'men', 'kids', 'home', 'beauty'],
    priceRange: 'mid-range',
    regions: ['UK'],
    affiliateProgram: 'Debenhams Affiliate Program',
    features: ['department-store', 'beauty', 'returns', 'loyalty-program']
  },
  
  // Luxury & Designer
  {
    id: 'net-a-porter',
    name: 'Net-a-Porter',
    domain: 'net-a-porter.com',
    logo: '/logos/net-a-porter.png',
    commission: 8.0,
    categories: ['women', 'men', 'kids'],
    priceRange: 'luxury',
    regions: ['UK', 'EU', 'Global'],
    affiliateProgram: 'Net-a-Porter Affiliate Program',
    features: ['luxury', 'designer', 'exclusive', 'personal-shopper']
  },
  {
    id: 'farfetch',
    name: 'Farfetch',
    domain: 'farfetch.com',
    logo: '/logos/farfetch.png',
    commission: 7.5,
    categories: ['women', 'men', 'kids'],
    priceRange: 'luxury',
    regions: ['UK', 'EU', 'Global'],
    affiliateProgram: 'Farfetch Affiliate Program',
    features: ['luxury', 'designer', 'global-boutiques', 'exclusive']
  },
  {
    id: 'matches-fashion',
    name: 'Matches Fashion',
    domain: 'matchesfashion.com',
    logo: '/logos/matches-fashion.png',
    commission: 8.5,
    categories: ['women', 'men'],
    priceRange: 'luxury',
    regions: ['UK', 'EU', 'Global'],
    affiliateProgram: 'Matches Fashion Affiliate Program',
    features: ['luxury', 'designer', 'curated', 'personal-styling']
  }
];

export const US_RETAILERS: Retailer[] = [
  {
    id: 'nordstrom',
    name: 'Nordstrom',
    domain: 'nordstrom.com',
    logo: '/logos/nordstrom.png',
    commission: 6.0,
    categories: ['women', 'men', 'kids', 'home'],
    priceRange: 'high-end',
    regions: ['US'],
    affiliateProgram: 'Nordstrom Affiliate Program',
    features: ['premium-service', 'returns', 'loyalty-program', 'personal-styling']
  },
  {
    id: 'anthropologie',
    name: 'Anthropologie',
    domain: 'anthropologie.com',
    logo: '/logos/anthropologie.png',
    commission: 8.0,
    categories: ['women', 'home'],
    priceRange: 'high-end',
    regions: ['US', 'Global'],
    affiliateProgram: 'Anthropologie Affiliate Program',
    features: ['boho-chic', 'home-decor', 'returns', 'loyalty-program']
  },
  {
    id: 'urban-outfitters',
    name: 'Urban Outfitters',
    domain: 'urbanoutfitters.com',
    logo: '/logos/urban-outfitters.png',
    commission: 8.5,
    categories: ['women', 'men', 'home'],
    priceRange: 'mid-range',
    regions: ['US', 'Global'],
    affiliateProgram: 'Urban Outfitters Affiliate Program',
    features: ['trending', 'youth-culture', 'returns', 'loyalty-program']
  }
];

export const SUSTAINABLE_RETAILERS: Retailer[] = [
  {
    id: 'patagonia',
    name: 'Patagonia',
    domain: 'patagonia.com',
    logo: '/logos/patagonia.png',
    commission: 10.0,
    categories: ['women', 'men', 'kids'],
    priceRange: 'high-end',
    regions: ['UK', 'EU', 'US', 'Global'],
    affiliateProgram: 'Patagonia Affiliate Program',
    features: ['sustainable', 'eco-friendly', 'outdoor', 'lifetime-warranty']
  },
  {
    id: 'tentree',
    name: 'Tentree',
    domain: 'tentree.com',
    logo: '/logos/tentree.png',
    commission: 15.0,
    categories: ['women', 'men', 'kids'],
    priceRange: 'mid-range',
    regions: ['UK', 'EU', 'US', 'Global'],
    affiliateProgram: 'Tentree Affiliate Program',
    features: ['sustainable', 'tree-planting', 'eco-friendly', 'returns']
  }
];

export const ALL_RETAILERS = [
  ...UK_RETAILERS,
  ...US_RETAILERS,
  ...SUSTAINABLE_RETAILERS
];

export function getRetailersByCategory(category: string): Retailer[] {
  return ALL_RETAILERS.filter(retailer => 
    retailer.categories.includes(category.toLowerCase())
  );
}

export function getRetailersByPriceRange(priceRange: string): Retailer[] {
  return ALL_RETAILERS.filter(retailer => 
    retailer.priceRange === priceRange
  );
}

export function getRetailersByRegion(region: string): Retailer[] {
  return ALL_RETAILERS.filter(retailer => 
    retailer.regions.includes(region.toUpperCase())
  );
}

export function getTopRetailersByCommission(limit: number = 10): Retailer[] {
  return ALL_RETAILERS
    .sort((a, b) => b.commission - a.commission)
    .slice(0, limit);
}

export function generateAffiliateLink(
  retailer: Retailer, 
  productUrl: string, 
  trackingId?: string
): string {
  const baseUrl = new URL(productUrl);
  
  // Add affiliate parameters
  if (trackingId) {
    baseUrl.searchParams.set('affiliate', trackingId);
  }
  
  // Add campaign tracking
  baseUrl.searchParams.set('utm_source', 'mystyledwardrobe');
  baseUrl.searchParams.set('utm_medium', 'affiliate');
  baseUrl.searchParams.set('utm_campaign', 'style-recommendations');
  
  return baseUrl.toString();
}

export function calculateCommission(price: number, retailer: Retailer): number {
  return (price * retailer.commission) / 100;
}

export function getRetailerById(id: string): Retailer | undefined {
  return ALL_RETAILERS.find(retailer => retailer.id === id);
}

export function getRetailersByFeature(feature: string): Retailer[] {
  return ALL_RETAILERS.filter(retailer => 
    retailer.features.includes(feature)
  );
}
