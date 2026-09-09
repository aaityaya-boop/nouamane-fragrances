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

export const dynamic = 'force-dynamic';

export default async function VIPMarketingPage() {
  const allCustomers = await prisma.customer.findMany({
    include: { 
      orders: { 
        where: { status: 'delivered' }, 
        orderBy: { createdAt: 'desc' } 
      } 
    }
  });

  let totalStoreRevenue = 0;
  
  const customerStats = allCustomers.map(c => {
    const spent = c.orders.reduce((sum, o) => sum + o.total, 0);
    const count = c.orders.length;
    const lastOrder = count > 0 ? c.orders[0] : null;
    totalStoreRevenue += spent;

    let tier: 'DIAMOND' | 'GOLD' | 'SILVER' | 'STANDARD' = 'STANDARD';
    if (spent >= 5000 || count >= 5) {
      tier = 'DIAMOND';
    } else if (spent >= 2500 || count >= 3) {
      tier = 'GOLD';
    } else if (spent >= 1000 || count >= 2) {
      tier = 'SILVER';
    }

    return { ...c, spent, count, lastOrder, tier };
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
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-neutral-900 tracking-tight flex items-center gap-2">
            <Crown size={22} className="text-amber-500" />
            Club Privilège & Fidélisation VIP
          </h2>
          <p className="text-xs md:text-sm text-neutral-500 mt-1">
            Gérez vos clients les plus précieux, offrez un service conciergerie personnalisé et boostez la rétention.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/admin/marketing/campaigns/new?audience=VIP"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-black text-xs shadow-md transition-all active:scale-95"
          >
            <Gift size={15} />
            <span>Offre Privilège VIP</span>
          </Link>
        </div>
      </div>

      {/* Luxury KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-neutral-900 to-neutral-950 text-white rounded-2xl p-5 border border-neutral-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Membres VIP</span>
            <div className="p-2 rounded-xl bg-neutral-800 text-amber-400">
              <Crown size={16} />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-white">{vipCustomers.length} clients</div>
          <p className="text-xs text-neutral-400 mt-1">Segments Diamant, Or & Argent</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Chiffre d'Affaires VIP</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-neutral-900">{formatMAD(totalVipRevenue)}</div>
          <p className="text-xs text-emerald-600 font-semibold mt-1">{vipShare}% du CA total boutique</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Club Diamant (&gt;5k MAD)</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <Diamond size={16} />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-neutral-900">{diamondCount}</div>
          <p className="text-xs text-neutral-400 mt-1">Vos plus grands ambassadeurs</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Club Or (&gt;2.5k MAD)</span>
            <div className="p-2 rounded-xl bg-yellow-50 text-yellow-700">
              <Award size={16} />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-neutral-900">{goldCount}</div>
          <p className="text-xs text-neutral-400 mt-1">Forte récurrence d'achat</p>
        </div>
      </div>

      {/* VIP Customers Table */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/60">
          <div className="flex items-center gap-2">
            <Crown size={16} className="text-amber-500" />
            <h3 className="font-bold text-neutral-900 text-sm">Registre des Membres VIP ({vipCustomers.length})</h3>
          </div>
          <span className="text-xs text-neutral-500 font-medium">Trié par dépenses cumulées (MAD)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3.5 px-6">Client VIP</th>
                <th className="py-3.5 px-6">Statut / Rang</th>
                <th className="py-3.5 px-6">Commandes Livrées</th>
                <th className="py-3.5 px-6">CA Cumulé (LTV)</th>
                <th className="py-3.5 px-6">Dernier Achat</th>
                <th className="py-3.5 px-6 text-right">Actions Concierge</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-sm">
              {vipCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-neutral-400">
                    <Crown className="mx-auto text-neutral-300 mb-2" size={32} />
                    <p className="font-bold text-neutral-800">Aucun client qualifié VIP pour le moment.</p>
                    <p className="text-xs text-neutral-400 mt-1">Le statut VIP s'active dès 2 commandes livrées ou 1 000 MAD de dépenses.</p>
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

                  const vipMsg = `Salam ${vip.name} ✨, c'est Nouamane de l'équipe NAY Parfum. En tant que membre privilégié de notre maison, nous vous réservons un accompagnement personnalisé et des privilèges exclusifs sur nos prochains arrivages de testeurs rares. N'hésitez pas si vous souhaitez réserver une fragrance particulière !`;
                  const whatsappUrl = formattedPhone.length >= 9 
                    ? `https://wa.me/${formattedPhone}?text=${encodeURIComponent(vipMsg)}`
                    : null;

                  return (
                    <tr key={vip.id} className="hover:bg-neutral-50/70 transition-colors">
                      {/* Customer Info */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl font-black flex items-center justify-center text-xs shrink-0 ${
                            vip.tier === 'DIAMOND' ? 'bg-neutral-950 text-amber-400 border border-amber-500/40 shadow-sm' :
                            vip.tier === 'GOLD' ? 'bg-amber-500 text-neutral-950 shadow-sm' :
                            'bg-neutral-100 text-neutral-700'
                          }`}>
                            {vip.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <Link 
                              href={`/admin/customers/${vip.id}`} 
                              className="font-bold text-neutral-900 hover:text-amber-600 transition-colors flex items-center gap-1"
                            >
                              {vip.name}
                              <ExternalLink size={11} className="text-neutral-400" />
                            </Link>
                            <div className="text-xs text-neutral-500 mt-0.5 space-x-1">
                              {vip.phone && <span className="font-mono">{vip.phone}</span>}
                              {vip.phone && vip.city && <span>•</span>}
                              {vip.city && <span>{vip.city}</span>}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Tier Badge */}
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                          vip.tier === 'DIAMOND' 
                            ? 'bg-neutral-950 text-amber-400 border border-amber-500/50 shadow-xs' :
                          vip.tier === 'GOLD' 
                            ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                            'bg-neutral-100 text-neutral-700 border border-neutral-200'
                        }`}>
                          {vip.tier === 'DIAMOND' ? <Diamond size={12} className="text-amber-400" /> :
                           vip.tier === 'GOLD' ? <Crown size={12} className="text-amber-600" /> :
                           <Award size={12} className="text-neutral-500" />}
                          <span>VIP {vip.tier === 'DIAMOND' ? 'Diamant' : vip.tier === 'GOLD' ? 'Or' : 'Argent'}</span>
                        </span>
                      </td>

                      {/* Orders Count */}
                      <td className="py-4 px-6 font-semibold text-neutral-800">
                        <div className="flex items-center gap-1.5">
                          <ShoppingBag size={14} className="text-neutral-400" />
                          <span>{vip.count} commande(s)</span>
                        </div>
                      </td>

                      {/* Total Spent */}
                      <td className="py-4 px-6">
                        <span className="text-base font-black text-emerald-700">
                          {formatMAD(vip.spent)}
                        </span>
                      </td>

                      {/* Last Order */}
                      <td className="py-4 px-6 text-xs text-neutral-500">
                        <div className="flex items-center gap-1">
                          <Clock size={12} className="text-neutral-400" />
                          {vip.lastOrder ? new Date(vip.lastOrder.createdAt).toLocaleDateString('fr-FR') : '-'}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {whatsappUrl && (
                            <a
                              href={whatsappUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Message Concierge VIP direct"
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs shadow-sm transition-all active:scale-95"
                            >
                              <MessageSquare size={13} />
                              <span>Concierge WhatsApp</span>
                            </a>
                          )}

                          <Link
                            href={`/admin/customers/${vip.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold text-xs transition-colors"
                          >
                            <span>Fiche Client</span>
                            <ArrowRight size={12} />
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
