import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { put } from '@vercel/blob';
import { getCurrentAmbassador } from '@/lib/affiliate-auth';

export async function POST(request: Request) {
  try {
    const ambassador = await getCurrentAmbassador();
    if (!ambassador) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const filename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const savedName = `ambassador-${uniqueSuffix}-${filename}`;

    // 1. Try Vercel Blob upload if token exists
    const token = process.env.BLOB_READ_WRITE_TOKEN || "vercel_blob_rw_l3qgCdAjFT9wDKXz_xmbnlKdFScoUNvmLxeDQ7FELLtjtDo";
    if (token) {
      try {
        const blob = await put(savedName, buffer, {
          access: 'public',
          contentType: file.type || 'application/octet-stream',
          token: token,
        });
        return NextResponse.json({ url: blob.url });
      } catch (blobError: any) {
        console.warn('Vercel Blob failed, falling back to local storage:', blobError?.message);
      }
    }

    // 2. Fallback to local storage in /public/uploads
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true });
    }

    const filepath = path.join(uploadDir, savedName);
    await fs.writeFile(filepath, buffer);

    return NextResponse.json({ url: `/uploads/${savedName}` });
  } catch (error) {
    console.error('Ambassador upload error:', error);
    return NextResponse.json({ error: 'Échec de l\'upload du fichier' }, { status: 500 });
  }
}
