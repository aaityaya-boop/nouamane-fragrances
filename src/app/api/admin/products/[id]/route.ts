import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Convert arrays/objects to JSON strings for SQLite
    const data: any = {};
    if (body.slug !== undefined) data.slug = body.slug;
    if (body.sku !== undefined) data.sku = body.sku || null;
    if (body.name !== undefined) data.name = body.name;
    if (body.brand !== undefined) data.brandId = body.brand;
    if (body.brandLabel !== undefined || body.brand !== undefined) data.brandLabel = body.brandLabel || body.brand;
    if (body.gender !== undefined) data.gender = body.gender;
    if (body.subcategory !== undefined) data.subcategory = body.subcategory;
    if (body.subcategoryLabel !== undefined || body.subcategory !== undefined) data.subcategoryLabel = body.subcategoryLabel || body.subcategory;
    if (body.tagline !== undefined) data.tagline = body.tagline || '';
    if (body.description !== undefined) data.description = body.description || '';
    if (body.longDescription !== undefined) data.longDescription = body.longDescription || '';
    if (body.ingredients !== undefined) data.ingredients = body.ingredients || '';
    if (body.bottleColor !== undefined) data.bottleColor = body.bottleColor || 'transparent';
    if (body.bottleColorLabel !== undefined) data.bottleColorLabel = body.bottleColorLabel || 'Transparent';
    if (body.bottleMaterial !== undefined) data.bottleMaterial = body.bottleMaterial || 'glass';
    if (body.bottleMaterialLabel !== undefined) data.bottleMaterialLabel = body.bottleMaterialLabel || 'Verre';
    if (body.perfectSeason !== undefined) data.perfectSeason = body.perfectSeason || 'Toutes Saisons';
    if (body.images !== undefined) data.images = JSON.stringify(body.images || []);
    if (body.notes !== undefined) data.notes = JSON.stringify(body.notes || { top: [], heart: [], base: [] });
    if (body.sizes !== undefined) data.sizes = JSON.stringify(body.sizes || []);
    if (body.tags !== undefined) data.tags = JSON.stringify(body.tags || []);
    if (body.price !== undefined) data.price = parseFloat(body.price);
    if (body.originalPrice !== undefined) data.originalPrice = body.originalPrice ? parseFloat(body.originalPrice) : null;
    if (body.testerPrice !== undefined) data.testerPrice = body.testerPrice ? parseFloat(body.testerPrice) : null;
    if (body.rating !== undefined) data.rating = parseFloat(body.rating || 5);
    if (body.reviewCount !== undefined) data.reviewCount = parseInt(body.reviewCount || 0, 10);
    if (body.releaseDate !== undefined) data.releaseDate = body.releaseDate || new Date().toISOString();
    if (body.inStock !== undefined) {
      data.inStock = body.inStock;
      if (body.inStock === false) {
        data.stock = 0;
      }
    }
    if (body.isTester !== undefined) data.isTester = body.isTester;


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
    const productId = parseInt(id, 10);
    
    // First, find the product to get its slug
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Delete associated reviews first to avoid foreign key constraint error
    await prisma.review.deleteMany({
      where: { productSlug: product.slug },
    });
    
    // Now delete the product
    await prisma.product.delete({
      where: { id: productId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
