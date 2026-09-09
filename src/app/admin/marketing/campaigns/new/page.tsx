import React from 'react';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import CampaignBuilderClient from './CampaignBuilderClient';

export const dynamic = 'force-dynamic';

export default async function NewCampaignPage({
  searchParams
}: {
  searchParams: Promise<{ audience?: string }>
}) {
  const sp = await searchParams;
  const initialAudience = sp?.audience || 'ALL';

  async function saveCampaignAction(formData: FormData) {
    'use server';
    const name = (formData.get('name') as string) || 'Campagne sans titre';
    const channel = (formData.get('channel') as string) || 'WHATSAPP';
    const type = (formData.get('type') as string) || 'PROMOTION';
    const audience = (formData.get('audience') as string) || 'ALL';
    const subject = (formData.get('subject') as string) || null;
    const message = (formData.get('message') as string) || '';

    await prisma.marketingCampaign.create({
      data: {
        name,
        channel,
        type,
        audience,
        subject,
        message,
        status: 'DRAFT'
      }
    });

    redirect('/admin/marketing/campaigns');
  }

  return (
    <CampaignBuilderClient 
      initialAudience={initialAudience} 
      saveCampaignAction={saveCampaignAction} 
    />
  );
}
