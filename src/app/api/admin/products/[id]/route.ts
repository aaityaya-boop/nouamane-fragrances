import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Convert arrays/objects to JSON strings for SQLite
    const data = {
      slug: body.slug,
      name: body.name,
      brandId: body.brand,
      brandLabel: body.brandLabel || body.brand,
      gender: body.gender,
      subcategory: body.subcategory,
      subcategoryLabel: body.subcategoryLabel || body.subcategory,
      tagline: body.tagline || '',
      description: body.description || '',
      longDescription: body.longDescription || '',
      ingredients: body.ingredients || '',
      bottleColor: body.bottleColor || 'transparent',
      bottleColorLabel: body.bottleColorLabel || 'Transparent',
      bottleMaterial: body.bottleMaterial || 'glass',
      bottleMaterialLabel: body.bottleMaterialLabel || 'Verre',
      perfectSeason: body.perfectSeason || 'Toutes Saisons',
      images: JSON.stringify(body.images || []),
      notes: JSON.stringify(body.notes || { top: [], heart: [], base: [] }),
      sizes: JSON.stringify(body.sizes || []),
      tags: JSON.stringify(body.tags || []),
      price: parseFloat(body.price),
      originalPrice: body.originalPrice ? parseFloat(body.originalPrice) : null,
      rating: parseFloat(body.rating || 5),
      reviewCount: parseInt(body.reviewCount || 0, 10),
      releaseDate: body.releaseDate || new Date().toISOString(),
      inStock: body.inStock !== undefined ? body.inStock : true,
    };

    const updatedProduct = await prisma.product.update({
      where: { id: parseInt(id, 10) },
      data,
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    await prisma.product.delete({
      where: { id: parseInt(id, 10) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
