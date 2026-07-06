import React from 'react';
import prisma from '@/lib/prisma';
import { Mail } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminNewsletter() {
  const subscribers = await prisma.newsletterSubscriber.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Abonnés Newsletter</h1>
        <div className="bg-sky-50 text-sky-700 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2">
          <Mail size={16} />
          {subscribers.length} abonnés
        </div>
      </div>

      <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
        {subscribers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Aucun abonné pour le moment.</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date d'inscription</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {subscribers.map((sub) => (
                <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {sub.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
