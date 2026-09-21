import React from 'react';
import prisma from '@/lib/prisma';
import { Mail, Users } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminNewsletter() {
  const subscribers = await prisma.newsletterSubscriber.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-semibold tracking-wider bg-neutral-100 text-neutral-700 border border-neutral-200">
              Marketing Direct
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 flex items-center gap-2">
            <Mail size={22} className="text-neutral-900" />
            <span>Abonnés Newsletter</span>
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Liste de diffusion des clients inscrits aux alertes et promotions email.
          </p>
        </div>

        <div className="bg-neutral-100 text-neutral-800 border border-neutral-200 px-3.5 py-1.5 rounded-lg font-medium text-xs flex items-center gap-1.5 shadow-2xs">
          <Users size={13} />
          <span>{subscribers.length} abonné{subscribers.length > 1 ? 's' : ''}</span>
        </div>
      </div>

      <div className="bg-white shadow-2xs border border-neutral-200 rounded-2xl overflow-hidden">
        {subscribers.length === 0 ? (
          <div className="p-12 text-center text-neutral-400">
            <Mail size={28} className="mx-auto mb-2 opacity-30" />
            <p className="text-xs font-semibold text-neutral-700">Aucun abonné pour le moment</p>
            <p className="text-[11px] text-neutral-400 mt-0.5">Les emails collectés via le pied de page s&apos;afficheront ici.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200 text-[11px] font-semibold text-neutral-600 uppercase tracking-wider">
                <th className="py-3 px-5">Adresse Email</th>
                <th className="py-3 px-5 text-right">Date d&apos;inscription</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-xs text-neutral-700">
              {subscribers.map((sub) => (
                <tr key={sub.id} className="hover:bg-neutral-50/60 transition-colors">
                  <td className="py-3.5 px-5 font-semibold text-neutral-900">
                    {sub.email}
                  </td>
                  <td className="py-3.5 px-5 text-neutral-500 text-right text-[11px]">
                    {new Date(sub.createdAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
