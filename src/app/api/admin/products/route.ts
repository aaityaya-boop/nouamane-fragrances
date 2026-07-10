import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Convert arrays/objects to JSON strings for SQLite
    const data = {
      slug: body.slug,
      sku: body.sku || null,
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
      testerPrice: body.testerPrice ? parseFloat(body.testerPrice) : null,
      rating: parseFloat(body.rating || 5),
      reviewCount: parseInt(body.reviewCount || 0, 10),
      releaseDate: new Date().toISOString(),
      inStock: body.inStock !== undefined ? body.inStock : true,
      isTester: body.isTester !== undefined ? body.isTester : false,
    };

    const newProduct = await prisma.product.create({
      data,
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
