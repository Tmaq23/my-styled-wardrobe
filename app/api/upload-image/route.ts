import { NextRequest, NextResponse } from 'next/server';

import { verifyAdminAccess } from '@/lib/apiAuth';
import { uploadPublicImage } from '@/lib/storage';

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

export async function POST(req: NextRequest) {
  try {
    const access = await verifyAdminAccess(req);

    if (access.status === 'unauthenticated') {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    if (access.status === 'forbidden') {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get('image');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only images are allowed.' }, { status: 400 });
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: 'File too large. Maximum size is 5MB.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_').slice(-80);
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`;

    const result = await uploadPublicImage({
      buffer,
      contentType: file.type === 'image/jpg' ? 'image/jpeg' : file.type,
      filename,
    });

    return NextResponse.json({
      success: true,
      url: result.url,
      filename,
      storage: result.storage,
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    const message = error instanceof Error ? error.message : 'Failed to upload image';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
