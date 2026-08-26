import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { calculateTopicalAuthorityScore } from '@/lib/seo-ai/topical-authority';
import { Network, Search, FileText, ChevronRight, BarChart2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function TopicalAuthorityPage() {
  const topics = await prisma.seoTopic.findMany({
    orderBy: { createdAt: 'desc' }
  });

  const topicMetrics = [];
  for (const t of topics) {
    const scoreInfo = await calculateTopicalAuthorityScore(t.id);
    if (scoreInfo) {
      topicMetrics.push(scoreInfo);
    }
  }

  // Sort by score
  topicMetrics.sort((a, b) => b.score - a.score);

  const totalAuthority = topicMetrics.length > 0 
    ? Math.round(topicMetrics.reduce((acc, curr) => acc + curr.score, 0) / topicMetrics.length) 
    : 0;

  const totalGaps = topicMetrics.reduce((acc, curr) => acc + curr.topicGaps, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Topical Authority Engine</h1>
        <p className="text-muted-foreground mt-2">Data-driven content clusters and gaps for Morocco.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 flex flex-col justify-center">
          <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wider mb-1">Overall Authority</span>
          <div className="text-4xl font-bold text-indigo-900">{totalAuthority}<span className="text-xl text-indigo-500 font-medium">/100</span></div>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500">Tracked Topics</span>
            <Network size={16} className="text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{topics.length}</div>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500">Content Gaps</span>
            <FileText size={16} className="text-orange-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{totalGaps}</div>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500">Top 10 Keywords</span>
            <BarChart2 size={16} className="text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {topicMetrics.reduce((acc, curr) => acc + curr.top10Keywords, 0)}
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 flex justify-between items-center">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            Topic Clusters
          </h3>
          <form action="/api/admin/seo/ai/discover-topics" method="POST">
             <button type="submit" className="text-sm bg-white border px-3 py-1.5 rounded shadow-sm hover:bg-gray-50 font-medium flex items-center gap-2">
               <Search size={14} /> Discover Topics
             </button>
          </form>
        </div>
        
        {topicMetrics.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No topics discovered yet. Click "Discover Topics" to run the deterministic clustering engine.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {topicMetrics.map((tm) => (
              <div key={tm.topicId} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-lg font-bold text-gray-900">{tm.topicName}</h4>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${tm.score >= 75 ? 'bg-green-100 text-green-700' : tm.score >= 40 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                      Score: {tm.score}/100
                    </span>
                  </div>
                  <div className="flex gap-4 text-sm text-gray-500">
                    <span>Coverage: <strong>{tm.coverage}%</strong></span>
                    <span>Keywords: <strong>{tm.rankingKeywords}</strong></span>
                    <span>Top 10: <strong className="text-emerald-600">{tm.top10Keywords}</strong></span>
                    <span className="text-orange-600">Gaps: <strong>{tm.topicGaps}</strong></span>
                  </div>
                </div>
                
                <div className="shrink-0 flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-xs font-semibold text-gray-500 uppercase">Opportunity</div>
                    <div className={`font-bold ${tm.opportunity === 'HIGH' ? 'text-green-600' : tm.opportunity === 'MEDIUM' ? 'text-amber-600' : 'text-gray-400'}`}>
                      {tm.opportunity}
                    </div>
                  </div>
                  <Link 
                    href={`/admin/seo/topical-authority/${tm.topicId}`}
                    className="p-2 bg-white border rounded-lg hover:bg-gray-50 text-gray-600 shadow-sm"
                  >
                    <ChevronRight size={20} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
