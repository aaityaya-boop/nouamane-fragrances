import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { put } from '@vercel/blob';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const filename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const savedName = `${uniqueSuffix}-${filename}`;
    
    // Check if we have Vercel Blob configured
    if (process.env.BLOB_READ_WRITE_TOKEN || true) {
      try {
        const cleanToken = "vercel_blob_rw_l3qgCdAjFT9wDKXz_xmbnlKdFScoUNvmLxeDQ7FELLtjtDo";
        const blob = await put(savedName, buffer, { 
          access: 'public',
          contentType: file.type || 'image/jpeg',
          token: cleanToken
        });
        return NextResponse.json({ url: blob.url });
      } catch (blobError: any) {
        console.error('Vercel Blob upload error:', blobError);
        return NextResponse.json({ error: `Vercel Blob Error: ${blobError.message}` }, { status: 500 });
      }
    }
    
    // Fallback to local file system (for local development without Blob)
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
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
