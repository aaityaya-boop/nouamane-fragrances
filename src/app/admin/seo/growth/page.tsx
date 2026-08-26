import React from 'react';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { Target, Lightbulb, Rocket, ListChecks, Database, TrendingUp } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function SeoGrowthCommandCenter() {
  const settings = await prisma.seoSettings.findFirst();
  const recentGSC = await prisma.seoSearchConsoleDaily.findFirst({ orderBy: { date: 'desc' } });
  
  // Deterministic Growth Score
  let growthScore = 0;
  if (settings?.googleSearchConsoleConnected) growthScore += 20;
  if (recentGSC) growthScore += 20;
  if (process.env.NEXT_PUBLIC_GTM_ID) growthScore += 10;
  if (process.env.NEXT_PUBLIC_GA4_ID) growthScore += 10;

  // Aggregate Metrics (Last 30 Days)
  const gscData = await prisma.seoSearchConsoleDaily.findMany({
    orderBy: { date: 'desc' },
    take: 30
  });
  
  const totalImpressions = gscData.reduce((acc, curr) => acc + curr.impressions, 0);
  const totalClicks = gscData.reduce((acc, curr) => acc + curr.clicks, 0);
  const avgCtr = gscData.length > 0 ? (totalClicks / totalImpressions * 100).toFixed(2) : 0;
  const avgPosition = gscData.length > 0 ? (gscData.reduce((acc, curr) => acc + curr.position, 0) / gscData.length).toFixed(1) : 0;

  const activeOpportunities = await prisma.seoOpportunity.count();
  const techIssues = await prisma.seoIssue.count();

  // Revenue Metrics
  const ga4Data = await prisma.seoAnalyticsDaily.findMany({
    orderBy: { date: 'desc' },
    take: 30
  });
  const organicOrders = ga4Data.reduce((acc, curr) => acc + curr.orders, 0);
  const organicRevenue = ga4Data.reduce((acc, curr) => acc + curr.revenue, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
          🇲🇦 NAY PARFUM
        </h1>
        <h2 className="text-xl text-gray-600 font-semibold uppercase tracking-wide mt-1">
          Morocco SEO Growth Command Center
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 shadow-sm flex flex-col justify-center">
          <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wider mb-1">SEO Growth Readiness</span>
          <div className="text-4xl font-bold text-indigo-900">{growthScore}/100</div>
          <Link href="/admin/seo/growth/data-quality" className="text-indigo-600 text-xs font-medium hover:underline mt-2">
            View Data Quality
          </Link>
        </div>
        
        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500">Organic Revenue</span>
            <span className="text-green-500 font-bold tracking-tight text-xs bg-green-50 px-2 py-1 rounded">30d</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{organicRevenue.toLocaleString()} MAD</div>
          <p className="text-xs text-gray-500 mt-1">{organicOrders} Orders</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500">Impressions (GSC)</span>
            <span className="text-blue-500 font-bold tracking-tight text-xs bg-blue-50 px-2 py-1 rounded">30d</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{totalImpressions.toLocaleString()}</div>
          <p className="text-xs text-gray-500 mt-1">Avg Pos: {avgPosition}</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500">Clicks (GSC)</span>
            <span className="text-emerald-500 font-bold tracking-tight text-xs bg-emerald-50 px-2 py-1 rounded">30d</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{totalClicks.toLocaleString()}</div>
          <p className="text-xs text-gray-500 mt-1">CTR: {avgCtr}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/admin/seo/growth/opportunities" className="block bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all group">
          <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <Target size={24} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Top 20 Opportunities</h3>
          <p className="text-sm text-gray-500 mb-4">Highest impact Quick Wins, Page 2 rankers, and Low CTR pages detected from real GSC data.</p>
          <div className="flex justify-between items-center text-sm font-medium">
            <span className="text-indigo-600">View Prioritized List &rarr;</span>
            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">{activeOpportunities} Total</span>
          </div>
        </Link>

        <Link href="/admin/seo/growth/roadmap" className="block bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:border-blue-300 hover:shadow-md transition-all group">
          <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <ListChecks size={24} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">30-Day Roadmap</h3>
          <p className="text-sm text-gray-500 mb-4">Automatically generated week-by-week execution plan based on opportunity scores and technical health.</p>
          <div className="flex justify-between items-center text-sm font-medium">
            <span className="text-blue-600">View Roadmap &rarr;</span>
          </div>
        </Link>

        <Link href="/admin/seo/growth/experiments" className="block bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all group">
          <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <Lightbulb size={24} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">SEO Experiments</h3>
          <p className="text-sm text-gray-500 mb-4">Track before/after performance for your title, meta, and content optimizations.</p>
          <div className="flex justify-between items-center text-sm font-medium">
            <span className="text-emerald-600">View Experiments &rarr;</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
