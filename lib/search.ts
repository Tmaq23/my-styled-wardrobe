import { searchWithImageExtraction } from './imageExtractor';

type SearchItem = { query: string; retailer?: string };

const RETAILER_DOMAINS: Record<string, string> = {
  'Next': 'next.co.uk',
  'River Island': 'riverisland.com',
  'M&S': 'marksandspencer.com',
  'Zara': 'zara.com',
};

const BLOCKED_DOMAINS = new Set<string>([
  'unsplash.com',
  'pexels.com',
  'pixabay.com',
  'gettyimages.com',
  'istockphoto.com',
  'shutterstock.com',
  'freepik.com',
]);

const BLOCKED_TITLE_TERMS = [
  'bouquet', 'wedding', 'flowers', 'stock photo', 'hanger', 'frame mockup', 'background', 'wallpaper', 'free photo', 'royalty-free', 'illustration', 'vector', 'mockup', 'template', 'design', 'art', 'drawing', 'painting', 'graphic', 'logo', 'icon', 'symbol', 'pattern', 'texture', 'fabric swatch', 'color palette', 'color chart'
];

function buildSiteQuery(retailers?: string[]): string | null {
  if (!retailers || retailers.length === 0) return null;
  const domains = retailers.map(r => RETAILER_DOMAINS[r] || '').filter(Boolean);
  if (!domains.length) return null;
  if (domains.length === 1) return `site:${domains[0]}`;
  return domains.map(d => `site:${d}`).join(' OR ');
}

export type FoundProduct = { title: string; url: string; image: string };

function getDomain(url: string | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

function isAllowedDomain(url: string | undefined, retailers?: string[]) {
  const d = getDomain(url || '');
  if (!d) return false;
  if (BLOCKED_DOMAINS.has(d)) return false;
  if (!retailers || retailers.length === 0) return true;
  const allowed = retailers.map(r => RETAILER_DOMAINS[r]).filter(Boolean);
  return allowed.some(dom => d.endsWith(dom));
}

function hasBadTerms(title?: string) {
  if (!title) return false;
  const t = title.toLowerCase();
  return BLOCKED_TITLE_TERMS.some(w => t.includes(w));
}

function refineQuery(base: string, gender?: string, retailers?: string[]) {
  const g = gender && /men/i.test(gender) ? 'men' : (gender && /women|female/i.test(gender) ? 'women' : '');
  const extras = ['buy', 'shop', 'clothing', 'fashion', 'apparel', 'outfit'];
  return [base, g, ...extras, buildSiteQuery(retailers)].filter(Boolean).join(' ');
}

export async function searchProductImageAndLink(query: string, opts: { retailers?: string[]; gender?: string; exclude?: Set<string> | string[] }): Promise<FoundProduct | null> {
  const q = refineQuery(query, opts.gender, opts.retailers);
  const excludeSet: Set<string> = Array.isArray(opts.exclude)
    ? new Set(opts.exclude)
    : (opts.exclude instanceof Set ? opts.exclude : new Set());

  // Try Google Custom Search (images) first
  const gKey = process.env.GOOGLE_API_KEY;
  const gCse = process.env.GOOGLE_CSE_ID;
  if (gKey && gCse) {
    try {
      const gUrl = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(q)}&cx=${encodeURIComponent(gCse)}&searchType=image&num=10&safe=active`; 
      const gres = await fetch(gUrl, { headers: { 'Accept': 'application/json' } });
      if (gres.ok) {
        const gdata: any = await gres.json();
        const items: any[] = gdata?.items || [];
        // Pass 1: prefer allowed retailer domains
        for (const gi of items) {
          const img = gi?.link; // direct image
          const page = gi?.image?.contextLink; // host page
          if (!img || !page) continue;
          const keyA = (page as string).trim();
          const keyB = (img as string).trim();
          if (excludeSet.has(keyA) || excludeSet.has(keyB)) continue;
          if (!hasBadTerms(gi?.title) && (isAllowedDomain(page, opts.retailers) || isAllowedDomain(img, opts.retailers))) {
            return { title: gi.title || query, url: page, image: img };
          }
        }
        // Pass 2: any non-excluded only if no retailer restriction
        if (!opts.retailers || opts.retailers.length === 0) {
          for (const gi of items) {
            const img = gi?.link;
            const page = gi?.image?.contextLink;
            if (!img || !page) continue;
            const keyA = (page as string).trim();
            const keyB = (img as string).trim();
            if (excludeSet.has(keyA) || excludeSet.has(keyB)) continue;
            if (!hasBadTerms(gi?.title) && !BLOCKED_DOMAINS.has(getDomain(page) || '') && !BLOCKED_DOMAINS.has(getDomain(img) || '')) {
              return { title: gi.title || query, url: page, image: img };
            }
          }
        }
      }
    } catch {}
  }

  // Fallback: Bing Images API
  const key = process.env.BING_SEARCH_KEY;
  const endpoint = process.env.BING_IMAGES_ENDPOINT || 'https://api.bing.microsoft.com/v7.0/images/search';
  if (!key) return null;
  try {
    const url = `${endpoint}?q=${encodeURIComponent(q)}&mkt=en-GB&safeSearch=Strict&count=25`;
    const res = await fetch(url, { headers: { 'Ocp-Apim-Subscription-Key': key } });
    if (!res.ok) return null;
    const data: any = await res.json();
    const arr: any[] = data?.value || [];
    // Pass 1: prefer allowed retailer domains
    for (const v of arr) {
      const page = v?.hostPageUrl || v?.contentUrl;
      const img = v?.contentUrl || v?.thumbnailUrl;
      const keyA = (page || '').trim();
      const keyB = (img || '').trim();
      if (!page || !img) continue;
      if (excludeSet.has(keyA) || excludeSet.has(keyB)) continue;
  if (!hasBadTerms(v?.name) && (isAllowedDomain(page, opts.retailers) || isAllowedDomain(img, opts.retailers))) {
        return { title: v.name || query, url: page, image: img };
      }
    }
    // Pass 2: any non-excluded only if no retailer restriction
    if (!opts.retailers || opts.retailers.length === 0) {
      for (const v of arr) {
        const page = v?.hostPageUrl || v?.contentUrl;
        const img = v?.contentUrl || v?.thumbnailUrl;
        const keyA = (page || '').trim();
        const keyB = (img || '').trim();
  if (!page || !img) continue;
        if (excludeSet.has(keyA) || excludeSet.has(keyB)) continue;
  if (!hasBadTerms(v?.name) && !BLOCKED_DOMAINS.has(getDomain(page) || '') && !BLOCKED_DOMAINS.has(getDomain(img) || '')) {
          return { title: v.name || query, url: page, image: img };
        }
      }
    }
  } catch {
    // Continue to enhanced extraction if Bing fails
  }

  // Enhanced Fallback: Try robust image extraction from search results
  // This implements the multi-layered approach you specified
  try {
    console.log(`🔍 Traditional search failed, trying enhanced image extraction...`);
    
    // Get a sample URL from the search results to try extraction
    let sampleUrl: string | null = null;
    
    // Try to get a URL from Google results first
    if (gKey && gCse) {
      try {
        const gUrl = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(q)}&cx=${encodeURIComponent(gCse)}&searchType=web&num=5&safe=active`;
        const gres = await fetch(gUrl, { headers: { 'Accept': 'application/json' } });
        if (gres.ok) {
          const gdata: any = await gres.json();
          const items: any[] = gdata?.items || [];
          for (const item of items) {
            if (item.link && isAllowedDomain(item.link, opts.retailers)) {
              sampleUrl = item.link;
              break;
            }
          }
        }
      } catch {}
    }
    
    // If no Google URL, try Bing web search
    if (!sampleUrl && key) {
      try {
        const webUrl = `${endpoint.replace('/images/', '/web/')}?q=${encodeURIComponent(q)}&mkt=en-GB&safeSearch=Strict&count=5`;
        const res = await fetch(webUrl, { headers: { 'Ocp-Apim-Subscription-Key': key } });
        if (res.ok) {
          const data: any = await res.json();
          const arr: any[] = data?.webPages?.value || [];
          for (const item of arr) {
            if (item.url && isAllowedDomain(item.url, opts.retailers)) {
              sampleUrl = item.url;
              break;
            }
          }
        }
      } catch {}
    }
    
    // If we have a sample URL, try enhanced extraction
    if (sampleUrl) {
      console.log(`🔍 Trying enhanced extraction from: ${sampleUrl}`);
      
      // Determine retailer from URL for better extraction
      const domain = getDomain(sampleUrl);
      let retailer: string | undefined;
      
      if (domain) {
        for (const [retailerName, retailerDomain] of Object.entries(RETAILER_DOMAINS)) {
          if (domain.endsWith(retailerDomain)) {
            retailer = retailerName;
            break;
          }
        }
      }
      
      const extractedResult = await searchWithImageExtraction(query, sampleUrl, retailer);
      if (extractedResult) {
        console.log(`✅ Enhanced extraction successful: ${extractedResult.image}`);
        return extractedResult;
      }
    }
    
  } catch (error) {
    console.log(`Enhanced extraction fallback failed: ${error}`);
  }

  return null;
}

export async function enrichLookItems(items: { query: string; retailer?: string }[], opts: { retailers?: string[]; gender?: string; exclude?: Set<string> | string[] }): Promise<FoundProduct[]> {
  const excludeSet: Set<string> = Array.isArray(opts.exclude)
    ? new Set(opts.exclude)
    : (opts.exclude instanceof Set ? opts.exclude : new Set());
  // Try up to 3 queries, stop at the first unique found result
  for (const it of items.slice(0,3)) {
    const found = await searchProductImageAndLink(it.query, { retailers: opts.retailers, gender: opts.gender, exclude: excludeSet });
    if (found) {
      excludeSet.add(found.url);
      excludeSet.add(found.image);
      return [found];
    }
  }
  return [];
}
