import React from 'react';
import prisma from '@/lib/prisma';
import { AlertCircle, Search } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function KeywordsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  
  const keywords = await prisma.seoKeyword.findMany({
    where: {
      country: { in: ['MA', 'MAR'] },
      ...(q ? { keyword: { contains: q, mode: 'insensitive' } } : {})
    },
    orderBy: { impressions: 'desc' },
    take: 50
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Morocco Keywords</h2>
          <p className="text-sm text-gray-500">Keyword performance in Google Morocco (Top 50).</p>
        </div>
        
        <form className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            name="q"
            defaultValue={q || ''}
            placeholder="Search keywords..." 
            className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-black"
          />
        </form>
      </div>

      {keywords.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-12 flex flex-col items-center justify-center text-center border border-gray-100">
          <AlertCircle className="text-gray-400 mb-3" size={32} />
          <h3 className="text-gray-900 font-medium mb-1">No keywords found</h3>
          <p className="text-gray-500 text-sm">Synchronize with Google Search Console or adjust your search.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500">
              <tr>
                <th className="px-6 py-4 font-medium">Keyword</th>
                <th className="px-6 py-4 font-medium">Language</th>
                <th className="px-6 py-4 font-medium">Intent</th>
                <th className="px-6 py-4 font-medium text-right">Impressions</th>
                <th className="px-6 py-4 font-medium text-right">Clicks</th>
                <th className="px-6 py-4 font-medium text-right">Position</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {keywords.map((kw) => (
                <tr key={kw.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{kw.keyword}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-medium bg-gray-100 text-gray-800">
                      {kw.language}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-medium ${
                      kw.searchIntent === 'TRANSACTIONAL' ? 'bg-emerald-100 text-emerald-800' :
                      kw.searchIntent === 'COMMERCIAL' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {kw.searchIntent}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-gray-900">{kw.impressions.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right text-gray-900">{kw.clicks.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right text-gray-900">{kw.currentPosition?.toFixed(1) || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
