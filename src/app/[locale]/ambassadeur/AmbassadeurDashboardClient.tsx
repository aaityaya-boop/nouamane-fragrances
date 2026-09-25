'use client';

import React, { useState, useRef, useEffect } from 'react';
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
  CheckCircle2,
  Clock,
  ChevronRight,
  Layers,
  FileText,
  Settings,
  Camera,
  Upload,
  Eye,
  Image as ImageIcon,
  Key,
  Smartphone,
  X
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatMAD } from '@/lib/products';

import Image from 'next/image';

interface OrderItem {
  name?: string;
  quantity?: number;
  price?: number;
}

export default function AmbassadeurDashboardClient({ ambassador: initialAmbassador }: { ambassador: any }) {
  const router = useRouter();
  const [ambassador, setAmbassador] = useState(initialAmbassador);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'orders' | 'leads' | 'payouts' | 'marketing'>('orders');
  const [showQr, setShowQr] = useState(false);
  const [origin, setOrigin] = useState('https://nayparfum.ma');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  // Settings / Profile Modal State
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: ambassador.name || '',
    code: ambassador.code || '',
    phone: ambassador.phone || '',
    instagram: ambassador.instagram || '',
    tiktok: ambassador.tiktok || '',
    avatar: ambassador.avatar || '',
    bankName: ambassador.bankName || 'CIH Bank',
    bankAccountName: ambassador.bankAccountName || ambassador.name || '',
    bankRib: ambassador.bankRib || '',
    cinNumber: ambassador.cinNumber || '',
    newPassword: '',
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Payout Request Modal
  const [payoutModalOpen, setPayoutModalOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState<number>(0);
  const [payoutNote, setPayoutNote] = useState('');
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [payoutSuccess, setPayoutSuccess] = useState<string | null>(null);

  // Proof image viewer modal
  const [viewProofUrl, setViewProofUrl] = useState<string | null>(null);

  const vipUrl = `${origin}/vip/${ambassador.code}`;

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

  // Avatar Upload Handler
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/ambassadeur/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        setProfileForm((prev) => ({ ...prev, avatar: data.url }));
      } else {
        alert(data.error || 'Erreur lors de l\'upload de la photo');
      }
    } catch {
      alert('Erreur de connexion');
    } finally {
      setAvatarUploading(false);
    }
  };

  // Profile Save Handler
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);

    try {
      const res = await fetch('/api/ambassadeur/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm),
      });

      const data = await res.json();
      if (res.ok) {
        setAmbassador((prev: any) => ({ ...prev, ...data.ambassador }));
        alert('Vos informations et coordonnées ont été mises à jour avec succès !');
        setSettingsOpen(false);
        router.refresh();
      } else {
        alert(data.error || 'Erreur lors de la mise à jour');
      }
    } catch {
      alert('Erreur de connexion');
    } finally {
      setSavingProfile(false);
    }
  };

  // Payout Request Handler
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

  // Compensation Badge renderer
  const renderCompensationBadge = () => {
    const type = ambassador.commissionType || 'PERCENTAGE';
    if (type === 'PERCENTAGE') {
      return (
        <span className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-800 px-2.5 py-1 rounded-full text-xs font-semibold">
          <Sparkles size={13} className="text-amber-600" />
          <span>Contrat : {ambassador.commissionRate}% sur chaque vente</span>
        </span>
      );
    }
    if (type === 'FIXED_PER_ORDER') {
      return (
        <span className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 px-2.5 py-1 rounded-full text-xs font-semibold">
          <DollarSign size={13} className="text-emerald-600" />
          <span>Prime Fixe : {ambassador.fixedPerOrder} MAD par commande validée</span>
        </span>
      );
    }
    if (type === 'PAY_PER_VISIT') {
      return (
        <span className="inline-flex items-center gap-1.5 bg-sky-50 border border-sky-200 text-sky-800 px-2.5 py-1 rounded-full text-xs font-semibold">
          <TrendingUp size={13} className="text-sky-600" />
          <span>Rémunération au Clic : {ambassador.payPerVisit} MAD par visiteur</span>
        </span>
      );
    }
    if (type === 'PAY_PER_LEAD') {
      return (
        <span className="inline-flex items-center gap-1.5 bg-purple-50 border border-purple-200 text-purple-800 px-2.5 py-1 rounded-full text-xs font-semibold">
          <Users size={13} className="text-purple-600" />
          <span>Rémunération au Lead : {ambassador.payPerLead} MAD par inscription</span>
        </span>
      );
    }
    if (type === 'MONTHLY_RETAINER') {
      return (
        <span className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-800 px-2.5 py-1 rounded-full text-xs font-semibold">
          <Award size={13} className="text-amber-600" />
          <span>Forfait Mensuel Fixe : {formatMAD(ambassador.monthlyRetainer)} / mois</span>
        </span>
      );
    }
    if (type === 'HYBRID') {
      return (
        <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-50 to-emerald-50 border border-amber-200 text-neutral-800 px-2.5 py-1 rounded-full text-xs font-semibold">
          <Sparkles size={13} className="text-amber-600" />
          <span>Contrat Hybride : {ambassador.commissionRate}% + {ambassador.fixedPerOrder} MAD/commande</span>
        </span>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-neutral-50/70 text-neutral-900 pb-24 font-sans">
      {/* Top Header matching Admin Panel design */}
      <header className="border-b border-neutral-200 bg-white sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white border border-sky-200 p-1.5 flex items-center justify-center shadow-2xs">
              <Image 
                src="/images/nay/nay-logo-blue.png" 
                alt="NAY Logo" 
                width={26} 
                height={26}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-neutral-900 tracking-wider text-xs sm:text-sm">NAY PARFUMS</span>
                <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full">
                  VIP Ambassadeur
                </span>
              </div>
              <div className="text-[10px] text-neutral-400 font-medium">
                Maison de Luxe • Espace Partenaires
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setProfileForm({
                  name: ambassador.name || '',
                  code: ambassador.code || '',
                  phone: ambassador.phone || '',
                  instagram: ambassador.instagram || '',
                  tiktok: ambassador.tiktok || '',
                  avatar: ambassador.avatar || '',
                  bankName: ambassador.bankName || 'CIH Bank',
                  bankAccountName: ambassador.bankAccountName || ambassador.name || '',
                  bankRib: ambassador.bankRib || '',
                  cinNumber: ambassador.cinNumber || '',
                  newPassword: '',
                });
                setSettingsOpen(true);
              }}
              className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-neutral-200"
            >
              <Settings size={14} />
              <span className="hidden sm:inline">Modifier Profil & RIB</span>
            </button>

            <div className="flex items-center gap-2 pl-2 border-l border-neutral-200">
              {ambassador.avatar ? (
                <img
                  src={ambassador.avatar}
                  alt={ambassador.name}
                  className="w-8 h-8 rounded-full object-cover border border-neutral-200"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-700 font-bold flex items-center justify-center text-xs">
                  {ambassador.name?.charAt(0) || 'A'}
                </div>
              )}
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-neutral-900 leading-tight">{ambassador.name}</span>
                <span className="text-[10px] text-neutral-500 font-mono">@{ambassador.code}</span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 rounded-lg bg-white hover:bg-neutral-100 text-neutral-600 hover:text-neutral-900 transition-colors border border-neutral-200 flex items-center gap-1.5 text-xs font-medium cursor-pointer"
              title="Déconnexion"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Quitter</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 space-y-6">
        {/* Welcome & Deal Ribbon (Light theme) */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-7 shadow-2xs relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="text-xs text-neutral-500">Bienvenue sur votre espace privé,</span>
                <span className="text-xs font-bold text-neutral-900">{ambassador.name}</span>
                {ambassador.instagram && (
                  <span className="text-xs text-neutral-400 font-mono">(@{ambassador.instagram})</span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
                Suivi de vos Performances
              </h1>
              <p className="text-xs sm:text-sm text-neutral-500 mt-1 max-w-xl">
                Partagez votre lien exclusif auprès de votre communauté. Vos gains sont calculés automatiquement et disponibles pour virement.
              </p>
              <div className="mt-3.5 flex flex-wrap items-center gap-2">
                {renderCompensationBadge()}
              </div>
            </div>

            {/* Solde Card */}
            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-5 flex flex-col justify-between sm:min-w-[280px]">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 block">
                  Solde Disponible à Virer
                </span>
                <div className="text-3xl font-extrabold text-neutral-900 mt-1">
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
                className="mt-4 w-full py-2.5 px-4 bg-neutral-900 hover:bg-black disabled:opacity-40 text-white font-bold rounded-xl text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Wallet size={14} />
                <span>Demander un virement</span>
              </button>
            </div>
          </div>
        </div>

        {/* VIP Link Card (Sharing Station) */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-5 sm:p-6 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-neutral-100 text-neutral-800 border border-neutral-200">
                <Share2 size={16} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">Votre Lien VIP Exclusif</h3>
                <p className="text-xs text-neutral-500">À placer en bio Instagram, TikTok, description YouTube ou stories.</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowQr(!showQr)}
                className="px-3 py-1.5 bg-neutral-50 hover:bg-neutral-100 text-neutral-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-neutral-200 transition-colors cursor-pointer"
              >
                <QrCode size={14} />
                <span>{showQr ? 'Masquer QR' : 'Afficher QR Code'}</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
            <div className="flex-1 bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs sm:text-sm font-mono text-neutral-900 overflow-x-auto">
              <span suppressHydrationWarning className="truncate font-semibold">{vipUrl}</span>
            </div>

            <button
              onClick={copyVipLink}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                copied
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-neutral-900 text-white hover:bg-black shadow-xs'
              }`}
            >
              {copied ? <Check size={15} /> : <Copy size={15} />}
              <span>{copied ? 'Lien Copié !' : 'Copier le Lien'}</span>
            </button>

            <a
              href={`https://wa.me/?text=${encodeURIComponent(
                `✨ Découvrez la collection exclusive de parfums authentiques chez NAY Parfums avec mon lien VIP : ${vipUrl}`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 rounded-xl font-semibold text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center justify-center gap-1.5 transition-colors"
            >
              <MessageCircle size={15} />
              <span className="hidden sm:inline">Partager WhatsApp</span>
            </a>
          </div>

          {/* QR Code expansion */}
          {showQr && (
            <div className="mt-4 p-5 bg-neutral-50 border border-neutral-200 rounded-xl flex flex-col sm:flex-row items-center gap-5 animate-in fade-in">
              <div className="bg-white p-2.5 rounded-xl shadow-2xs border border-neutral-200">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(vipUrl)}`}
                  alt="VIP QR Code"
                  className="w-32 h-32"
                />
              </div>
              <div className="space-y-1.5 text-center sm:text-left">
                <h4 className="text-xs font-bold text-neutral-900 uppercase">QR Code pour vos évènements et Stories</h4>
                <p className="text-xs text-neutral-500 max-w-md">
                  Téléchargez ce QR Code pour vos stories ou vidéos. Vos abonnés n'ont qu'à le scanner pour être rattachés à votre profil.
                </p>
                <a
                  href={`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(vipUrl)}`}
                  target="_blank"
                  download="nay-vip-qrcode.png"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-900 hover:underline pt-1"
                >
                  <Download size={13} />
                  <span>Télécharger en Haute Définition</span>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Real-time KPI Stats Grid (Light Theme) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-2xs">
            <span className="text-[11px] text-neutral-500 font-medium block">Visiteurs (Clics)</span>
            <div className="text-2xl font-bold text-neutral-900 mt-1">{ambassador.visits}</div>
            <div className="text-[10px] text-neutral-400 mt-0.5">
              Taux conversion : <strong className="text-neutral-700">{conversionRate}%</strong>
            </div>
          </div>

          <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-2xs">
            <span className="text-[11px] text-neutral-500 font-medium block">Inscriptions & Leads</span>
            <div className="text-2xl font-bold text-purple-700 mt-1">{ambassador.leads || (ambassador.leadsList?.length || 0)}</div>
            <div className="text-[10px] text-neutral-400 mt-0.5">
              Newsletters & Comptes créés
            </div>
          </div>

          <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-2xs">
            <span className="text-[11px] text-neutral-500 font-medium block">Commandes Passées</span>
            <div className="text-2xl font-bold text-neutral-900 mt-1">{ambassador.sales}</div>
            <div className="text-[10px] text-neutral-400 mt-0.5">
              CA généré : <strong className="text-emerald-700">{formatMAD(ambassador.revenueGenerated)}</strong>
            </div>
          </div>

          <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-2xs">
            <span className="text-[11px] text-neutral-500 font-medium block">Commissions Gagnées</span>
            <div className="text-2xl font-bold text-amber-700 mt-1">
              {formatMAD(ambassador.commissionEarned)}
            </div>
            <div className="text-[10px] text-neutral-400 mt-0.5">
              Solde disponible : <strong className="text-neutral-900">{formatMAD(availableBalance)}</strong>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-neutral-200 flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-neutral-900 text-white shadow-2xs'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            <ShoppingBag size={14} />
            <span>Commandes Réalisées ({ambassador.orders?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('leads')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'leads'
                ? 'bg-neutral-900 text-white shadow-2xs'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            <Users size={14} />
            <span>Leads & Inscriptions ({ambassador.leadsList?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('payouts')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'payouts'
                ? 'bg-neutral-900 text-white shadow-2xs'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            <Building2 size={14} />
            <span>Virements & Justificatifs ({ambassador.payouts?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('marketing')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'marketing'
                ? 'bg-neutral-900 text-white shadow-2xs'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            <Layers size={14} />
            <span>Kit Marketing & UGC</span>
          </button>
        </div>

        {/* Tab 1: Orders Tab */}
        {activeTab === 'orders' && (
          <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-2xs">
            <div className="p-4 border-b border-neutral-200 bg-neutral-50/50 flex items-center justify-between">
              <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                Historique des Ventes Recommandées
              </h3>
              <span className="text-xs text-neutral-500">Total : {ambassador.orders?.length || 0} commandes</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-2.5 px-4 sm:px-5">N° Commande</th>
                    <th className="py-2.5 px-4">Date</th>
                    <th className="py-2.5 px-4">Ville</th>
                    <th className="py-2.5 px-4">Articles</th>
                    <th className="py-2.5 px-4">Montant Vente</th>
                    <th className="py-2.5 px-4">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-neutral-700">
                  {(!ambassador.orders || ambassador.orders.length === 0) ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-neutral-400">
                        <ShoppingBag size={28} className="mx-auto mb-2 opacity-30" />
                        <p className="font-semibold text-neutral-700">Aucune commande enregistrée pour le moment</p>
                        <p className="text-[11px] text-neutral-400 mt-0.5">Partagez votre lien VIP pour générer vos premières ventes !</p>
                      </td>
                    </tr>
                  ) : (
                    ambassador.orders.map((order: any) => {
                      let items: OrderItem[] = [];
                      try {
                        items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
                      } catch {}

                      return (
                        <tr key={order.id} className="hover:bg-neutral-50/60 transition-colors">
                          <td className="py-2.5 px-4 sm:px-5 font-mono font-bold text-neutral-900">
                            #{order.orderNumber}
                          </td>
                          <td className="py-2.5 px-4 text-neutral-500">
                            {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </td>
                          <td className="py-2.5 px-4 font-medium text-neutral-800">{order.shippingCity || 'Maroc'}</td>
                          <td className="py-2.5 px-4">
                            <span className="text-neutral-600">
                              {items.map((it) => it.name).filter(Boolean).join(', ') || `${items.length} article(s)`}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 font-bold text-neutral-900">
                            {formatMAD(order.total)}
                          </td>
                          <td className="py-2.5 px-4">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
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
          <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-2xs">
            <div className="p-4 border-b border-neutral-200 bg-neutral-50/50 flex items-center justify-between">
              <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                Leads & Inscriptions Générées
              </h3>
              <span className="text-xs text-neutral-500">Total : {ambassador.leadsList?.length || 0} leads</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-2.5 px-4 sm:px-5">E-mail (Anonymisé)</th>
                    <th className="py-2.5 px-4">Type de Lead</th>
                    <th className="py-2.5 px-4">Date</th>
                    <th className="py-2.5 px-4">Prime Comptabilisée</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-neutral-700">
                  {(!ambassador.leadsList || ambassador.leadsList.length === 0) ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-neutral-400">
                        <Users size={28} className="mx-auto mb-2 opacity-30" />
                        <p className="font-semibold text-neutral-700">Aucun lead enregistré pour le moment</p>
                        <p className="text-[11px] text-neutral-400 mt-0.5">Les abonnés qui s'inscrivent via votre lien apparaîtront ici.</p>
                      </td>
                    </tr>
                  ) : (
                    ambassador.leadsList.map((lead: any) => {
                      const emailMasked = lead.email 
                        ? lead.email.replace(/^(.)(.*)(@.*)$/, (_: any, a: string, b: string, c: string) => `${a}${'*'.repeat(Math.min(b.length, 5))}${c}`)
                        : 'Contact Visiteur';

                      return (
                        <tr key={lead.id} className="hover:bg-neutral-50/60 transition-colors">
                          <td className="py-2.5 px-4 sm:px-5 font-mono text-neutral-800">{emailMasked}</td>
                          <td className="py-2.5 px-4">
                            <span className="px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded text-[10px] font-bold uppercase">
                              {lead.type || 'NEWSLETTER'}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-neutral-500">
                            {new Date(lead.createdAt).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </td>
                          <td className="py-2.5 px-4 font-bold text-emerald-700">
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

        {/* Tab 3: Payouts & Banking with Proof of Virement (Light Theme) */}
        {activeTab === 'payouts' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <div className="flex items-center gap-2 text-neutral-900 font-bold text-xs uppercase tracking-wider">
                  <Building2 size={16} className="text-amber-600" />
                  <span>Coordonnées Bancaires</span>
                </div>
                <button
                  onClick={() => setSettingsOpen(true)}
                  className="text-[11px] font-semibold text-neutral-700 hover:text-neutral-900 underline cursor-pointer"
                >
                  Modifier
                </button>
              </div>

              <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200 space-y-2.5 text-xs">
                <div>
                  <span className="text-neutral-500 block text-[10px] uppercase font-bold">Banque Partenaire</span>
                  <span className="font-bold text-neutral-900 text-sm">{ambassador.bankName || 'CIH Bank / Virement Bancaire'}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[10px] uppercase font-bold">Titulaire du Compte</span>
                  <span className="font-semibold text-neutral-800">{ambassador.bankAccountName || ambassador.name}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[10px] uppercase font-bold">RIB (24 Chiffres)</span>
                  <span className="font-mono text-neutral-900 font-bold text-[11px] block bg-white p-2 rounded border border-neutral-200">
                    {ambassador.bankRib || 'Non renseigné (Cliquez sur Modifier)'}
                  </span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-2xs">
              <div className="p-4 border-b border-neutral-200 bg-neutral-50/50 flex items-center justify-between">
                <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                  Historique des Règlements & Justificatifs Bancaires
                </h3>
                <span className="text-xs text-neutral-500">Total payé : {formatMAD(ambassador.commissionPaid || 0)}</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-semibold uppercase tracking-wider text-[11px]">
                      <th className="py-2.5 px-4 sm:px-5">Date du Virement</th>
                      <th className="py-2.5 px-4">Mode</th>
                      <th className="py-2.5 px-4">Référence</th>
                      <th className="py-2.5 px-4">Montant Versé</th>
                      <th className="py-2.5 px-4 text-center">Justificatif / Reçu</th>
                      <th className="py-2.5 px-4">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 text-neutral-700">
                    {(!ambassador.payouts || ambassador.payouts.length === 0) ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-neutral-400">
                          <Building2 size={28} className="mx-auto mb-2 opacity-30" />
                          <p className="font-semibold text-neutral-700">Aucun virement pour l'instant</p>
                          <p className="text-[11px] text-neutral-400 mt-0.5">Dès que l'administration NAY émet un virement, le justificatif figurera ici.</p>
                        </td>
                      </tr>
                    ) : (
                      ambassador.payouts.map((p: any) => (
                        <tr key={p.id} className="hover:bg-neutral-50/60 transition-colors">
                          <td className="py-2.5 px-4 sm:px-5 text-neutral-600">
                            {new Date(p.paidAt).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </td>
                          <td className="py-2.5 px-4 font-semibold text-neutral-800">{p.method || 'Virement Bancaire'}</td>
                          <td className="py-2.5 px-4 font-mono text-neutral-700">{p.reference || 'VIR-NAY-' + p.id.slice(0, 6)}</td>
                          <td className="py-2.5 px-4 font-bold text-emerald-700">{formatMAD(p.amount)}</td>
                          <td className="py-2.5 px-4 text-center">
                            {p.proofUrl ? (
                              <button
                                onClick={() => setViewProofUrl(p.proofUrl)}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded text-[11px] font-semibold transition-colors cursor-pointer"
                              >
                                <Eye size={12} />
                                <span>Voir Reçu</span>
                              </button>
                            ) : (
                              <span className="text-[11px] text-neutral-400 italic">Virement direct</span>
                            )}
                          </td>
                          <td className="py-2.5 px-4">
                            <span className="inline-flex items-center gap-1 text-emerald-700 text-[10px] font-bold uppercase bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              <CheckCircle2 size={11} /> Payé
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

        {/* Tab 4: Marketing Kit */}
        {activeTab === 'marketing' && (
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-7 shadow-2xs space-y-6">
            <div>
              <div className="flex items-center gap-2 text-neutral-900 mb-1">
                <Sparkles size={16} className="text-amber-600" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900">Kit Créatif & Supports de Communication</h3>
              </div>
              <p className="text-xs text-neutral-500">
                Utilisez ces ressources officielles pour créer vos stories, réels, vidéos TikTok et posts sponsorisés NAY Parfums.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-1">
              <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <div className="h-28 bg-white rounded-lg flex items-center justify-center border border-neutral-200 mb-3 overflow-hidden">
                    <div className="text-center">
                      <span className="font-serif font-black text-lg text-neutral-900 tracking-widest">NAY PARFUMS</span>
                      <span className="block text-[9px] text-neutral-500 uppercase tracking-widest mt-0.5">Logo Officiel Transparent</span>
                    </div>
                  </div>
                  <h4 className="text-xs font-bold text-neutral-900 uppercase">Pack Logos Officiels (PNG & SVG)</h4>
                  <p className="text-xs text-neutral-500 mt-1">
                    Logos NAY Parfums en haute définition avec fond transparent pour incrustation vidéo et montages.
                  </p>
                </div>
                <a
                  href="/icon.png"
                  download="nay-parfums-logo.png"
                  className="mt-3 w-full py-2 bg-neutral-900 hover:bg-black text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Download size={13} />
                  <span>Télécharger le Logo</span>
                </a>
              </div>

              <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <div className="h-28 bg-white rounded-lg flex items-center justify-center border border-neutral-200 mb-3 p-3 text-center">
                    <p className="text-xs italic text-neutral-800 font-serif">
                      "100% Originaux & Testeurs de Luxe. Livraison 24-48h partout au Maroc avec paiement à la livraison 🇲🇦"
                    </p>
                  </div>
                  <h4 className="text-xs font-bold text-neutral-900 uppercase">Accroches Stories & Captions TikTok</h4>
                  <p className="text-xs text-neutral-500 mt-1">
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
                  className="mt-3 w-full py-2 bg-white hover:bg-neutral-100 text-neutral-900 border border-neutral-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Copy size={13} />
                  <span>Copier le Texte d'Accroche</span>
                </button>
              </div>

              <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <div className="h-28 bg-white rounded-lg flex items-center justify-center border border-neutral-200 mb-3 text-center p-3">
                    <ShieldCheck size={28} className="text-emerald-600 mb-1" />
                  </div>
                  <h4 className="text-xs font-bold text-neutral-900 uppercase">Garantie d'Authenticité NAY</h4>
                  <p className="text-xs text-neutral-500 mt-1">
                    Tous nos parfums sont certifiés originaux avec tenue garantie et vérification avant paiement par vos abonnés.
                  </p>
                </div>
                <a
                  href="/fr/shop"
                  target="_blank"
                  className="mt-3 w-full py-2 bg-white hover:bg-neutral-100 text-neutral-900 border border-neutral-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ExternalLink size={13} />
                  <span>Voir le Catalogue</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* SETTINGS / PROFILE MODAL (Ambassador Self-Service) */}
      {settingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-2xs animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 sm:p-7 max-w-xl w-full shadow-2xl border border-neutral-200 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2 text-neutral-900 font-bold text-sm">
                <Settings size={18} className="text-neutral-700" />
                <span>Modifier mes Coordonnées & Lien VIP</span>
              </div>
              <button
                onClick={() => setSettingsOpen(false)}
                className="p-1 rounded-md text-neutral-400 hover:text-neutral-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              {/* Avatar Upload */}
              <div className="flex items-center gap-4 p-3.5 bg-neutral-50 rounded-xl border border-neutral-200">
                <div className="relative">
                  {profileForm.avatar ? (
                    <img
                      src={profileForm.avatar}
                      alt="Avatar"
                      className="w-14 h-14 rounded-full object-cover border border-neutral-300"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-neutral-200 text-neutral-700 font-bold flex items-center justify-center text-base">
                      {profileForm.name?.charAt(0) || 'A'}
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <span className="block font-semibold text-neutral-900 mb-0.5">Photo de Profil</span>
                  <p className="text-[11px] text-neutral-500 mb-2">Image JPG ou PNG pour personnaliser votre portail.</p>
                  <input
                    type="file"
                    ref={avatarInputRef}
                    onChange={handleAvatarChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={avatarUploading}
                    className="px-3 py-1.5 bg-white hover:bg-neutral-100 text-neutral-800 border border-neutral-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Camera size={13} />
                    <span>{avatarUploading ? 'Upload en cours...' : 'Changer la photo'}</span>
                  </button>
                </div>
              </div>

              {/* Code VIP / Lien */}
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Votre Code VIP personnalisé (Lien de partage) *
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-neutral-200 bg-neutral-50 text-neutral-500 font-mono text-xs">
                    nayparfum.ma/vip/
                  </span>
                  <input
                    type="text"
                    required
                    value={profileForm.code}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        code: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''),
                      })
                    }
                    placeholder="votre_nom"
                    className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-xl border border-neutral-200 font-mono font-bold text-neutral-900 text-xs focus:outline-none focus:border-neutral-900"
                  />
                </div>
                <span className="text-[10px] text-neutral-500 mt-1 block">
                  En modifiant ce code, votre lien VIP changera instantanément.
                </span>
              </div>

              {/* Phone & Social */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Téléphone / WhatsApp</label>
                  <input
                    type="text"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    placeholder="06XXXXXXXX"
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Compte Instagram (@)</label>
                  <input
                    type="text"
                    value={profileForm.instagram}
                    onChange={(e) => setProfileForm({ ...profileForm, instagram: e.target.value })}
                    placeholder="pseudo_insta"
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Coordonnées Bancaires (RIB) */}
              <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-3">
                <div className="flex items-center gap-1.5 font-bold text-neutral-900 uppercase text-[11px]">
                  <Building2 size={14} className="text-amber-600" />
                  <span>Informations Bancaires pour les Virements</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">Banque</label>
                    <input
                      type="text"
                      value={profileForm.bankName}
                      onChange={(e) => setProfileForm({ ...profileForm, bankName: e.target.value })}
                      placeholder="Ex: CIH Bank, Attijariwafa..."
                      className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">Titulaire du Compte</label>
                    <input
                      type="text"
                      value={profileForm.bankAccountName}
                      onChange={(e) => setProfileForm({ ...profileForm, bankAccountName: e.target.value })}
                      placeholder="Nom figurant sur l'attestation RIB"
                      className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">RIB Bancaire (24 Chiffres)</label>
                  <input
                    type="text"
                    value={profileForm.bankRib}
                    onChange={(e) => setProfileForm({ ...profileForm, bankRib: e.target.value })}
                    placeholder="Ex: 230 780 4567890123456789 12"
                    className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-lg font-mono text-xs"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Nouveau Mot de Passe (Laisser vide si inchangé)
                </label>
                <input
                  type="password"
                  value={profileForm.newPassword}
                  onChange={(e) => setProfileForm({ ...profileForm, newPassword: e.target.value })}
                  placeholder="Min 6 caractères"
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-xs"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setSettingsOpen(false)}
                  className="flex-1 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="flex-1 py-2.5 bg-neutral-900 hover:bg-black text-white rounded-xl font-semibold shadow-xs disabled:opacity-50"
                >
                  {savingProfile ? 'Enregistrement...' : 'Sauvegarder mes modifications'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payout Withdrawal Request Modal */}
      {payoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-2xs animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-neutral-200 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2 text-neutral-900 font-bold text-sm">
                <Wallet size={16} className="text-amber-600" />
                <span>Demande de Virement de Commission</span>
              </div>
              <button
                onClick={() => setPayoutModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                ✕
              </button>
            </div>

            {payoutSuccess ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs text-center space-y-2">
                <CheckCircle2 size={24} className="mx-auto text-emerald-600" />
                <p className="font-semibold">{payoutSuccess}</p>
              </div>
            ) : (
              <form onSubmit={handleRequestPayout} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Montant à virer (MAD) *
                  </label>
                  <input
                    type="number"
                    required
                    min="50"
                    max={availableBalance}
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl font-bold text-lg text-neutral-900 focus:outline-none focus:border-neutral-900"
                  />
                  <span className="text-[11px] text-neutral-500 mt-1 block">
                    Solde maximum disponible : {formatMAD(availableBalance)}
                  </span>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    RIB de Destination (24 Chiffres)
                  </label>
                  <input
                    type="text"
                    defaultValue={ambassador.bankRib || ''}
                    disabled
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 text-neutral-500 font-mono text-xs rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Note ou Message additionnel (Optionnel)
                  </label>
                  <textarea
                    rows={2}
                    value={payoutNote}
                    onChange={(e) => setPayoutNote(e.target.value)}
                    placeholder="Ex: Virement sur mon compte CIH Bank"
                    className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs placeholder-neutral-400 focus:outline-none focus:border-neutral-900"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPayoutModalOpen(false)}
                    className="flex-1 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold rounded-xl"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={payoutLoading || availableBalance <= 0}
                    className="flex-1 py-2.5 bg-neutral-900 hover:bg-black text-white font-bold rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {payoutLoading ? 'Envoi...' : 'Confirmer le Retrait'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* PROOF OF VIREMENT LIGHTBOX MODAL */}
      {viewProofUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl p-4 sm:p-5 max-w-2xl w-full shadow-2xl border border-neutral-200 space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
              <div className="flex items-center gap-2 text-neutral-900 font-bold text-xs uppercase tracking-wider">
                <ImageIcon size={16} className="text-amber-600" />
                <span>Reçu & Justificatif Officiel de Virement NAY</span>
              </div>
              <button
                onClick={() => setViewProofUrl(null)}
                className="p-1 rounded-md text-neutral-400 hover:text-neutral-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-auto flex items-center justify-center bg-neutral-50 rounded-xl p-2">
              <img
                src={viewProofUrl}
                alt="Reçu de Virement"
                className="max-w-full max-h-[65vh] object-contain rounded-lg shadow-sm"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <a
                href={viewProofUrl}
                download="recu-virement-nay.jpg"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-neutral-900 hover:bg-black text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Download size={13} />
                <span>Télécharger le Reçu</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
