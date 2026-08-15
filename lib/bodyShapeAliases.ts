import type { BodyShape } from '@/lib/bodyShape';

const ALIASES: Record<string, BodyShape> = {
  pear: 'Triangle',
  triangle: 'Triangle',
  apple: 'Round',
  round: 'Round',
  hourglass: 'Hourglass',
  rectangle: 'Rectangle',
  'inverted triangle': 'Inverted Triangle',
  invertedtriangle: 'Inverted Triangle',
};

export function normalizeBodyShape(shape?: string | null): BodyShape {
  if (!shape) return 'Rectangle';
  const key = shape.trim().toLowerCase().replace(/[_-]+/g, ' ');
  return ALIASES[key] || (['Hourglass', 'Triangle', 'Inverted Triangle', 'Rectangle', 'Round'].includes(shape)
    ? (shape as BodyShape)
    : 'Rectangle');
}
