'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Edit,
  DollarSign,
  Users,
  ShoppingBag,
  TrendingUp,
  Building2,
  Copy,
  Check,
  ExternalLink,
  MessageCircle,
  Wallet,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  QrCode
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatMAD } from '@/lib/products';
import AffiliateForm from './AffiliateForm';

export default function AffiliateDetailClient({ affiliate }: { affiliate: any }) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [payoutModal, setPayoutModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState<number>(0);
  const [payoutMethod, setPayoutMethod] = useState(affiliate.paymentMethod || 'VIREMENT_BANCAIRE');
  const [payoutRef, setPayoutRef] = useState('');
  const [payoutNotes, setPayoutNotes] = useState('');
  const [payoutLoading, setPayoutLoading] = useState(false);

  const availableBalance = Math.max(0, affiliate.commissionEarned - (affiliate.commissionPaid || 0));

  const vipUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/vip/${affiliate.code}`
    : `https://nayparfum.ma/vip/${affiliate.code}`;

  const copyVip = () => {
    navigator.clipboard.writeText(vipUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleRecordPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    setPayoutLoading(true);

    try {
      const res = await fetch(`/api/admin/affiliates/${affiliate.id}/payouts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(payoutAmount),
          method: payoutMethod,
          reference: payoutRef,
          notes: payoutNotes,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert('Virement enregistré avec succès ! La dépense a été ajoutée automatiquement dans les charges NAY.');
        setPayoutModal(false);
        router.refresh();
      } else {
        alert(data.error || 'Erreur lors de l\'enregistrement du virement');
      }
    } catch {
      alert('Erreur de connexion');
    } finally {
      setPayoutLoading(false);
    }
  };

  if (isEditing) {
    return (
      <div>
        <div className="mb-4">
          <button
            onClick={() => setIsEditing(false)}
            className="text-xs text-neutral-600 hover:text-neutral-900 font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Retour au rapport détaillé</span>
          </button>
        </div>
        <AffiliateForm initialData={affiliate} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-24 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/affiliates"
            className="p-2 rounded-lg bg-neutral-100 text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-neutral-900">{affiliate.name}</h1>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  affiliate.status === 'ACTIVE'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                {affiliate.status === 'ACTIVE' ? 'Actif' : 'En Pause'}
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5 flex items-center gap-2">
              <span>Code : <strong className="font-mono text-neutral-800">/vip/{affiliate.code}</strong></span>
              {affiliate.email && <span>• Email : {affiliate.email}</span>}
              {affiliate.phone && <span>• Tel : {affiliate.phone}</span>}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setPayoutAmount(availableBalance);
              setPayoutModal(true);
            }}
            disabled={availableBalance <= 0}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
          >
            <Wallet size={14} />
            <span>Payer la Commission ({formatMAD(availableBalance)})</span>
          </button>

          <button
            onClick={() => setIsEditing(true)}
            className="px-3.5 py-2 bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
          >
            <Edit size={14} />
            <span>Modifier / Contrat</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
          <span className="text-[11px] text-neutral-500 font-medium block">Visiteurs (Clics)</span>
          <div className="text-2xl font-bold text-neutral-900 mt-1">{affiliate.visits}</div>
          <span className="text-[10px] text-neutral-400 mt-0.5 block">Lien VIP</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
          <span className="text-[11px] text-neutral-500 font-medium block">Leads / Abonnés</span>
          <div className="text-2xl font-bold text-purple-700 mt-1">{affiliate.leads || (affiliate.leadsList?.length || 0)}</div>
          <span className="text-[10px] text-neutral-400 mt-0.5 block">Inscriptions créées</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
          <span className="text-[11px] text-neutral-500 font-medium block">Commandes Passées</span>
          <div className="text-2xl font-bold text-neutral-900 mt-1">{affiliate.sales}</div>
          <span className="text-[10px] text-neutral-400 mt-0.5 block">Ventes générées</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
          <span className="text-[11px] text-neutral-500 font-medium block">CA Total Généré</span>
          <div className="text-2xl font-bold text-emerald-700 mt-1">{formatMAD(affiliate.revenueGenerated)}</div>
          <span className="text-[10px] text-neutral-400 mt-0.5 block">Chiffre d'Affaires</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs col-span-2 lg:col-span-1">
          <span className="text-[11px] text-neutral-500 font-medium block">Solde à Payer (Dû)</span>
          <div className="text-2xl font-bold text-amber-700 mt-1">{formatMAD(availableBalance)}</div>
          <span className="text-[10px] text-neutral-400 mt-0.5 block">
            Cumul : {formatMAD(affiliate.commissionEarned)} • Payé : {formatMAD(affiliate.commissionPaid || 0)}
          </span>
        </div>
      </div>

      {/* Contract & VIP Box */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-2xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-600">
            Contrat & Informations Bancaires
          </h3>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1.5 border-b border-neutral-100">
              <span className="text-neutral-500">Modèle de Rémunération</span>
              <span className="font-bold text-neutral-900">{affiliate.commissionType || 'PERCENTAGE'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-neutral-100">
              <span className="text-neutral-500">Taux / Prime</span>
              <span className="font-bold text-emerald-700">
                {affiliate.commissionType === 'PERCENTAGE' && `${affiliate.commissionRate}%`}
                {affiliate.commissionType === 'FIXED_PER_ORDER' && `${affiliate.fixedPerOrder} MAD / cmd`}
                {affiliate.commissionType === 'PAY_PER_VISIT' && `${affiliate.payPerVisit} MAD / clic`}
                {affiliate.commissionType === 'PAY_PER_LEAD' && `${affiliate.payPerLead} MAD / lead`}
                {affiliate.commissionType === 'MONTHLY_RETAINER' && `${formatMAD(affiliate.monthlyRetainer)} / mois`}
                {affiliate.commissionType === 'HYBRID' && `${affiliate.commissionRate}% + ${affiliate.fixedPerOrder} MAD`}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-neutral-100">
              <span className="text-neutral-500">Banque</span>
              <span className="font-semibold text-neutral-800">{affiliate.bankName || 'Non renseigné'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-neutral-100">
              <span className="text-neutral-500">Titulaire Compte</span>
              <span className="font-semibold text-neutral-800">{affiliate.bankAccountName || affiliate.name}</span>
            </div>
            <div className="flex flex-col py-1.5">
              <span className="text-neutral-500 mb-0.5">RIB Bancaire (24 Chiffres)</span>
              <span className="font-mono text-neutral-900 font-bold bg-neutral-50 p-2 rounded-lg border border-neutral-200 text-[11px]">
                {affiliate.bankRib || 'Aucun RIB enregistré'}
              </span>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-neutral-200 bg-neutral-50/50 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700">
              Commandes Référées ({affiliate.orders?.length || 0})
            </h3>
          </div>

          <div className="overflow-x-auto max-h-80">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200 text-[11px] font-semibold text-neutral-600 uppercase">
                  <th className="py-2.5 px-4">Commande</th>
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-4">Client</th>
                  <th className="py-2.5 px-4">Montant</th>
                  <th className="py-2.5 px-4">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-700">
                {(!affiliate.orders || affiliate.orders.length === 0) ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-neutral-400">
                      Aucune commande enregistrée pour cet ambassadeur.
                    </td>
                  </tr>
                ) : (
                  affiliate.orders.map((order: any) => (
                    <tr key={order.id} className="hover:bg-neutral-50">
                      <td className="py-2.5 px-4 font-mono font-bold text-neutral-900">
                        #{order.orderNumber}
                      </td>
                      <td className="py-2.5 px-4 text-neutral-500">
                        {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="py-2.5 px-4 font-medium text-neutral-800">{order.customerName}</td>
                      <td className="py-2.5 px-4 font-bold text-emerald-700">{formatMAD(order.total)}</td>
                      <td className="py-2.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {order.status}
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

      {/* Payouts History */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-neutral-200 bg-neutral-50/50 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700">
            Historique des Règlements & Virements Effectués ({affiliate.payouts?.length || 0})
          </h3>
          <span className="text-xs text-neutral-500">Total versé : {formatMAD(affiliate.commissionPaid || 0)}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200 text-[11px] font-semibold text-neutral-600 uppercase">
                <th className="py-2.5 px-4">Date du Virement</th>
                <th className="py-2.5 px-4">Mode</th>
                <th className="py-2.5 px-4">Référence</th>
                <th className="py-2.5 px-4">Montant</th>
                <th className="py-2.5 px-4">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-700">
              {(!affiliate.payouts || affiliate.payouts.length === 0) ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-neutral-400">
                    Aucun virement enregistré.
                  </td>
                </tr>
              ) : (
                affiliate.payouts.map((p: any) => (
                  <tr key={p.id} className="hover:bg-neutral-50">
                    <td className="py-2.5 px-4 text-neutral-600">{new Date(p.paidAt).toLocaleDateString('fr-FR')}</td>
                    <td className="py-2.5 px-4 font-semibold text-neutral-800">{p.method}</td>
                    <td className="py-2.5 px-4 font-mono text-neutral-700">{p.reference || '-'}</td>
                    <td className="py-2.5 px-4 font-bold text-emerald-700">{formatMAD(p.amount)}</td>
                    <td className="py-2.5 px-4 text-neutral-500">{p.notes || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payout Modal */}
      {payoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-neutral-200 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="font-bold text-neutral-900 text-sm flex items-center gap-2">
                <Wallet size={16} className="text-emerald-600" />
                <span>Enregistrer un Virement Partenaire</span>
              </h3>
              <button onClick={() => setPayoutModal(false)} className="text-neutral-400 hover:text-neutral-600">✕</button>
            </div>

            <form onSubmit={handleRecordPayout} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Montant à verser (MAD) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  step="5"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm font-bold text-neutral-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Mode de Paiement</label>
                <select
                  value={payoutMethod}
                  onChange={(e) => setPayoutMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg bg-white"
                >
                  <option value="VIREMENT_BANCAIRE">Virement Bancaire (CIH / Attijari / Autre)</option>
                  <option value="CASH_PLUS">Cash Plus</option>
                  <option value="WAFA_CASH">Wafacash</option>
                  <option value="ESPECES">Espèces (Remise en mains propres)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Référence du Virement (Optionnel)</label>
                <input
                  type="text"
                  value={payoutRef}
                  onChange={(e) => setPayoutRef(e.target.value)}
                  placeholder="Ex: VIR-CIH-849204"
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Notes internes</label>
                <textarea
                  rows={2}
                  value={payoutNotes}
                  onChange={(e) => setPayoutNotes(e.target.value)}
                  placeholder="Règlement commissions ventes mois en cours..."
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setPayoutModal(false)}
                  className="flex-1 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={payoutLoading}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-xs disabled:opacity-50"
                >
                  {payoutLoading ? 'Enregistrement...' : 'Confirmer le Virement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
