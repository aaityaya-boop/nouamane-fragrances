import React from 'react';
import prisma from '@/lib/prisma';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DataQualityCenterPage() {
  const settings = await prisma.seoSettings.findFirst();
  const recentGSC = await prisma.seoSearchConsoleDaily.findFirst({ orderBy: { date: 'desc' } });
  
  const daysSinceGsc = recentGSC ? Math.floor((new Date().getTime() - recentGSC.date.getTime()) / (1000 * 3600 * 24)) : null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Data Quality Center</h1>
        <p className="text-muted-foreground mt-2">Validate the health of data pipelines feeding the SEO Growth Engine.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
          <h3 className="font-semibold text-gray-900">Pipeline Validations</h3>
        </div>
        <div className="p-0">
          <table className="w-full text-left">
            <tbody className="divide-y divide-gray-100">
              
              <tr className="hover:bg-gray-50">
                <td className="p-4 w-12">
                  {settings?.googleSearchConsoleConnected ? <CheckCircle2 className="text-green-500" /> : <XCircle className="text-red-500" />}
                </td>
                <td className="p-4">
                  <p className="font-medium text-gray-900">Google Search Console Integration</p>
                  <p className="text-xs text-gray-500">OAuth connectivity to production GSC property.</p>
                </td>
                <td className="p-4 text-right">
                  {settings?.googleSearchConsoleConnected ? (
                    <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded">PASS</span>
                  ) : (
                    <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded">NOT_CONFIGURED</span>
                  )}
                </td>
              </tr>

              <tr className="hover:bg-gray-50">
                <td className="p-4 w-12">
                  {daysSinceGsc !== null && daysSinceGsc < 3 ? <CheckCircle2 className="text-green-500" /> : <AlertTriangle className="text-amber-500" />}
                </td>
                <td className="p-4">
                  <p className="font-medium text-gray-900">GSC Data Freshness</p>
                  <p className="text-xs text-gray-500">Recent synchronization within the last 3 days.</p>
                </td>
                <td className="p-4 text-right">
                  {daysSinceGsc !== null && daysSinceGsc < 3 ? (
                    <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded">PASS</span>
                  ) : (
                    <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded">WARNING (Stale Data)</span>
                  )}
                </td>
              </tr>

              <tr className="hover:bg-gray-50">
                <td className="p-4 w-12">
                  {process.env.NEXT_PUBLIC_GTM_ID ? <CheckCircle2 className="text-green-500" /> : <AlertTriangle className="text-amber-500" />}
                </td>
                <td className="p-4">
                  <p className="font-medium text-gray-900">Google Tag Manager</p>
                  <p className="text-xs text-gray-500">NEXT_PUBLIC_GTM_ID environment variable.</p>
                </td>
                <td className="p-4 text-right">
                  {process.env.NEXT_PUBLIC_GTM_ID ? (
                    <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded">PASS</span>
                  ) : (
                    <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded">WARNING</span>
                  )}
                </td>
              </tr>

              <tr className="hover:bg-gray-50">
                <td className="p-4 w-12">
                  {process.env.NEXT_PUBLIC_GA4_ID ? <CheckCircle2 className="text-green-500" /> : <AlertTriangle className="text-amber-500" />}
                </td>
                <td className="p-4">
                  <p className="font-medium text-gray-900">Google Analytics 4</p>
                  <p className="text-xs text-gray-500">NEXT_PUBLIC_GA4_ID environment variable.</p>
                </td>
                <td className="p-4 text-right">
                  {process.env.NEXT_PUBLIC_GA4_ID ? (
                    <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded">PASS</span>
                  ) : (
                    <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded">WARNING</span>
                  )}
                </td>
              </tr>

            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
