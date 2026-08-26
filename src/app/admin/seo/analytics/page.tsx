import React from 'react';
import prisma from '@/lib/prisma';
import { BarChart, AlertCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AnalyticsComparisonPage() {
  const gscData = await prisma.seoSearchConsoleDaily.findMany({
    orderBy: { date: 'desc' },
    take: 30
  });

  const ga4Data = await prisma.seoAnalyticsDaily.findMany({
    orderBy: { date: 'desc' },
    take: 30
  });

  // Group by date
  const combined = gscData.map(gsc => {
    const ga = ga4Data.find(g => g.date.toISOString().split('T')[0] === gsc.date.toISOString().split('T')[0]);
    return {
      date: gsc.date,
      clicks: gsc.clicks,
      sessions: ga?.organicSessions || 0,
      orders: ga?.orders || 0,
      revenue: ga?.revenue || 0
    };
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">GA4 vs GSC Comparison</h1>
        <p className="text-muted-foreground mt-2">Compare Google Search Console clicks against Google Analytics sessions.</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex items-start gap-3">
        <AlertCircle className="text-blue-500 shrink-0 mt-0.5" size={18} />
        <div className="text-sm text-blue-900">
          <p className="font-semibold mb-1">Why are these numbers different?</p>
          <p>
            <strong>GSC Clicks</strong> represent a user clicking a link in Google Search. 
            <strong> GA4 Sessions</strong> represent a user landing on the site and loading the tracking script. 
            Discrepancies are normal due to ad blockers, users leaving before the page loads, or users returning via bookmarks after an initial organic click.
          </p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 flex items-center gap-2">
          <BarChart size={18} className="text-gray-500" />
          <h3 className="font-semibold text-gray-900">30-Day Comparison</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-4 text-xs font-semibold text-gray-600 uppercase">Date</th>
                <th className="p-4 text-xs font-semibold text-gray-600 uppercase">GSC Clicks</th>
                <th className="p-4 text-xs font-semibold text-gray-600 uppercase">GA4 Sessions</th>
                <th className="p-4 text-xs font-semibold text-gray-600 uppercase">Difference</th>
                <th className="p-4 text-xs font-semibold text-gray-600 uppercase">Orders</th>
                <th className="p-4 text-xs font-semibold text-gray-600 uppercase">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {combined.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">No data available for comparison.</td>
                </tr>
              ) : (
                combined.map(day => {
                  const diff = day.sessions - day.clicks;
                  const diffPercent = day.clicks > 0 ? ((diff / day.clicks) * 100).toFixed(1) : 0;
                  
                  return (
                    <tr key={day.date.toString()} className="hover:bg-gray-50">
                      <td className="p-4 text-sm font-medium text-gray-900">{new Date(day.date).toLocaleDateString()}</td>
                      <td className="p-4 text-sm font-semibold text-blue-600">{day.clicks}</td>
                      <td className="p-4 text-sm font-semibold text-emerald-600">{day.sessions}</td>
                      <td className="p-4 text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${diff > 0 ? 'bg-green-100 text-green-700' : diff < 0 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'}`}>
                          {diff > 0 ? '+' : ''}{diffPercent}%
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-900">{day.orders}</td>
                      <td className="p-4 text-sm text-gray-900">{day.revenue.toLocaleString()} MAD</td>
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
