import sample from '../data/products.sample.json';

type Palette = 'Spring'|'Summer'|'Autumn'|'Winter';
type Shape = 'Hourglass'|'Triangle'|'Inverted Triangle'|'Rectangle'|'Round';

export type Product = {
  id: string;
  title: string;
  brand?: string;
  retailer?: 'Next'|'River Island'|'M&S'|'Zara'|string;
  price?: number;
  currency?: string;
  image?: string;
  url: string;
  tags?: string[];
  color?: string;
  paletteHint?: Palette[];
  shapes?: Shape[]|['All'];
  occasions?: string[];
  priceBucket?: '£'|'££'|'£££';
};

export function findProducts(opts: {
  palette: Palette;
  shape: Shape;
  occasion: string;
  budget: '£'|'££'|'£££';
  retailers?: string[];
}): Product[] {
  const { palette, shape, occasion, budget, retailers } = opts;
  const all: Product[] = sample as any;

  return all
    .filter(p => !p.paletteHint || p.paletteHint.includes(palette))
  .filter(p => !p.shapes || (p.shapes as any).includes(shape) || (p.shapes as any)?.includes?.('All'))
    .filter(p => !p.occasions || p.occasions.includes(occasion))
    .filter(p => !p.priceBucket || p.priceBucket === budget)
    .filter(p => !retailers?.length || (p.retailer && retailers.includes(p.retailer)))
    .slice(0, 12);
}