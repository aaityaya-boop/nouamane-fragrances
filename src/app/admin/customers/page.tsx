import React from 'react';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { Users, UserPlus, UserCheck, TrendingUp, Search, Filter } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function CustomersDashboardPage({
  searchParams,
}: {
  searchParams: { q?: string; page?: string; filter?: string }
}) {
  const query = searchParams.q || '';
  const page = parseInt(searchParams.page || '1');
  const filter = searchParams.filter || 'all';
  const take = 20;
  const skip = (page - 1) * take;

  // KPIs Aggregation
  const totalCustomers = await prisma.customer.count();
  const allCustomersWithOrders = await prisma.customer.findMany({
    include: { orders: { where: { status: 'delivered' } } } // count delivered orders for revenue
  });

  let newCustomersCount = 0;
  let returningCustomersCount = 0;
  let totalRevenue = 0;
  let totalDeliveredOrders = 0;

  const processedCustomers = allCustomersWithOrders.map(c => {
    const deliveredOrders = c.orders;
    const spent = deliveredOrders.reduce((sum, o) => sum + o.total, 0);
    const orderCount = deliveredOrders.length;
    
    if (orderCount === 1) newCustomersCount++;
    if (orderCount > 1) returningCustomersCount++;
    
    totalRevenue += spent;
    totalDeliveredOrders += orderCount;

    return { ...c, spent, orderCount };
  });

  const aov = totalDeliveredOrders > 0 ? (totalRevenue / totalDeliveredOrders).toFixed(2) : 0;
  const cltv = allCustomersWithOrders.length > 0 ? (totalRevenue / allCustomersWithOrders.length).toFixed(2) : 0;

  // Search & Filter Query
  const whereClause: any = {};
  
  if (query) {
    whereClause.OR = [
      { name: { contains: query, mode: 'insensitive' } },
      { email: { contains: query, mode: 'insensitive' } },
      { phone: { contains: query, mode: 'insensitive' } }
    ];
  }

  // Fetch paginated list
  const customersList = await prisma.customer.findMany({
    where: whereClause,
    include: { orders: { orderBy: { createdAt: 'desc' } } },
    take,
    skip,
    orderBy: { createdAt: 'desc' }
  });

  const totalFiltered = await prisma.customer.count({ where: whereClause });
  const totalPages = Math.ceil(totalFiltered / take);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Customers CRM</h1>
        <p className="text-muted-foreground mt-2">Manage customer relationships, track lifetime value, and segment audiences.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500">Total Customers</span>
            <Users size={16} className="text-gray-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{totalCustomers}</div>
        </div>
        
        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500">Returning Customers</span>
            <UserCheck size={16} className="text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{returningCustomersCount}</div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500">Total Revenue (Delivered)</span>
            <TrendingUp size={16} className="text-green-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{totalRevenue.toLocaleString()} MAD</div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500">Customer LTV</span>
            <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">AVG</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{Number(cltv).toLocaleString()} MAD</div>
          <p className="text-xs text-gray-500 mt-1">AOV: {Number(aov).toLocaleString()} MAD</p>
        </div>
      </div>

      {/* Filters & Search - UI Only for visual completeness */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search name, email, phone..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            defaultValue={query}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
          <Link href="?filter=all" className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap ${filter === 'all' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}>All</Link>
          <Link href="?filter=new" className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap ${filter === 'new' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}>New</Link>
          <Link href="?filter=returning" className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap ${filter === 'returning' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}>Returning</Link>
          <Link href="?filter=vip" className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap ${filter === 'vip' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}>VIP</Link>
        </div>
      </div>

      {/* Customer List */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-4 text-xs font-semibold text-gray-600 uppercase">Customer</th>
                <th className="p-4 text-xs font-semibold text-gray-600 uppercase">Contact</th>
                <th className="p-4 text-xs font-semibold text-gray-600 uppercase">Orders</th>
                <th className="p-4 text-xs font-semibold text-gray-600 uppercase">Total Spent</th>
                <th className="p-4 text-xs font-semibold text-gray-600 uppercase">Last Order</th>
                <th className="p-4 text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="p-4 text-xs font-semibold text-gray-600 uppercase text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {customersList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    No customers found.
                  </td>
                </tr>
              ) : (
                customersList.map((customer) => {
                  const orders = customer.orders;
                  const deliveredOrders = orders.filter(o => o.status === 'delivered');
                  const spent = deliveredOrders.reduce((sum, o) => sum + o.total, 0);
                  const lastOrder = orders.length > 0 ? orders[0] : null;
                  
                  let status = 'NEW';
                  if (orders.length === 0) status = 'NO_ORDER';
                  else if (deliveredOrders.length > 1) status = 'RETURNING';
                  else if (lastOrder && (new Date().getTime() - new Date(lastOrder.createdAt).getTime()) > 90 * 24 * 3600 * 1000) status = 'AT_RISK';

                  return (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      <td className="p-4">
                        <div className="font-medium text-gray-900">{customer.name}</div>
                        <div className="text-xs text-gray-500">ID: {customer.id.slice(-6)}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-gray-900">{customer.email}</div>
                        <div className="text-xs text-gray-500">{customer.phone || 'No phone'}</div>
                      </td>
                      <td className="p-4 text-sm font-medium text-gray-900">
                        {orders.length}
                      </td>
                      <td className="p-4 text-sm font-bold text-gray-900">
                        {spent.toLocaleString()} MAD
                      </td>
                      <td className="p-4 text-sm text-gray-500">
                        {lastOrder ? new Date(lastOrder.createdAt).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          status === 'RETURNING' ? 'bg-blue-100 text-blue-800' :
                          status === 'AT_RISK' ? 'bg-red-100 text-red-800' :
                          status === 'NO_ORDER' ? 'bg-gray-100 text-gray-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <Link href={`/admin/customers/${customer.id}`} className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">
                          View Profile
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              {page > 1 && (
                <Link href={`?page=${page - 1}${query ? `&q=${query}` : ''}`} className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50">Previous</Link>
              )}
              {page < totalPages && (
                <Link href={`?page=${page + 1}${query ? `&q=${query}` : ''}`} className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50">Next</Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
