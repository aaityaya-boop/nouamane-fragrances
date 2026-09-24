import React from 'react';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import AffiliateDetailClient from './AffiliateDetailClient';

export const dynamic = 'force-dynamic';

export default async function EditAffiliatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const affiliate = await prisma.affiliate.findUnique({
    where: { id },
    include: {
      orders: {
        orderBy: { createdAt: 'desc' },
      },
      leadsList: {
        orderBy: { createdAt: 'desc' },
      },
      clicks: {
        orderBy: { createdAt: 'desc' },
        take: 30,
      },
      payouts: {
        orderBy: { paidAt: 'desc' },
      },
    },
  });

  if (!affiliate) {
    notFound();
  }

  return <AffiliateDetailClient affiliate={affiliate} />;
}
