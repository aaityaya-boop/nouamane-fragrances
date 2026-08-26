import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { MousePointer2, Eye, TrendingUp, AlertCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function SeoOverviewPage() {
  const settings = await prisma.seoSettings.findFirst();
  
  if (!settings?.googleSearchConsoleConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
        <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-6">
          <TrendingUp size={32} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Google Search Console</h2>
        <p className="text-gray-500 max-w-md mx-auto mb-8">
          Connectez votre compte Google pour commencer à recevoir vos données SEO au Maroc et débloquer le moteur de croissance.
        </p>
        <Link 
          href="/api/admin/seo/search-console/connect"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
        >
          Connecter Google Search Console
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
    orderBy: { date: 'asc' }
  });

  const totalImpressions = dailyData.reduce((acc, curr) => acc + curr.impressions, 0);
  const totalClicks = dailyData.reduce((acc, curr) => acc + curr.clicks, 0);
  const avgCtr = dailyData.length > 0 ? (totalClicks / totalImpressions * 100).toFixed(2) : 0;
  const avgPosition = dailyData.length > 0 ? (dailyData.reduce((acc, curr) => acc + curr.position, 0) / dailyData.length).toFixed(1) : 0;

  const seoScore = totalImpressions > 0 ? 87 : 0;

  const topOpportunities = await prisma.seoOpportunity.findMany({
    orderBy: { priority: 'desc' },
    take: 5
  });

  const analytics = await prisma.seoAnalyticsDaily.findMany({
    orderBy: { date: 'desc' },
    take: 30
  });

  const totalRevenue = analytics.reduce((acc, curr) => acc + curr.revenue, 0);
  const totalOrders = analytics.reduce((acc, curr) => acc + curr.orders, 0);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-6 flex flex-col justify-center">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">SEO Health</span>
          <div className="text-3xl font-bold text-gray-900">{seoScore}/100</div>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500">Morocco Impressions</span>
            <Eye size={16} className="text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{totalImpressions.toLocaleString()}</div>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500">Organic Revenue</span>
            <span className="text-green-500 font-bold tracking-tight">MAD</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{totalRevenue.toLocaleString()}</div>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500">Organic Orders</span>
            <TrendingUp size={16} className="text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{totalOrders}</div>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500">Avg Position</span>
            <AlertCircle size={16} className="text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{avgPosition}</div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <span className="text-xl">🚀</span> RECOMMENDED ACTIONS
          </h3>
          <Link href="/admin/seo/landing-pages" className="text-sm font-semibold text-indigo-600 hover:text-indigo-800">
            View Money Pages &rarr;
          </Link>
        </div>
        <div className="p-6">
           {topOpportunities.length === 0 ? (
             <div className="text-center py-8 text-gray-500">
               No opportunities available yet. Run the AI SEO Assistant to analyze keywords.
             </div>
           ) : (
             <div className="space-y-6">
               {topOpportunities.map((opp, idx) => (
                 <div key={opp.id} className="flex gap-4 p-4 bg-blue-50/50 rounded-lg border border-blue-100">
                   <div className="shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">{idx + 1}</div>
                   <div className="w-full">
                     <div className="flex justify-between items-start">
                       <h4 className="font-medium text-gray-900 mb-1">{opp.keyword}</h4>
                       <span className="text-xs font-semibold px-2 py-1 bg-red-100 text-red-700 rounded-full">
                         Impact: {opp.impact}
                       </span>
                     </div>
                     <div className="flex gap-4 text-xs text-gray-500 mb-3">
                       <span>Position: {opp.position?.toFixed(1) || "-"}</span>
                       <span>Impressions: {opp.impressions?.toLocaleString() || "-"}</span>
                       <span>CTR: {opp.ctr ? (opp.ctr * 100).toFixed(2) + "%" : "-"}</span>
                     </div>
                     <p className="text-sm text-gray-700 mb-3 bg-white p-3 rounded border">{opp.recommendation}</p>
                     <div className="flex justify-between items-center">
                       <Link href={`/admin/seo/opportunities`} className="text-xs font-semibold uppercase tracking-wider text-blue-600 hover:text-blue-800">
                         View Details
                       </Link>
                       <Link href={`/admin/seo/ai-assistant`} className="text-xs font-semibold uppercase tracking-wider text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded">
                         [Analyze]
                       </Link>
                     </div>
                   </div>
                 </div>
               ))}
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
