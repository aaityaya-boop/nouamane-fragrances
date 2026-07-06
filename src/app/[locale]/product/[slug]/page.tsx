import React from 'react';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import ProductClient from './ProductClient';
import { Product } from '@/lib/products';

export const dynamic = 'force-dynamic';

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  
  const dbProduct = await prisma.product.findUnique({
    where: { slug: resolvedParams.slug },
  });

  if (!dbProduct) {
    notFound();
  }

  // Get related products (same brand, excluding self)
  const dbRelated = await prisma.product.findMany({
    where: { 
      brandId: dbProduct.brandId,
      id: { not: dbProduct.id }
    },
    take: 4
  });

  // Get reviews
  const dbReviews = await prisma.review.findMany({
    where: { productSlug: resolvedParams.slug },
    orderBy: { createdAt: 'desc' }
  });

  const transformProduct = (p: any): Product => ({
    ...p,
    brand: p.brandId,
    gender: p.gender,
    subcategory: p.subcategory,
    images: JSON.parse(p.images),
    notes: JSON.parse(p.notes),
    sizes: JSON.parse(p.sizes),
    tags: JSON.parse(p.tags),
    bottleColor: p.bottleColor,
    bottleMaterial: p.bottleMaterial,
    perfectSeason: p.perfectSeason,
  });

  return (
    <ProductClient 
      product={transformProduct(dbProduct)} 
      relatedProducts={dbRelated.map(transformProduct)} 
      initialReviews={dbReviews}
    />
  );
}
