export interface Lookbook {
  id: string;
  title: string;
  description: string;
  price: number;
  bodyShape: string;
  season: string;
  previewImages: string[];
  fileUrl?: string; // PDF download after purchase
  outfits: {
    title: string;
    description: string;
    items: string[];
    occasion: string;
  }[];
}

export const AVAILABLE_LOOKBOOKS: Lookbook[] = [
  {
    id: 'autumn-hourglass-capsule',
    title: 'Autumn Capsule Collection - Hourglass Body Shape',
    description: 'A curated collection of 8 sophisticated outfits for autumn, specifically tailored for hourglass body shapes. Includes workwear, weekend looks, and evening styles.',
    price: 12.99,
    bodyShape: 'Hourglass',
    season: 'Autumn',
    previewImages: [
      'https://picsum.photos/300/400?random=1',
      'https://picsum.photos/300/400?random=2',
      'https://picsum.photos/300/400?random=3'
    ],
    outfits: [
      {
        title: 'Power Meeting Look',
        description: 'Structured blazer with fitted pants and statement accessories',
        items: ['Burgundy blazer', 'Black fitted trousers', 'Cream silk blouse'],
        occasion: 'Business'
      },
      {
        title: 'Weekend Brunch Style',
        description: 'Cozy yet chic autumn layers for casual outings',
        items: ['Camel coat', 'Rust orange sweater', 'Dark wash jeans'],
        occasion: 'Casual'
      }
      // ... more outfits
    ]
  },
  {
    id: 'winter-rectangle-essentials',
    title: 'Winter Essentials - Rectangle Body Shape',
    description: 'Stay stylish through winter with 10 outfits designed to add curves and definition to rectangle body shapes.',
    price: 14.99,
    bodyShape: 'Rectangle',
    season: 'Winter',
    previewImages: [
      'https://picsum.photos/300/400?random=4',
      'https://picsum.photos/300/400?random=5'
    ],
    outfits: [
      {
        title: 'Cozy Date Night',
        description: 'Textured layers that create visual interest and curves',
        items: ['Chunky knit sweater', 'High-waisted wide-leg pants', 'Statement belt'],
        occasion: 'Evening'
      }
    ]
  }
];

export function getLookbooksForUser(bodyShape: string, season?: string): Lookbook[] {
  return AVAILABLE_LOOKBOOKS.filter(lookbook => {
    const shapeMatch = lookbook.bodyShape.toLowerCase() === bodyShape.toLowerCase();
    const seasonMatch = !season || lookbook.season.toLowerCase() === season.toLowerCase();
    return shapeMatch && seasonMatch;
  });
}
