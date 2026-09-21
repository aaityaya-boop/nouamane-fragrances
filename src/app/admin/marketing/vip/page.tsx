import React from 'react';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { 
  Crown, 
  Sparkles, 
  Gift, 
  ArrowRight, 
  MessageSquare, 
  ExternalLink, 
  TrendingUp, 
  Award, 
  ShoppingBag, 
  Diamond,
  Flame,
  Clock,
  UserCheck
} from 'lucide-react';
import { formatMAD } from '@/lib/products';
import { getUnifiedCustomers } from '@/lib/unifiedCustomers';

export const dynamic = 'force-dynamic';

export default async function VIPMarketingPage() {
  const allCustomers = await getUnifiedCustomers();

  let totalStoreRevenue = 0;
  
  const customerStats = allCustomers.map(c => {
    totalStoreRevenue += c.totalSpent;
    return {
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      cleanPhone: c.cleanPhone,
      city: c.city,
      address: c.address,
      count: c.ordersCount,
      spent: c.totalSpent,
      lastOrder: c.lastOrderDate ? { createdAt: c.lastOrderDate } : null,
      tier: c.tier
    };
  });

  const vipCustomers = customerStats
    .filter(c => c.tier !== 'STANDARD')
    .sort((a, b) => b.spent - a.spent);

  const totalVipRevenue = vipCustomers.reduce((acc, c) => acc + c.spent, 0);
  const vipShare = totalStoreRevenue > 0 ? ((totalVipRevenue / totalStoreRevenue) * 100).toFixed(1) : '0';
  const diamondCount = vipCustomers.filter(c => c.tier === 'DIAMOND').length;
  const goldCount = vipCustomers.filter(c => c.tier === 'GOLD').length;
  const silverCount = vipCustomers.filter(c => c.tier === 'SILVER').length;

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
            <Crown size={18} className="text-neutral-700" />
            Club Privilège & Fidélisation VIP
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Gérez vos clients fidèles, offrez un suivi personnalisé et boostez le réachat.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/admin/marketing/campaigns/new?audience=VIP"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-neutral-900 hover:bg-black text-white font-medium text-xs shadow-xs transition-colors"
          >
            <Gift size={14} />
            <span>Offre Privilège VIP</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-xl p-4 border border-neutral-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-neutral-500">Membres VIP</span>
            <div className="p-1.5 rounded-lg bg-neutral-100 text-neutral-700">
              <Crown size={14} />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold text-neutral-900">{vipCustomers.length} clients</div>
          <p className="text-[11px] text-neutral-400 mt-0.5">Diamant, Or & Argent</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-neutral-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-neutral-500">Chiffre d'Affaires VIP</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
              <TrendingUp size={14} />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold text-neutral-900">{formatMAD(totalVipRevenue)}</div>
          <p className="text-[11px] text-emerald-700 font-medium mt-0.5">{vipShare}% du CA global</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-neutral-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-neutral-500">Club Diamant (&gt;5k MAD)</span>
            <div className="p-1.5 rounded-lg bg-neutral-100 text-neutral-700">
              <Diamond size={14} />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold text-neutral-900">{diamondCount}</div>
          <p className="text-[11px] text-neutral-400 mt-0.5">Plus grands ambassadeurs</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-neutral-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-neutral-500">Club Or (&gt;2.5k MAD)</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-700">
              <Award size={14} />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold text-neutral-900">{goldCount}</div>
          <p className="text-[11px] text-neutral-400 mt-0.5">Forte récurrence</p>
        </div>
      </div>

      {/* VIP Customers Table */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
          <div className="flex items-center gap-2">
            <Crown size={14} className="text-neutral-700" />
            <h3 className="font-semibold text-neutral-900 text-xs">Membres VIP ({vipCustomers.length})</h3>
          </div>
          <span className="text-xs text-neutral-500 font-medium">Classé par dépenses cumulées (MAD)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 text-[11px] font-semibold uppercase tracking-wider">
                <th className="py-3 px-4 sm:px-5">Client VIP</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4">Commandes</th>
                <th className="py-3 px-4">CA Cumulé (LTV)</th>
                <th className="py-3 px-4">Dernier Achat</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-xs">
              {vipCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-neutral-400">
                    <Crown className="mx-auto text-neutral-300 mb-2" size={24} />
                    <p className="font-semibold text-neutral-800">Aucun client qualifié VIP pour le moment.</p>
                    <p className="text-xs text-neutral-500 mt-0.5">Le statut VIP s'active dès 2 commandes livrées ou 1 000 MAD de dépenses.</p>
                  </td>
                </tr>
              ) : (
                vipCustomers.map((vip) => {
                  const customerPhone = vip.phone || '';
                  const cleanPhone = customerPhone.replace(/[^0-9]/g, '');
                  const formattedPhone = cleanPhone.startsWith('0') 
                    ? `212${cleanPhone.slice(1)}` 
                    : cleanPhone.startsWith('212') 
                      ? cleanPhone 
                      : cleanPhone ? `212${cleanPhone}` : '';

                  const vipMsg = `Salam ${vip.name} ✨, c'est l'équipe NAY Parfum. En tant que client fidèle, nous vous réservons des privilèges exclusifs sur nos prochains arrivages. N'hésitez pas si vous avez une demande particulière !`;
                  const whatsappUrl = formattedPhone.length >= 9 
                    ? `https://wa.me/${formattedPhone}?text=${encodeURIComponent(vipMsg)}`
                    : null;

                  return (
                    <tr key={vip.id} className="hover:bg-neutral-50/60 transition-colors">
                      {/* Customer Info */}
                      <td className="py-3 px-4 sm:px-5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-neutral-900 text-white font-medium flex items-center justify-center text-[10px] shrink-0">
                            {vip.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <Link 
                              href={`/admin/customers/${vip.id}`} 
                              className="font-semibold text-neutral-900 hover:text-neutral-700 transition-colors flex items-center gap-1"
                            >
                              {vip.name}
                              <ExternalLink size={10} className="text-neutral-400" />
                            </Link>
                            <div className="text-[10px] text-neutral-400 mt-0.5 space-x-1">
                              {vip.phone && <span className="font-mono">{vip.phone}</span>}
                              {vip.phone && vip.city && <span>•</span>}
                              {vip.city && <span>{vip.city}</span>}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Tier Badge */}
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-neutral-100 text-neutral-800 border border-neutral-200">
                          {vip.tier === 'DIAMOND' ? <Diamond size={11} className="text-neutral-700" /> :
                           vip.tier === 'GOLD' ? <Crown size={11} className="text-amber-600" /> :
                           <Award size={11} className="text-neutral-500" />}
                          <span>VIP {vip.tier === 'DIAMOND' ? 'Diamant' : vip.tier === 'GOLD' ? 'Or' : 'Argent'}</span>
                        </span>
                      </td>

                      {/* Orders Count */}
                      <td className="py-3 px-4 text-neutral-700">
                        <div className="flex items-center gap-1.5">
                          <ShoppingBag size={13} className="text-neutral-400" />
                          <span>{vip.count} cmd</span>
                        </div>
                      </td>

                      {/* Total Spent */}
                      <td className="py-3 px-4">
                        <span className="font-semibold text-neutral-900">
                          {formatMAD(vip.spent)}
                        </span>
                      </td>

                      {/* Last Order */}
                      <td className="py-3 px-4 text-xs text-neutral-500">
                        <div className="flex items-center gap-1">
                          <Clock size={11} className="text-neutral-400" />
                          {vip.lastOrder ? new Date(vip.lastOrder.createdAt).toLocaleDateString('fr-FR') : '-'}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {whatsappUrl && (
                            <a
                              href={whatsappUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Message WhatsApp direct"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-medium text-xs border border-emerald-200 transition-colors"
                            >
                              <MessageSquare size={12} />
                              <span>WhatsApp</span>
                            </a>
                          )}

                          <Link
                            href={`/admin/customers/${vip.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-200 font-medium text-xs transition-colors shadow-2xs"
                          >
                            <span>Fiche</span>
                            <ArrowRight size={11} />
                          </Link>
                        </div>
                      </td>
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
