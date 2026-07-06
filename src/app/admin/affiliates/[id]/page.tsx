import React from 'react';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import AffiliateForm from './AffiliateForm';

export const dynamic = 'force-dynamic';

export default async function EditAffiliatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const affiliate = await prisma.affiliate.findUnique({
    where: { id }
  });

  if (!affiliate) {
    notFound();
  }

  return <AffiliateForm initialData={affiliate} />;
}
