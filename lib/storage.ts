import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const DEFAULT_BUCKET = 'blog-images';
const INLINE_FALLBACK_MAX_BYTES = 1.5 * 1024 * 1024;

let cachedClient: SupabaseClient | null | undefined;
const ensuredBuckets = new Set<string>();

export function getStorageBucketName(): string {
  return process.env['SUPABASE_STORAGE_BUCKET'] || DEFAULT_BUCKET;
}

/**
 * Service-role Supabase client for server-side storage operations.
 * Returns null when Supabase is not configured so callers can fall back.
 */
export function getSupabaseAdminClient(): SupabaseClient | null {
  if (cachedClient !== undefined) {
    return cachedClient;
  }

  const url = process.env['NEXT_PUBLIC_SUPABASE_URL'] || process.env['SUPABASE_URL'];
  const serviceKey = process.env['SUPABASE_SERVICE_ROLE_KEY'];

  if (!url || !serviceKey) {
    cachedClient = null;
    return null;
  }

  cachedClient = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return cachedClient;
}

async function ensurePublicBucket(client: SupabaseClient, bucket: string): Promise<void> {
  if (ensuredBuckets.has(bucket)) return;

  const { error } = await client.storage.createBucket(bucket, {
    public: true,
    fileSizeLimit: '5MB',
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  });

  // "already exists" is the expected steady state; anything else is a real failure.
  if (error && !/exists|duplicate/i.test(error.message)) {
    throw new Error(`Failed to prepare storage bucket "${bucket}": ${error.message}`);
  }

  ensuredBuckets.add(bucket);
}

export interface UploadImageOptions {
  buffer: Buffer;
  contentType: string;
  filename: string;
  folder?: string;
}

export interface UploadImageResult {
  url: string;
  storage: 'supabase' | 'inline';
  path?: string;
}

/**
 * Persist an image somewhere that survives serverless cold starts.
 * Prefers Supabase Storage; falls back to an inline data URL for small files
 * so admins can still publish when storage is not configured.
 */
export async function uploadPublicImage(options: UploadImageOptions): Promise<UploadImageResult> {
  const { buffer, contentType, filename, folder = 'blog' } = options;
  const client = getSupabaseAdminClient();

  if (client) {
    const bucket = getStorageBucketName();
    await ensurePublicBucket(client, bucket);

    const path = `${folder}/${filename}`;
    const { error } = await client.storage.from(bucket).upload(path, buffer, {
      contentType,
      cacheControl: '31536000',
      upsert: false,
    });

    if (error) {
      throw new Error(`Failed to upload image to storage: ${error.message}`);
    }

    const { data } = client.storage.from(bucket).getPublicUrl(path);
    return { url: data.publicUrl, storage: 'supabase', path };
  }

  if (buffer.byteLength > INLINE_FALLBACK_MAX_BYTES) {
    throw new Error(
      'Image storage is not configured (set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY). ' +
        'Without it, uploads must be under 1.5MB or provided as an external image URL.'
    );
  }

  return {
    url: `data:${contentType};base64,${buffer.toString('base64')}`,
    storage: 'inline',
  };
}
