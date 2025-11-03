import { JSDOM } from 'jsdom';

// Types for structured data extraction
interface ProductSchema {
  '@type': string;
  image?: string | string[] | ImageObject | ImageObject[];
  name?: string;
  description?: string;
}

interface ImageObject {
  '@type': string;
  contentURL?: string;
  thumbnail?: string;
  url?: string;
}

interface ExtractionResult {
  images: string[];
  title?: string;
  description?: string;
  source: 'json-ld' | 'open-graph' | 'meta-tags' | 'img-elements' | 'javascript' | 'fallback';
}

// Rate limiting configuration
const RATE_LIMIT_DELAY = 1000; // 1 second between requests
const MAX_RETRIES = 3;
const REQUEST_TIMEOUT = 10000; // 10 seconds

// User agent rotation to avoid detection
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/121.0'
];

// Retailer-specific configurations
const RETAILER_CONFIGS = {
  'ASOS': {
    apiUrl: 'https://api.asos.com/product/v2/detail',
    imagePattern: 'https://images.asos-media.com/products/{sku}/image.jpg',
    requiresJavaScript: false,
    selectors: {
      productImage: '.product-gallery__image',
      jsonLd: 'script[type="application/ld+json"]',
      ogImage: 'meta[property="og:image"]'
    }
  },
  'Zara': {
    apiUrl: 'https://www.zara.com/api/products',
    imagePattern: 'https://static.zara.net/photos/{sku}/w/750/image.jpg',
    requiresJavaScript: true,
    selectors: {
      productImage: '.product-detail__image',
      jsonLd: 'script[type="application/ld+json"]',
      ogImage: 'meta[property="og:image"]'
    }
  },
  'H&M': {
    apiUrl: 'https://apidojo-hm-hennes-mauritz-v1.p.rapidapi.com/products',
    imagePattern: 'https://lp.hm.com/hmprod?set=source[/{sku}/image.jpg]',
    requiresJavaScript: false,
    selectors: {
      productImage: '.product-image',
      jsonLd: 'script[type="application/ld+json"]',
      ogImage: 'meta[property="og:image"]'
    }
  },
  'Next': {
    apiUrl: 'https://www.next.co.uk/api/products',
    imagePattern: 'https://images.next.co.uk/products/{sku}/image.jpg',
    requiresJavaScript: false,
    selectors: {
      productImage: '.product-image',
      jsonLd: 'script[type="application/ld+json"]',
      ogImage: 'meta[property="og:image"]'
    }
  },
  'River Island': {
    apiUrl: null,
    imagePattern: null,
    requiresJavaScript: false,
    selectors: {
      productImage: '.product-image',
      jsonLd: 'script[type="application/ld+json"]',
      ogImage: 'meta[property="og:image"]'
    }
  }
};

/**
 * Main function to extract product images from a URL
 * Implements the multi-layered approach as specified
 */
export async function extractProductImages(url: string, retailer?: string): Promise<ExtractionResult> {
  try {
    console.log(`🔍 Starting image extraction from: ${url}`);
    
    // Step 1: Try official retailer API if available
    if (retailer && RETAILER_CONFIGS[retailer as keyof typeof RETAILER_CONFIGS]?.apiUrl) {
      const apiResult = await tryOfficialAPI(url, retailer);
      if (apiResult.images.length > 0) {
        console.log(`✅ Found ${apiResult.images.length} images via ${retailer} API`);
        return apiResult;
      }
    }

    // Step 2: Fetch and parse the HTML page
    const html = await fetchPageHTML(url);
    if (!html) {
      throw new Error('Failed to fetch page HTML');
    }

    // Step 3: Parse schema.org JSON-LD (highest priority)
    const jsonLdResult = await extractJSONLD(html, url);
    if (jsonLdResult.images.length > 0) {
      console.log(`✅ Found ${jsonLdResult.images.length} images via JSON-LD`);
      return jsonLdResult;
    }

    // Step 4: Extract Open Graph images
    const ogResult = await extractOpenGraph(html, url);
    if (ogResult.images.length > 0) {
      console.log(`✅ Found ${ogResult.images.length} images via Open Graph`);
      return ogResult;
    }

    // Step 5: Extract meta tag images
    const metaResult = await extractMetaTags(html, url);
    if (metaResult.images.length > 0) {
      console.log(`✅ Found ${metaResult.images.length} images via meta tags`);
      return metaResult;
    }

    // Step 6: Find high-resolution images in JavaScript variables
    const jsResult = await extractJavaScriptImages(html, url);
    if (jsResult.images.length > 0) {
      console.log(`✅ Found ${jsResult.images.length} images via JavaScript variables`);
      return jsResult;
    }

    // Step 7: Fallback to first <img> element
    const fallbackResult = await extractImgElements(html, url);
    if (fallbackResult.images.length > 0) {
      console.log(`✅ Found ${fallbackResult.images.length} images via <img> elements`);
      return fallbackResult;
    }

    // Step 8: Ultimate fallback - generate placeholder
    console.log(`⚠️ No images found, using fallback`);
    return {
      images: [`https://via.placeholder.com/400x600/f0f0f0/999999?text=No+Image+Found`],
      source: 'fallback'
    };

  } catch (error) {
    console.error(`❌ Image extraction failed: ${error}`);
    return {
      images: [`https://via.placeholder.com/400x600/f0f0f0/999999?text=Extraction+Failed`],
      source: 'fallback'
    };
  }
}

/**
 * Step 1: Try official retailer API
 */
async function tryOfficialAPI(url: string, retailer: string): Promise<ExtractionResult> {
  const config = RETAILER_CONFIGS[retailer as keyof typeof RETAILER_CONFIGS];
  if (!config?.apiUrl) return { images: [], source: 'fallback' };

  try {
    // Extract product ID from URL
    const productId = extractProductIdFromURL(url, retailer);
    if (!productId) return { images: [], source: 'fallback' };

    // Make API request
    const response = await fetch(`${config.apiUrl}/${productId}`, {
      headers: {
        'User-Agent': getRandomUserAgent(),
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT)
    });

    if (response.ok) {
      const data = await response.json();
      const images = extractImagesFromAPIResponse(data, retailer);
      if (images.length > 0) {
        return {
          images,
          title: data.name || data.title || '',
          description: data.description || '',
          source: 'json-ld'
        };
      }
    }
  } catch (error) {
    console.log(`API call failed for ${retailer}: ${error}`);
  }

  return { images: [], source: 'fallback' };
}

/**
 * Step 2: Fetch page HTML with proper headers and rate limiting
 */
async function fetchPageHTML(url: string): Promise<string | null> {
  try {
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY));

    const response = await fetch(url, {
      headers: {
        'User-Agent': getRandomUserAgent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.text();
  } catch (error) {
    console.error(`Failed to fetch HTML: ${error}`);
    return null;
  }
}

/**
 * Step 3: Parse schema.org JSON-LD Product objects
 */
async function extractJSONLD(html: string, baseUrl: string): Promise<ExtractionResult> {
  try {
    const dom = new JSDOM(html);
    const scripts = dom.window.document.querySelectorAll('script[type="application/ld+json"]');
    
    for (const script of scripts) {
      try {
        const content = script.textContent?.trim();
        if (!content) continue;

        const data: ProductSchema = JSON.parse(content);
        
        // Check if it's a Product type
        if (data['@type'] === 'Product' && data.image) {
          const images = normalizeImageUrls(data.image, baseUrl);
          if (images.length > 0) {
            return {
              images,
              title: data.name || '',
              description: data.description || '',
              source: 'json-ld'
            };
          }
        }
      } catch (parseError) {
        console.log(`Failed to parse JSON-LD: ${parseError}`);
        continue;
      }
    }
  } catch (error) {
    console.log(`JSON-LD extraction failed: ${error}`);
  }

  return { images: [], source: 'fallback' };
}

/**
 * Step 4: Extract Open Graph images
 */
async function extractOpenGraph(html: string, baseUrl: string): Promise<ExtractionResult> {
  try {
    const dom = new JSDOM(html);
    
    // Look for og:image meta tags
    const ogImage = dom.window.document.querySelector('meta[property="og:image"]');
    if (ogImage && ogImage.getAttribute('content')) {
      const imageUrl = new URL(ogImage.getAttribute('content')!, baseUrl).href;
      return {
        images: [imageUrl],
        source: 'open-graph'
      };
    }

    // Look for twitter:image meta tags
    const twitterImage = dom.window.document.querySelector('meta[name="twitter:image"]');
    if (twitterImage && twitterImage.getAttribute('content')) {
      const imageUrl = new URL(twitterImage.getAttribute('content')!, baseUrl).href;
      return {
        images: [imageUrl],
        source: 'open-graph'
      };
    }
  } catch (error) {
    console.log(`Open Graph extraction failed: ${error}`);
  }

  return { images: [], source: 'fallback' };
}

/**
 * Step 5: Extract images from meta tags
 */
async function extractMetaTags(html: string, baseUrl: string): Promise<ExtractionResult> {
  try {
    const dom = new JSDOM(html);
    
    // Look for various image meta tags
    const imageSelectors = [
      'meta[property="og:image"]',
      'meta[name="twitter:image"]',
      'meta[name="image"]',
      'meta[property="image"]'
    ];

    for (const selector of imageSelectors) {
      const meta = dom.window.document.querySelector(selector);
      if (meta && meta.getAttribute('content')) {
        const imageUrl = new URL(meta.getAttribute('content')!, baseUrl).href;
        return {
          images: [imageUrl],
          source: 'meta-tags'
        };
      }
    }
  } catch (error) {
    console.log(`Meta tag extraction failed: ${error}`);
  }

  return { images: [], source: 'fallback' };
}

/**
 * Step 6: Extract high-resolution images from JavaScript variables
 */
async function extractJavaScriptImages(html: string, baseUrl: string): Promise<ExtractionResult> {
  try {
    const images: string[] = [];
    
    // Common patterns for high-resolution images in JavaScript
    const patterns = [
      /"hiRes"\s*:\s*"([^"]+\.(?:jpg|jpeg|png|webp))"/gi,
      /"highRes"\s*:\s*"([^"]+\.(?:jpg|jpeg|png|webp))"/gi,
      /"largeImage"\s*:\s*"([^"]+\.(?:jpg|jpeg|png|webp))"/gi,
      /"fullImage"\s*:\s*"([^"]+\.(?:jpg|jpeg|png|webp))"/gi,
      /"originalImage"\s*:\s*"([^"]+\.(?:jpg|jpeg|png|webp))"/gi,
      /"imageUrl"\s*:\s*"([^"]+\.(?:jpg|jpeg|png|webp))"/gi,
      /"src"\s*:\s*"([^"]+\.(?:jpg|jpeg|png|webp))"/gi
    ];

    for (const pattern of patterns) {
      const matches = html.matchAll(pattern);
      for (const match of matches) {
        if (match[1]) {
          const imageUrl = new URL(match[1], baseUrl).href;
          images.push(imageUrl);
        }
      }
    }

    if (images.length > 0) {
      return {
        images: [...new Set(images)], // Remove duplicates
        source: 'javascript'
      };
    }
  } catch (error) {
    console.log(`JavaScript image extraction failed: ${error}`);
  }

  return { images: [], source: 'fallback' };
}

/**
 * Step 7: Fallback to <img> elements
 */
async function extractImgElements(html: string, baseUrl: string): Promise<ExtractionResult> {
  try {
    const dom = new JSDOM(html);
    const images = dom.window.document.querySelectorAll('img');
    
    for (const img of images) {
      const src = img.getAttribute('src');
      if (src && !src.startsWith('data:') && !src.startsWith('blob:')) {
        try {
          const imageUrl = new URL(src, baseUrl).href;
          // Filter out common non-product images
          if (!isNonProductImage(imageUrl)) {
            return {
              images: [imageUrl],
              source: 'img-elements'
            };
          }
        } catch (urlError) {
          continue;
        }
      }
    }
  } catch (error) {
    console.log(`<img> element extraction failed: ${error}`);
  }

  return { images: [], source: 'fallback' };
}

/**
 * Helper function to normalize image URLs from various sources
 */
function normalizeImageUrls(imageData: string | string[] | ImageObject | ImageObject[], baseUrl: string): string[] {
  const images: string[] = [];

  if (typeof imageData === 'string') {
    images.push(imageData);
  } else if (Array.isArray(imageData)) {
    for (const item of imageData) {
      if (typeof item === 'string') {
        images.push(item);
      } else if (typeof item === 'object' && item !== null) {
        if (item.contentURL) images.push(item.contentURL);
        if (item.thumbnail) images.push(item.thumbnail);
        if (item.url) images.push(item.url);
      }
    }
  } else if (typeof imageData === 'object' && imageData !== null) {
    if (imageData.contentURL) images.push(imageData.contentURL);
    if (imageData.thumbnail) images.push(imageData.thumbnail);
    if (imageData.url) images.push(imageData.url);
  }

  // Convert relative URLs to absolute URLs
  return images.map(img => {
    try {
      return new URL(img, baseUrl).href;
    } catch {
      return img;
    }
  }).filter(Boolean);
}

/**
 * Helper function to extract product ID from URL
 */
function extractProductIdFromURL(url: string, retailer: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    
    // Common patterns for different retailers
    const patterns = {
      'ASOS': /\/products\/([^\/]+)/,
      'Zara': /\/products\/([^\/]+)/,
      'H&M': /\/product\/([^\/]+)/,
      'Next': /\/products\/([^\/]+)/,
      'River Island': /\/products\/([^\/]+)/
    };

    const pattern = patterns[retailer as keyof typeof patterns];
    if (pattern) {
      const match = pathname.match(pattern);
      return match ? match[1] : null;
    }
  } catch (error) {
    console.log(`Failed to extract product ID: ${error}`);
  }

  return null;
}

/**
 * Helper function to extract images from API response
 */
function extractImagesFromAPIResponse(data: any, retailer: string): string[] {
  const images: string[] = [];
  
  // Common API response structures
  if (data.images && Array.isArray(data.images)) {
    images.push(...data.images);
  } else if (data.image && typeof data.image === 'string') {
    images.push(data.image);
  } else if (data.media && Array.isArray(data.media)) {
    for (const media of data.media) {
      if (media.url) images.push(media.url);
    }
  }

  return images.filter(Boolean);
}

/**
 * Helper function to check if an image is likely not a product image
 */
function isNonProductImage(imageUrl: string): boolean {
  const nonProductPatterns = [
    /logo/i,
    /icon/i,
    /banner/i,
    /advertisement/i,
    /social/i,
    /avatar/i,
    /profile/i,
    /thumbnail/i,
    /placeholder/i
  ];

  return nonProductPatterns.some(pattern => pattern.test(imageUrl));
}

/**
 * Helper function to get a random user agent
 */
function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

/**
 * Enhanced search function that uses the robust image extraction
 */
export async function searchWithImageExtraction(
  query: string, 
  url: string, 
  retailer?: string
): Promise<{ title: string; url: string; image: string } | null> {
  try {
    const result = await extractProductImages(url, retailer);
    
    if (result.images.length > 0) {
      return {
        title: result.title || query,
        url: url,
        image: result.images[0] // Use the first (best) image
      };
    }
  } catch (error) {
    console.error(`Image extraction failed for ${url}: ${error}`);
  }

  return null;
}

