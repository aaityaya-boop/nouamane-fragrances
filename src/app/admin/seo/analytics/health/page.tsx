import React from 'react';
import prisma from '@/lib/prisma';
import { ShieldCheck, AlertTriangle, Activity } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function TrackingHealthDashboard() {
  const events = await prisma.seoConversionEvent.findMany({
    orderBy: { createdAt: 'desc' },
    take: 1000
  });

  const hasPageView = events.some(e => e.eventType === 'page_view');
  const hasViewItem = events.some(e => e.eventType === 'view_item');
  const hasAddToCart = events.some(e => e.eventType === 'add_to_cart');
  const hasPurchase = events.some(e => e.eventType === 'purchase');

  const purchases = events.filter(e => e.eventType === 'purchase');
  const duplicatePurchases = purchases.filter((e, idx, self) => 
    self.findIndex(t => t.transactionId === e.transactionId) !== idx
  ).length;

  const purchasesWithoutId = purchases.filter(e => !e.transactionId).length;
  const purchasesWithoutRevenue = purchases.filter(e => !e.revenue).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Tracking Diagnostics</h1>
        <p className="text-muted-foreground mt-2">Monitor dataLayer health, GA4 event firing, and ecommerce integrity.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'page_view', active: hasPageView },
          { label: 'view_item', active: hasViewItem },
          { label: 'add_to_cart', active: hasAddToCart },
          { label: 'purchase', active: hasPurchase },
        ].map(event => (
          <div key={event.label} className={`p-4 border rounded-xl flex items-center gap-3 ${event.active ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            {event.active ? <ShieldCheck className="text-green-500" /> : <AlertTriangle className="text-red-500" />}
            <div>
              <div className="text-sm font-semibold text-gray-900">{event.label}</div>
              <div className={`text-xs ${event.active ? 'text-green-700' : 'text-red-700'}`}>
                {event.active ? 'Event Firing' : 'Missing/Not Detected'}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 flex items-center gap-2">
          <Activity size={18} className="text-gray-500" />
          <h3 className="font-semibold text-gray-900">Purchase Integrity Checks</h3>
        </div>
        <div className="divide-y divide-gray-100">
          <div className="p-4 flex justify-between items-center hover:bg-gray-50">
            <span className="text-sm font-medium text-gray-700">Duplicate Purchases</span>
            {duplicatePurchases > 0 ? (
              <span className="text-xs font-bold px-2 py-1 bg-red-100 text-red-700 rounded uppercase">Failed ({duplicatePurchases})</span>
            ) : (
              <span className="text-xs font-bold px-2 py-1 bg-green-100 text-green-700 rounded uppercase">Pass</span>
            )}
          </div>
          <div className="p-4 flex justify-between items-center hover:bg-gray-50">
            <span className="text-sm font-medium text-gray-700">Missing Transaction IDs</span>
            {purchasesWithoutId > 0 ? (
              <span className="text-xs font-bold px-2 py-1 bg-red-100 text-red-700 rounded uppercase">Failed ({purchasesWithoutId})</span>
            ) : (
              <span className="text-xs font-bold px-2 py-1 bg-green-100 text-green-700 rounded uppercase">Pass</span>
            )}
          </div>
          <div className="p-4 flex justify-between items-center hover:bg-gray-50">
            <span className="text-sm font-medium text-gray-700">Missing Revenue / Currency</span>
            {purchasesWithoutRevenue > 0 ? (
              <span className="text-xs font-bold px-2 py-1 bg-red-100 text-red-700 rounded uppercase">Failed ({purchasesWithoutRevenue})</span>
            ) : (
              <span className="text-xs font-bold px-2 py-1 bg-green-100 text-green-700 rounded uppercase">Pass</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
