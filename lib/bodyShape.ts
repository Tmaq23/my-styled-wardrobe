export type BodyShape = 'Hourglass'|'Triangle'|'Inverted Triangle'|'Rectangle'|'Round';

/**
 * Enhanced body shape classification from three widths (in pixels) measured across shoulders, waist, hips.
 * Uses improved ratios and thresholds for more accurate classification.
 */
export function classifyFromWidths(shoulders: number, waist: number, hips: number): BodyShape {
  let s = shoulders, w = waist, h = hips;
  
  // Validate inputs and add sanity checks
  if (!isFinite(s) || !isFinite(w) || !isFinite(h) || s <= 0 || h <= 0) {
    return 'Rectangle';
  }

  // Sanity check: waist should be reasonable compared to shoulders and hips
  const maxWidth = Math.max(s, h);
  const minWidth = Math.min(s, h);
  
  if (w > maxWidth * 1.3 || w < minWidth * 0.4) {
    console.warn('Unrealistic waist measurement detected, using proportional estimation');
    // Use proportional waist if measurements seem unrealistic
    w = (s + h) / 2 * 0.7;
  }

  // Calculate key ratios
  const shoulderToHipRatio = s / h;
  const waistToHipRatio = w / h;
  const waistToShoulderRatio = w / s;
  
  // Calculate relative differences
  const shoulderHipDiff = Math.abs(s - h) / Math.max(s, h);
  const waistNarrowness = Math.min(waistToHipRatio, waistToShoulderRatio);

  // Debug logging (can be removed in production)
  console.log('Body Shape Analysis:', {
    shoulders: s,
    waist: w,
    hips: h,
    shoulderToHipRatio: shoulderToHipRatio.toFixed(3),
    waistToHipRatio: waistToHipRatio.toFixed(3),
    waistToShoulderRatio: waistToShoulderRatio.toFixed(3),
    shoulderHipDiff: shoulderHipDiff.toFixed(3),
    waistNarrowness: waistNarrowness.toFixed(3)
  });

  // IMPROVED HOURGLASS DETECTION: More sensitive to waist definition
  // Hourglass: Significant waist definition with balanced shoulders/hips
  if (waistNarrowness <= 0.85 && shoulderHipDiff <= 0.25) {
    // Additional check: waist should be noticeably smaller than both shoulders and hips
    const waistDefinition = (w < s * 0.85) && (w < h * 0.85);
    if (waistDefinition) {
      return 'Hourglass';
    }
  }

  // Triangle (Pear): Hips significantly wider than shoulders
  if (shoulderToHipRatio <= 0.9 && waistToHipRatio >= 0.8) {
    return 'Triangle';
  }

  // Inverted Triangle: Shoulders significantly wider than hips AND waist not too defined
  if (shoulderToHipRatio >= 1.15) {
    // Check if waist is defined enough to be hourglass instead
    if (w < s * 0.85 && w < h * 0.85) {
      return 'Hourglass'; // Even with wide shoulders, defined waist = hourglass
    }
    return 'Inverted Triangle';
  }

  // Round: Waist is very close to shoulder/hip width (minimal definition)
  if (waistNarrowness >= 0.92) {
    return 'Round';
  }

  // Rectangle: Default case - balanced proportions with moderate waist definition
  return 'Rectangle';
}

/**
 * Alternative classification method using more sophisticated analysis
 */
export function classifyFromWidthsAdvanced(shoulders: number, waist: number, hips: number): BodyShape {
  let s = shoulders, w = waist, h = hips;
  
  if (!isFinite(s) || !isFinite(w) || !isFinite(h) || s <= 0 || h <= 0) {
    return 'Rectangle';
  }

  // Sanity check for waist measurements
  const maxWidth = Math.max(s, h);
  const minWidth = Math.min(s, h);
  
  if (w > maxWidth * 1.3 || w < minWidth * 0.4) {
    console.warn('Advanced: Unrealistic waist measurement detected, using proportional estimation');
    w = (s + h) / 2 * 0.7;
  }

  // Normalize measurements to percentages
  const total = s + w + h;
  const shoulderPct = (s / total) * 100;
  const waistPct = (w / total) * 100;
  const hipPct = (h / total) * 100;

  // Calculate shape indicators
  const shoulderDominance = shoulderPct - hipPct;
  const waistDefinition = Math.min(waistPct / shoulderPct, waistPct / hipPct);

  console.log('Advanced Analysis:', {
    shoulderPct: shoulderPct.toFixed(1),
    waistPct: waistPct.toFixed(1),
    hipPct: hipPct.toFixed(1),
    shoulderDominance: shoulderDominance.toFixed(1),
    waistDefinition: waistDefinition.toFixed(3)
  });

  // IMPROVED HOURGLASS DETECTION: More sensitive thresholds
  if (waistDefinition <= 0.78 && Math.abs(shoulderDominance) <= 8) {
    // Additional check: waist should be proportionally smaller
    const proportionalWaist = (waistPct < shoulderPct * 0.85) && (waistPct < hipPct * 0.85);
    if (proportionalWaist) {
      return 'Hourglass';
    }
  }
  
  if (shoulderDominance <= -6) {
    return 'Triangle';
  }
  
  if (shoulderDominance >= 8) {
    // Check if waist is defined enough to be hourglass instead
    if (waistPct < shoulderPct * 0.85 && waistPct < hipPct * 0.85) {
      return 'Hourglass'; // Even with wide shoulders, defined waist = hourglass
    }
    return 'Inverted Triangle';
  }
  
  if (waistDefinition >= 0.88) {
    return 'Round';
  }
  
  return 'Rectangle';
}

// Convenience wrapper; for MVP we keep manual selection default
export function detectBodyShape(): BodyShape {
  return 'Rectangle';
}
