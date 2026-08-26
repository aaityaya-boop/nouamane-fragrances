import React from 'react';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { Star, ArrowRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function VipCustomersPage() {
  const allCustomers = await prisma.customer.findMany({
    include: { orders: { where: { status: 'delivered' }, orderBy: { createdAt: 'desc' } } }
  });

  const processed = allCustomers.map(c => {
    const spent = c.orders.reduce((sum, o) => sum + o.total, 0);
    const count = c.orders.length;
    const aov = count > 0 ? (spent / count).toFixed(2) : 0;
    const lastOrder = count > 0 ? c.orders[0] : null;
    return { ...c, spent, count, aov, lastOrder };
  });

  // VIP Criteria: Top 20 by spending OR > 3 orders
  const vipCustomers = processed
    .filter(c => c.spent > 0)
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 50);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">VIP Customers</h1>
        <p className="text-muted-foreground mt-2">Highest lifetime value and most frequent buyers.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 flex items-center gap-2">
          <Star size={18} className="text-yellow-500 fill-yellow-500" />
          <h3 className="font-semibold text-gray-900">Top 50 Value Customers</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-4 text-xs font-semibold text-gray-600 uppercase">Rank</th>
                <th className="p-4 text-xs font-semibold text-gray-600 uppercase">Customer</th>
                <th className="p-4 text-xs font-semibold text-gray-600 uppercase">Orders</th>
                <th className="p-4 text-xs font-semibold text-gray-600 uppercase">LTV (Revenue)</th>
                <th className="p-4 text-xs font-semibold text-gray-600 uppercase">AOV</th>
                <th className="p-4 text-xs font-semibold text-gray-600 uppercase">Last Order</th>
                <th className="p-4 text-xs font-semibold text-gray-600 uppercase text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {vipCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">No VIP customers detected yet.</td>
                </tr>
              ) : (
                vipCustomers.map((customer, idx) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="p-4 text-sm font-bold text-gray-400">#{idx + 1}</td>
                    <td className="p-4">
                      <div className="font-medium text-gray-900">{customer.name}</div>
                      <div className="text-xs text-gray-500">{customer.email}</div>
                    </td>
                    <td className="p-4 text-sm font-medium">{customer.count}</td>
                    <td className="p-4 text-sm font-bold text-green-600">{customer.spent.toLocaleString()} MAD</td>
                    <td className="p-4 text-sm text-gray-600">{customer.aov} MAD</td>
                    <td className="p-4 text-sm text-gray-500">
                      {customer.lastOrder ? new Date(customer.lastOrder.createdAt).toLocaleDateString() : '-'}
                    </td>
                    <td className="p-4 text-right">
                      <Link href={`/admin/customers/${customer.id}`} className="text-indigo-600 hover:text-indigo-900 text-sm font-medium flex items-center justify-end gap-1">
                        Profile <ArrowRight size={14} />
                      </Link>
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
