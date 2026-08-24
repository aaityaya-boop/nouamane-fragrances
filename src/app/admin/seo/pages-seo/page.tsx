'use client';
import React, { useEffect, useState } from 'react';
import { Search, Filter, ExternalLink, AlertTriangle, CheckCircle } from 'lucide-react';

export default function PagesSeoPage() {
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/seo/pages')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setPages(data.data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-10 text-center text-gray-500">Loading pages...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Pages SEO Optimization</h2>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search URLs..."
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <button className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
            <Filter size={18} />
          </button>
        </div>
      </div>

      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">URL</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Clicks</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Impressions</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">CTR</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Position</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {pages.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  No pages found. Please sync Search Console.
                </td>
              </tr>
            ) : pages.map((page: any) => (
              <tr key={page.id} className="hover:bg-gray-50">
                <td className="px-6 py-3 text-sm font-medium text-gray-900 max-w-sm truncate">
                  <a href={`https://nayparfum.ma${page.url}`} target="_blank" rel="noreferrer" className="hover:underline">
                    {page.url}
                  </a>
                </td>
                <td className="px-6 py-3 text-sm text-gray-600">{page.clicks}</td>
                <td className="px-6 py-3 text-sm text-gray-600">{page.impressions}</td>
                <td className="px-6 py-3 text-sm text-gray-600">{(page.ctr * 100).toFixed(2)}%</td>
                <td className="px-6 py-3 text-sm text-gray-600">{page.position.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
