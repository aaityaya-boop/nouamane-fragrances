import React from 'react';
import prisma from '@/lib/prisma';
import FinanceClient from './FinanceClient';

export const dynamic = 'force-dynamic';

export default async function FinancePage() {
  // Fetch all orders
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      orderNumber: true,
      customerName: true,
      customerEmail: true,
      shippingCity: true,
      total: true,
      status: true,
      createdAt: true,
      shippingCost: true,
      discount: true,
      items: true,
    }
  });

  const serializedOrders = orders.map(o => ({
    ...o,
    createdAt: o.createdAt.toISOString()
  }));

  // Fetch visitors for conversion rate
  const visitors = await prisma.visitor.findMany({
    select: {
      id: true,
      createdAt: true,
    }
  });

  const serializedVisitors = visitors.map(v => ({
    id: v.id,
    createdAt: v.createdAt.toISOString()
  }));

  // Fetch product page views to calculate "Winning Products" conversion rate
  const productViews = await prisma.pageView.findMany({
    where: { pathname: { contains: '/product/' } },
    select: {
      pathname: true,
      createdAt: true,
    }
  });

  // Aggregate views per product slug on the server to save bandwidth
  const viewsBySlug: Record<string, { total: number, dates: string[] }> = {};
  
  productViews.forEach(pv => {
    // Extract slug from pathname, e.g., "/fr/product/bleu-de-chanel" -> "bleu-de-chanel"
    const parts = pv.pathname.split('/product/');
    if (parts.length > 1) {
      const slug = parts[1].split('?')[0].split('#')[0];
      if (!viewsBySlug[slug]) {
        viewsBySlug[slug] = { total: 0, dates: [] };
      }
      viewsBySlug[slug].total += 1;
      viewsBySlug[slug].dates.push(pv.createdAt.toISOString());
    }
  });

  // Fetch products
  const products = await prisma.product.findMany({
    select: {
      id: true,
      slug: true,
      name: true,
      brandLabel: true,
      price: true,
      images: true,
      sku: true,
    }
  });

  // Fetch Ad Spend
  const adSpends = await prisma.adSpend.findMany({
    orderBy: { date: 'desc' }
  });

  const serializedAdSpends = adSpends.map(ad => ({
    id: ad.id,
    date: ad.date.toISOString(),
    platform: ad.platform,
    amount: ad.amount,
  }));

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-8 lg:p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-[#111] mb-2 tracking-tight">Master Dashboard</h1>
        <p className="text-[14px] text-[#666] font-medium">L'outil analytique ultime pour piloter votre rentabilité.</p>
      </div>

      <FinanceClient 
        orders={serializedOrders} 
        visitors={serializedVisitors}
        viewsBySlug={viewsBySlug}
        products={products as any}
        adSpends={serializedAdSpends}
      />
    </div>
  );
}
