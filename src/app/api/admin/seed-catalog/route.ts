import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { PRODUCTS, BRANDS } from '@/lib/products';

export async function GET() {
  try {
    // 1. Seed Brands
    for (const brand of BRANDS) {
      await prisma.brand.upsert({
        where: { slug: brand.slug },
        update: {
          name: brand.label,
          label: brand.label,
          description: brand.description,
          image: brand.heroImage,
        },
        create: {
          slug: brand.slug,
          name: brand.label,
          label: brand.label,
          description: brand.description,
          image: brand.heroImage,
        }
      });
    }

    // 2. Seed Products
    for (const prod of PRODUCTS) {
      await prisma.product.upsert({
        where: { slug: prod.slug },
        update: {
          name: prod.name,
          brandId: prod.brand,
          brandLabel: prod.brandLabel,
          gender: prod.gender,
          subcategory: prod.subcategory,
          subcategoryLabel: prod.subcategoryLabel,
          tagline: prod.tagline,
          price: prod.price,
          originalPrice: prod.originalPrice || null,
          description: prod.description,
          longDescription: prod.longDescription,
          images: JSON.stringify(prod.images),
          notes: JSON.stringify(prod.notes),
          ingredients: prod.ingredients,
          sizes: JSON.stringify(prod.sizes),
          bottleColor: prod.bottleColor,
          bottleColorLabel: prod.bottleColorLabel,
          bottleMaterial: prod.bottleMaterial,
          bottleMaterialLabel: prod.bottleMaterialLabel,
          rating: prod.rating,
          reviewCount: prod.reviewCount,
          releaseDate: prod.releaseDate,
          tags: JSON.stringify(prod.tags),
          inStock: prod.inStock,
          perfectSeason: prod.perfectSeason
        },
        create: {
          slug: prod.slug,
          name: prod.name,
          brandId: prod.brand,
          brandLabel: prod.brandLabel,
          gender: prod.gender,
          subcategory: prod.subcategory,
          subcategoryLabel: prod.subcategoryLabel,
          tagline: prod.tagline,
          price: prod.price,
          originalPrice: prod.originalPrice || null,
          description: prod.description,
          longDescription: prod.longDescription,
          images: JSON.stringify(prod.images),
          notes: JSON.stringify(prod.notes),
          ingredients: prod.ingredients,
          sizes: JSON.stringify(prod.sizes),
          bottleColor: prod.bottleColor,
          bottleColorLabel: prod.bottleColorLabel,
          bottleMaterial: prod.bottleMaterial,
          bottleMaterialLabel: prod.bottleMaterialLabel,
          rating: prod.rating,
          reviewCount: prod.reviewCount,
          releaseDate: prod.releaseDate,
          tags: JSON.stringify(prod.tags),
          inStock: prod.inStock,
          perfectSeason: prod.perfectSeason
        }
      });
    }

    return NextResponse.json({ success: true, message: 'Catalog seeded successfully!' });
  } catch (error: any) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
