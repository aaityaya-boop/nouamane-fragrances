import React from 'react';
import prisma from '@/lib/prisma';
import { AlertCircle, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function SearchConsolePage() {
  const settings = await prisma.seoSettings.findFirst();

  if (!settings?.googleSearchConsoleConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
        <AlertCircle className="text-gray-400 mb-4" size={48} />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Google Search Console non connecté</h2>
        <p className="text-gray-500 mb-6">Connectez votre compte dans la page de vue d'ensemble (Overview) pour voir ces données.</p>
        <Link href="/admin/seo" className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">
          Retour à l'Overview
        </Link>
      </div>
    );
  }

  const twentyEightDaysAgo = new Date();
  twentyEightDaysAgo.setDate(twentyEightDaysAgo.getDate() - 28);

  const dailyData = await prisma.seoSearchConsoleDaily.findMany({
    where: { 
      country: { in: ['MA', 'MAR'] },
      date: { gte: twentyEightDaysAgo }
    },
    orderBy: { date: 'desc' },
    take: 28
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Google Search Console Data</h2>
          <p className="text-sm text-gray-500">
            Source: <span className="font-medium text-black">Google Search Console</span> | 
            Country: <span className="font-medium text-black">Morocco (MA)</span>
          </p>
        </div>
        <form action="/api/admin/seo/search-console/sync" method="POST">
          <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800">
            <RefreshCw size={14} /> Sync Now
          </button>
        </form>
      </div>

      {dailyData.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-12 flex flex-col items-center justify-center text-center border border-gray-100">
          <AlertCircle className="text-gray-400 mb-3" size={32} />
          <h3 className="text-gray-900 font-medium mb-1">No Data Available Yet</h3>
          <p className="text-gray-500 text-sm">Please click "Sync Now" to fetch the latest data for Morocco.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500">
              <tr>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Impressions</th>
                <th className="px-6 py-4 font-medium">Clicks</th>
                <th className="px-6 py-4 font-medium">CTR</th>
                <th className="px-6 py-4 font-medium">Position</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {dailyData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{new Date(item.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4">{item.impressions.toLocaleString()}</td>
                  <td className="px-6 py-4">{item.clicks.toLocaleString()}</td>
                  <td className="px-6 py-4">{(item.ctr * 100).toFixed(2)}%</td>
                  <td className="px-6 py-4">{item.position.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
