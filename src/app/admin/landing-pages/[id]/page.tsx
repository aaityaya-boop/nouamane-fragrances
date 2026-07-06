import React from 'react';
import prisma from '@/lib/prisma';
import LandingPageForm from './LandingPageForm';

export const dynamic = 'force-dynamic';

export default async function EditLandingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let initialData = null;

  if (id !== 'new') {
    initialData = await prisma.landingPage.findUnique({
      where: { id }
    });
  }

  return <LandingPageForm initialData={initialData} />;
}
