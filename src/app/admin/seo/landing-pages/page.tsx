import React from 'react';
import prisma from '@/lib/prisma';
import { Target, TrendingUp, AlertTriangle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function LandingPagesPerformance() {
  const landingPages = await prisma.seoLandingPagePerformance.findMany({
    orderBy: { revenue: 'desc' }
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Landing Page Performance</h1>
        <p className="text-muted-foreground mt-2">Discover high-converting money pages and conversion gaps.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-4 text-xs font-semibold text-gray-600 uppercase">Landing Page URL</th>
                <th className="p-4 text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="p-4 text-xs font-semibold text-gray-600 uppercase">Sessions</th>
                <th className="p-4 text-xs font-semibold text-gray-600 uppercase">Orders</th>
                <th className="p-4 text-xs font-semibold text-gray-600 uppercase">Conversion</th>
                <th className="p-4 text-xs font-semibold text-gray-600 uppercase">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {landingPages.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    <p className="font-medium text-gray-900">NO_DATA</p>
                    <p className="text-sm mt-1">Landing page tracking events not yet aggregated.</p>
                  </td>
                </tr>
              ) : (
                landingPages.map(page => {
                  const isMoneyPage = page.organicSessions > 100 && page.conversionRate >= 2.0;
                  const isConversionGap = page.organicSessions > 500 && page.conversionRate < 0.5;
                  const isScaleOpp = page.organicSessions < 100 && page.conversionRate > 3.0;

                  return (
                    <tr key={page.id} className="hover:bg-gray-50">
                      <td className="p-4 text-sm font-medium text-indigo-600 max-w-xs truncate" title={page.url}>
                        {page.url}
                      </td>
                      <td className="p-4">
                        {isMoneyPage && (
                          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-green-100 text-green-700 w-max">
                            <TrendingUp size={12}/> SEO Money Page
                          </span>
                        )}
                        {isConversionGap && (
                          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-red-100 text-red-700 w-max">
                            <AlertTriangle size={12}/> Conversion Gap
                          </span>
                        )}
                        {isScaleOpp && (
                          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-blue-100 text-blue-700 w-max">
                            <Target size={12}/> Scale Opp
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-sm text-gray-600">{page.organicSessions}</td>
                      <td className="p-4 text-sm font-medium text-gray-900">{page.orders}</td>
                      <td className="p-4 text-sm text-gray-600">{page.conversionRate.toFixed(2)}%</td>
                      <td className="p-4 text-sm font-bold text-gray-900">{page.revenue.toLocaleString()} MAD</td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
