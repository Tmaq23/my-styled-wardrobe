'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ExtractionResult {
  success: boolean;
  url: string;
  retailer: string;
  extractionSource: string;
  images: string[];
  title?: string;
  description?: string;
  totalImages: number;
  timestamp: string;
}

export default function ImageExtractionTester() {
  const [url, setUrl] = useState('');
  const [retailer, setRetailer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const retailers = [
    'ASOS',
    'Zara',
    'H&M', 
    'Next',
    'River Island',
    'M&S'
  ];

  // Color classes for source badge
  const getSourceColor = (source: string) => {
    const colors: Record<string,string> = {
      'json-ld': 'text-green-600 bg-green-100',
      'open-graph': 'text-blue-600 bg-blue-100',
      'meta-tags': 'text-purple-600 bg-purple-100',
      'javascript': 'text-orange-600 bg-orange-100',
      'img-elements': 'text-indigo-600 bg-indigo-100',
      'fallback': 'text-red-600 bg-red-100'
    };
    return colors[source] || 'text-gray-600 bg-gray-100';
  };

  const sourceIconPath = (source: string) => {
    const map: Record<string,string> = {
      'json-ld': '/icons/check.svg',
      'open-graph': '/icons/check.svg',
      'meta-tags': '/icons/check.svg',
      'javascript': '/icons/check.svg',
      'img-elements': '/icons/check.svg',
      'fallback': '/icons/warning.svg'
    };
    return map[source] || '/icons/warning.svg';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await fetch('/api/extract-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim(), retailer: retailer || undefined })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || 'Extraction failed');
      }
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Unexpected error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
          <Image src="/icons/rocket.svg" alt="Rocket" width={28} height={28} />
          Enhanced Image Extraction Tester
        </h1>
        <p className="text-gray-600">
          Test the robust multi-layered approach for extracting product images from retailer websites
        </p>
      </div>

      {/* Test Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Test Image Extraction</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
              Product Page URL *
            </label>
            <input
              type="url"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.asos.com/products/example"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label htmlFor="retailer" className="block text-sm font-medium text-gray-700 mb-2">
              Retailer (Optional - for optimization)
            </label>
            <select
              id="retailer"
              value={retailer}
              onChange={(e) => setRetailer(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Auto detect</option>
              {retailers.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <button
            type="submit"
            disabled={isLoading || !url.trim()}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Extracting Images...' : 'Extract Images'}
          </button>
        </form>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
                  <span className="text-red-400 inline-block w-4 h-4 align-middle"><Image src="/icons/x.svg" alt="Error" width={16} height={16} /></span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Extraction Failed</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      {/* Results Display */}
      {result && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Extraction Results</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Result Details */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Extraction Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Source:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1 ${getSourceColor(result.extractionSource)}`}>
                      <Image src={sourceIconPath(result.extractionSource)} alt={result.extractionSource} width={14} height={14} />
                      {result.extractionSource}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Retailer:</span>
                    <span className="font-medium">{result.retailer}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Images Found:</span>
                    <span className="font-medium">{result.totalImages}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Timestamp:</span>
                    <span className="text-xs text-gray-500">
                      {new Date(result.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {result.title && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Product Title</h4>
                  <p className="text-sm text-gray-600">{result.title}</p>
                </div>
              )}

              {result.description && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Description</h4>
                  <p className="text-sm text-gray-600">{result.description}</p>
                </div>
              )}
            </div>

            {/* Image Display */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Extracted Images</h3>
              <div className="space-y-3">
                {result.images.map((image, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Image {index + 1}
                      </span>
                      <a
                        href={image}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-xs inline-flex items-center gap-1"
                      >
                        <Image src="/icons/target.svg" alt="Open" width={14} height={14} /> Open
                      </a>
                    </div>
                    <Image
                      src={image}
                      alt={`Extracted image ${index + 1}`}
                      width={400}
                      height={300}
                      className="w-full h-48 object-cover rounded border border-gray-200"
                      unoptimized
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://via.placeholder.com/400x300/f0f0f0/999999?text=Image+Failed+to+Load';
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Information Panel */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-3">How It Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <h4 className="font-medium mb-2">Extraction Methods (in priority order):</h4>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Official retailer API</li>
              <li>Schema.org JSON-LD</li>
              <li>Open Graph meta tags</li>
              <li>Meta tag images</li>
              <li>JavaScript variables</li>
              <li>IMG elements</li>
              <li>Placeholder fallback</li>
            </ol>
          </div>
          <div>
            <h4 className="font-medium mb-2">Features:</h4>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Rate limiting & user agent rotation</li>
              <li>Retailer-specific optimizations</li>
              <li>Automatic fallback strategies</li>
              <li>Robust error handling</li>
              <li>Multiple image format support</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

