import React from 'react';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { 
  Send, 
  Plus, 
  Mail, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  Users, 
  Sparkles, 
  FileEdit, 
  ArrowRight,
  Layers,
  Radio
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function CampaignsPage() {
  const [campaigns, totalCustomers] = await Promise.all([
    prisma.marketingCampaign.findMany({
      orderBy: { createdAt: 'desc' }
    }),
    prisma.customer.count()
  ]);

  const totalCampaigns = campaigns.length;
  const sentCampaigns = campaigns.filter(c => c.status === 'SENT').length;
  const draftCampaigns = campaigns.filter(c => c.status === 'DRAFT').length;

  return (
    <div className="space-y-6">
      {/* Top Header & New Campaign Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-neutral-900 tracking-tight flex items-center gap-2">
            <Send size={22} className="text-[#0ea5e9]" />
            Campagnes de Diffusion & Messages Ciblés
          </h2>
          <p className="text-xs md:text-sm text-neutral-500 mt-1">
            Pilotez vos diffusions WhatsApp et Email marketing pour vos lancements, offres VIP et réactivations.
          </p>
        </div>

        <Link
          href="/admin/marketing/campaigns/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0ea5e9] to-blue-600 hover:brightness-110 text-white font-bold text-xs shadow-md shadow-sky-500/20 transition-all active:scale-95 shrink-0"
        >
          <Plus size={18} />
          <span>Nouvelle Campagne</span>
        </Link>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Total Campagnes</span>
            <div className="p-2 rounded-xl bg-neutral-100 text-neutral-800">
              <Layers size={16} />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-neutral-900">{totalCampaigns}</div>
          <p className="text-xs text-neutral-400 mt-1">Créées sur la plateforme</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Campagnes Envoyées</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-emerald-700">{sentCampaigns}</div>
          <p className="text-xs text-neutral-400 mt-1">Diffusions achevées</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Brouillons & En Préparation</span>
            <div className="p-2 rounded-xl bg-sky-50 text-[#0ea5e9]">
              <FileEdit size={16} />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-neutral-900">{draftCampaigns}</div>
          <p className="text-xs text-neutral-400 mt-1">Prêts pour révision</p>
        </div>

        <div className="bg-[#0A0A0A] text-white rounded-2xl p-5 border border-[#1e1e1e] shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#0ea5e9] uppercase tracking-wider">Portée Potentielle</span>
            <div className="p-2 rounded-xl bg-[#1c1c1c] text-[#0ea5e9]">
              <Users size={16} />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-white">{totalCustomers} contacts</div>
          <p className="text-xs text-gray-400 mt-1">Base clients réels NAY</p>
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/60">
          <h3 className="font-bold text-neutral-900 text-sm flex items-center gap-2">
            <Send size={15} className="text-[#0ea5e9]" />
            Liste des Campagnes & Automations
          </h3>
          <span className="text-xs text-neutral-500 font-semibold">{campaigns.length} campagne(s)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3.5 px-6">Nom de la Campagne</th>
                <th className="py-3.5 px-6">Canal & Format</th>
                <th className="py-3.5 px-6">Audience Ciblée</th>
                <th className="py-3.5 px-6">Statut</th>
                <th className="py-3.5 px-6">Date de Création</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-sm">
              {campaigns.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-neutral-400">
                    <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto mb-3">
                      <Mail size={24} />
                    </div>
                    <p className="font-bold text-neutral-800">Aucune campagne n'a encore été créée.</p>
                    <p className="text-xs text-neutral-500 mt-1">
                      Lancez votre première offre WhatsApp ou Email avec nos modèles exclusifs.
                    </p>
                    <Link
                      href="/admin/marketing/campaigns/new"
                      className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-900 text-[#0ea5e9] text-xs font-bold hover:bg-neutral-800 transition-colors shadow-sm"
                    >
                      <Plus size={14} /> Créer Maintenant
                    </Link>
                  </td>
                </tr>
              ) : (
                campaigns.map((camp) => (
                  <tr key={camp.id} className="hover:bg-neutral-50/70 transition-colors">
                    <td className="py-4 px-6 font-bold text-neutral-900">
                      <div>{camp.name}</div>
                      {camp.subject && (
                        <div className="text-xs text-neutral-500 font-normal mt-0.5 truncate max-w-xs">
                          {camp.subject}
                        </div>
                      )}
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span className={`p-1.5 rounded-lg ${
                          camp.channel === 'WHATSAPP' 
                            ? 'bg-[#25D366]/10 text-[#25D366]' 
                            : 'bg-sky-50 text-[#0ea5e9]'
                        }`}>
                          {camp.channel === 'WHATSAPP' ? <MessageSquare size={14} /> : <Mail size={14} />}
                        </span>
                        <div>
                          <div className="text-xs font-bold text-neutral-900">{camp.channel}</div>
                          <div className="text-[11px] text-neutral-500">{camp.type}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-neutral-100 text-neutral-800">
                        <Users size={12} className="text-neutral-500" />
                        {camp.audience}
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                        camp.status === 'SENT' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        camp.status === 'DRAFT' 
                          ? 'bg-neutral-100 text-neutral-700 border border-neutral-200' :
                        'bg-sky-50 text-sky-700 border border-sky-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          camp.status === 'SENT' ? 'bg-emerald-500' :
                          camp.status === 'DRAFT' ? 'bg-neutral-400' :
                          'bg-[#0ea5e9]'
                        }`} />
                        {camp.status}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-xs text-neutral-500">
                      <div className="flex items-center gap-1.5">
                        <Clock size={12} className="text-neutral-400" />
                        {new Date(camp.createdAt).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <Link
                        href={`/admin/marketing/campaigns/new?audience=${camp.audience}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#0ea5e9] hover:text-sky-700 bg-sky-50 hover:bg-sky-100 px-3 py-1.5 rounded-lg transition-colors border border-sky-200"
                      >
                        Dupliquer
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
