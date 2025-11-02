import type { Product } from './products';

export const SYSTEM_PROMPT = `You are an expert personal stylist who creates PERFECTLY aligned outfit recommendations. Your responses must be precise and match exactly with the provided product images and details.

CRITICAL RULES:
- ALWAYS describe the EXACT items shown in the product list - never invent or mismatch descriptions
- Each look description must perfectly match the actual product titles, colors, and styles
- If a product shows "Red Wrap Dress", describe it as exactly that - not as a different item
- Ensure every description aligns with the actual product image and title
- Build 3 cohesive looks with perfect image-description alignment
- Each look: 1 sentence outfit description + 1 sentence styling rationale
- Maximum 3-4 items per look
- Only reference items from the provided product list by their exact titles
- No markdown, no bullet points, no JSON. Plain sentences only.
- Double-check that descriptions match the actual product images and titles`;

export function userPrompt(
  info: { palette: string; shape: string; occasion: string; budget: string; retailers?: string[]; gender?: 'Women'|'Men'|'Unisex' },
  products: Product[],
  hasPhoto: boolean
) {
  const { palette, shape, occasion, budget, retailers, gender } = info;
  const header = `User: palette=${palette}; shape=${shape}; occasion=${occasion}; budget=${budget}`
    + (gender ? `; gender=${gender}` : '')
    + (retailers?.length ? `; retailers in scope=${retailers.join(', ')}` : '')
    + (hasPhoto ? '; photo=provided' : '');

  const catalog = products.map(p => {
    const bits = [
      `"${p.title}"`, // Exact title in quotes
      p.brand ? `brand: ${p.brand}` : '',
      p.retailer ? `retailer: ${p.retailer}` : '',
      p.price ? `price: ${p.price}${p.currency || ''}` : '',
      p.tags?.length ? `tags: ${p.tags.join(', ')}` : ''
    ].filter(Boolean).join(' | ');
    return `- ${bits}`;
  }).join('\n');

  const tail = products.length ? `\n\nIMPORTANT: Use ONLY the exact product titles from the list above. Ensure your descriptions perfectly match the actual product images and titles. Create 3 cohesive looks that align with the ${palette} palette and ${shape} body shape for ${occasion} occasions.` : '';

  return `${header}\n\nAvailable Products (use EXACT titles):\n${catalog || '- (empty)'}${tail}\n\nCreate 3 perfect looks with descriptions that exactly match the product titles and images.`;
}

// Enhanced extractor for perfect item matching
export const EXTRACTOR_PROMPT = `Extract each look with PERFECT alignment to the actual product titles and images. Ensure descriptions match exactly what is shown.

Return strict JSON only: {"looks":[{"name":string,"desc":string,"items":string[]}]} (exactly 3 looks, max 3 items per look).

CRITICAL: Each description must match the exact product titles from the product list. No generic descriptions - use the specific product names provided.`;
