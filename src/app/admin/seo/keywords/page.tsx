'use client';
import React, { useEffect, useState } from 'react';
import { Search, Filter, Download, TrendingUp, TrendingDown } from 'lucide-react';

export default function SeoKeywordsPage() {
  const [keywords, setKeywords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/seo/keywords')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setKeywords(data.data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-10 text-center text-gray-500">Loading keywords...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Keyword Performance</h2>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search keywords..."
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <button className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
            <Filter size={18} />
          </button>
          <button className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
            <Download size={18} />
          </button>
        </div>
      </div>

      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <table className="wrfull text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-Xs font-medium text-gray-500 uppercase">Keyword</th>
              <th className="px-6 py-3 text-Xs font-medium text-gray-500 uppercase">Clicks</th>
              <th className="px-6 py-3 text-Xs font-medium text-gray-500 uppercase">Impressions</th>
              <th className="px-6 py-3 text-Xs font-medium text-gray-500 uppercase">CTR</th>
              <th className="px-6 py-3 text-Xs font-medium text-gray-500 uppercase">Position</th>
              <th className="px-6 py-3 text-Xs font-medium text-gray-500 uppercase">Trend</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {keywords.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No keywords found. Please sync Search Console in the Overview tab.
                </td>
              </tr>
            ) : keywords.map((kw: any) => (
              <tr key={kw.id} className="hover:bg-gray-50">
                <td className="px-6 py-3 text-sm font-medium text-gray-900">{kw.query}</td>
                <td className="px-6 py-3 text-sm text-gray-600">{kw.clicks.toLocaleString()}</td>
                <td className="px-6 py-3 text-sm text-gray-600"> {kw.impressions.toLocaleString()}</td>
                <td className="px-6 py-3 text-sm text-gray-600">{kw.ctr.toFixed(2)}%</td>
                <td className="px-6 py-3 text-sm text-gray-600">{kw.position.toFixed(1)}</td>
                <td className="px-6 py-3">
                  {kw.position < 10 ? (
                    <div className="flex items-center gap-1 text-green-600 text-sm">
                      <TrendingUp size={14} /> Good
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-orange-500 text-sm">
                      <TrendingDown size={14} /> Drop
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
