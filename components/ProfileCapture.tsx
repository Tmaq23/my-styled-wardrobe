"use client";

import { useRef, useState, useEffect } from 'react';
import type { BodyShape } from '../lib/bodyShape';
import { PaletteSwatches } from './PaletteSwatches';

type Palette = 'Spring'|'Summer'|'Autumn'|'Winter';

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
	const [bodyPreview, setBodyPreview] = useState<string | null>(null);
	const [facePreview, setFacePreview] = useState<string | null>(null);
	const [err, setErr] = useState<string | null>(null);
	const [analysisComplete, setAnalysisComplete] = useState(false);
	const [analysisCount, setAnalysisCount] = useState<number>(0);
	const [analysisLimit, setAnalysisLimit] = useState<number>(1);
	const [loadingCount, setLoadingCount] = useState(true);
	const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
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

	async function onBodyFileChange(e: React.ChangeEvent<HTMLInputElement>) {
		const f = e.target.files?.[0];
		if (!f) return;
		
		setBodyPreview(URL.createObjectURL(f));
		setAnalysisComplete(false);
		setErr(null);
		
		// Check if both images are uploaded before analyzing
		const faceFile = faceFileRef.current?.files?.[0];
		if (faceFile) {
			setTimeout(() => {
				analyzeWithAI(f, faceFile);
			}, 100);
		}
	}

	async function onFaceFileChange(e: React.ChangeEvent<HTMLInputElement>) {
		const f = e.target.files?.[0];
		if (!f) return;
		
		setFacePreview(URL.createObjectURL(f));
		setAnalysisComplete(false);
		setErr(null);
		
		// Check if both images are uploaded before analyzing
		const bodyFile = bodyFileRef.current?.files?.[0];
		if (bodyFile) {
			setTimeout(() => {
				analyzeWithAI(bodyFile, f);
			}, 100);
		}
	}

	async function analyzeWithAI(bodyFile: File, faceFile: File) {
		// Check if user has exceeded free analysis limit
		if (analysisCount >= analysisLimit) {
			setShowUpgradePrompt(true);
			return;
		}
		
		setBusy(true); 
		setErr(null);
		
		try {
			// Convert both images to base64 for API
			const bodyImageBase64 = await fileToBase64(bodyFile);
			const faceImageBase64 = await fileToBase64(faceFile);
			
			// Call our AI analysis API with both images
			const response = await fetch('/api/analyze-body', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					bodyImage: bodyImageBase64,
					faceImage: faceImageBase64,
					bodyFilename: bodyFile.name,
					faceFilename: faceFile.name
				})
			});

			if (!response.ok) {
				throw new Error(`Analysis failed: ${response.statusText}`);
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

	const bothUploaded = Boolean(bodyPreview && facePreview);

	return (
		<div className="profile-analysis">
			
			{/* Free analysis usage indicator */}
			{!loadingCount && analysisCount < analysisLimit && (
				<div className="pa-trial-banner">
					<strong>Free trial:</strong>&nbsp;you have {analysisLimit - analysisCount} complimentary AI {analysisLimit - analysisCount === 1 ? 'analysis' : 'analyses'} remaining
				</div>
			)}

			<p className="pa-intro">
				Upload two photos and our AI will identify your body shape and colour
				season, then tailor every recommendation to you.
			</p>

			<div className="pa-upload-grid">
				<div className={`pa-upload-tile ${bodyPreview ? 'has-file' : ''}`}>
					<label htmlFor="pa-body-input" className="pa-upload-label">
						{bodyPreview ? (
							<img src={bodyPreview} alt="Full-body photo preview" className="pa-upload-preview" />
						) : (
							<span className="pa-upload-placeholder">
								<span className="pa-upload-icon" aria-hidden="true">
									<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 16V4m0 0-4 4m4-4 4 4"/><path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/></svg>
								</span>
								<span className="pa-upload-title">Full-body photo</span>
								<span className="pa-upload-sub">Fitted clothing, full figure visible</span>
								<span className="pa-upload-cta">Choose photo</span>
							</span>
						)}
					</label>
					{bodyPreview && <span className="pa-upload-check">✓ Full-body photo added — click to replace</span>}
					<input 
						id="pa-body-input"
						ref={bodyFileRef} 
						type="file" 
						accept="image/*" 
						aria-label="Upload full-body photo in fitted clothing"
						onChange={onBodyFileChange}
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
					{bodyPreview || facePreview
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
							const bodyFile = bodyFileRef.current?.files?.[0]; 
							const faceFile = faceFileRef.current?.files?.[0]; 
							if (bodyFile && faceFile) analyzeWithAI(bodyFile, faceFile); 
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
				<h4 className="pa-subtitle">
					{analysisComplete
						? 'The AI has selected these for you — adjust them if you know your profile better.'
						: 'Already know your profile? Select your colour season and body shape manually below.'}
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
			</div>
		</div>
	);
}
