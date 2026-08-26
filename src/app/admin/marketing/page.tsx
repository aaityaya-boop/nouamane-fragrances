import React from 'react';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { Users, Repeat, TrendingUp, AlertTriangle, ArrowRight, ShoppingCart } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function MarketingDashboardPage() {
  const allCustomers = await prisma.customer.findMany({
    include: { orders: { where: { status: 'delivered' } } }
  });

  let totalRevenue = 0;
  let repeatRevenue = 0;
  let newCustomers = 0;
  let returningCustomers = 0;
  let vipCustomers = 0;
  let atRiskCustomers = 0;
  let inactiveCustomers = 0;
  let totalOrders = 0;

  const now = new Date().getTime();

  allCustomers.forEach(c => {
    const orders = c.orders;
    const spent = orders.reduce((sum, o) => sum + o.total, 0);
    totalRevenue += spent;
    const count = orders.length;
    totalOrders += count;

    if (count === 1) newCustomers++;
    if (count > 1) {
      returningCustomers++;
      repeatRevenue += spent;
    }

    // VIP: >3 orders OR spent high (for demo, just count > 3)
    if (count > 3) vipCustomers++;

    const lastOrder = count > 0 ? c.orders[0] : null;
    const daysSince = lastOrder ? Math.floor((now - new Date(lastOrder.createdAt).getTime()) / (1000 * 3600 * 24)) : 0;

    if (count > 0 && daysSince > 90 && daysSince <= 180) atRiskCustomers++;
    if (count > 0 && daysSince > 180) inactiveCustomers++;
  });

  const aov = totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : 0;
  const cltv = allCustomers.length > 0 ? (totalRevenue / allCustomers.length).toFixed(2) : 0;
  const repeatRate = allCustomers.length > 0 ? ((returningCustomers / allCustomers.length) * 100).toFixed(1) : 0;

  const abandonedCartsCount = await prisma.abandonedCart.count({
    where: { status: 'ABANDONED' }
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Retention & Marketing</h1>
        <p className="text-muted-foreground mt-2">Monitor customer retention, automated campaigns, and recover abandoned carts.</p>
      </div>

      {/* Main KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500">Total Customers</span>
            <Users size={16} className="text-gray-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{allCustomers.length}</div>
          <div className="text-xs text-gray-500 mt-2">New: {newCustomers} | Returning: {returningCustomers}</div>
        </div>
        
        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500">Repeat Purchase Rate</span>
            <Repeat size={16} className="text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{repeatRate}%</div>
          <div className="text-xs text-gray-500 mt-2">Repeat Rev: {repeatRevenue.toLocaleString()} MAD</div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500">Customer LTV</span>
            <TrendingUp size={16} className="text-green-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{Number(cltv).toLocaleString()} MAD</div>
          <p className="text-xs text-gray-500 mt-2">AOV: {Number(aov).toLocaleString()} MAD</p>
        </div>

        <div className="bg-white border border-red-100 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-red-600">Abandoned Carts</span>
            <ShoppingCart size={16} className="text-red-500" />
          </div>
          <div className="text-2xl font-bold text-red-600">{abandonedCartsCount}</div>
          <Link href="/admin/marketing/abandoned-carts" className="text-xs text-red-500 mt-2 hover:underline flex items-center gap-1">
            View Carts <ArrowRight size={12} />
          </Link>
        </div>
      </div>

      {/* Segments Overview */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
          <h3 className="font-semibold text-gray-900">Audience Segmentation for Campaigns</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded bg-yellow-100 text-yellow-600 flex items-center justify-center">
                <Users size={16} />
              </div>
              <h4 className="font-semibold text-gray-900">VIP Customers</h4>
            </div>
            <p className="text-3xl font-bold text-gray-900">{vipCustomers}</p>
            <p className="text-sm text-gray-500 mt-1">High frequency, high value.</p>
            <Link href="/admin/marketing/vip" className="text-sm text-indigo-600 hover:underline mt-4 inline-block">Create VIP Campaign</Link>
          </div>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded bg-orange-100 text-orange-600 flex items-center justify-center">
                <AlertTriangle size={16} />
              </div>
              <h4 className="font-semibold text-gray-900">At-Risk</h4>
            </div>
            <p className="text-3xl font-bold text-gray-900">{atRiskCustomers}</p>
            <p className="text-sm text-gray-500 mt-1">90-180 days since last purchase.</p>
            <Link href="/admin/marketing/campaigns/new?audience=AT_RISK" className="text-sm text-indigo-600 hover:underline mt-4 inline-block">Create Reactivation</Link>
          </div>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded bg-gray-100 text-gray-600 flex items-center justify-center">
                <Users size={16} />
              </div>
              <h4 className="font-semibold text-gray-900">Inactive</h4>
            </div>
            <p className="text-3xl font-bold text-gray-900">{inactiveCustomers}</p>
            <p className="text-sm text-gray-500 mt-1">&gt; 180 days since last purchase.</p>
            <Link href="/admin/marketing/campaigns/new?audience=INACTIVE" className="text-sm text-indigo-600 hover:underline mt-4 inline-block">Create Win-Back</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
