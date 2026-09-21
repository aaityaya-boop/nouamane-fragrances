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
    },
  });

  const serializedOrders = orders.map((o) => ({
    ...o,
    createdAt: o.createdAt.toISOString(),
  }));

  // Fetch all recorded operational expenses & charges
  const expenses = await prisma.adminExpense.findMany({
    orderBy: { date: 'desc' },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
    },
  });

  const serializedExpenses = expenses.map((e) => ({
    ...e,
    date: e.date.toISOString(),
    createdAt: e.createdAt.toISOString(),
    updatedAt: e.updatedAt.toISOString(),
  }));

  // Fetch active team members with their salaries
  const employees = await prisma.adminUser.findMany({
    where: { status: 'ACTIVE' },
    select: {
      id: true,
      name: true,
      role: true,
      jobTitle: true,
      salary: true,
      salaryType: true,
    },
  });

  // Fetch visitors for conversion rate
  const visitors = await prisma.visitor.findMany({
    select: {
      id: true,
      createdAt: true,
    },
  });

  const serializedVisitors = visitors.map((v) => ({
    id: v.id,
    createdAt: v.createdAt.toISOString(),
  }));

  // Fetch product page views to calculate "Winning Products" conversion rate
  const productViews = await prisma.pageView.findMany({
    where: { pathname: { contains: '/product/' } },
    select: {
      pathname: true,
      createdAt: true,
    },
  });

  const viewsBySlug: Record<string, { total: number; dates: string[] }> = {};

  productViews.forEach((pv) => {
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
    },
  });

  return (
    <div className="p-6 md:p-10 max-w-[1600px] mx-auto text-neutral-900 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            Finance & CA Net
          </h1>
          <p className="text-[13px] text-neutral-500 mt-1">
            Suivi du chiffre d&apos;affaires brut, déduction des charges opérationnelles (Ads, Hébergement, Salaires) et calcul du CA Net réel en MAD.
          </p>
        </div>
      </div>

      <FinanceClient
        orders={serializedOrders}
        visitors={serializedVisitors}
        viewsBySlug={viewsBySlug}
        products={products as any}
        initialExpenses={serializedExpenses}
        employees={employees}
      />
    </div>
  );
}
