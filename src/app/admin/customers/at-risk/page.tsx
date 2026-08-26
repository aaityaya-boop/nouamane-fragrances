import React from 'react';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { AlertTriangle, ArrowRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AtRiskCustomersPage() {
  const allCustomers = await prisma.customer.findMany({
    include: { orders: { where: { status: 'delivered' }, orderBy: { createdAt: 'desc' } } }
  });

  const now = new Date().getTime();

  const processed = allCustomers.map(c => {
    const spent = c.orders.reduce((sum, o) => sum + o.total, 0);
    const count = c.orders.length;
    const lastOrder = count > 0 ? c.orders[0] : null;
    const daysSince = lastOrder ? Math.floor((now - new Date(lastOrder.createdAt).getTime()) / (1000 * 3600 * 24)) : 0;
    return { ...c, spent, count, lastOrder, daysSince };
  });

  // At Risk Criteria: > 0 orders, daysSince > 90
  const atRiskCustomers = processed
    .filter(c => c.count > 0 && c.daysSince > 90)
    .sort((a, b) => b.spent - a.spent); // Prioritize by lost revenue

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">At-Risk Customers</h1>
        <p className="text-muted-foreground mt-2">Customers with previous purchases who have not bought in over 90 days.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 flex items-center gap-2">
          <AlertTriangle size={18} className="text-red-500" />
          <h3 className="font-semibold text-gray-900">At-Risk Churn List</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-4 text-xs font-semibold text-gray-600 uppercase">Customer</th>
                <th className="p-4 text-xs font-semibold text-gray-600 uppercase">Orders</th>
                <th className="p-4 text-xs font-semibold text-gray-600 uppercase">LTV (Lost Revenue)</th>
                <th className="p-4 text-xs font-semibold text-gray-600 uppercase">Days Inactive</th>
                <th className="p-4 text-xs font-semibold text-gray-600 uppercase">Last Order</th>
                <th className="p-4 text-xs font-semibold text-gray-600 uppercase text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {atRiskCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">No at-risk customers detected.</td>
                </tr>
              ) : (
                atRiskCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="p-4">
                      <div className="font-medium text-gray-900">{customer.name}</div>
                      <div className="text-xs text-gray-500">{customer.email}</div>
                    </td>
                    <td className="p-4 text-sm font-medium">{customer.count}</td>
                    <td className="p-4 text-sm font-bold text-gray-900">{customer.spent.toLocaleString()} MAD</td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-red-100 text-red-800">
                        {customer.daysSince} days
                      </span>
                    </td>
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
