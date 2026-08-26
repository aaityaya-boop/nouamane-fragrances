import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { Map, RefreshCw, CheckCircle2, AlertTriangle, FileWarning } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function SitemapEnginePage() {
  const status = await prisma.seoSitemapStatus.findFirst();
  const issues = await prisma.seoIssue.findMany({ 
    where: { 
      type: { in: ['SITEMAP_MISSING', 'SITEMAP_ERROR', 'SITEMAP_URL_404', 'SITEMAP_URL_NOINDEX'] }
    }
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Sitemap Engine</h1>
        <p className="text-muted-foreground mt-2">Validate sitemap.xml consistency against the real database and crawl data.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Map className="text-blue-500" />
            <h3 className="font-semibold text-gray-900">Sitemap Health</h3>
          </div>
          {status ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-sm text-gray-500">Status</span>
                <span className={`text-xs font-bold px-2 py-1 rounded ${status.isValid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {status.isValid ? 'VALID' : 'INVALID'}
                </span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-sm text-gray-500">HTTP Status</span>
                <span className="text-sm font-medium text-gray-900">{status.httpStatus || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-sm text-gray-500">URLs Found</span>
                <span className="text-sm font-medium text-gray-900">{status.urlCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Last Checked</span>
                <span className="text-sm font-medium text-gray-900">
                  {status.lastCheckedAt ? new Date(status.lastCheckedAt).toLocaleDateString() : 'Never'}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No sitemap data found. Run a validation check.</p>
          )}

          <form action="/api/admin/seo/sitemap/check" method="POST" className="mt-6">
            <button className="w-full bg-white border border-gray-300 text-gray-700 font-semibold py-2 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2">
              <RefreshCw size={16} /> Validate Sitemap
            </button>
          </form>
        </div>

        <div className="md:col-span-2 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 flex items-center gap-2">
            <AlertTriangle size={18} className="text-orange-500" />
            <h3 className="font-semibold text-gray-900">Sitemap Inconsistencies</h3>
          </div>
          <div className="p-0">
            {issues.length === 0 ? (
              <div className="p-8 text-center text-gray-500 flex flex-col items-center">
                <CheckCircle2 size={32} className="text-emerald-500 mb-2" />
                <p>No sitemap inconsistencies detected.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {issues.map(issue => (
                  <div key={issue.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        issue.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {issue.severity}
                      </span>
                      <h4 className="font-semibold text-gray-900 text-sm">{issue.title}</h4>
                    </div>
                    <div className="text-xs text-gray-500 font-mono mb-2">{issue.url}</div>
                    <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded border">
                      <strong>Action:</strong> {issue.recommendation}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
