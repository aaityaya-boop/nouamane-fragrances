import React from 'react';
import HomePageClient from './HomePageClient';
import prisma from '@/lib/prisma';
import { Product } from '@/lib/products';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const dbProducts = await prisma.product.findMany();
  let siteConfig = await prisma.siteConfig.findFirst();

  if (!siteConfig) {
    siteConfig = {
      id: 1,
      heroTitle: "L'Essence de l'Élégance",
      heroSubtitle: "Découvrez notre collection de parfums de luxe, conçue pour laisser une empreinte inoubliable.",
    } as any;
  }
  const products: Product[] = dbProducts.map((p) => ({
    ...p,
    brand: p.brandId as any,
    gender: p.gender as any,
    subcategory: p.subcategory as any,
    images: JSON.parse(p.images),
    notes: JSON.parse(p.notes),
    sizes: JSON.parse(p.sizes),
    tags: JSON.parse(p.tags) as any,
    bottleColor: p.bottleColor as any,
    bottleMaterial: p.bottleMaterial as any,
    perfectSeason: p.perfectSeason as any,
    originalPrice: p.originalPrice ?? undefined,
  }));

  return <HomePageClient products={products} config={siteConfig} />;
}
