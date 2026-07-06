import React from 'react';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import InvoiceClient from './InvoiceClient';

export default async function InvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  const order = await prisma.order.findUnique({
    where: { orderNumber: id },
  });

  if (!order) {
    notFound();
  }

  return <InvoiceClient order={order} />;
}
