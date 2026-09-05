import OpenAI from 'openai';

let cachedClient: OpenAI | null = null;

export function hasValidOpenAiKey(): boolean {
  const apiKey = process.env['OPENAI_API_KEY'];
  return (
    !!apiKey &&
    !apiKey.includes('sk-local') &&
    !apiKey.includes('your-api-key') &&
    !apiKey.includes('placeholder') &&
    apiKey.length >= 20 &&
    apiKey.startsWith('sk-')
  );
}

/**
 * Lazily construct the OpenAI client. Instantiating at module scope throws
 * when the key is absent, which breaks `next build` page-data collection and
 * takes unrelated routes down with it.
 */
export function getOpenAIClient(): OpenAI {
  if (!cachedClient) {
    cachedClient = new OpenAI({ apiKey: process.env['OPENAI_API_KEY'] || 'missing-openai-api-key' });
  }
  return cachedClient;
}
