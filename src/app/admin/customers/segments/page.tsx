import React from 'react';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { PieChart, ArrowRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function CustomerSegmentsPage() {
  const allCustomers = await prisma.customer.findMany({
    include: { orders: { where: { status: 'delivered' }, orderBy: { createdAt: 'desc' } } }
  });

  const segments = {
    champions: { name: 'Champions', count: 0, revenue: 0, desc: 'Bought recently, buy often and spend the most' },
    loyal: { name: 'Loyal Customers', count: 0, revenue: 0, desc: 'Buy on a regular basis' },
    potential: { name: 'Potential Loyalists', count: 0, revenue: 0, desc: 'Recent customers with average frequency' },
    new: { name: 'New Customers', count: 0, revenue: 0, desc: 'Bought most recently, but not often' },
    atRisk: { name: 'At Risk', count: 0, revenue: 0, desc: 'Spent big money and purchased often but long time ago' },
    inactive: { name: 'Inactive / Lost', count: 0, revenue: 0, desc: 'Lowest recency, frequency and monetary scores' },
    noOrder: { name: 'No Orders', count: 0, revenue: 0, desc: 'Registered but never purchased' }
  };

  const now = new Date().getTime();

  allCustomers.forEach(c => {
    const orders = c.orders;
    const spent = orders.reduce((sum, o) => sum + o.total, 0);
    const count = orders.length;

    if (count === 0) {
      segments.noOrder.count++;
      return;
    }

    const lastOrderDate = new Date(orders[0].createdAt).getTime();
    const daysSince = Math.floor((now - lastOrderDate) / (1000 * 3600 * 24));

    if (daysSince <= 30 && count >= 3) {
      segments.champions.count++;
      segments.champions.revenue += spent;
    } else if (daysSince <= 90 && count >= 2) {
      segments.loyal.count++;
      segments.loyal.revenue += spent;
    } else if (daysSince <= 60 && count > 1) {
      segments.potential.count++;
      segments.potential.revenue += spent;
    } else if (daysSince <= 30 && count === 1) {
      segments.new.count++;
      segments.new.revenue += spent;
    } else if (daysSince > 90 && count >= 2) {
      segments.atRisk.count++;
      segments.atRisk.revenue += spent;
    } else {
      segments.inactive.count++;
      segments.inactive.revenue += spent;
    }
  });

  const segmentKeys = Object.keys(segments) as Array<keyof typeof segments>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">RFM Segmentation</h1>
        <p className="text-muted-foreground mt-2">Deterministic grouping based on Recency, Frequency, and Monetary value.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 flex items-center gap-2">
          <PieChart size={18} className="text-indigo-500" />
          <h3 className="font-semibold text-gray-900">Customer Segments</h3>
        </div>
        <div className="p-0">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-4 text-xs font-semibold text-gray-600 uppercase">Segment</th>
                <th className="p-4 text-xs font-semibold text-gray-600 uppercase">Customers</th>
                <th className="p-4 text-xs font-semibold text-gray-600 uppercase">Revenue</th>
                <th className="p-4 text-xs font-semibold text-gray-600 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {segmentKeys.map(key => {
                const seg = segments[key];
                return (
                  <tr key={key} className="hover:bg-gray-50">
                    <td className="p-4">
                      <div className="font-medium text-gray-900">{seg.name}</div>
                      <div className="text-xs text-gray-500">{seg.desc}</div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2 py-1 rounded text-sm font-bold bg-gray-100 text-gray-800">
                        {seg.count}
                      </span>
                    </td>
                    <td className="p-4 font-medium text-gray-900">
                      {seg.revenue > 0 ? `${seg.revenue.toLocaleString()} MAD` : '-'}
                    </td>
                    <td className="p-4">
                      <Link href={`/admin/customers?filter=${key}`} className="text-indigo-600 hover:text-indigo-900 text-sm font-medium flex items-center gap-1">
                        View List <ArrowRight size={14} />
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
