// Skimlinks integration for affiliate tracking
const SKIMLINKS_API_KEY = process.env['SKIMLINKS_API_KEY'];
const SKIMLINKS_PUBLISHER_ID = process.env['SKIMLINKS_PUBLISHER_ID'];

export interface AffiliateLink {
  originalUrl: string;
  affiliateUrl: string;
  commission?: number;
  retailer?: string;
}

export async function generateAffiliateLink(productUrl: string): Promise<AffiliateLink> {
  try {
    // Skimlinks API call to generate affiliate link
    const response = await fetch('https://api-v2.skimlinks.com/links', {
      method: 'POST',
      headers: {
        'X-API-Key': SKIMLINKS_API_KEY || '',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url: productUrl,
        publisher_id: SKIMLINKS_PUBLISHER_ID
      })
    });

    if (!response.ok) {
      console.warn('Skimlinks API failed, using original URL');
      return { originalUrl: productUrl, affiliateUrl: productUrl };
    }

    const data = await response.json();
    
    return {
      originalUrl: productUrl,
      affiliateUrl: data.affiliate_url || productUrl,
      commission: data.commission_rate,
      retailer: data.merchant_name
    };
    
  } catch (error) {
    console.error('Affiliate link generation failed:', error);
    return { originalUrl: productUrl, affiliateUrl: productUrl };
  }
}

export async function trackAffiliateClick(userId: string, productUrl: string, affiliateUrl: string) {
  try {
    // Log click for analytics
    await fetch('/api/affiliate/track-click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        productUrl,
        affiliateUrl,
        timestamp: new Date().toISOString()
      })
    });
  } catch (error) {
    console.error('Failed to track affiliate click:', error);
  }
}
