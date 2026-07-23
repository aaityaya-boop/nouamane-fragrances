import React from 'react';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import ProductClient from './ProductClient';
import { Product } from '@/lib/products';

import { Metadata } from 'next';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const decodedSlug = decodeURIComponent(resolvedParams.slug);
  const product = await prisma.product.findUnique({
    where: { slug: decodedSlug },
  });

  if (!product) {
    return { title: 'Produit introuvable - NAY Parfums' };
  }

  const images = JSON.parse(product.images);

  return {
    title: `${product.name} - ${product.brandLabel} | Acheter au Maroc (Casablanca, Rabat)`,
    description: `Achetez ${product.name} de ${product.brandLabel} au meilleur prix au Maroc. ${product.description || product.tagline} Livraison rapide partout au Maroc.`,
    keywords: [product.name, product.brandLabel, 'parfum', 'maroc', 'casablanca', 'acheter parfum', 'luxe', product.subcategoryLabel || ''],
    openGraph: {
      title: `${product.name} - ${product.brandLabel} | NAY Parfums Maroc`,
      description: `Découvrez ${product.name}. Livraison rapide partout au Maroc. ${product.tagline}`,
      images: images.length > 0 ? [{ url: images[0] }] : [],
    }
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const decodedSlug = decodeURIComponent(resolvedParams.slug);
  
  const standardProducts = await prisma.product.findMany({ where: { subcategory: { not: 'coffrets' } } });
  
  const dbProduct = await prisma.product.findUnique({
    where: { slug: decodedSlug },
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
    where: { productSlug: decodedSlug },
    orderBy: { createdAt: 'desc' }
  });

  const transformProduct = (p: any): Product => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    brand: p.brandId,
    brandLabel: p.brandLabel,
    gender: p.gender,
    subcategory: p.subcategory,
    subcategoryLabel: p.subcategoryLabel ?? '',
    tagline: p.tagline ?? '',
    price: p.price,
    originalPrice: p.originalPrice ?? undefined,
    description: p.description ?? '',
    longDescription: p.longDescription ?? '',
    images: JSON.parse(p.images || '[]'),
    notes: JSON.parse(p.notes || '{"top":[],"heart":[],"base":[]}'),
    ingredients: p.ingredients ?? '',
    sizes: JSON.parse(p.sizes || '[]'),
    bottleColor: p.bottleColor,
    bottleColorLabel: p.bottleColorLabel ?? '',
    bottleMaterial: p.bottleMaterial,
    bottleMaterialLabel: p.bottleMaterialLabel ?? '',
    rating: p.rating ?? 0,
    reviewCount: p.reviewCount ?? 0,
    releaseDate: p.releaseDate ?? '',
    tags: JSON.parse(p.tags || '[]'),
    inStock: p.inStock ?? true,
    perfectSeason: p.perfectSeason ?? 'Toutes Saisons',
    isTester: p.isTester ?? false,
  });

  // Serialize reviews — convert Date objects to ISO strings
  const serializedReviews = dbReviews.map((r: any) => ({
    ...r,
    createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt,
    updatedAt: r.updatedAt instanceof Date ? r.updatedAt.toISOString() : r.updatedAt,
  }));

  const transformedProduct = transformProduct(dbProduct);
  
  let includedProducts: Product[] = [];
  if (dbProduct.subcategory === 'coffrets') {
    const tags = typeof dbProduct.tags === 'string' ? JSON.parse(dbProduct.tags) : dbProduct.tags;
    includedProducts = (tags || []).map((slug: string) => {
      const p = standardProducts.find(sp => sp.slug === slug);
      if (p) {
        return transformProduct(p);
      }
      return null;
    }).filter(Boolean);
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: transformedProduct.name,
    image: transformedProduct.images[0],
    description: transformedProduct.description,
    brand: {
      '@type': 'Brand',
      name: transformedProduct.brandLabel,
    },
    offers: {
      '@type': 'Offer',
      url: `https://nayparfum.ma/fr/product/${transformedProduct.slug}`,
      priceCurrency: 'MAD',
      price: transformedProduct.price,
      itemCondition: 'https://schema.org/NewCondition',
      availability: transformedProduct.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'MA',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 14,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/ReturnFeesCustomerResponsibility'
      }
    },
    aggregateRating: transformedProduct.reviewCount > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: transformedProduct.rating.toFixed(1),
      reviewCount: transformedProduct.reviewCount,
    } : undefined,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProductClient 
        product={transformedProduct} 
        relatedProducts={dbRelated.map(transformProduct)} 
        initialReviews={serializedReviews}
        includedProducts={includedProducts}
      />
    </>
  );
}
