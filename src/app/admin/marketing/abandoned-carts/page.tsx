import React from 'react';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { ShoppingCart, Clock, ArrowRight, MessageSquare, Mail } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AbandonedCartsPage() {
  const abandonedCarts = await prisma.abandonedCart.findMany({
    where: { status: { in: ['ABANDONED', 'ACTIVE'] } },
    include: { customer: true },
    orderBy: { lastActivity: 'desc' }
  });

  const now = new Date().getTime();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Abandoned Carts</h1>
        <p className="text-muted-foreground mt-2">Recover lost revenue by sending targeted reminders to customers who left items in their cart.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart size={18} className="text-gray-500" />
            <h3 className="font-semibold text-gray-900">Recovery Queue</h3>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-4 text-xs font-semibold text-gray-600 uppercase">Customer</th>
                <th className="p-4 text-xs font-semibold text-gray-600 uppercase">Cart Value</th>
                <th className="p-4 text-xs font-semibold text-gray-600 uppercase">Time Since Abandoned</th>
                <th className="p-4 text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="p-4 text-xs font-semibold text-gray-600 uppercase text-right">Actions (Admin Only)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {abandonedCarts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">No abandoned carts currently.</td>
                </tr>
              ) : (
                abandonedCarts.map((cart) => {
                  const minutesSince = Math.floor((now - new Date(cart.lastActivity).getTime()) / 60000);
                  const isAbandoned = minutesSince > 60; // 60 minutes threshold
                  const displayStatus = isAbandoned ? 'ABANDONED' : 'ACTIVE (In Session)';

                  return (
                    <tr key={cart.id} className="hover:bg-gray-50">
                      <td className="p-4">
                        <div className="font-medium text-gray-900">{cart.customer.name}</div>
                        <div className="text-xs text-gray-500">{cart.customer.email}</div>
                      </td>
                      <td className="p-4 text-sm font-bold text-gray-900">{cart.cartValue.toLocaleString()} MAD</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock size={14} className="text-gray-400" />
                          {minutesSince > 1440 
                            ? `${Math.floor(minutesSince / 1440)} days` 
                            : minutesSince > 60 
                              ? `${Math.floor(minutesSince / 60)} hours` 
                              : `${minutesSince} mins`}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          isAbandoned ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {displayStatus}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        {isAbandoned ? (
                          <>
                            <button className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded border border-gray-200 transition-colors">
                              <Mail size={14} /> Send Email
                            </button>
                            <button className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] text-xs font-medium rounded border border-[#25D366]/20 transition-colors">
                              <MessageSquare size={14} /> WhatsApp
                            </button>
                          </>
                        ) : (
                          <span className="text-xs text-gray-400">Waiting for threshold...</span>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
