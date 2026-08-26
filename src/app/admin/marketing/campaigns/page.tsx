import React from 'react';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { Mail, Plus, Settings } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function CampaignsPage() {
  const campaigns = await prisma.marketingCampaign.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Marketing Campaigns</h1>
          <p className="text-muted-foreground mt-2">Manage email and WhatsApp automation.</p>
        </div>
        <Link href="/admin/marketing/campaigns/new" className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors">
          <Plus size={18} /> New Campaign
        </Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-4 text-xs font-semibold text-gray-600 uppercase">Campaign Name</th>
                <th className="p-4 text-xs font-semibold text-gray-600 uppercase">Type / Channel</th>
                <th className="p-4 text-xs font-semibold text-gray-600 uppercase">Audience</th>
                <th className="p-4 text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="p-4 text-xs font-semibold text-gray-600 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {campaigns.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    <Mail className="mx-auto text-gray-300 mb-3" size={32} />
                    <p>No campaigns found.</p>
                  </td>
                </tr>
              ) : (
                campaigns.map(campaign => (
                  <tr key={campaign.id} className="hover:bg-gray-50">
                    <td className="p-4 font-medium text-gray-900">{campaign.name}</td>
                    <td className="p-4 text-sm text-gray-600">
                      <div>{campaign.type}</div>
                      <div className="text-xs text-gray-400">{campaign.channel}</div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">{campaign.audience}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        campaign.status === 'SENT' ? 'bg-green-100 text-green-800' :
                        campaign.status === 'DRAFT' ? 'bg-gray-100 text-gray-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {campaign.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-500">{new Date(campaign.createdAt).toLocaleDateString()}</td>
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
