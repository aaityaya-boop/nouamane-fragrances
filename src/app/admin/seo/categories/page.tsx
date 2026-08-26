import React from 'react';
import prisma from '@/lib/prisma';
import { LayoutList } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function CategorySeoPerformance() {
  const categories: any[] = [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Category SEO Performance</h1>
        <p className="text-muted-foreground mt-2">Correlate organic search metrics with category-level revenue.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 flex items-center justify-between">
           <h3 className="font-semibold text-gray-900 flex items-center gap-2">
             <LayoutList size={18} className="text-gray-500" />
             Top SEO Categories
           </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-4 text-xs font-semibold text-gray-600 uppercase">Category</th>
                <th className="p-4 text-xs font-semibold text-gray-600 uppercase">Organic Traffic</th>
                <th className="p-4 text-xs font-semibold text-gray-600 uppercase">Orders</th>
                <th className="p-4 text-xs font-semibold text-gray-600 uppercase">Revenue</th>
                <th className="p-4 text-xs font-semibold text-gray-600 uppercase">Conv. Rate</th>
                <th className="p-4 text-xs font-semibold text-gray-600 uppercase">Impressions</th>
                <th className="p-4 text-xs font-semibold text-gray-600 uppercase">Clicks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">No categories found.</td>
                </tr>
              ) : (
                categories.map((category: any) => {
                  return (
                    <tr key={category.id} className="hover:bg-gray-50">
                      <td className="p-4">
                        <div className="font-medium text-indigo-600 text-sm max-w-xs truncate">{category.name}</div>
                        <div className="text-xs text-gray-500">{category.slug}</div>
                      </td>
                      <td className="p-4 text-sm text-gray-500">-</td>
                      <td className="p-4 text-sm text-gray-500">-</td>
                      <td className="p-4 text-sm font-semibold text-gray-900">0 MAD</td>
                      <td className="p-4 text-sm text-gray-500">0.00%</td>
                      <td className="p-4 text-sm text-gray-500">-</td>
                      <td className="p-4 text-sm text-gray-500">-</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
