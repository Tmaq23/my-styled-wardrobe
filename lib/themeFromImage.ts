export interface ColorAnalysis {
  skinTone: {
    undertone: 'warm' | 'cool' | 'neutral';
    depth: 'light' | 'medium' | 'deep';
    hex: string;
    confidence: number;
  };
  eyeColor: {
    primary: string;
    secondary?: string;
    hex: string;
    confidence: number;
  };
  hairColor: {
    primary: string;
    secondary?: string;
    hex: string;
    confidence: number;
  };
  recommendedPalette: 'Spring' | 'Summer' | 'Autumn' | 'Winter';
  confidence: number;
}

export interface SkinToneResult {
  undertone: 'warm' | 'cool' | 'neutral';
  depth: 'light' | 'medium' | 'deep';
  hex: string;
  confidence: number;
}

export interface EyeColorResult {
  primary: string;
  secondary?: string;
  hex: string;
  confidence: number;
}

export interface HairColorResult {
  primary: string;
  secondary?: string;
  hex: string;
  confidence: number;
}

/**
 * Enhanced skin tone analysis using multiple face regions
 */
export function analyzeSkinTone(imageData: ImageData, faceLandmarks: any[]): SkinToneResult {
  const regions = [
    { name: 'cheeks', x: 0.3, y: 0.4, size: 0.1 },
    { name: 'forehead', x: 0.5, y: 0.2, size: 0.08 },
    { name: 'chin', x: 0.5, y: 0.6, size: 0.08 }
  ];

  const samples: number[][] = [];
  
  regions.forEach(region => {
    const x = Math.floor(region.x * imageData.width);
    const y = Math.floor(region.y * imageData.height);
    const size = Math.floor(region.size * Math.min(imageData.width, imageData.height));
    
    for (let dy = -size/2; dy < size/2; dy++) {
      for (let dx = -size/2; dx < size/2; dx++) {
        const px = Math.max(0, Math.min(imageData.width - 1, x + dx));
        const py = Math.max(0, Math.min(imageData.height - 1, y + dy));
        const idx = (py * imageData.width + px) * 4;
        
        const r = imageData.data[idx];
        const g = imageData.data[idx + 1];
        const b = imageData.data[idx + 2];
        const a = imageData.data[idx + 3];
        
        if (a > 128) { // Only sample non-transparent pixels
          samples.push([r, g, b]);
        }
      }
    }
  });

  if (samples.length === 0) {
    return {
      undertone: 'neutral',
      depth: 'medium',
      hex: '#d4a574',
      confidence: 0.5
    };
  }

  // Calculate average color
  const avgR = samples.reduce((sum, [r]) => sum + r, 0) / samples.length;
  const avgG = samples.reduce((sum, [_, g]) => sum + g, 0) / samples.length;
  const avgB = samples.reduce((sum, [_, __, b]) => sum + b, 0) / samples.length;

  // Determine undertone
  let undertone: 'warm' | 'cool' | 'neutral' = 'neutral';
  let undertoneConfidence = 0.5;

  if (avgR > avgB + 15) {
    undertone = 'warm';
    undertoneConfidence = Math.min(0.9, (avgR - avgB) / 50);
  } else if (avgB > avgR + 15) {
    undertone = 'cool';
    undertoneConfidence = Math.min(0.9, (avgB - avgR) / 50);
  }

  // Determine depth
  const brightness = (avgR + avgG + avgB) / 3;
  let depth: 'light' | 'medium' | 'deep' = 'medium';
  let depthConfidence = 0.5;

  if (brightness > 180) {
    depth = 'light';
    depthConfidence = Math.min(0.9, (brightness - 180) / 50);
  } else if (brightness < 100) {
    depth = 'deep';
    depthConfidence = Math.min(0.9, (100 - brightness) / 50);
  }

  const hex = rgbToHex(Math.round(avgR), Math.round(avgG), Math.round(avgB));
  const confidence = (undertoneConfidence + depthConfidence) / 2;

  return {
    undertone,
    depth,
    hex,
    confidence
  };
}

/**
 * Analyze eye color from face landmarks
 */
export function analyzeEyeColor(imageData: ImageData, faceLandmarks: any[]): EyeColorResult {
  // Simplified eye color detection - in a real app, you'd use more sophisticated ML
  const leftEye = { x: 0.4, y: 0.45, size: 0.06 };
  const rightEye = { x: 0.6, y: 0.45, size: 0.06 };
  
  const eyeSamples: number[][] = [];
  
  [leftEye, rightEye].forEach(eye => {
    const x = Math.floor(eye.x * imageData.width);
    const y = Math.floor(eye.y * imageData.height);
    const size = Math.floor(eye.size * Math.min(imageData.width, imageData.height));
    
    for (let dy = -size/2; dy < size/2; dy++) {
      for (let dx = -size/2; dx < size/2; dx++) {
        const px = Math.max(0, Math.min(imageData.width - 1, x + dx));
        const py = Math.max(0, Math.min(imageData.height - 1, y + dy));
        const idx = (py * imageData.width + px) * 4;
        
        const r = imageData.data[idx];
        const g = imageData.data[idx + 1];
        const b = imageData.data[idx + 2];
        const a = imageData.data[idx + 3];
        
        if (a > 128) {
          eyeSamples.push([r, g, b]);
        }
      }
    }
  });

  if (eyeSamples.length === 0) {
    return {
      primary: 'brown',
      hex: '#8B4513',
      confidence: 0.5
    };
  }

  const avgR = eyeSamples.reduce((sum, [r]) => sum + r, 0) / eyeSamples.length;
  const avgG = eyeSamples.reduce((sum, [_, g]) => sum + g, 0) / eyeSamples.length;
  const avgB = eyeSamples.reduce((sum, [_, __, b]) => sum + b, 0) / eyeSamples.length;

  // Simple eye color classification
  let primary = 'brown';
  let confidence = 0.7;

  if (avgB > avgR + 20 && avgB > avgG + 20) {
    primary = 'blue';
    confidence = 0.8;
  } else if (avgG > avgR + 15 && avgG > avgB + 15) {
    primary = 'green';
    confidence = 0.8;
  } else if (avgR > avgG + 20 && avgR > avgB + 20) {
    primary = 'hazel';
    confidence = 0.7;
  }

  const hex = rgbToHex(Math.round(avgR), Math.round(avgG), Math.round(avgB));

  return {
    primary,
    hex,
    confidence
  };
}

/**
 * Analyze hair color from face landmarks
 */
export function analyzeHairColor(imageData: ImageData, faceLandmarks: any[]): HairColorResult {
  // Sample hair region above forehead
  const hairRegion = { x: 0.5, y: 0.1, size: 0.15 };
  
  const hairSamples: number[][] = [];
  const x = Math.floor(hairRegion.x * imageData.width);
  const y = Math.floor(hairRegion.y * imageData.height);
  const size = Math.floor(hairRegion.size * Math.min(imageData.width, imageData.height));
  
  for (let dy = -size/2; dy < size/2; dy++) {
    for (let dx = -size/2; dx < size/2; dx++) {
      const px = Math.max(0, Math.min(imageData.width - 1, x + dx));
      const py = Math.max(0, Math.min(imageData.height - 1, y + dy));
      const idx = (py * imageData.width + px) * 4;
      
      const r = imageData.data[idx];
      const g = imageData.data[idx + 1];
      const b = imageData.data[idx + 2];
      const a = imageData.data[idx + 3];
      
      if (a > 128) {
        hairSamples.push([r, g, b]);
      }
    }
  }

  if (hairSamples.length === 0) {
    return {
      primary: 'brown',
      hex: '#8B4513',
      confidence: 0.5
    };
  }

  const avgR = hairSamples.reduce((sum, [r]) => sum + r, 0) / hairSamples.length;
  const avgG = hairSamples.reduce((sum, [_, g]) => sum + g, 0) / hairSamples.length;
  const avgB = hairSamples.reduce((sum, [_, __, b]) => sum + b, 0) / hairSamples.length;

  // Simple hair color classification
  let primary = 'brown';
  let confidence = 0.7;

  if (avgR + avgG + avgB < 100) {
    primary = 'black';
    confidence = 0.8;
  } else if (avgR + avgG + avgB > 200) {
    primary = 'blonde';
    confidence = 0.8;
  } else if (avgR > avgG + 20 && avgR > avgB + 20) {
    primary = 'red';
    confidence = 0.8;
  }

  const hex = rgbToHex(Math.round(avgR), Math.round(avgG), Math.round(avgB));

  return {
    primary,
    hex,
    confidence
  };
}

/**
 * Determine seasonal color palette based on comprehensive analysis
 */
export function determineSeasonalPalette(analysis: {
  skinTone: SkinToneResult;
  eyeColor: EyeColorResult;
  hairColor: HairColorResult;
}): 'Spring' | 'Summer' | 'Autumn' | 'Winter' {
  const { skinTone, eyeColor, hairColor } = analysis;
  
  // Spring: Warm undertones, light to medium depth, warm eye/hair colors
  if (skinTone.undertone === 'warm' && 
      (skinTone.depth === 'light' || skinTone.depth === 'medium') &&
      ['brown', 'hazel', 'green'].includes(eyeColor.primary) &&
      ['brown', 'red', 'blonde'].includes(hairColor.primary)) {
    return 'Spring';
  }
  
  // Summer: Cool undertones, light to medium depth, cool eye/hair colors
  if (skinTone.undertone === 'cool' && 
      (skinTone.depth === 'light' || skinTone.depth === 'medium') &&
      ['blue', 'green'].includes(eyeColor.primary) &&
      ['brown', 'blonde'].includes(hairColor.primary)) {
    return 'Summer';
  }
  
  // Autumn: Warm undertones, medium to deep depth, warm eye/hair colors
  if (skinTone.undertone === 'warm' && 
      (skinTone.depth === 'medium' || skinTone.depth === 'deep') &&
      ['brown', 'hazel'].includes(eyeColor.primary) &&
      ['brown', 'red', 'black'].includes(hairColor.primary)) {
    return 'Autumn';
  }
  
  // Winter: Cool undertones, medium to deep depth, high contrast
  if (skinTone.undertone === 'cool' && 
      (skinTone.depth === 'medium' || skinTone.depth === 'deep') &&
      ['brown', 'blue'].includes(eyeColor.primary) &&
      ['brown', 'black'].includes(hairColor.primary)) {
    return 'Winter';
  }
  
  // Fallback based on skin tone only
  if (skinTone.undertone === 'warm') {
    return skinTone.depth === 'light' ? 'Spring' : 'Autumn';
  } else {
    return skinTone.depth === 'light' ? 'Summer' : 'Winter';
  }
}

/**
 * Convert RGB values to hex color
 */
function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

/**
 * Main analysis function
 */
export function analyzeImageColors(imageData: ImageData, faceLandmarks: any[]): ColorAnalysis {
  const skinTone = analyzeSkinTone(imageData, faceLandmarks);
  const eyeColor = analyzeEyeColor(imageData, faceLandmarks);
  const hairColor = analyzeHairColor(imageData, faceLandmarks);
  
  const recommendedPalette = determineSeasonalPalette({
    skinTone,
    eyeColor,
    hairColor
  });
  
  const overallConfidence = (skinTone.confidence + eyeColor.confidence + hairColor.confidence) / 3;
  
  return {
    skinTone,
    eyeColor,
    hairColor,
    recommendedPalette,
    confidence: overallConfidence
  };
}
