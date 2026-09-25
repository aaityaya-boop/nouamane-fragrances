import React from 'react';
import prisma from '@/lib/prisma';
import AdsManagerClient from './AdsManagerClient';

export const dynamic = 'force-dynamic';

export default async function AdminAdsPage() {
  const [integrations, campaigns, dailySpends, orders] = await Promise.all([
    prisma.adAccountIntegration.findMany({
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.adCampaign.findMany({
      orderBy: { totalSpend: 'desc' },
      include: {
        integration: {
          select: { accountName: true, status: true },
        },
      },
    }),
    prisma.adDailySpend.findMany({
      orderBy: { date: 'desc' },
      take: 60,
    }),
    prisma.order.findMany({
      where: {
        status: { in: ['completed', 'delivered', 'processing', 'confirmed', 'shipped'] },
      },
      select: {
        id: true,
        orderNumber: true,
        total: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  // Mask tokens
  const sanitizedIntegrations = integrations.map((item) => ({
    ...item,
    accessToken: item.accessToken ? `${item.accessToken.slice(0, 6)}...${item.accessToken.slice(-4)}` : null,
    refreshToken: item.refreshToken ? `${item.refreshToken.slice(0, 4)}...` : null,
  }));

  return (
    <AdsManagerClient
      initialIntegrations={sanitizedIntegrations as any}
      initialCampaigns={campaigns as any}
      initialDailySpends={dailySpends as any}
      orders={orders as any}
    />
  );
}
