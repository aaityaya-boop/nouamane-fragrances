import React from 'react';
import Link from 'next/link';
import { Plus, Users, TrendingUp, DollarSign, Award, ExternalLink } from 'lucide-react';
import prisma from '@/lib/prisma';
import { formatMAD } from '@/lib/products';

export const dynamic = 'force-dynamic';

export default async function AffiliatesPage() {
  const affiliates = await prisma.affiliate.findMany({
    orderBy: { createdAt: 'desc' }
  });

  const totalRevenue = affiliates.reduce((sum, a) => sum + a.revenueGenerated, 0);
  const totalCommissions = affiliates.reduce((sum, a) => sum + a.commissionEarned, 0);
  const totalVisits = affiliates.reduce((sum, a) => sum + a.visits, 0);
  const totalSales = affiliates.reduce((sum, a) => sum + a.sales, 0);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Programme Ambassadeurs</h1>
          <p className="text-sm text-gray-500 mt-1">Gérez vos influenceurs et suivez leurs performances.</p>
        </div>
        <Link 
          href="/admin/affiliates/new" 
          className="bg-sky-600 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 hover:bg-sky-700 transition-colors"
        >
          <Plus size={16} /> Nouvel Ambassadeur
        </Link>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Users size={20} /></div>
            <h3 className="font-medium text-gray-500 text-sm">Visites Générées</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalVisits}</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><TrendingUp size={20} /></div>
            <h3 className="font-medium text-gray-500 text-sm">Ventes</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalSales}</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-50 text-green-600 rounded-lg"><DollarSign size={20} /></div>
            <h3 className="font-medium text-gray-500 text-sm">CA Généré</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatMAD(totalRevenue)}</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><Award size={20} /></div>
            <h3 className="font-medium text-gray-500 text-sm">Commissions Dues</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatMAD(totalCommissions)}</p>
        </div>
      </div>

      {/* Affiliates List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-500 uppercase tracking-wider">
              <th className="p-4 font-medium">Ambassadeur</th>
              <th className="p-4 font-medium">Lien VIP</th>
              <th className="p-4 font-medium">Commission</th>
              <th className="p-4 font-medium">Visites</th>
              <th className="p-4 font-medium">Ventes</th>
              <th className="p-4 font-medium">Revenus</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {affiliates.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-500">
                  Aucun ambassadeur pour le moment.
                </td>
              </tr>
            ) : (
              affiliates.map((aff) => (
                <tr key={aff.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-medium text-gray-900">{aff.name}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-sky-600 bg-sky-50 px-2 py-1 rounded-md w-max text-xs font-mono">
                      /vip/{aff.code}
                      <a href={`/vip/${aff.code}`} target="_blank" rel="noreferrer" className="hover:text-sky-800">
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600">{aff.commissionRate}%</td>
                  <td className="p-4 text-gray-600">{aff.visits}</td>
                  <td className="p-4 text-gray-600">{aff.sales}</td>
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="text-gray-900 font-medium">CA: {formatMAD(aff.revenueGenerated)}</span>
                      <span className="text-orange-600 text-xs">Dû: {formatMAD(aff.commissionEarned)}</span>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <Link href={`/admin/affiliates/${aff.id}`} className="text-sky-600 hover:text-sky-900 font-medium">
                      Modifier
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
