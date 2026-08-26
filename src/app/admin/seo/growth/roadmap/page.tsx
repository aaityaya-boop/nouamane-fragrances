import React from 'react';
import prisma from '@/lib/prisma';
import { CalendarDays, CheckCircle2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function SeoRoadmapPage() {
  const opportunities = await prisma.seoOpportunity.findMany({
    orderBy: { businessValue: 'desc' },
    take: 10
  });

  // Simple automated chunking for roadmap
  const week1 = opportunities.slice(0, 3);
  const week2 = opportunities.slice(3, 6);
  const week3 = opportunities.slice(6, 9);
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">30-Day SEO Roadmap</h1>
        <p className="text-muted-foreground mt-2">Auto-generated sprint plan prioritizing highest-impact opportunities.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* WEEK 1 */}
        <div className="bg-white border-2 border-indigo-200 rounded-xl p-6 shadow-sm relative">
          <div className="absolute top-0 right-0 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">CURRENT SPRINT</div>
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
            <CalendarDays size={20} className="text-indigo-600" /> Week 1
          </h3>
          <ul className="space-y-4">
            {week1.length === 0 ? (
              <li className="text-sm text-gray-500">No tasks assigned.</li>
            ) : (
              week1.map(opp => (
                <li key={opp.id} className="flex items-start gap-3">
                  <CheckCircle2 size={16} className="text-gray-300 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{opp.title}</p>
                    <p className="text-xs text-gray-500 line-clamp-1">{opp.targetUrl || 'Site-wide'}</p>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* WEEK 2 */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm opacity-90">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
            <CalendarDays size={20} className="text-gray-400" /> Week 2
          </h3>
          <ul className="space-y-4">
            {week2.length === 0 ? (
              <li className="text-sm text-gray-500">No tasks assigned.</li>
            ) : (
              week2.map(opp => (
                <li key={opp.id} className="flex items-start gap-3">
                  <div className="w-4 h-4 rounded-full border-2 border-gray-300 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{opp.title}</p>
                    <p className="text-xs text-gray-500 line-clamp-1">{opp.targetUrl || 'Site-wide'}</p>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* WEEK 3 */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm opacity-75">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
            <CalendarDays size={20} className="text-gray-400" /> Week 3
          </h3>
          <ul className="space-y-4">
            {week3.length === 0 ? (
              <li className="text-sm text-gray-500">No tasks assigned.</li>
            ) : (
              week3.map(opp => (
                <li key={opp.id} className="flex items-start gap-3">
                  <div className="w-4 h-4 rounded-full border-2 border-gray-300 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{opp.title}</p>
                    <p className="text-xs text-gray-500 line-clamp-1">{opp.targetUrl || 'Site-wide'}</p>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>

      </div>
    </div>
  );
}
