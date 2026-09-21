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
    <div className="space-y-5">
      {/* Top Header & New Campaign Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
            <Send size={18} className="text-neutral-700" />
            Campagnes & Diffusions Ciblées
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Pilotez vos diffusions WhatsApp et Email marketing pour vos lancements, offres et réactivations.
          </p>
        </div>

        <Link
          href="/admin/marketing/campaigns/new"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-neutral-900 hover:bg-black text-white font-medium text-xs shadow-xs transition-colors shrink-0"
        >
          <Plus size={15} />
          <span>Nouvelle Campagne</span>
        </Link>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-xl p-4 border border-neutral-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-neutral-500">Total Campagnes</span>
            <div className="p-1.5 rounded-lg bg-neutral-100 text-neutral-700">
              <Layers size={14} />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold text-neutral-900">{totalCampaigns}</div>
          <p className="text-[11px] text-neutral-400 mt-0.5">Créées sur la plateforme</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-neutral-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-neutral-500">Campagnes Envoyées</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
              <CheckCircle2 size={14} />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold text-emerald-700">{sentCampaigns}</div>
          <p className="text-[11px] text-neutral-400 mt-0.5">Diffusions achevées</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-neutral-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-neutral-500">Brouillons</span>
            <div className="p-1.5 rounded-lg bg-sky-50 text-sky-700">
              <FileEdit size={14} />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold text-neutral-900">{draftCampaigns}</div>
          <p className="text-[11px] text-neutral-400 mt-0.5">Prêts pour révision</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-neutral-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-neutral-500">Portée Potentielle</span>
            <div className="p-2 rounded-lg bg-neutral-100 text-neutral-700">
              <Users size={14} />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold text-neutral-900">{totalCustomers} contacts</div>
          <p className="text-[11px] text-neutral-400 mt-0.5">Base clients réels NAY</p>
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
          <h3 className="font-semibold text-neutral-900 text-xs flex items-center gap-1.5">
            <Send size={13} className="text-neutral-500" />
            Liste des Campagnes & Automatisations
          </h3>
          <span className="text-xs text-neutral-500 font-medium">{campaigns.length} campagne(s)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 text-[11px] font-semibold uppercase tracking-wider">
                <th className="py-3 px-4 sm:px-5">Nom de la Campagne</th>
                <th className="py-3 px-4">Canal & Format</th>
                <th className="py-3 px-4">Audience Ciblée</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4">Date de Création</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-xs">
              {campaigns.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-neutral-400">
                    <div className="w-10 h-10 rounded-xl bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto mb-2">
                      <Mail size={20} />
                    </div>
                    <p className="font-semibold text-neutral-800">Aucune campagne n'a encore été créée.</p>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Lancez votre première offre WhatsApp ou Email avec nos modèles.
                    </p>
                    <Link
                      href="/admin/marketing/campaigns/new"
                      className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 text-white text-xs font-medium hover:bg-black transition-colors shadow-xs"
                    >
                      <Plus size={13} /> Créer Maintenant
                    </Link>
                  </td>
                </tr>
              ) : (
                campaigns.map((camp) => (
                  <tr key={camp.id} className="hover:bg-neutral-50/60 transition-colors">
                    <td className="py-3 px-4 sm:px-5 font-semibold text-neutral-900">
                      <div>{camp.name}</div>
                      {camp.subject && (
                        <div className="text-[11px] text-neutral-500 font-normal mt-0.5 truncate max-w-xs">
                          {camp.subject}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className={`p-1 rounded ${
                          camp.channel === 'WHATSAPP' 
                            ? 'bg-emerald-50 text-emerald-700' 
                            : 'bg-neutral-100 text-neutral-700'
                        }`}>
                          {camp.channel === 'WHATSAPP' ? <MessageSquare size={13} /> : <Mail size={13} />}
                        </span>
                        <div>
                          <div className="text-xs font-medium text-neutral-900">{camp.channel}</div>
                          <div className="text-[10px] text-neutral-400">{camp.type}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded bg-neutral-100 text-neutral-700 border border-neutral-200">
                        <Users size={11} className="text-neutral-500" />
                        {camp.audience}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        camp.status === 'SENT' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        camp.status === 'DRAFT' 
                          ? 'bg-neutral-100 text-neutral-700 border border-neutral-200' :
                        'bg-sky-50 text-sky-700 border border-sky-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          camp.status === 'SENT' ? 'bg-emerald-500' :
                          camp.status === 'DRAFT' ? 'bg-neutral-400' :
                          'bg-sky-500'
                        }`} />
                        {camp.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-xs text-neutral-500">
                      <div className="flex items-center gap-1.5">
                        <Clock size={11} className="text-neutral-400" />
                        {new Date(camp.createdAt).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/admin/marketing/campaigns/new?audience=${camp.audience}`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-neutral-700 hover:text-neutral-900 bg-white hover:bg-neutral-50 px-2.5 py-1 rounded-lg transition-colors border border-neutral-200 shadow-2xs"
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
