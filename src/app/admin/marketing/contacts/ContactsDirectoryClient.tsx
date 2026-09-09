'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Phone, 
  Mail, 
  Search, 
  Copy, 
  Check, 
  Download, 
  ExternalLink, 
  MessageSquare, 
  Sparkles, 
  Crown, 
  ShoppingBag, 
  MapPin, 
  PhoneCall, 
  Filter,
  CheckCircle2,
  AlertCircle,
  Package,
  Clock,
  ShieldCheck,
  Building2
} from 'lucide-react';
import { formatMAD } from '@/lib/products';

export interface CustomerContact {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  cleanPhone: string;
  city: string | null;
  address: string | null;
  postalCode: string | null;
  ordersCount: number;
  deliveredOrdersCount: number;
  totalSpent: number;
  lastOrderDate: string | null;
  createdAt: string;
  isVip: boolean;
  tier: 'DIAMOND' | 'GOLD' | 'SILVER' | 'STANDARD';
  source: 'COMMANDE' | 'COMPTE' | 'COMMANDE_ET_COMPTE';
  recentOrderNumber: string | null;
}

export default function ContactsDirectoryClient({ 
  initialContacts 
}: { 
  initialContacts: CustomerContact[] 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'ORDERS' | 'PHONE' | 'VIP' | 'COMMANDES_ONLY'>('ALL');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Filter and Search logic
  const filteredContacts = useMemo(() => {
    return initialContacts.filter(c => {
      // Filter tab
      if (activeFilter === 'ORDERS' && c.ordersCount === 0) return false;
      if (activeFilter === 'PHONE' && !c.phone) return false;
      if (activeFilter === 'VIP' && !c.isVip) return false;
      if (activeFilter === 'COMMANDES_ONLY' && c.ordersCount === 0) return false;

      // Search term
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      const matchName = c.name?.toLowerCase().includes(term);
      const matchEmail = c.email?.toLowerCase().includes(term);
      const matchPhone = c.phone?.toLowerCase().includes(term);
      const matchCity = c.city?.toLowerCase().includes(term);
      const matchAddress = c.address?.toLowerCase().includes(term);
      const matchOrder = c.recentOrderNumber?.toLowerCase().includes(term);
      return matchName || matchEmail || matchPhone || matchCity || matchAddress || matchOrder;
    });
  }, [initialContacts, searchTerm, activeFilter]);

  // Statistics
  const totalContacts = initialContacts.length;
  const withPhoneCount = initialContacts.filter(c => !!c.phone).length;
  const withOrdersCount = initialContacts.filter(c => c.ordersCount > 0).length;
  const totalSpentAll = initialContacts.reduce((sum, c) => sum + c.totalSpent, 0);

  // Copy helper
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Copy all phones
  const copyAllPhones = () => {
    const phones = initialContacts
      .map(c => c.phone)
      .filter((p): p is string => !!p && p.trim().length > 0)
      .map(p => {
        const clean = p.replace(/[^0-9]/g, '');
        return clean.startsWith('0') ? `+212${clean.slice(1)}` : clean.startsWith('212') ? `+${clean}` : `+212${clean}`;
      });

    const text = Array.from(new Set(phones)).join('\n');
    handleCopy(text, 'all_phones');
  };

  // Copy all emails
  const copyAllEmails = () => {
    const emails = initialContacts
      .map(c => c.email)
      .filter(e => !!e && e.includes('@'));

    const text = Array.from(new Set(emails)).join(', ');
    handleCopy(text, 'all_emails');
  };

  // Export CSV
  const exportCSV = () => {
    const headers = ['Nom & Prenom', 'Telephone', 'Email', 'Ville', 'Adresse Complete', 'Total Commandes', 'Total Depense (MAD)', 'Derniere Commande', 'Source', 'Statut VIP'];
    const rows = filteredContacts.map(c => [
      `"${(c.name || '').replace(/"/g, '""')}"`,
      `"${(c.phone || '').replace(/"/g, '""')}"`,
      `"${(c.email || '').replace(/"/g, '""')}"`,
      `"${(c.city || '').replace(/"/g, '""')}"`,
      `"${(c.address || '').replace(/"/g, '""')}"`,
      c.ordersCount,
      c.totalSpent,
      c.lastOrderDate ? `"${new Date(c.lastOrderDate).toLocaleDateString('fr-FR')}"` : '""',
      c.source === 'COMMANDE' ? 'Commande Directe' : c.source === 'COMPTE' ? 'Compte Enregistre' : 'Commande + Compte',
      c.isVip ? `VIP ${c.tier}` : 'Standard'
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `repertoire_clients_et_commandes_nay_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Total Clients & Acheteurs</span>
            <div className="p-2 rounded-xl bg-neutral-100 text-neutral-800">
              <Users size={16} />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-neutral-900">{totalContacts} contacts</div>
          <p className="text-xs text-neutral-400 mt-1">Extraits des Commandes & Comptes</p>
        </div>

        <div className="bg-[#0A0A0A] text-white rounded-2xl p-5 border border-[#1e1e1e] shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#0ea5e9] uppercase tracking-wider">Téléphones WhatsApp</span>
            <div className="p-2 rounded-xl bg-[#1c1c1c] text-[#0ea5e9]">
              <Phone size={16} />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-white">{withPhoneCount} numéros</div>
          <p className="text-xs text-gray-400 mt-1">Numéros marocains actifs pour relance</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Clients Ayant Commandé</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <ShoppingBag size={16} />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-emerald-700">{withOrdersCount} acheteurs</div>
          <p className="text-xs text-neutral-400 mt-1">Commandes en ligne passées</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Chiffre d'Affaires Total</span>
            <div className="p-2 rounded-xl bg-sky-50 text-[#0ea5e9]">
              <Sparkles size={16} />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-neutral-900">{formatMAD(totalSpentAll)}</div>
          <p className="text-xs text-neutral-400 mt-1">Valeur totale des achats</p>
        </div>
      </div>

      {/* Top Search & Bulk Actions Bar */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-sm p-4 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Instant Search input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher par nom, téléphone (ex: 06...), email, ville, adresse..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 text-xs md:text-sm font-medium focus:ring-2 focus:ring-[#0ea5e9] focus:outline-none bg-neutral-50/50"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-neutral-700"
              >
                Effacer
              </button>
            )}
          </div>

          {/* Quick Bulk Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={copyAllPhones}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 transition-colors"
              title="Copier tous les numéros WhatsApp de la base"
            >
              {copiedKey === 'all_phones' ? <Check size={14} className="text-emerald-600" /> : <Phone size={14} />}
              <span>{copiedKey === 'all_phones' ? 'Numéros Copiés !' : `Copier ${withPhoneCount} Numéros WhatsApp`}</span>
            </button>

            <button
              onClick={copyAllEmails}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-[#0ea5e9] text-xs font-bold border border-sky-200 transition-colors"
              title="Copier toutes les adresses email"
            >
              {copiedKey === 'all_emails' ? <Check size={14} className="text-sky-600" /> : <Mail size={14} />}
              <span>{copiedKey === 'all_emails' ? 'Emails Copiés !' : 'Copier tous les Emails'}</span>
            </button>

            <button
              onClick={exportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0A0A0A] hover:bg-[#1f1f1f] text-white text-xs font-bold shadow-sm transition-colors border border-white/10"
              title="Télécharger le fichier CSV complet des contacts"
            >
              <Download size={14} />
              <span>Exporter CSV</span>
            </button>
          </div>
        </div>

        {/* Filter Badges */}
        <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveFilter('ALL')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeFilter === 'ALL'
                  ? 'bg-[#0A0A0A] text-white shadow-sm'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              Tous ({totalContacts})
            </button>
            <button
              onClick={() => setActiveFilter('COMMANDES_ONLY')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeFilter === 'COMMANDES_ONLY'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              Provenant des Commandes ({withOrdersCount})
            </button>
            <button
              onClick={() => setActiveFilter('PHONE')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeFilter === 'PHONE'
                  ? 'bg-[#0ea5e9] text-white shadow-sm'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              Avec Téléphone WhatsApp ({withPhoneCount})
            </button>
            <button
              onClick={() => setActiveFilter('VIP')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeFilter === 'VIP'
                  ? 'bg-neutral-950 text-[#0ea5e9] border border-sky-500/40 shadow-sm'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              Membres VIP
            </button>
          </div>

          <span className="text-xs text-neutral-500 font-semibold">
            {filteredContacts.length} contact(s) affiché(s)
          </span>
        </div>
      </div>

      {/* Full Contacts Table */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3.5 px-6">Nom & Client</th>
                <th className="py-3.5 px-6">Téléphone (WhatsApp Direct)</th>
                <th className="py-3.5 px-6">Email</th>
                <th className="py-3.5 px-6">Ville & Adresse de Livraison</th>
                <th className="py-3.5 px-6">Commandes & Total MAD</th>
                <th className="py-3.5 px-6 text-right">Actions Directes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-sm">
              {filteredContacts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-neutral-400">
                    <AlertCircle className="mx-auto text-neutral-300 mb-2" size={32} />
                    <p className="font-bold text-neutral-800">Aucun contact ne correspond à votre recherche.</p>
                    <p className="text-xs text-neutral-400 mt-1">Vérifiez les filtres ou le terme recherché.</p>
                  </td>
                </tr>
              ) : (
                filteredContacts.map((contact) => {
                  const rawPhone = contact.phone || '';
                  const cleanPhone = rawPhone.replace(/[^0-9]/g, '');
                  const formattedWhatsapp = cleanPhone.startsWith('0')
                    ? `212${cleanPhone.slice(1)}`
                    : cleanPhone.startsWith('212')
                      ? cleanPhone
                      : cleanPhone ? `212${cleanPhone}` : '';

                  const whatsappMessage = `Salam ${contact.name} ✨, c'est l'équipe NAY Parfum ! Nous vous remercions pour votre confiance. N'hésitez pas si vous avez la moindre question concernant vos parfums ou une nouvelle commande.`;
                  const whatsappLink = formattedWhatsapp.length >= 9
                    ? `https://wa.me/${formattedWhatsapp}?text=${encodeURIComponent(whatsappMessage)}`
                    : null;

                  return (
                    <tr key={contact.id} className="hover:bg-neutral-50/70 transition-colors">
                      {/* Name & Avatar */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl font-black flex items-center justify-center text-xs shrink-0 shadow-sm border ${
                            contact.isVip ? 'bg-[#0A0A0A] text-[#0ea5e9] border-sky-500/40' : 'bg-neutral-100 text-neutral-800 border-neutral-200'
                          }`}>
                            {contact.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-neutral-900">
                                {contact.name}
                              </span>
                              {contact.isVip && (
                                <span className="p-0.5 rounded bg-sky-50 text-[#0ea5e9]" title={`VIP ${contact.tier}`}>
                                  <Crown size={12} />
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-neutral-500 mt-0.5 flex items-center gap-1.5">
                              <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                                contact.source === 'COMMANDE' ? 'bg-emerald-50 text-emerald-700' :
                                contact.source === 'COMMANDE_ET_COMPTE' ? 'bg-sky-50 text-sky-700' :
                                'bg-neutral-100 text-neutral-600'
                              }`}>
                                {contact.source === 'COMMANDE' ? 'Commande' : contact.source === 'COMMANDE_ET_COMPTE' ? 'Client + Cmd' : 'Compte'}
                              </span>
                              {contact.recentOrderNumber && (
                                <span className="font-mono text-[10px] text-neutral-400">
                                  #{contact.recentOrderNumber}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Phone Number */}
                      <td className="py-4 px-6">
                        {contact.phone ? (
                          <div className="flex items-center gap-2">
                            <a
                              href={`tel:${contact.phone}`}
                              className="font-mono text-xs font-bold text-neutral-900 hover:text-[#0ea5e9] bg-neutral-100 hover:bg-neutral-200/80 px-2.5 py-1 rounded-lg transition-colors inline-flex items-center gap-1.5"
                            >
                              <Phone size={12} className="text-neutral-500" />
                              <span>{contact.phone}</span>
                            </a>
                            <button
                              onClick={() => handleCopy(contact.phone!, `phone_${contact.id}`)}
                              title="Copier le numéro"
                              className="text-gray-400 hover:text-neutral-700 transition-colors p-1"
                            >
                              {copiedKey === `phone_${contact.id}` ? (
                                <Check size={13} className="text-emerald-600" />
                              ) : (
                                <Copy size={13} />
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-neutral-400 italic">Non renseigné</span>
                        )}
                      </td>

                      {/* Email */}
                      <td className="py-4 px-6">
                        {contact.email ? (
                          <div className="flex items-center gap-2">
                            <a
                              href={`mailto:${contact.email}`}
                              className="text-xs text-neutral-700 hover:text-[#0ea5e9] font-medium transition-colors truncate max-w-[180px]"
                            >
                              {contact.email}
                            </a>
                            <button
                              onClick={() => handleCopy(contact.email, `email_${contact.id}`)}
                              title="Copier l'email"
                              className="text-gray-400 hover:text-neutral-700 transition-colors p-1 shrink-0"
                            >
                              {copiedKey === `email_${contact.id}` ? (
                                <Check size={13} className="text-emerald-600" />
                              ) : (
                                <Copy size={13} />
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-neutral-400 italic">-</span>
                        )}
                      </td>

                      {/* City & Address */}
                      <td className="py-4 px-6">
                        <div className="text-xs font-bold text-neutral-900 flex items-center gap-1">
                          <MapPin size={12} className="text-[#0ea5e9] shrink-0" />
                          <span>{contact.city || 'Maroc'}</span>
                        </div>
                        {contact.address && (
                          <p className="text-[11px] text-neutral-500 truncate max-w-[200px] mt-0.5">
                            {contact.address} {contact.postalCode ? `(${contact.postalCode})` : ''}
                          </p>
                        )}
                      </td>

                      {/* Orders & Total Spent */}
                      <td className="py-4 px-6">
                        <div className="text-xs font-black text-neutral-900">
                          {formatMAD(contact.totalSpent)}
                        </div>
                        <div className="text-[11px] text-neutral-500 flex items-center gap-1 mt-0.5">
                          <ShoppingBag size={11} className="text-neutral-400" />
                          <span>{contact.ordersCount} commande(s)</span>
                          {contact.lastOrderDate && (
                            <span>• {new Date(contact.lastOrderDate).toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' })}</span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {whatsappLink && (
                            <a
                              href={whatsappLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Ouvrir WhatsApp direct"
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs shadow-sm shadow-emerald-500/20 transition-all active:scale-95"
                            >
                              <MessageSquare size={13} />
                              <span>WhatsApp</span>
                            </a>
                          )}

                          <Link
                            href={`/admin/customers/${contact.id}`}
                            title="Voir profil complet du client"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-semibold text-xs transition-colors"
                          >
                            <span>Fiche Client</span>
                            <ExternalLink size={12} />
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
