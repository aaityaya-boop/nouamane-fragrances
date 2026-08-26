import React from 'react';
import prisma from '@/lib/prisma';
import { DollarSign, ShoppingCart, TrendingUp, Users } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function SeoRevenueDashboard() {
  // We'll aggregate data from SeoAnalyticsDaily (simulated/populated by a sync script or manually tracked)
  const analytics = await prisma.seoAnalyticsDaily.findMany({
    orderBy: { date: 'desc' },
    take: 30
  });

  const totalRevenue = analytics.reduce((acc, curr) => acc + curr.revenue, 0);
  const totalOrders = analytics.reduce((acc, curr) => acc + curr.orders, 0);
  const totalSessions = analytics.reduce((acc, curr) => acc + curr.organicSessions, 0);
  
  const conversionRate = totalSessions > 0 ? ((totalOrders / totalSessions) * 100).toFixed(2) : '0.00';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">SEO Conversion & Revenue</h1>
        <p className="text-muted-foreground mt-2">Connect organic traffic directly to revenue and sales.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-green-700 uppercase tracking-wider">Organic Revenue</span>
            <DollarSign size={18} className="text-green-500" />
          </div>
          <div className="text-3xl font-bold text-green-900">{totalRevenue.toLocaleString()} MAD</div>
          <p className="text-xs text-green-600 mt-2">Last 30 Days</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500">Organic Orders</span>
            <ShoppingCart size={16} className="text-indigo-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{totalOrders}</div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500">Conversion Rate</span>
            <TrendingUp size={16} className="text-blue-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{conversionRate}%</div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500">Organic Sessions</span>
            <Users size={16} className="text-purple-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{totalSessions.toLocaleString()}</div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
         <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
           <h3 className="font-semibold text-gray-900">Daily Revenue Attribution</h3>
         </div>
         <div className="p-0">
           <table className="w-full text-left border-collapse">
             <thead>
               <tr className="bg-gray-50 border-b border-gray-200">
                 <th className="p-4 text-xs font-semibold text-gray-600 uppercase">Date</th>
                 <th className="p-4 text-xs font-semibold text-gray-600 uppercase">Sessions</th>
                 <th className="p-4 text-xs font-semibold text-gray-600 uppercase">Product Views</th>
                 <th className="p-4 text-xs font-semibold text-gray-600 uppercase">Add to Cart</th>
                 <th className="p-4 text-xs font-semibold text-gray-600 uppercase">Orders</th>
                 <th className="p-4 text-xs font-semibold text-gray-600 uppercase">Revenue (MAD)</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-gray-100">
               {analytics.length === 0 ? (
                 <tr>
                   <td colSpan={6} className="p-8 text-center text-gray-500">
                     <p className="font-medium text-gray-900">NO_DATA</p>
                     <p className="text-sm mt-1">GA4 API connection required or no tracked events.</p>
                   </td>
                 </tr>
               ) : (
                 analytics.map(day => (
                   <tr key={day.id} className="hover:bg-gray-50">
                     <td className="p-4 text-sm font-medium text-gray-900">{new Date(day.date).toLocaleDateString()}</td>
                     <td className="p-4 text-sm text-gray-600">{day.organicSessions}</td>
                     <td className="p-4 text-sm text-gray-600">{day.productViews}</td>
                     <td className="p-4 text-sm text-gray-600">{day.addToCart}</td>
                     <td className="p-4 text-sm text-gray-600 font-medium">{day.orders}</td>
                     <td className="p-4 text-sm text-gray-900 font-semibold">{day.revenue.toLocaleString()} MAD</td>
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
