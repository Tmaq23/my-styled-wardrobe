"use client";

import { useRef, useState, useEffect } from 'react';
import type { BodyShape } from '../lib/bodyShape';
import { PaletteSwatches } from './PaletteSwatches';

type Palette = 'Spring'|'Summer'|'Autumn'|'Winter';

const MAX_BODY_PHOTOS = 3;

const defaultSwatches: Record<Palette, string[]> = {
	Spring: ['#f7d6a1','#ffe9c9','#f6aa1c','#6cc551','#70c9e8','#f77aa1'],
	Summer: ['#e5d4ff','#c8d4f0','#a3c1d1','#90b4c1','#f3b0c3','#9abf8f'],
	Autumn: ['#f2c792','#e2a36b','#c27b48','#6c8a45','#8f5d3f','#3f5a5a'],
	Winter: ['#f2f2f2','#c9d6ff','#3a86ff','#8338ec','#ff006e','#0b0c0e'],
};

const paletteDescriptions: Record<Palette, string> = {
	Spring: 'Warm and bright — coral, peach, golden yellow and fresh greens',
	Summer: 'Cool and soft — rose pink, lavender, powder blue and muted tones',
	Autumn: 'Warm and rich — rust, olive, chocolate brown and spicy earth tones',
	Winter: 'Cool and bold — jewel tones, true red, royal blue, black and pure white',
};

export default function ProfileCapture({
	palette, shape,
	onPalette, onShape, onAiAnalysis
}: {
	palette: Palette;
	shape: BodyShape;
	onPalette: (p: Palette)=>void;
	onShape: (s: BodyShape)=>void;
	onAiAnalysis?: (analysis: any)=>void;
}) {
	const [busy, setBusy] = useState(false);
	const [bodyFiles, setBodyFiles] = useState<File[]>([]);
	const [bodyPreviews, setBodyPreviews] = useState<string[]>([]);
	const [facePreview, setFacePreview] = useState<string | null>(null);
	const [err, setErr] = useState<string | null>(null);
	const [analysisComplete, setAnalysisComplete] = useState(false);
	const [analysisCount, setAnalysisCount] = useState<number>(0);
	const [analysisLimit, setAnalysisLimit] = useState<number>(1);
	const [loadingCount, setLoadingCount] = useState(true);
	const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
	const [showManualSelection, setShowManualSelection] = useState(false);
	const bodyFileRef = useRef<HTMLInputElement>(null);
	const faceFileRef = useRef<HTMLInputElement>(null);

	// Fetch analysis count from database on mount
	useEffect(() => {
		fetchAnalysisCount();
	}, []);

	async function fetchAnalysisCount() {
		try {
			const response = await fetch('/api/user/analysis-count', { credentials: 'include', cache: 'no-store' });
			const data = await response.json();
			
			if (data.success) {
				setAnalysisCount(data.analysisCount);
				setAnalysisLimit(data.analysisLimit);
			}
		} catch (error) {
			console.error('Failed to fetch analysis count:', error);
		} finally {
			setLoadingCount(false);
		}
	}

	async function onBodyFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
		const selected = Array.from(e.target.files || []);
		if (!selected.length) return;

		const combined = [...bodyFiles, ...selected].slice(0, MAX_BODY_PHOTOS);
		setBodyFiles(combined);
		setBodyPreviews(combined.map(f => URL.createObjectURL(f)));
		setAnalysisComplete(false);
		setErr(null);

		// Allow re-selecting the same file later
		e.target.value = '';

		const faceFile = faceFileRef.current?.files?.[0];
		if (faceFile) {
			setTimeout(() => {
				analyzeWithAI(combined, faceFile);
			}, 100);
		}
	}

	function removeBodyPhoto(index: number) {
		const remaining = bodyFiles.filter((_, i) => i !== index);
		setBodyFiles(remaining);
		setBodyPreviews(remaining.map(f => URL.createObjectURL(f)));
		setAnalysisComplete(false);
	}

	async function onFaceFileChange(e: React.ChangeEvent<HTMLInputElement>) {
		const f = e.target.files?.[0];
		if (!f) return;
		
		setFacePreview(URL.createObjectURL(f));
		setAnalysisComplete(false);
		setErr(null);
		
		if (bodyFiles.length > 0) {
			setTimeout(() => {
				analyzeWithAI(bodyFiles, f);
			}, 100);
		}
	}

	async function analyzeWithAI(bodyPhotoFiles: File[], faceFile: File) {
		// Check if user has exceeded free analysis limit
		if (analysisCount >= analysisLimit) {
			setShowUpgradePrompt(true);
			return;
		}
		
		setBusy(true); 
		setErr(null);
		
		try {
			// Compress photos client-side so the request stays under
			// serverless body-size limits (large phone photos caused failures)
			const bodyImagesBase64 = await Promise.all(bodyPhotoFiles.map(f => fileToCompressedBase64(f)));
			const faceImageBase64 = await fileToCompressedBase64(faceFile);
			
			const response = await fetch('/api/analyze-body', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include',
				body: JSON.stringify({
					bodyImages: bodyImagesBase64,
					bodyImage: bodyImagesBase64[0],
					faceImage: faceImageBase64,
					bodyFilename: bodyPhotoFiles[0]?.name,
					faceFilename: faceFile.name
				})
			});

			if (!response.ok) {
				if (response.status === 413) {
					throw new Error('Your photos are too large to upload. Please try smaller photos.');
				}
				let serverError = '';
				try {
					const data = await response.json();
					serverError = data?.details || data?.error || '';
				} catch {}
				throw new Error(serverError || `Analysis failed: ${response.statusText}`);
			}

			const result = await response.json();
			
			// Update state with AI results
			onPalette(result.colorPalette);
			onShape(result.bodyShape);
			setAnalysisComplete(true);
			
			// Refresh analysis count from database
			await fetchAnalysisCount();
			
			// Notify parent component of AI analysis results
			if (onAiAnalysis) {
				onAiAnalysis(result);
			}
			
		} catch (e:any) {
			setErr(e.message || 'AI analysis failed');
		} finally {
			setBusy(false);
		}
	}

	// Downscale and re-encode a photo, then return raw base64 (no data: prefix).
	// Keeps uploads small enough for serverless request limits.
	function fileToCompressedBase64(file: File, maxDimension = 1280, quality = 0.82): Promise<string> {
		return new Promise((resolve, reject) => {
			const objectUrl = URL.createObjectURL(file);
			const img = new Image();

			img.onload = () => {
				URL.revokeObjectURL(objectUrl);
				try {
					const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
					const width = Math.max(1, Math.round(img.width * scale));
					const height = Math.max(1, Math.round(img.height * scale));

					const canvas = document.createElement('canvas');
					canvas.width = width;
					canvas.height = height;
					const ctx = canvas.getContext('2d');
					if (!ctx) {
						fileToBase64(file).then(resolve, reject);
						return;
					}
					ctx.drawImage(img, 0, 0, width, height);
					const dataUrl = canvas.toDataURL('image/jpeg', quality);
					const base64 = dataUrl.split(',')[1] || '';
					if (!base64) {
						fileToBase64(file).then(resolve, reject);
						return;
					}
					resolve(base64);
				} catch {
					fileToBase64(file).then(resolve, reject);
				}
			};

			img.onerror = () => {
				URL.revokeObjectURL(objectUrl);
				// Not a decodable image (e.g. HEIC in some browsers) — send as-is
				fileToBase64(file).then(resolve, reject);
			};

			img.src = objectUrl;
		});
	}

	// Helper function to convert file to base64
	function fileToBase64(file: File): Promise<string> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = () => {
				const base64 = reader.result as string | null;
				if (!base64) {
					reject(new Error('Failed to read file'));
					return;
				}
				const base64Data = base64.split(',')[1] || '';
				resolve(base64Data);
			};
			reader.onerror = error => reject(error);
		});
	}

	const bothUploaded = Boolean(bodyPreviews.length && facePreview);
	const manualVisible = showManualSelection || analysisComplete;

	return (
		<div className="profile-analysis">
			
			{/* Free analysis usage indicator */}
			{!loadingCount && analysisCount < analysisLimit && (
				<div className="pa-trial-banner">
					<strong>Free trial:</strong>&nbsp;you have {analysisLimit - analysisCount} complimentary AI {analysisLimit - analysisCount === 1 ? 'analysis' : 'analyses'} remaining
				</div>
			)}

			<p className="pa-intro">
				Upload your photos and our AI will identify your body shape and colour
				season, then tailor every recommendation to you. Add up to {MAX_BODY_PHOTOS} body
				photos from different angles for a more accurate result.
			</p>

			<div className="pa-upload-grid">
				<div className={`pa-upload-tile ${bodyPreviews.length ? 'has-file' : ''}`}>
					<label htmlFor="pa-body-input" className="pa-upload-label">
						{bodyPreviews.length ? (
							<span style={{ display: 'grid', gridTemplateColumns: bodyPreviews.length > 1 ? '1fr 1fr' : '1fr', gap: '0.4rem', width: '100%' }}>
								{bodyPreviews.map((src, i) => (
									<img key={i} src={src} alt={`Full-body photo ${i + 1} preview`} className="pa-upload-preview" style={{ maxHeight: bodyPreviews.length > 1 ? '130px' : undefined, objectFit: 'cover' }} />
								))}
							</span>
						) : (
							<span className="pa-upload-placeholder">
								<span className="pa-upload-icon" aria-hidden="true">
									<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 16V4m0 0-4 4m4-4 4 4"/><path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/></svg>
								</span>
								<span className="pa-upload-title">Full-body photos</span>
								<span className="pa-upload-sub">Fitted clothing, full figure visible — up to {MAX_BODY_PHOTOS} angles</span>
								<span className="pa-upload-cta">Choose photos</span>
							</span>
						)}
					</label>
					{bodyPreviews.length > 0 && (
						<span className="pa-upload-check">
							✓ {bodyPreviews.length} of {MAX_BODY_PHOTOS} body {bodyPreviews.length === 1 ? 'photo' : 'photos'} added
							{bodyPreviews.length < MAX_BODY_PHOTOS ? ' — click to add another angle' : ''}
						</span>
					)}
					{bodyPreviews.length > 0 && (
						<span style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '0.35rem' }}>
							{bodyPreviews.map((_, i) => (
								<button
									key={i}
									type="button"
									onClick={(e) => { e.preventDefault(); removeBodyPhoto(i); }}
									style={{ background: 'none', border: 'none', color: '#8a8378', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}
								>
									Remove photo {i + 1}
								</button>
							))}
						</span>
					)}
					<input 
						id="pa-body-input"
						ref={bodyFileRef} 
						type="file" 
						accept="image/*" 
						multiple
						aria-label="Upload full-body photos in fitted clothing (up to 3)"
						onChange={onBodyFilesChange}
						className="pa-upload-input"
					/>
				</div>

				<div className={`pa-upload-tile ${facePreview ? 'has-file' : ''}`}>
					<label htmlFor="pa-face-input" className="pa-upload-label">
						{facePreview ? (
							<img src={facePreview} alt="Face photo preview" className="pa-upload-preview" />
						) : (
							<span className="pa-upload-placeholder">
								<span className="pa-upload-icon" aria-hidden="true">
									<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6"/></svg>
								</span>
								<span className="pa-upload-title">Face photo</span>
								<span className="pa-upload-sub">Natural light, no makeup</span>
								<span className="pa-upload-cta">Choose photo</span>
							</span>
						)}
					</label>
					{facePreview && <span className="pa-upload-check">✓ Face photo added — click to replace</span>}
					<input 
						id="pa-face-input"
						ref={faceFileRef} 
						type="file" 
						accept="image/*" 
						aria-label="Upload face photo without makeup"
						onChange={onFaceFileChange}
						className="pa-upload-input"
					/>
				</div>
			</div>

			{/* Status area: guides the user through the flow */}
			{!bothUploaded && !busy && (
				<div className="pa-status">
					{bodyPreviews.length || facePreview
						? 'One more photo to go — the analysis starts automatically once both are added.'
						: 'Add both photos and the AI analysis will start automatically.'}
				</div>
			)}

			{busy && (
				<div className="pa-status pa-status-busy">
					<span className="pa-spinner" aria-hidden="true"></span>
					Analysing your photos… this takes a few seconds
				</div>
			)}

			{err && (
				<div className="pa-status pa-status-error">
					{err}
					<button 
						onClick={() => { 
							const faceFile = faceFileRef.current?.files?.[0]; 
							if (bodyFiles.length && faceFile) analyzeWithAI(bodyFiles, faceFile); 
						}}
						className="pa-retry-btn"
					>
						Retry
					</button>
				</div>
			)}

			{analysisComplete && !busy && (
				<div className="pa-status pa-status-success">
					✓ Analysis complete — you&apos;re a <strong>&nbsp;{shape}&nbsp;</strong> shape with a <strong>&nbsp;{palette}&nbsp;</strong> colour season
				</div>
			)}

			{/* Upgrade prompt for users who have used their free analysis */}
			{showUpgradePrompt && (
				<div className="pa-upgrade-prompt">
					<h3>Free analysis used</h3>
					<p>
						You&apos;ve already used your complimentary AI analysis.
						Upgrade to unlock unlimited analyses and premium features.
					</p>
					<div className="pa-upgrade-actions">
						<a href="/pricing" className="pa-upgrade-btn">View Pricing Plans</a>
						<button onClick={() => setShowUpgradePrompt(false)} className="pa-upgrade-dismiss">
							Maybe Later
						</button>
					</div>
				</div>
			)}

			{/* Colour Palette & Body Shape Section */}
			<div className="pa-preferences">
				{!manualVisible ? (
					<button
						type="button"
						onClick={() => setShowManualSelection(true)}
						style={{
							background: 'none',
							border: 'none',
							padding: 0,
							font: 'inherit',
							color: '#1c1a17',
							cursor: 'pointer',
							textDecoration: 'underline',
							fontSize: '1rem',
						}}
					>
						Already know your profile? Click here to select your colour season and body shape.
					</button>
				) : (
					<>
						<h4 className="pa-subtitle">
							{analysisComplete
								? 'The AI has selected these for you — adjust them if you know your profile better.'
								: 'Select your colour season and body shape below.'}
						</h4>
						
						<div className="pa-options-grid">
							<div>
								<label>Colour Season</label>
								<div className="pa-option-buttons">
									{(['Spring','Summer','Autumn','Winter'] as Palette[]).map(p => (
										<button 
											key={p} 
											onClick={() => onPalette(p)} 
											className={`preference-btn ${palette === p ? 'active' : ''}`}
										>
											{p}
										</button>
									))}
								</div>
								<div className="pa-swatches">
									<PaletteSwatches colors={defaultSwatches[palette] || defaultSwatches['Winter']} />
								</div>
								<p className="pa-palette-note">{paletteDescriptions[palette] || paletteDescriptions['Winter']}</p>
							</div>

							<div>
								<label>Body Shape</label>
								<div className="pa-option-buttons">
									{['Hourglass','Triangle','Inverted Triangle','Rectangle','Round'].map((s) => (
										<button 
											key={s} 
											onClick={() => onShape(s as any)} 
											className={`preference-btn ${shape === s ? 'active' : ''}`}
										>
											{s}
										</button>
									))}
								</div>
							</div>
						</div>
					</>
				)}
			</div>
		</div>
	);
}
