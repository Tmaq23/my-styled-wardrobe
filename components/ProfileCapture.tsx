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
	const [debugInfo, setDebugInfo] = useState<string>('');
	const bodyFileRef = useRef<HTMLInputElement>(null);
	const faceFileRef = useRef<HTMLInputElement>(null);

	// Fetch analysis count from database on mount
	useEffect(() => {
		fetchAnalysisCount();
	}, []);

	async function fetchAnalysisCount() {
		try {
			const response = await fetch('/api/user/analysis-count');
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
		setDebugInfo('');
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
		setDebugInfo('');
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
		setDebugInfo('');
		
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
			
			// Set debug information
			const debug = `AI Analysis Results:
Body Shape: ${result.bodyShape}
Color Palette: ${result.colorPalette}
Confidence: ${result.confidence}%
Analysis: ${result.analysis}`;
			
			setDebugInfo(debug);
			
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
			
			console.log('AI analysis complete:', result);
			
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

	return (
		<div className="card section compact-section profile-analysis">
			
		{/* Free analysis usage indicator */}
		{!loadingCount && analysisCount < analysisLimit && (
			<div style={{
				padding: '0.75rem 1rem',
				background: 'rgba(76, 175, 80, 0.15)',
				border: '1px solid rgba(76, 175, 80, 0.3)',
				borderRadius: '8px',
				marginBottom: '1.5rem',
				textAlign: 'center',
				fontSize: '0.9rem',
				color: 'rgba(255, 255, 255, 0.9)'
			}}>
				🎉 <strong>Free Trial:</strong> You have {analysisLimit - analysisCount} complimentary AI {analysisLimit - analysisCount === 1 ? 'analysis' : 'analyses'} available
			</div>
		)}
			
			<div className="pa-upload-block">
				<label style={{fontWeight: '600', marginBottom: '0.5rem', display: 'block'}}>1. Body Photo (in gym clothes)</label>
				<input 
					ref={bodyFileRef} 
					className="input mt-1" 
					type="file" 
					accept="image/*" 
					aria-label="Upload body picture in gym clothes"
					title="Upload body picture in gym clothes"
					onChange={onBodyFileChange}
				/>
				<div className="pa-hint">
					Upload a full-body photo in fitted gym clothes for accurate body shape analysis
				</div>
			</div>

			<div className="pa-upload-block" style={{marginTop: '1.5rem'}}>
				<label style={{fontWeight: '600', marginBottom: '0.5rem', display: 'block'}}>2. Face Photo (no makeup)</label>
				<input 
					ref={faceFileRef} 
					className="input mt-1" 
					type="file" 
					accept="image/*" 
					aria-label="Upload face picture without makeup"
					title="Upload face picture without makeup"
					onChange={onFaceFileChange}
				/>
				<div className="pa-hint">
					Upload a clear face photo without makeup for accurate colour palette analysis
				</div>
			</div>

			<div className="pa-tip" style={{marginTop: '1rem'}}>
				<span className="icon-inline small"><img src="/icons/bulb.svg" alt="Tip" width={18} height={18} /></span><strong>Tips:</strong> Use clear photos with good lighting. Body photo should show your full figure in fitted clothing. Face photo should be well-lit and makeup-free.
			</div>

			{(bodyPreview || facePreview) && (
				<div className="pa-preview">
					<label>Previews</label>
					<div style={{display: 'flex', gap: '1rem', flexWrap: 'wrap'}}>
						{bodyPreview && (
							<div className="pa-preview-frame">
								<img 
									src={bodyPreview} 
									alt="body preview" 
									className="pa-preview-img" 
									style={{maxWidth: '150px'}}
								/>
								<div style={{textAlign: 'center', fontSize: '0.875rem', marginTop: '0.5rem'}}>Body</div>
							</div>
						)}
						{facePreview && (
							<div className="pa-preview-frame">
								<img 
									src={facePreview} 
									alt="face preview" 
									className="pa-preview-img" 
									style={{maxWidth: '150px'}}
								/>
								<div style={{textAlign: 'center', fontSize: '0.875rem', marginTop: '0.5rem'}}>Face</div>
							</div>
						)}
					</div>
					{/* AI Analysed badge hidden after completion */}
				</div>
			)}

			<div className="pa-actions">
				<button 
					className="button pa-reanalyze" 
					disabled={!bodyFileRef.current?.files?.[0] || !faceFileRef.current?.files?.[0] || busy} 
					onClick={() => { 
						const bodyFile = bodyFileRef.current?.files?.[0]; 
						const faceFile = faceFileRef.current?.files?.[0]; 
						if (bodyFile && faceFile) analyzeWithAI(bodyFile, faceFile); 
					}}
				>
					{busy ? 'AI Analysing...' : 'Re-analyse with AI'}
				</button>
				
				{err && (
					<div className="status error pa-inline-alert">
						<span className="icon-inline small"><img src="/icons/x.svg" alt="Error" width={16} height={16} /></span>{err}
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
				
				{/* Upgrade prompt for users who have used their free analysis */}
				{showUpgradePrompt && (
					<div className="upgrade-prompt-inline" style={{
						marginTop: '1rem',
						padding: '1.5rem',
						background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
						border: '2px solid rgba(99, 102, 241, 0.3)',
						borderRadius: '12px',
						textAlign: 'center'
					}}>
						<div style={{fontSize: '1.5rem', marginBottom: '0.5rem'}}>🎁</div>
						<h3 style={{margin: '0 0 0.75rem 0', color: 'rgba(255, 255, 255, 0.95)', fontSize: '1.1rem'}}>
							Free Analysis Used
						</h3>
						<p style={{margin: '0 0 1rem 0', color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.95rem', lineHeight: '1.5'}}>
							You&apos;ve already used your complimentary AI body shape and colour palette analysis. 
							Upgrade to unlock unlimited AI analyses and premium features!
						</p>
						<div style={{display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap'}}>
							<a 
								href="/pricing" 
								style={{
									padding: '0.75rem 1.5rem',
									background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
									color: 'white',
									textDecoration: 'none',
									borderRadius: '8px',
									fontWeight: '600',
									fontSize: '0.95rem',
									transition: 'all 0.3s',
									display: 'inline-block'
								}}
								onMouseEnter={(e) => {
									e.currentTarget.style.transform = 'translateY(-2px)';
									e.currentTarget.style.boxShadow = '0 8px 20px rgba(99, 102, 241, 0.4)';
								}}
								onMouseLeave={(e) => {
									e.currentTarget.style.transform = 'translateY(0)';
									e.currentTarget.style.boxShadow = 'none';
								}}
							>
								View Pricing Plans
							</a>
							<button 
								onClick={() => setShowUpgradePrompt(false)}
								style={{
									padding: '0.75rem 1.5rem',
									background: 'rgba(255, 255, 255, 0.1)',
									color: 'rgba(255, 255, 255, 0.85)',
									border: '1px solid rgba(255, 255, 255, 0.3)',
									borderRadius: '8px',
									fontWeight: '600',
									fontSize: '0.95rem',
									cursor: 'pointer',
									transition: 'all 0.3s'
								}}
								onMouseEnter={(e) => {
									e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
								}}
								onMouseLeave={(e) => {
									e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
								}}
							>
								Maybe Later
							</button>
						</div>
						<div style={{marginTop: '1rem', fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.7)'}}>
							✨ Unlimited AI analyses • Priority support • Advanced styling features
						</div>
					</div>
				)}
				
				{/* AI analysis complete message hidden - results shown below */}
			</div>

				{analysisComplete && (
					<div className="pa-results">
					<div className="pa-results-heading">
						AI Analysis Results:
					</div>
						<div className="pa-summary">
						<span><strong>Palette:</strong> {palette}</span>
						<span><strong>Body Shape:</strong> {shape}</span>
					</div>
				</div>
			)}

				{/* Colour Palette & Body Shape Section */}
				<div className="pa-preferences">
					<h4 className="pa-subtitle">
					Based on this analysis, here is your colour palette and body shape details.
				</h4>
				
				{/* Palette and Body Shape Selection */}
					<div className="pa-options-grid">
					<div>
						<label>Colour Palette</label>
						<div className="pa-option-buttons">
							{(['Spring','Summer','Autumn','Winter'] as Palette[]).map(p => (
								<button 
									key={p} 
									onClick={() => onPalette(p)} 
									className={`button text-xs ${palette === p ? '' : 'secondary'}`}
								>
									{p}
								</button>
							))}
						</div>
						<div className="pa-swatches">
							<PaletteSwatches colors={defaultSwatches[palette] || defaultSwatches['Winter']} />
						</div>
					</div>

					<div>
						<label>Body Shape</label>
						<div className="pa-option-buttons">
								{['Hourglass','Triangle','Inverted Triangle','Rectangle','Round'].map((s) => (
									<button 
										key={s} 
										onClick={() => onShape(s as any)} 
										className={`button text-xs ${shape === s ? '' : 'secondary'}`}
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
