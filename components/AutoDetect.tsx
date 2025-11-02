'use client';

/**
 * Scaffold for auto-detecting body shape & sampling colors using MediaPipe in-browser.
 * This is OFF by default to keep MVP simple — wire it into page.tsx when ready.
 *
 * Docs:
 * - Pose Landmarker Web: https://ai.google.dev/edge/mediapipe/solutions/vision/pose_landmarker/web_js
 * - Face Landmarker / Face Detection: https://developers.google.com/ml-kit/vision/face-detection/
 */

import { useRef, useState } from 'react';
import type { BodyShape } from '../lib/bodyShape';

export default function AutoDetect({ onDetected }: { onDetected: (r: { shape?: BodyShape, paletteGuess?: string }) => void }) {
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function run() {
    setBusy(true);
    try {
      // TODO: Load MediaPipe tasks, run pose on the uploaded image,
      // compute shoulder/waist/hip widths from landmarks and classify.
      // For now we return a stub.
      onDetected({ shape: 'Rectangle', paletteGuess: 'Winter' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card section">
      <h3>Auto detect (beta)</h3>
      <input ref={inputRef} className="input" type="file" accept="image/*" />
      <button className="button" disabled={busy} onClick={run}>{busy? 'Analysing…':'Try detection'}</button>
    </div>
  );
}
