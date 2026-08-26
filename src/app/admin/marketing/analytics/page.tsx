import React from 'react';
import { BarChart3, TrendingUp, AlertCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function MarketingAnalyticsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Marketing Analytics</h1>
        <p className="text-muted-foreground mt-2">Measure campaign performance, open rates, and attributed revenue.</p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 shadow-sm flex items-start gap-3">
        <AlertCircle className="text-amber-600 mt-0.5" size={20} />
        <div>
          <h3 className="font-bold text-amber-900">NO_DATA</h3>
          <p className="text-sm text-amber-800 mt-1">
            Marketing Analytics requires an active email or WhatsApp provider connection to receive webhook events (Delivered, Opened, Clicked). Currently, all campaigns are in safe DRAFT mode.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 opacity-50 pointer-events-none">
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="text-sm font-medium text-gray-500 mb-2">Total Campaigns Sent</div>
          <div className="text-2xl font-bold text-gray-900">0</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="text-sm font-medium text-gray-500 mb-2">Average Open Rate</div>
          <div className="text-2xl font-bold text-gray-900">0%</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="text-sm font-medium text-gray-500 mb-2">Average Click Rate</div>
          <div className="text-2xl font-bold text-gray-900">0%</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="text-sm font-medium text-gray-500 mb-2 flex items-center justify-between">
            Campaign-Assisted Revenue
            <TrendingUp size={16} className="text-green-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">0 MAD</div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-12 text-center opacity-50 pointer-events-none shadow-sm">
        <BarChart3 className="mx-auto text-gray-300 mb-4" size={48} />
        <h3 className="font-bold text-gray-900 text-lg">Performance Timeline</h3>
        <p className="text-gray-500 mt-2 max-w-sm mx-auto">Once campaigns are sent, charts comparing Opens vs Clicks and Attributed Revenue will appear here.</p>
      </div>

    </div>
  );
}
