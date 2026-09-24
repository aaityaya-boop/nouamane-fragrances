'use client';

import React, { useState } from 'react';
import {
  Award,
  Copy,
  Check,
  ExternalLink,
  Share2,
  TrendingUp,
  Users,
  ShoppingBag,
  DollarSign,
  Wallet,
  LogOut,
  Calendar,
  Sparkles,
  QrCode,
  Download,
  Building2,
  ShieldCheck,
  ArrowUpRight,
  Send,
  MessageCircle,
  Instagram,
  CheckCircle2,
  Clock,
  ChevronRight,
  Layers,
  FileText
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatMAD } from '@/lib/products';

interface OrderItem {
  name?: string;
  quantity?: number;
  price?: number;
}

export default function AmbassadeurDashboardClient({ ambassador }: { ambassador: any }) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'orders' | 'leads' | 'payouts' | 'marketing'>('orders');
  const [showQr, setShowQr] = useState(false);
  const [payoutModalOpen, setPayoutModalOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState<number>(0);
  const [payoutNote, setPayoutNote] = useState('');
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [payoutSuccess, setPayoutSuccess] = useState<string | null>(null);

  const vipUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/vip/${ambassador.code}`
    : `https://nayparfum.ma/vip/${ambassador.code}`;

  const availableBalance = Math.max(0, ambassador.commissionEarned - (ambassador.commissionPaid || 0));
  const conversionRate = ambassador.visits > 0 
    ? ((ambassador.sales / ambassador.visits) * 100).toFixed(1) 
    : '0.0';

  const copyVipLink = () => {
    navigator.clipboard.writeText(vipUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleLogout = async () => {
    await fetch('/api/ambassadeur/logout', { method: 'POST' });
    router.refresh();
  };

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    setPayoutLoading(true);
    setPayoutSuccess(null);

    try {
      const res = await fetch('/api/ambassadeur/payout-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(payoutAmount) || availableBalance,
          note: payoutNote,
          bankRib: ambassador.bankRib,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setPayoutSuccess(data.message || 'Demande transmise avec succès !');
        setTimeout(() => {
          setPayoutModalOpen(false);
          setPayoutSuccess(null);
        }, 3000);
      } else {
        alert(data.error || 'Erreur lors de la demande');
      }
    } catch {
      alert('Erreur de connexion');
    } finally {
      setPayoutLoading(false);
    }
  };

  // Human readable compensation plan
  const renderCompensationBadge = () => {
    const type = ambassador.commissionType || 'PERCENTAGE';
    if (type === 'PERCENTAGE') {
      return (
        <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-300 px-3 py-1.5 rounded-full text-xs font-semibold">
          <Sparkles size={14} className="text-amber-400" />
          <span>Commission : {ambassador.commissionRate}% sur chaque vente</span>
        </div>
      );
    }
    if (type === 'FIXED_PER_ORDER') {
      return (
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-3 py-1.5 rounded-full text-xs font-semibold">
          <DollarSign size={14} className="text-emerald-400" />
          <span>Prime Fixe : {ambassador.fixedPerOrder} MAD par commande validée</span>
        </div>
      );
    }
    if (type === 'PAY_PER_VISIT') {
      return (
        <div className="flex items-center gap-2 bg-sky-500/10 border border-sky-500/30 text-sky-300 px-3 py-1.5 rounded-full text-xs font-semibold">
          <TrendingUp size={14} className="text-sky-400" />
          <span>Rémunération au Trafic : {ambassador.payPerVisit} MAD par visiteur unique</span>
        </div>
      );
    }
    if (type === 'PAY_PER_LEAD') {
      return (
        <div className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 text-purple-300 px-3 py-1.5 rounded-full text-xs font-semibold">
          <Users size={14} className="text-purple-400" />
          <span>Rémunération au Lead : {ambassador.payPerLead} MAD par inscription client</span>
        </div>
      );
    }
    if (type === 'MONTHLY_RETAINER') {
      return (
        <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-300 px-3 py-1.5 rounded-full text-xs font-semibold">
          <Award size={14} className="text-amber-400" />
          <span>Forfait Mensuel Fixe : {formatMAD(ambassador.monthlyRetainer)} / mois</span>
        </div>
      );
    }
    if (type === 'HYBRID') {
      return (
        <div className="flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-emerald-500/20 border border-amber-500/30 text-amber-200 px-3 py-1.5 rounded-full text-xs font-semibold">
          <Sparkles size={14} className="text-amber-400" />
          <span>Contrat Hybride : {ambassador.commissionRate}% + {ambassador.fixedPerOrder} MAD/commande</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-neutral-100 pb-24 font-sans">
      {/* Top Bar */}
      <header className="border-b border-neutral-800/80 bg-neutral-900/60 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Award size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white tracking-wide text-sm sm:text-base font-serif">NAY PARFUMS</span>
                <span className="bg-amber-400/10 text-amber-300 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border border-amber-400/20">
                  VIP Ambassadeur
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-bold text-neutral-200">{ambassador.name}</span>
              <span className="text-[11px] text-neutral-400 font-mono">@{ambassador.code}</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl bg-neutral-800/80 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors border border-neutral-700/50 flex items-center gap-1.5 text-xs font-medium cursor-pointer"
              title="Déconnexion"
            >
              <LogOut size={15} />
              <span className="hidden sm:inline">Quitter</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 space-y-6">
        {/* Welcome & Deal Ribbon */}
        <div className="bg-gradient-to-r from-neutral-900 via-neutral-900 to-[#171614] border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-xs text-neutral-400">Bienvenue sur votre espace privé,</span>
                <span className="text-xs font-bold text-amber-400">{ambassador.name}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-serif">
                Suivi de vos Performances
              </h1>
              <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-xl">
                Partagez votre lien exclusif auprès de votre communauté. Vos gains sont calculés automatiquement et disponibles pour virement.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {renderCompensationBadge()}
              </div>
            </div>

            {/* Quick Balance CTA */}
            <div className="bg-neutral-950/80 border border-neutral-800/90 rounded-2xl p-4 sm:p-5 flex flex-col justify-between sm:min-w-[280px]">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 block">
                  Solde Disponible à Virer
                </span>
                <div className="text-3xl font-extrabold text-amber-400 mt-1">
                  {formatMAD(availableBalance)}
                </div>
                <div className="text-[11px] text-neutral-500 mt-0.5">
                  Total cumulé : {formatMAD(ambassador.commissionEarned)} • Déjà versé : {formatMAD(ambassador.commissionPaid || 0)}
                </div>
              </div>

              <button
                onClick={() => {
                  setPayoutAmount(availableBalance);
                  setPayoutModalOpen(true);
                }}
                disabled={availableBalance <= 0}
                className="mt-4 w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-40 disabled:hover:from-amber-500 text-neutral-950 font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Wallet size={15} />
                <span>Demander un virement</span>
              </button>
            </div>
          </div>
        </div>

        {/* VIP Link Card (Sharing Station) */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 sm:p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-amber-400/10 text-amber-400 border border-amber-400/20">
                <Share2 size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Votre Lien VIP Exclusif</h3>
                <p className="text-xs text-neutral-400">À placer en bio Instagram, TikTok, description YouTube ou stories.</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowQr(!showQr)}
                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700/80 text-neutral-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-neutral-700 transition-colors cursor-pointer"
              >
                <QrCode size={14} />
                <span>{showQr ? 'Masquer QR' : 'Afficher QR Code'}</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
            <div className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 flex items-center justify-between text-xs sm:text-sm font-mono text-amber-300 overflow-x-auto">
              <span className="truncate">{vipUrl}</span>
            </div>

            <button
              onClick={copyVipLink}
              className={`px-5 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                copied
                  ? 'bg-emerald-500 text-neutral-950 shadow-emerald-500/20 shadow-lg'
                  : 'bg-white text-neutral-950 hover:bg-neutral-200 shadow-lg'
              }`}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              <span>{copied ? 'Lien Copié !' : 'Copier le Lien'}</span>
            </button>

            <a
              href={`https://wa.me/?text=${encodeURIComponent(
                `✨ Découvrez la collection exclusive de parfums authentiques chez NAY Parfums avec mon lien VIP : ${vipUrl}`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-3 rounded-xl font-semibold text-xs bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 flex items-center justify-center gap-1.5 transition-colors"
            >
              <MessageCircle size={16} />
              <span className="hidden sm:inline">Partager WhatsApp</span>
            </a>
          </div>

          {/* QR Code expansion */}
          {showQr && (
            <div className="mt-5 p-6 bg-neutral-950 border border-neutral-800 rounded-2xl flex flex-col sm:flex-row items-center gap-6 animate-in fade-in zoom-in-95">
              <div className="bg-white p-3 rounded-xl shadow-lg">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(vipUrl)}`}
                  alt="VIP QR Code"
                  className="w-36 h-36"
                />
              </div>
              <div className="space-y-2 text-center sm:text-left">
                <h4 className="text-sm font-bold text-white">QR Code pour vos évènements et Stories</h4>
                <p className="text-xs text-neutral-400 max-w-md">
                  Téléchargez ce QR Code pour l'afficher sur vos supports imprimés, stands, pop-up stores ou vidéos YouTube/TikTok. Vos abonnés n'ont qu'à le scanner avec leur appareil photo.
                </p>
                <a
                  href={`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(vipUrl)}`}
                  target="_blank"
                  download="nay-vip-qrcode.png"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:underline pt-2"
                >
                  <Download size={14} />
                  <span>Télécharger en Haute Résolution (HD)</span>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Real-time KPI Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-neutral-900 border border-neutral-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between text-neutral-400 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">Visiteurs (Clics)</span>
              <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
                <TrendingUp size={16} />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white">{ambassador.visits}</div>
            <div className="text-[11px] text-neutral-500 mt-1 flex items-center gap-1">
              <span>Taux de conversion :</span>
              <span className="font-semibold text-neutral-300">{conversionRate}%</span>
            </div>
          </div>

          <div className="bg-neutral-900 border border-neutral-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between text-neutral-400 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">Inscriptions & Leads</span>
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                <Users size={16} />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white">{ambassador.leads || (ambassador.leadsList?.length || 0)}</div>
            <div className="text-[11px] text-neutral-500 mt-1">
              Newsletters & Comptes créés
            </div>
          </div>

          <div className="bg-neutral-900 border border-neutral-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between text-neutral-400 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">Commandes Passées</span>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <ShoppingBag size={16} />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white">{ambassador.sales}</div>
            <div className="text-[11px] text-neutral-500 mt-1 flex items-center gap-1">
              <span>CA généré :</span>
              <span className="font-semibold text-emerald-400">{formatMAD(ambassador.revenueGenerated)}</span>
            </div>
          </div>

          <div className="bg-neutral-900 border border-neutral-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between text-neutral-400 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">Commissions Gagnées</span>
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                <DollarSign size={16} />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-400">
              {formatMAD(ambassador.commissionEarned)}
            </div>
            <div className="text-[11px] text-neutral-500 mt-1 flex items-center gap-1">
              <span>Solde :</span>
              <span className="font-semibold text-white">{formatMAD(availableBalance)}</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-neutral-800 flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <ShoppingBag size={16} />
            <span>Commandes Réalisées ({ambassador.orders?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('leads')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'leads'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <Users size={16} />
            <span>Leads & Inscriptions ({ambassador.leadsList?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('payouts')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'payouts'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <Building2 size={16} />
            <span>Virements & RIB ({ambassador.payouts?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('marketing')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'marketing'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <Layers size={16} />
            <span>Kit Marketing & UGC</span>
          </button>
        </div>

        {/* Tab 1: Orders Tab */}
        {activeTab === 'orders' && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/40">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Historique des Ventes Recommandées
              </h3>
              <span className="text-xs text-neutral-400">Total : {ambassador.orders?.length || 0} commandes</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-neutral-950/80 border-b border-neutral-800 text-neutral-400 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4 sm:px-5">N° Commande</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Ville</th>
                    <th className="py-3 px-4">Articles</th>
                    <th className="py-3 px-4">Montant Vente</th>
                    <th className="py-3 px-4">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60 text-neutral-300">
                  {(!ambassador.orders || ambassador.orders.length === 0) ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-neutral-500">
                        <ShoppingBag size={28} className="mx-auto mb-2 opacity-30" />
                        <p className="font-semibold text-neutral-400">Aucune commande enregistrée pour le moment</p>
                        <p className="text-[11px] text-neutral-500 mt-0.5">Partagez votre lien VIP pour générer vos premières ventes !</p>
                      </td>
                    </tr>
                  ) : (
                    ambassador.orders.map((order: any) => {
                      let items: OrderItem[] = [];
                      try {
                        items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
                      } catch {}

                      return (
                        <tr key={order.id} className="hover:bg-neutral-800/40 transition-colors">
                          <td className="py-3 px-4 sm:px-5 font-mono font-bold text-amber-400">
                            #{order.orderNumber}
                          </td>
                          <td className="py-3 px-4 text-neutral-400">
                            {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </td>
                          <td className="py-3 px-4 font-medium text-neutral-300">{order.shippingCity || 'Maroc'}</td>
                          <td className="py-3 px-4">
                            <span className="text-neutral-400">
                              {items.map((it) => it.name).filter(Boolean).join(', ') || `${items.length} article(s)`}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-semibold text-white">
                            {formatMAD(order.total)}
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              Validée
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Leads Tab */}
        {activeTab === 'leads' && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/40">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Leads & Inscriptions Générées
              </h3>
              <span className="text-xs text-neutral-400">Total : {ambassador.leadsList?.length || 0} leads</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-neutral-950/80 border-b border-neutral-800 text-neutral-400 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4 sm:px-5">E-mail (Anonymisé)</th>
                    <th className="py-3 px-4">Type de Lead</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Prime Gagnée</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60 text-neutral-300">
                  {(!ambassador.leadsList || ambassador.leadsList.length === 0) ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-neutral-500">
                        <Users size={28} className="mx-auto mb-2 opacity-30" />
                        <p className="font-semibold text-neutral-400">Aucun lead enregistré pour le moment</p>
                        <p className="text-[11px] text-neutral-500 mt-0.5">Les abonnés qui s'inscrivent via votre lien apparaîtront ici.</p>
                      </td>
                    </tr>
                  ) : (
                    ambassador.leadsList.map((lead: any) => {
                      const emailMasked = lead.email 
                        ? lead.email.replace(/^(.)(.*)(@.*)$/, (_: any, a: string, b: string, c: string) => `${a}${'*'.repeat(Math.min(b.length, 5))}${c}`)
                        : 'Contact Visiteur';

                      return (
                        <tr key={lead.id} className="hover:bg-neutral-800/40 transition-colors">
                          <td className="py-3 px-4 sm:px-5 font-mono text-neutral-200">{emailMasked}</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded text-[10px] font-bold uppercase">
                              {lead.type || 'NEWSLETTER'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-neutral-400">
                            {new Date(lead.createdAt).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </td>
                          <td className="py-3 px-4 font-semibold text-emerald-400">
                            {lead.commissionEarned > 0 ? formatMAD(lead.commissionEarned) : 'Comptabilisé'}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Payouts & Banking */}
        {activeTab === 'payouts' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm uppercase tracking-wider">
                <Building2 size={18} />
                <span>Coordonnées Bancaires</span>
              </div>
              <p className="text-xs text-neutral-400">
                Vos virements sont émis directement sur ce compte bancaire ou via Cash Plus.
              </p>

              <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-3 text-xs">
                <div>
                  <span className="text-neutral-500 block text-[10px] uppercase font-bold">Banque Partenaire</span>
                  <span className="font-semibold text-white text-sm">{ambassador.bankName || 'CIH Bank / Virement Bancaire'}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[10px] uppercase font-bold">Titulaire du Compte</span>
                  <span className="font-semibold text-neutral-200">{ambassador.bankAccountName || ambassador.name}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[10px] uppercase font-bold">RIB (24 Chiffres)</span>
                  <span className="font-mono text-amber-300 font-semibold">{ambassador.bankRib || 'Non renseigné (Contactez NAY)'}</span>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href="https://wa.me/212663380011?text=Bonjour,%20je%20souhaite%20mettre%20%C3%A0%20jour%20mes%20coordonn%C3%A9es%20bancaires%20ambassadeur"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 bg-neutral-800 hover:bg-neutral-700/80 text-neutral-300 font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 border border-neutral-700 cursor-pointer"
                >
                  <MessageCircle size={14} />
                  <span>Modifier mon RIB sur WhatsApp</span>
                </a>
              </div>
            </div>

            <div className="lg:col-span-2 bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/40">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Historique des Règlements & Virements
                </h3>
                <span className="text-xs text-neutral-400">Total payé : {formatMAD(ambassador.commissionPaid || 0)}</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-neutral-950/80 border-b border-neutral-800 text-neutral-400 font-semibold uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-4 sm:px-5">Date du Virement</th>
                      <th className="py-3 px-4">Mode</th>
                      <th className="py-3 px-4">Référence</th>
                      <th className="py-3 px-4">Montant Versé</th>
                      <th className="py-3 px-4">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60 text-neutral-300">
                    {(!ambassador.payouts || ambassador.payouts.length === 0) ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-neutral-500">
                          <Building2 size={28} className="mx-auto mb-2 opacity-30" />
                          <p className="font-semibold text-neutral-400">Aucun virement pour l'instant</p>
                          <p className="text-[11px] text-neutral-500 mt-0.5">Dès que vous demandez un retrait et qu'il est validé, il figurera ici.</p>
                        </td>
                      </tr>
                    ) : (
                      ambassador.payouts.map((p: any) => (
                        <tr key={p.id} className="hover:bg-neutral-800/40 transition-colors">
                          <td className="py-3 px-4 sm:px-5 text-neutral-300">
                            {new Date(p.paidAt).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </td>
                          <td className="py-3 px-4 font-semibold text-neutral-200">{p.method || 'Virement Bancaire'}</td>
                          <td className="py-3 px-4 font-mono text-amber-300">{p.reference || 'VIR-NAY-' + p.id.slice(0, 6)}</td>
                          <td className="py-3 px-4 font-bold text-emerald-400">{formatMAD(p.amount)}</td>
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center gap-1 text-emerald-400 text-[10px] font-bold uppercase">
                              <CheckCircle2 size={12} /> Payé
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Marketing Kit & UGC Assets */}
        {activeTab === 'marketing' && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
            <div>
              <div className="flex items-center gap-2 text-amber-400 mb-1">
                <Sparkles size={18} />
                <h3 className="text-base font-bold uppercase tracking-wider text-white">Kit Créatif & Supports de Communication</h3>
              </div>
              <p className="text-xs text-neutral-400">
                Utilisez ces ressources officielles pour créer vos stories, réels, vidéos TikTok et posts sponsorisés NAY Parfums.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              {/* Card 1 */}
              <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 flex flex-col justify-between">
                <div>
                  <div className="h-32 bg-neutral-900 rounded-xl flex items-center justify-center border border-neutral-800/80 mb-4 overflow-hidden relative">
                    <div className="text-center">
                      <span className="font-serif font-black text-xl text-white tracking-widest">NAY PARFUMS</span>
                      <span className="block text-[10px] text-amber-400 uppercase tracking-widest mt-1">Logo Officiel Transparent</span>
                    </div>
                  </div>
                  <h4 className="text-sm font-bold text-white">Pack Logos Officiels (PNG & SVG)</h4>
                  <p className="text-xs text-neutral-400 mt-1">
                    Logos NAY Parfums en haute définition avec fond transparent pour incrustation vidéo et montages.
                  </p>
                </div>
                <a
                  href="/icon.png"
                  download="nay-parfums-logo.png"
                  className="mt-4 w-full py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Download size={14} />
                  <span>Télécharger le Logo</span>
                </a>
              </div>

              {/* Card 2 */}
              <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 flex flex-col justify-between">
                <div>
                  <div className="h-32 bg-neutral-900 rounded-xl flex items-center justify-center border border-neutral-800/80 mb-4 p-4 text-center">
                    <p className="text-xs italic text-amber-200/90 font-serif">
                      "100% Originaux & Testeurs de Luxe. Livraison 24-48h partout au Maroc avec paiement à la livraison 🇲🇦"
                    </p>
                  </div>
                  <h4 className="text-sm font-bold text-white">Accroches Stories & Captions TikTok</h4>
                  <p className="text-xs text-neutral-400 mt-1">
                    Textes percutants prêts à copier-coller pour maximiser vos clics et taux de conversion.
                  </p>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `Découvrez des parfums 100% authentiques et testeurs de luxe chez NAY Parfums ! ✨\nLivraison rapide et paiement à la livraison partout au Maroc 🇲🇦\nCommandez directement via mon lien VIP : ${vipUrl}`
                    );
                    alert('Texte d\'accroche copié dans le presse-papiers !');
                  }}
                  className="mt-4 w-full py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Copy size={14} />
                  <span>Copier le Texte d'Accroche</span>
                </button>
              </div>

              {/* Card 3 */}
              <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 flex flex-col justify-between">
                <div>
                  <div className="h-32 bg-neutral-900 rounded-xl flex items-center justify-center border border-neutral-800/80 mb-4 text-center p-4">
                    <ShieldCheck size={32} className="text-amber-400 mb-1" />
                  </div>
                  <h4 className="text-sm font-bold text-white">Garantie d'Authenticité NAY</h4>
                  <p className="text-xs text-neutral-400 mt-1">
                    Tous nos parfums sont certifiés originaux avec tenue garantie et vérification avant paiement par vos abonnés.
                  </p>
                </div>
                <a
                  href="/fr/shop"
                  target="_blank"
                  className="mt-4 w-full py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ExternalLink size={14} />
                  <span>Voir le Catalogue Complet</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Payout Withdrawal Request Modal */}
      {payoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-base">
                <Wallet size={20} />
                <span>Demande de Virement</span>
              </div>
              <button
                onClick={() => setPayoutModalOpen(false)}
                className="text-neutral-500 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {payoutSuccess ? (
              <div className="p-4 bg-emerald-950/60 border border-emerald-800/80 rounded-2xl text-emerald-300 text-xs text-center space-y-2">
                <CheckCircle2 size={24} className="mx-auto text-emerald-400" />
                <p className="font-semibold">{payoutSuccess}</p>
              </div>
            ) : (
              <form onSubmit={handleRequestPayout} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-neutral-400 mb-1">
                    Montant à virer (MAD)
                  </label>
                  <input
                    type="number"
                    required
                    min="50"
                    max={availableBalance}
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-white font-bold text-lg focus:outline-none focus:border-amber-500"
                  />
                  <span className="text-[11px] text-neutral-500 mt-1 block">
                    Solde maximum disponible : {formatMAD(availableBalance)}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-neutral-400 mb-1">
                    RIB de Destination (24 Chiffres)
                  </label>
                  <input
                    type="text"
                    defaultValue={ambassador.bankRib || ''}
                    disabled
                    className="w-full px-4 py-2.5 bg-neutral-950/60 border border-neutral-800 text-neutral-400 font-mono text-xs rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-neutral-400 mb-1">
                    Note ou Message additionnel (Optionnel)
                  </label>
                  <textarea
                    rows={2}
                    value={payoutNote}
                    onChange={(e) => setPayoutNote(e.target.value)}
                    placeholder="Ex: Merci de virer sur mon compte CIH"
                    className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setPayoutModalOpen(false)}
                    className="flex-1 py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={payoutLoading || availableBalance <= 0}
                    className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold rounded-xl text-xs transition-all shadow-lg flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {payoutLoading ? 'Envoi...' : 'Confirmer le Retrait'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
