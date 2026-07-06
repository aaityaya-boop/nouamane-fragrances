import React from 'react';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import PromoClient from './PromoClient';
import { PRODUCTS } from '@/lib/products';

export const dynamic = 'force-dynamic';

export default async function PromoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const landingPage = await prisma.landingPage.findUnique({
    where: { slug }
  });

  const cookieStore = await cookies();
  const isAdmin = cookieStore.has('admin_token');

  if (!landingPage || (landingPage.status !== 'active' && !isAdmin)) {
    notFound();
  }

  // Parse product slugs/objects
  let parsedItems: any[] = [];
  try {
    const parsed = JSON.parse(landingPage.productSlugs);
    parsedItems = parsed.map((item: any) => typeof item === 'string' ? { slug: item, promoPrice: null } : item);
  } catch (e) {
    parsedItems = [];
  }

  // Map to actual products and apply custom promo price if it exists
  const selectedProducts = PRODUCTS.filter(p => parsedItems.find(i => i.slug === p.slug)).map(p => {
    const item = parsedItems.find(i => i.slug === p.slug);
    if (item && item.promoPrice) {
      return { ...p, price: item.promoPrice, originalPrice: p.price };
    }
    return p;
  });
  
  // If none selected, fallback to 3 bestsellers
  const productsToDisplay = selectedProducts.length > 0 
    ? selectedProducts 
    : PRODUCTS.filter(p => p.tags.includes('bestseller')).slice(0, 3);

  return (
    <PromoClient 
      landingPage={landingPage} 
      products={productsToDisplay} 
    />
  );
}
