import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { Activity, AlertTriangle, ShieldCheck, Search, Link as LinkIcon, Database, ArrowRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function TechnicalSeoDashboard() {
  const audits = await prisma.seoAudit.findMany();
  const issues = await prisma.seoIssue.findMany({ where: { status: 'OPEN' } });

  const totalCrawled = audits.length;
  const indexable = audits.filter(a => a.isIndexable).length;
  const brokenLinks = issues.filter(i => i.type === 'BROKEN_LINK').length;
  const criticalIssues = issues.filter(i => i.severity === 'CRITICAL').length;
  const highIssues = issues.filter(i => i.severity === 'HIGH').length;
  const medIssues = issues.filter(i => i.severity === 'MEDIUM').length;

  // Calculate Health Score (Deterministic)
  // Base 100
  // -10 per Critical, -5 per High, -2 per Medium
  let healthScore = 100 - (criticalIssues * 10) - (highIssues * 5) - (medIssues * 2);
  healthScore = Math.max(0, Math.min(100, healthScore));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Technical SEO</h1>
        <p className="text-muted-foreground mt-2">Monitor crawlability, indexation, and technical health.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 flex flex-col justify-center">
          <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wider mb-1">Health Score</span>
          <div className="text-4xl font-bold text-indigo-900">{healthScore}<span className="text-xl text-indigo-500 font-medium">/100</span></div>
        </div>
        
        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500">Critical Issues</span>
            <AlertTriangle size={16} className="text-red-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{criticalIssues}</div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500">Crawled URLs</span>
            <Search size={16} className="text-blue-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{totalCrawled}</div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500">Indexable</span>
            <ShieldCheck size={16} className="text-emerald-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{indexable}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
             <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 flex items-center justify-between">
               <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                 <Activity size={18} className="text-gray-500" /> Top Technical Issues
               </h3>
               <Link href="/admin/seo/technical/issues" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1">
                 View All <ArrowRight size={14} />
               </Link>
             </div>
             <div className="p-0">
               {issues.length === 0 ? (
                 <div className="p-8 text-center text-gray-500">No open technical issues. Great job!</div>
               ) : (
                 <div className="divide-y divide-gray-100">
                   {issues.slice(0, 5).map(issue => (
                     <div key={issue.id} className="p-4 hover:bg-gray-50 flex justify-between items-center">
                       <div>
                         <div className="flex items-center gap-2 mb-1">
                           <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                             issue.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' : 
                             issue.severity === 'HIGH' ? 'bg-orange-100 text-orange-700' : 
                             'bg-amber-100 text-amber-700'
                           }`}>
                             {issue.severity}
                           </span>
                           <h4 className="font-semibold text-gray-900 text-sm">{issue.title}</h4>
                         </div>
                         <div className="text-xs text-gray-500 font-mono truncate max-w-md">{issue.url}</div>
                       </div>
                       <button className="text-xs border px-3 py-1.5 rounded bg-white hover:bg-gray-50">Fix</button>
                     </div>
                   ))}
                 </div>
               )}
             </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Database size={18} className="text-gray-400" /> Quick Actions
            </h3>
            <div className="space-y-3">
              <Link href="/admin/seo/technical/url-inspector" className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 group transition-colors">
                <div>
                  <div className="font-medium text-gray-900 text-sm group-hover:text-indigo-600 transition-colors">URL Inspector</div>
                  <div className="text-xs text-gray-500">Crawl and analyze a specific URL</div>
                </div>
                <Search size={16} className="text-gray-400 group-hover:text-indigo-600 transition-colors" />
              </Link>
              <Link href="/admin/seo/sitemap" className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 group transition-colors">
                <div>
                  <div className="font-medium text-gray-900 text-sm group-hover:text-indigo-600 transition-colors">Sitemap Engine</div>
                  <div className="text-xs text-gray-500">Validate and check XML sitemaps</div>
                </div>
                <LinkIcon size={16} className="text-gray-400 group-hover:text-indigo-600 transition-colors" />
              </Link>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Core Web Vitals</h3>
            <div className="p-4 bg-gray-50 border rounded-lg text-center">
              <p className="text-sm text-gray-500 font-medium">NO_DATA</p>
              <p className="text-xs text-gray-400 mt-1">PageSpeed API not connected</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
