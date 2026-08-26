import React from 'react';
import prisma from '@/lib/prisma';
import { AlertTriangle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function TechnicalIssuesPage() {
  const issues = await prisma.seoIssue.findMany({
    orderBy: [
      { severity: 'asc' }, // We actually want CRITICAL first. Wait, string sort might not be right.
      { createdAt: 'desc' }
    ]
  });

  // Sort by severity manually
  const severityRank: any = { 'CRITICAL': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3 };
  issues.sort((a, b) => severityRank[a.severity] - severityRank[b.severity]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Technical Issues Log</h1>
        <p className="text-muted-foreground mt-2">Detailed view of all detected SEO issues.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-4 text-xs font-semibold text-gray-600 uppercase">Severity</th>
                <th className="p-4 text-xs font-semibold text-gray-600 uppercase">Issue</th>
                <th className="p-4 text-xs font-semibold text-gray-600 uppercase">URL</th>
                <th className="p-4 text-xs font-semibold text-gray-600 uppercase">Recommendation</th>
                <th className="p-4 text-xs font-semibold text-gray-600 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {issues.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">No issues found.</td>
                </tr>
              ) : (
                issues.map(issue => (
                  <tr key={issue.id} className="hover:bg-gray-50">
                    <td className="p-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                         issue.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' : 
                         issue.severity === 'HIGH' ? 'bg-orange-100 text-orange-700' : 
                         issue.severity === 'MEDIUM' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'
                       }`}>
                         {issue.severity}
                       </span>
                    </td>
                    <td className="p-4 font-medium text-gray-900 text-sm">{issue.title}</td>
                    <td className="p-4 text-xs font-mono text-gray-500 max-w-[250px] truncate" title={issue.url}>
                      {issue.url}
                    </td>
                    <td className="p-4 text-sm text-gray-600 max-w-xs">{issue.recommendation}</td>
                    <td className="p-4">
                       <span className="text-xs font-semibold px-2 py-1 rounded bg-gray-100 text-gray-700">{issue.status}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
