'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Save,
  Trash2,
  ArrowLeft,
  Key,
  DollarSign,
  Users,
  Percent,
  TrendingUp,
  Building2,
  Copy,
  Check,
  Sparkles,
  Share2,
  MessageCircle,
  ExternalLink,
  ShieldAlert,
  Smartphone
} from 'lucide-react';
import Link from 'next/link';

export default function AffiliateForm({ initialData }: { initialData?: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [copiedWhatsapp, setCopiedWhatsapp] = useState(false);

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    code: initialData?.code || '',
    email: initialData?.email || '',
    password: '',
    phone: initialData?.phone || '',
    instagram: initialData?.instagram || '',
    tiktok: initialData?.tiktok || '',
    status: initialData?.status || 'ACTIVE',

    commissionType: initialData?.commissionType || 'PERCENTAGE',
    commissionRate: initialData?.commissionRate ?? 10,
    fixedPerOrder: initialData?.fixedPerOrder ?? 0,
    payPerVisit: initialData?.payPerVisit ?? 0,
    payPerLead: initialData?.payPerLead ?? 0,
    monthlyRetainer: initialData?.monthlyRetainer ?? 0,

    paymentMethod: initialData?.paymentMethod || 'VIREMENT_BANCAIRE',
    bankName: initialData?.bankName || 'CIH Bank',
    bankAccountName: initialData?.bankAccountName || '',
    bankRib: initialData?.bankRib || '',
    cinNumber: initialData?.cinNumber || '',
  });

  const generatePassword = () => {
    const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$';
    let pass = 'NAY-';
    for (let i = 0; i < 8; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData((prev) => ({ ...prev, password: pass }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const url = initialData
      ? `/api/admin/affiliates/${initialData.id}`
      : '/api/admin/affiliates';

    const method = initialData ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        router.push(initialData ? `/admin/affiliates/${initialData.id}` : '/admin/affiliates');
        router.refresh();
      } else {
        alert(data.error || "Erreur lors de l'enregistrement.");
        setLoading(false);
      }
    } catch {
      alert("Erreur de connexion avec le serveur.");
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Voulez-vous vraiment supprimer cet ambassadeur ?')) return;
    setLoading(true);
    const res = await fetch(`/api/admin/affiliates/${initialData.id}`, { method: 'DELETE' });
    if (res.ok) {
      router.push('/admin/affiliates');
      router.refresh();
    } else {
      alert('Erreur lors de la suppression');
      setLoading(false);
    }
  };

  const copyWhatsappCredentials = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://nayparfum.ma';
    const loginUrl = `${origin}/fr/ambassadeur`;
    const vipUrl = `${origin}/vip/${formData.code}`;

    const text = `Bonjour ${formData.name || 'Cher Partenaire'} ! 👋\n\nBienvenue dans le Programme Ambassadeur officiel de *NAY Parfums* ✨\n\nVoici vos accès personnels pour suivre vos résultats en direct :\n🔗 *Portail Ambassadeur :* ${loginUrl}\n📧 *Email :* ${formData.email || 'Votre email'}\n🔑 *Mot de passe :* ${formData.password || '(Conservé)'}\n\n⭐ *Votre lien VIP à partager en bio & story :*\n👉 ${vipUrl}\n\nToutes vos visites, leads et ventes y sont enregistrés automatiquement avec vos commissions. N'hésitez pas si vous avez des questions !`;

    navigator.clipboard.writeText(text);
    setCopiedWhatsapp(true);
    setTimeout(() => setCopiedWhatsapp(false), 3000);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto pb-24 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <div className="flex items-center gap-3">
          <Link
            href={initialData ? `/admin/affiliates/${initialData.id}` : '/admin/affiliates'}
            className="p-2 rounded-lg bg-neutral-100 text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-neutral-900">
              {initialData ? `Modifier l'Ambassadeur : ${initialData.name}` : 'Créer un Nouvel Ambassadeur'}
            </h1>
            <p className="text-xs text-neutral-500 mt-0.5">
              Configurez le compte, les identifiants d'accès et le modèle de rémunération.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {initialData && (
            <button
              type="button"
              onClick={handleDelete}
              className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 size={14} />
              <span>Supprimer</span>
            </button>
          )}

          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-neutral-900 hover:bg-black text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
          >
            <Save size={14} />
            <span>{loading ? 'Enregistrement...' : 'Enregistrer'}</span>
          </button>
        </div>
      </div>

      {/* Quick Invite Box */}
      {formData.email && (formData.password || initialData) && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-xs">
              <MessageCircle size={20} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                Partager les Identifiants par WhatsApp
              </h4>
              <p className="text-xs text-emerald-800">
                Générez en 1 clic le message d'invitation avec le lien VIP et les accès au portail ambassadeur.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={copyWhatsappCredentials}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              copiedWhatsapp
                ? 'bg-emerald-700 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
            }`}
          >
            {copiedWhatsapp ? <Check size={14} /> : <Copy size={14} />}
            <span>{copiedWhatsapp ? 'Message Copié !' : 'Copier Message WhatsApp'}</span>
          </button>
        </div>
      )}

      {/* SECTION 1: Profil & Identifiants */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-2xs space-y-5">
        <div className="flex items-center gap-2 text-neutral-900 font-bold text-sm uppercase tracking-wider border-b border-neutral-100 pb-3">
          <Users size={16} className="text-amber-500" />
          <span>1. Profil & Identifiants de Connexion</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Nom complet de l'Ambassadeur / Créateur *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Salma Benjelloun, Simo Life..."
              className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-neutral-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Code VIP / Identifiant URL *
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-neutral-200 bg-neutral-50 text-neutral-500 text-xs font-mono">
                nayparfum.ma/vip/
              </span>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    code: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''),
                  })
                }
                placeholder="salma"
                className="flex-1 min-w-0 block w-full px-3 py-2.5 rounded-none rounded-r-xl border border-neutral-200 text-xs font-mono font-bold text-neutral-900 focus:outline-none focus:border-neutral-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Adresse E-mail (Identifiant de connexion au portail)
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="ambassadeur@exemple.com"
              className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-neutral-900"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-neutral-700">
                {initialData ? 'Nouveau Mot de Passe (Laisser vide si inchangé)' : 'Mot de Passe du Portail'}
              </label>
              <button
                type="button"
                onClick={generatePassword}
                className="text-[11px] font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
              >
                <Sparkles size={12} />
                <span>Générer</span>
              </button>
            </div>
            <div className="relative">
              <input
                type="text"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder={initialData ? '••••••••••••' : 'Définir ou générer un mot de passe'}
                className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl text-xs font-mono focus:outline-none focus:border-neutral-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Numéro de Téléphone / WhatsApp
            </label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="06XXXXXXXX ou +2126XXXXXXXX"
              className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-neutral-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Instagram (@)</label>
              <input
                type="text"
                value={formData.instagram}
                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                placeholder="salma_beauty"
                className="w-full px-3 py-2.5 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-neutral-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">TikTok (@)</label>
              <input
                type="text"
                value={formData.tiktok}
                onChange={(e) => setFormData({ ...formData, tiktok: e.target.value })}
                placeholder="salma_nay"
                className="w-full px-3 py-2.5 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-neutral-900"
              />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Modèle de Rémunération & Commission */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-2xs space-y-5">
        <div className="flex items-center gap-2 text-neutral-900 font-bold text-sm uppercase tracking-wider border-b border-neutral-100 pb-3">
          <Percent size={16} className="text-emerald-600" />
          <span>2. Modèle de Rémunération & Tarification</span>
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-700 mb-2">
            Type de Rémunération
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                id: 'PERCENTAGE',
                title: 'Pourcentage (%) par Vente',
                desc: 'Commission calculée sur le montant total des commandes passées.',
                icon: Percent,
              },
              {
                id: 'FIXED_PER_ORDER',
                title: 'Prime Fixe par Commande',
                desc: 'Montant fixe en MAD versé pour chaque commande validée.',
                icon: DollarSign,
              },
              {
                id: 'PAY_PER_VISIT',
                title: 'Rémunération au Clic / Visite',
                desc: 'Montant en MAD versé pour chaque visiteur unique amené.',
                icon: TrendingUp,
              },
              {
                id: 'PAY_PER_LEAD',
                title: 'Rémunération au Lead / Inscription',
                desc: 'Montant en MAD pour chaque abonné newsletter ou compte créé.',
                icon: Users,
              },
              {
                id: 'MONTHLY_RETAINER',
                title: 'Forfait Mensuel Fixe',
                desc: 'Salaire / contrat mensuel fixe (ex: 2 000 MAD / mois).',
                icon: Sparkles,
              },
              {
                id: 'HYBRID',
                title: 'Modèle Hybride',
                desc: 'Cumul : Pourcentage (%) + Prime Fixe par commande.',
                icon: Building2,
              },
            ].map((plan) => {
              const Icon = plan.icon;
              const isSelected = formData.commissionType === plan.id;
              return (
                <div
                  key={plan.id}
                  onClick={() => setFormData({ ...formData, commissionType: plan.id })}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-neutral-900 bg-neutral-900 text-white shadow-sm'
                      : 'border-neutral-200 bg-white hover:border-neutral-300 text-neutral-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <Icon size={16} className={isSelected ? 'text-amber-400' : 'text-neutral-600'} />
                      <span className="font-bold text-xs">{plan.title}</span>
                    </div>
                    <p className={`text-[11px] leading-relaxed ${isSelected ? 'text-neutral-300' : 'text-neutral-500'}`}>
                      {plan.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Fields for selected compensation model */}
        <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(formData.commissionType === 'PERCENTAGE' || formData.commissionType === 'HYBRID') && (
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Taux de Commission (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={formData.commissionRate}
                  onChange={(e) => setFormData({ ...formData, commissionRate: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-lg text-xs font-bold text-neutral-900 focus:outline-none focus:border-neutral-900"
                />
                <span className="absolute right-3 top-2 text-xs font-bold text-neutral-400">%</span>
              </div>
            </div>
          )}

          {(formData.commissionType === 'FIXED_PER_ORDER' || formData.commissionType === 'HYBRID') && (
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Montant Fixe par Commande (MAD)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="5"
                  value={formData.fixedPerOrder}
                  onChange={(e) => setFormData({ ...formData, fixedPerOrder: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-lg text-xs font-bold text-neutral-900 focus:outline-none focus:border-neutral-900"
                />
                <span className="absolute right-3 top-2 text-xs font-bold text-neutral-400">MAD</span>
              </div>
            </div>
          )}

          {formData.commissionType === 'PAY_PER_VISIT' && (
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Tarif par Visiteur Unique / Clic (MAD)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.payPerVisit}
                  onChange={(e) => setFormData({ ...formData, payPerVisit: Number(e.target.value) })}
                  placeholder="Ex: 0.50"
                  className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-lg text-xs font-bold text-neutral-900 focus:outline-none focus:border-neutral-900"
                />
                <span className="absolute right-3 top-2 text-xs font-bold text-neutral-400">MAD</span>
              </div>
            </div>
          )}

          {formData.commissionType === 'PAY_PER_LEAD' && (
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Prime par Inscription / Lead Récolté (MAD)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={formData.payPerLead}
                  onChange={(e) => setFormData({ ...formData, payPerLead: Number(e.target.value) })}
                  placeholder="Ex: 5"
                  className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-lg text-xs font-bold text-neutral-900 focus:outline-none focus:border-neutral-900"
                />
                <span className="absolute right-3 top-2 text-xs font-bold text-neutral-400">MAD</span>
              </div>
            </div>
          )}

          {formData.commissionType === 'MONTHLY_RETAINER' && (
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Forfait Mensuel Fixe (MAD / mois)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={formData.monthlyRetainer}
                  onChange={(e) => setFormData({ ...formData, monthlyRetainer: Number(e.target.value) })}
                  placeholder="Ex: 2000"
                  className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-lg text-xs font-bold text-neutral-900 focus:outline-none focus:border-neutral-900"
                />
                <span className="absolute right-3 top-2 text-xs font-bold text-neutral-400">MAD / mois</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 3: Coordonnées Bancaires & Statut */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-2xs space-y-5">
        <div className="flex items-center gap-2 text-neutral-900 font-bold text-sm uppercase tracking-wider border-b border-neutral-100 pb-3">
          <Building2 size={16} className="text-sky-600" />
          <span>3. Coordonnées Bancaires & Statut du Compte</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Mode de Virement Préféré
            </label>
            <select
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              className="w-full px-3 py-2.5 border border-neutral-200 rounded-xl text-xs bg-white focus:outline-none focus:border-neutral-900"
            >
              <option value="VIREMENT_BANCAIRE">Virement Bancaire (Toutes banques)</option>
              <option value="CIH">CIH Bank</option>
              <option value="ATTIJARI">Attijariwafa Bank</option>
              <option value="CASH_PLUS">Cash Plus (Espèces)</option>
              <option value="WAFA_CASH">Wafacash</option>
              <option value="OTHER">Autre</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Nom de la Banque</label>
            <input
              type="text"
              value={formData.bankName}
              onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
              placeholder="Ex: CIH Bank, Attijariwafa..."
              className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-neutral-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Nom du Titulaire du Compte
            </label>
            <input
              type="text"
              value={formData.bankAccountName}
              onChange={(e) => setFormData({ ...formData, bankAccountName: e.target.value })}
              placeholder="Nom figurant sur l'attestation RIB"
              className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-neutral-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              RIB Bancaire (24 Chiffres)
            </label>
            <input
              type="text"
              value={formData.bankRib}
              onChange={(e) => setFormData({ ...formData, bankRib: e.target.value })}
              placeholder="Ex: 230 780 4567890123456789 12"
              className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl text-xs font-mono focus:outline-none focus:border-neutral-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Statut du Partenaire
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2.5 border border-neutral-200 rounded-xl text-xs bg-white focus:outline-none focus:border-neutral-900"
            >
              <option value="ACTIVE">Actif (Lien VIP & Portail opérationnels)</option>
              <option value="PAUSED">En Pause (Commissions suspendues)</option>
              <option value="BANNED">Désactivé / Bloqué</option>
            </select>
          </div>
        </div>
      </div>
    </form>
  );
}
