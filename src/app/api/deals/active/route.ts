import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const revalidate = 60; // cache for 1 minute

export async function GET() {
  try {
    const deals = await prisma.specialDeal.findMany({
      where: { isActive: true },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }]
    });

    const allProducts = await prisma.product.findMany({
      select: { id: true, gender: true, subcategory: true, subcategoryLabel: true, brandLabel: true, brandId: true }
    });

    const formatted = deals.map((d) => {
      let parsedCategories: string[] = [];
      let parsedProductIds: number[] = [];
      if (d.categories) {
        try {
          parsedCategories = JSON.parse(d.categories);
        } catch {}
      }
      if (d.productIds) {
        try {
          parsedProductIds = JSON.parse(d.productIds);
        } catch {}
      }

      if (d.applicableScope === 'CATEGORIES' && parsedCategories.length > 0) {
        parsedProductIds = allProducts.filter(p => {
          const pGender = (p.gender || '').toLowerCase();
          const pSub = (p.subcategory || '').toLowerCase();
          const pBrand = (p.brandLabel || '').toLowerCase();

          return parsedCategories.some(cat => {
            const c = cat.toLowerCase();
            if (c === 'men') return pGender === 'men' || pGender === 'homme';
            if (c === 'women') return pGender === 'women' || pGender === 'femme';
            if (c === 'unisex') return pGender === 'unisex' || pGender === 'unisexe';
            if (c === 'oriental') return pSub === 'arabic';
            if (c === 'testers' || c === 'testeurs' || c === 'originaux') return pSub !== 'arabic';
            if (c === 'coffrets') return pSub === 'coffrets';
            if (pBrand === c || pBrand.toLowerCase() === c) return true;
            return false;
          });
        }).map(p => p.id);
      }

      return {
        ...d,
        categories: parsedCategories,
        productIds: parsedProductIds,
      };
    });

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Error fetching active deals:', error);
    return NextResponse.json([], { status: 200 }); // Graceful fallback
  }
}
