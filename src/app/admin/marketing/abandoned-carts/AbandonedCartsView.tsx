'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ShoppingCart, 
  Clock, 
  MessageSquare, 
  Mail, 
  Copy, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink, 
  User, 
  Phone, 
  Package, 
  Sparkles, 
  AlertCircle,
  TrendingDown
} from 'lucide-react';
import { formatMAD } from '@/lib/products';

interface AbandonedCartItem {
  id: string;
  cartValue: number;
  status: string;
  lastActivity: string;
  cartItems: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    city: string | null;
  };
}

export default function AbandonedCartsView({ 
  initialCarts 
}: { 
  initialCarts: AbandonedCartItem[] 
}) {
  const [filter, setFilter] = useState<'ALL' | 'HOT' | 'ABANDONED' | 'ACTIVE'>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const now = new Date().getTime();

  // Statistics
  const totalCarts = initialCarts.length;
  const totalValue = initialCarts.reduce((sum, c) => sum + c.cartValue, 0);
  const hotCarts = initialCarts.filter(c => {
    const hours = (now - new Date(c.lastActivity).getTime()) / (1000 * 3600);
    return hours <= 24;
  }).length;
  const avgValue = totalCarts > 0 ? Math.round(totalValue / totalCarts) : 0;

  const filteredCarts = initialCarts.filter(c => {
    const minutesSince = Math.floor((now - new Date(c.lastActivity).getTime()) / 60000);
    const isAbandoned = minutesSince > 60;
    
    if (filter === 'HOT') return minutesSince <= 1440;
    if (filter === 'ABANDONED') return isAbandoned;
    if (filter === 'ACTIVE') return !isAbandoned;
    return true;
  });

  const getWhatsAppMessage = (cart: AbandonedCartItem, items: any[]) => {
    const firstItem = items[0]?.name || 'vos parfums d\'exception';
    return `Salam ${cart.customer.name} 👋✨, c'est l'équipe NAY Parfum ! Nous avons conservé votre sélection pour ${firstItem} (Total: ${formatMAD(cart.cartValue)}). Souhaitez-vous valider votre commande avec livraison rapide partout au Maroc ? Répondez-nous pour vous préparer votre colis prioritaire !`;
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Total Paniers</span>
            <div className="p-2 rounded-xl bg-neutral-100 text-neutral-800">
              <ShoppingCart size={16} />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-neutral-900">{totalCarts}</div>
          <p className="text-xs text-neutral-400 mt-1">Enregistrés en base de données</p>
        </div>

        <div className="bg-[#0A0A0A] text-white rounded-2xl p-5 border border-[#1e1e1e] shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#0ea5e9] uppercase tracking-wider">Montant Total à Récupérer</span>
            <div className="p-2 rounded-xl bg-[#1c1c1c] text-[#0ea5e9]">
              <TrendingDown size={16} />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-white">{formatMAD(totalValue)}</div>
          <p className="text-xs text-gray-400 mt-1">Chiffre d'affaires potentiel</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Paniers Chauds (&lt;24h)</span>
            <div className="p-2 rounded-xl bg-red-50 text-red-600">
              <Clock size={16} />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-red-600">{hotCarts}</div>
          <p className="text-xs text-neutral-400 mt-1">Priorité maximale de conversion</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Panier Moyen Abandonné</span>
            <div className="p-2 rounded-xl bg-sky-50 text-[#0ea5e9]">
              <Sparkles size={16} />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-neutral-900">{formatMAD(avgValue)}</div>
          <p className="text-xs text-neutral-400 mt-1">Moyenne par client</p>
        </div>
      </div>

      {/* Filter Tabs & Counter */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-sm p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filter === 'ALL'
                ? 'bg-[#0A0A0A] text-white shadow-md'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            Tous ({totalCarts})
          </button>
          <button
            onClick={() => setFilter('HOT')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filter === 'HOT'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            🔥 Chauds &lt;24h ({hotCarts})
          </button>
          <button
            onClick={() => setFilter('ABANDONED')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filter === 'ABANDONED'
                ? 'bg-[#0ea5e9] text-white shadow-md'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            Abandonnés &gt;1h
          </button>
          <button
            onClick={() => setFilter('ACTIVE')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filter === 'ACTIVE'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            En Session Active
          </button>
        </div>

        <div className="text-xs text-neutral-500 font-semibold">
          {filteredCarts.length} paniers affichés
        </div>
      </div>

      {/* Abandoned Carts Table */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3.5 px-6">Client & Contact</th>
                <th className="py-3.5 px-6">Articles & Flacons</th>
                <th className="py-3.5 px-6">Valeur Panier</th>
                <th className="py-3.5 px-6">Ancienneté</th>
                <th className="py-3.5 px-6">Statut</th>
                <th className="py-3.5 px-6 text-right">Relance Directe</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-sm">
              {filteredCarts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-neutral-400">
                    <AlertCircle className="mx-auto text-neutral-300 mb-2" size={32} />
                    <p className="font-bold text-neutral-700">Aucun panier trouvé pour ce filtre.</p>
                    <p className="text-xs text-neutral-400 mt-1">Modifiez vos filtres ou revenez plus tard.</p>
                  </td>
                </tr>
              ) : (
                filteredCarts.map((cart) => {
                  const minutesSince = Math.floor((now - new Date(cart.lastActivity).getTime()) / 60000);
                  const isAbandoned = minutesSince > 60;
                  
                  let items: any[] = [];
                  try {
                    items = JSON.parse(cart.cartItems || '[]');
                  } catch (e) {
                    items = [];
                  }

                  const customerPhone = cart.customer.phone || '';
                  const cleanPhone = customerPhone.replace(/[^0-9]/g, '');
                  const formattedPhone = cleanPhone.startsWith('0') 
                    ? `212${cleanPhone.slice(1)}` 
                    : cleanPhone.startsWith('212') 
                      ? cleanPhone 
                      : cleanPhone ? `212${cleanPhone}` : '';

                  const recoveryMsg = getWhatsAppMessage(cart, items);
                  const whatsappUrl = formattedPhone.length >= 9 
                    ? `https://wa.me/${formattedPhone}?text=${encodeURIComponent(recoveryMsg)}`
                    : null;

                  const emailSubject = `Votre sélection NAY Parfum vous attend`;
                  const emailBody = `Bonjour ${cart.customer.name},\n\nNous avons remarqué que vous avez laissé des articles dans votre panier chez NAY Parfum.\n\nVotre sélection :\n${items.map(i => `- ${i.name} (${formatMAD(i.price * (i.quantity || 1))})`).join('\n')}\n\nTotal : ${formatMAD(cart.cartValue)}\n\nN'hésitez pas à nous contacter si vous avez la moindre question.\n\nBien cordialement,\nL'équipe NAY Parfum\nhttps://nayparfum.ma`;
                  const mailtoUrl = `mailto:${cart.customer.email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

                  const isExpanded = expandedId === cart.id;

                  return (
                    <React.Fragment key={cart.id}>
                      <tr className="hover:bg-neutral-50/70 transition-colors">
                        {/* Customer Info */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-[#0A0A0A] text-[#0ea5e9] font-black flex items-center justify-center text-xs shrink-0 shadow-sm border border-white/10">
                              {cart.customer.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <Link 
                                href={`/admin/customers/${cart.customer.id}`}
                                className="font-bold text-neutral-900 hover:text-[#0ea5e9] transition-colors flex items-center gap-1"
                              >
                                {cart.customer.name}
                                <ExternalLink size={11} className="text-neutral-400" />
                              </Link>
                              <div className="text-xs text-neutral-500 mt-0.5 space-x-1">
                                {cart.customer.phone && (
                                  <span className="font-mono">{cart.customer.phone}</span>
                                )}
                                {cart.customer.phone && cart.customer.city && <span>•</span>}
                                {cart.customer.city && <span>{cart.customer.city}</span>}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Items Preview */}
                        <td className="py-4 px-6">
                          <div>
                            <button
                              onClick={() => setExpandedId(isExpanded ? null : cart.id)}
                              className="text-xs font-semibold text-neutral-800 hover:text-neutral-950 flex items-center gap-1.5 bg-neutral-100 hover:bg-neutral-200/80 px-2.5 py-1.5 rounded-lg transition-colors text-left"
                            >
                              <Package size={13} className="text-[#0ea5e9] shrink-0" />
                              <span>{items.length} article(s)</span>
                              {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                            </button>
                            <p className="text-[11px] text-neutral-500 mt-1 truncate max-w-[200px]">
                              {items.map(i => i.name).join(', ') || 'Articles enregistrés'}
                            </p>
                          </div>
                        </td>

                        {/* Cart Value */}
                        <td className="py-4 px-6">
                          <span className="text-base font-black text-neutral-900">
                            {formatMAD(cart.cartValue)}
                          </span>
                        </td>

                        {/* Time Elapsed */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-1.5 text-xs text-neutral-600">
                            <Clock size={13} className="text-neutral-400" />
                            <span>
                              {minutesSince > 1440 
                                ? `${Math.floor(minutesSince / 1440)} jour(s)` 
                                : minutesSince > 60 
                                  ? `${Math.floor(minutesSince / 60)}h ${minutesSince % 60}m` 
                                  : `${minutesSince} min`}
                            </span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                            isAbandoned 
                              ? 'bg-red-50 text-red-700 border border-red-200' 
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isAbandoned ? 'bg-red-500' : 'bg-emerald-500'}`} />
                            {isAbandoned ? 'Abandonné' : 'En session'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {whatsappUrl && (
                              <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Relancer directement sur WhatsApp avec message pré-rempli"
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all active:scale-95"
                              >
                                <MessageSquare size={13} />
                                <span>WhatsApp</span>
                              </a>
                            )}

                            <a
                              href={mailtoUrl}
                              title="Envoyer un e-mail de relance"
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold text-xs transition-colors"
                            >
                              <Mail size={13} />
                              <span className="hidden sm:inline">Email</span>
                            </a>

                            <button
                              onClick={() => copyToClipboard(recoveryMsg, cart.id)}
                              title="Copier le message de relance"
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold text-xs transition-colors"
                            >
                              {copiedId === cart.id ? (
                                <Check size={13} className="text-emerald-600" />
                              ) : (
                                <Copy size={13} />
                              )}
                              <span className="hidden sm:inline">
                                {copiedId === cart.id ? 'Copié !' : 'Copier'}
                              </span>
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expandable Items Drawer */}
                      {isExpanded && (
                        <tr className="bg-neutral-50/90 border-b border-neutral-200">
                          <td colSpan={6} className="p-6">
                            <div className="bg-white rounded-xl p-4 border border-neutral-200 shadow-inner space-y-3">
                              <h4 className="text-xs font-bold text-neutral-700 uppercase tracking-wider flex items-center gap-1.5">
                                <Package size={14} className="text-[#0ea5e9]" />
                                Détail des articles du panier ({items.length})
                              </h4>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                {items.map((item: any, idx: number) => (
                                  <div key={idx} className="flex items-center gap-3 p-2.5 rounded-lg bg-neutral-50 border border-neutral-200/70">
                                    <div className="w-12 h-12 rounded-lg bg-white overflow-hidden border border-neutral-200 shrink-0 flex items-center justify-center">
                                      {item.image ? (
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                      ) : (
                                        <Package className="text-neutral-400" size={18} />
                                      )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="text-xs font-bold text-neutral-900 truncate">{item.name}</p>
                                      <p className="text-[11px] text-neutral-500">Qté: {item.quantity || 1} {item.size ? `• ${item.size}` : ''}</p>
                                      <p className="text-xs font-black text-neutral-900 mt-0.5">{formatMAD(item.price * (item.quantity || 1))}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              <div className="pt-3 border-t border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                                <div className="text-neutral-500">
                                  Message pré-rempli généré : <i className="text-neutral-700 font-normal">"{recoveryMsg.slice(0, 100)}..."</i>
                                </div>
                                <div className="flex items-center gap-2">
                                  {whatsappUrl && (
                                    <a
                                      href={whatsappUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366] text-white font-bold text-xs shadow-sm"
                                    >
                                      <MessageSquare size={13} />
                                      Envoyer via WhatsApp Web / App
                                    </a>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
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
