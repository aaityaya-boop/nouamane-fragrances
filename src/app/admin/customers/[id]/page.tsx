import React from 'react';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { User, Phone, Mail, MapPin, Calendar, ShoppingBag, Clock, Tag, MessageSquare, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function CustomerProfilePage({ params }: { params: { id: string } }) {
  const customer = await prisma.customer.findUnique({
    where: { id: params.id },
    include: {
      orders: { orderBy: { createdAt: 'desc' } },
      notes: { orderBy: { createdAt: 'desc' } },
      tags: true
    }
  });

  if (!customer) {
    notFound();
  }

  const deliveredOrders = customer.orders.filter(o => o.status === 'delivered');
  const totalSpent = deliveredOrders.reduce((sum, o) => sum + o.total, 0);
  const aov = deliveredOrders.length > 0 ? (totalSpent / deliveredOrders.length).toFixed(2) : 0;
  
  const lastOrder = customer.orders.length > 0 ? customer.orders[0] : null;
  const firstOrder = customer.orders.length > 0 ? customer.orders[customer.orders.length - 1] : null;
  
  const daysSinceLastOrder = lastOrder ? Math.floor((new Date().getTime() - new Date(lastOrder.createdAt).getTime()) / (1000 * 3600 * 24)) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-4">
        <Link href="/admin/customers" className="text-gray-500 hover:text-gray-900 bg-gray-100 p-2 rounded-full">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">{customer.name}</h1>
          <p className="text-muted-foreground text-sm">Customer since {new Date(customer.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Col: Info */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <User size={18} className="text-gray-400" /> Contact Info
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-gray-400" />
                <a href={`mailto:${customer.email}`} className="text-indigo-600 hover:underline">{customer.email}</a>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-gray-400" />
                <span className="text-gray-700">{customer.phone || 'No phone'}</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-gray-400 mt-1" />
                <span className="text-gray-700">
                  {customer.address ? (
                    <>{customer.address}<br/>{customer.city} {customer.postalCode}</>
                  ) : 'No address provided'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Tag size={18} className="text-gray-400" /> Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {customer.tags.length === 0 ? (
                <span className="text-sm text-gray-500">No tags.</span>
              ) : (
                customer.tags.map(t => (
                  <span key={t.id} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded font-medium border border-gray-200">
                    {t.tag}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Stats & History */}
        <div className="md:col-span-2 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 shadow-sm">
              <span className="text-xs font-semibold text-indigo-700 uppercase">Lifetime Value</span>
              <div className="text-2xl font-bold text-indigo-900 mt-1">{totalSpent.toLocaleString()} MAD</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <span className="text-xs font-semibold text-gray-500 uppercase">Orders</span>
              <div className="text-2xl font-bold text-gray-900 mt-1">{customer.orders.length}</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <span className="text-xs font-semibold text-gray-500 uppercase">Avg Order Value</span>
              <div className="text-2xl font-bold text-gray-900 mt-1">{aov} MAD</div>
            </div>
          </div>

          {/* Orders */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 flex justify-between items-center">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <ShoppingBag size={18} className="text-gray-400" /> Order History
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white border-b border-gray-100">
                    <th className="p-4 text-xs font-semibold text-gray-500">Order ID</th>
                    <th className="p-4 text-xs font-semibold text-gray-500">Date</th>
                    <th className="p-4 text-xs font-semibold text-gray-500">Status</th>
                    <th className="p-4 text-xs font-semibold text-gray-500 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {customer.orders.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-gray-500 text-sm">No orders yet.</td>
                    </tr>
                  ) : (
                    customer.orders.map(order => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="p-4 text-sm font-medium">
                          <Link href={`/admin/orders?search=${order.orderNumber}`} className="text-indigo-600 hover:underline">
                            {order.orderNumber}
                          </Link>
                        </td>
                        <td className="p-4 text-sm text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                            order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="p-4 text-sm font-bold text-gray-900 text-right">{order.total.toLocaleString()} MAD</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Timeline & Notes */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Clock size={18} className="text-gray-400" /> Customer Timeline
            </h3>
            <div className="space-y-6 pl-4 border-l-2 border-gray-100">
              {firstOrder && (
                <div className="relative">
                  <div className="absolute -left-[21px] bg-green-500 w-3 h-3 rounded-full border-2 border-white"></div>
                  <p className="text-sm font-medium text-gray-900">First Purchase</p>
                  <p className="text-xs text-gray-500">{new Date(firstOrder.createdAt).toLocaleDateString()} ({firstOrder.orderNumber})</p>
                </div>
              )}
              <div className="relative">
                <div className="absolute -left-[21px] bg-blue-500 w-3 h-3 rounded-full border-2 border-white"></div>
                <p className="text-sm font-medium text-gray-900">Account Created</p>
                <p className="text-xs text-gray-500">{new Date(customer.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
