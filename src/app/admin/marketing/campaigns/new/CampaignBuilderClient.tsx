'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Save, 
  Send, 
  Sparkles, 
  MessageSquare, 
  Mail, 
  Users, 
  Crown, 
  Flame, 
  Clock, 
  Check, 
  Smartphone,
  Info,
  Gift
} from 'lucide-react';

interface TemplatePreset {
  id: string;
  name: string;
  tag: string;
  channel: 'WHATSAPP' | 'EMAIL';
  type: 'VIP' | 'PROMOTION' | 'ABANDONED_CART' | 'REACTIVATION';
  audience: string;
  subject?: string;
  message: string;
  badgeColor: string;
}

const PRESET_TEMPLATES: TemplatePreset[] = [
  {
    id: 'vip_privilege',
    name: 'Offre Privilège VIP (-15%)',
    tag: 'Haute Valeur',
    channel: 'WHATSAPP',
    type: 'VIP',
    audience: 'VIP',
    subject: 'Votre invitation privilégiée NAY Parfum ✨',
    message: 'Salam {{first_name}} ✨, en tant que client VIP d\'honneur chez NAY Parfum, nous vous réservons une remise exclusive de -15% sur toute notre collection et nos testeurs rares avec le code VIP15. Livraison express offerte et échantillon surprise inclus dans votre colis 🎁. Profitez-en ici : https://nayparfum.ma',
    badgeColor: 'bg-sky-50 text-[#0ea5e9] border-sky-200'
  },
  {
    id: 'cart_gift',
    name: 'Relance Panier + Échantillon Offert',
    tag: 'Forte Conversion',
    channel: 'WHATSAPP',
    type: 'ABANDONED_CART',
    audience: 'ALL',
    subject: 'Votre sélection NAY Parfum vous attend',
    message: 'Salam {{first_name}} 👋, votre panier chez NAY Parfum est toujours réservé ! Pour toute finalisation aujourd\'hui, nous vous ajoutons un échantillon de luxe offert dans votre commande. Cliquez ici pour valider : https://nayparfum.ma/cart ✨',
    badgeColor: 'bg-red-50 text-red-700 border-red-200'
  },
  {
    id: 'new_testers',
    name: 'Arrivage Nouveautés & Testeurs',
    tag: 'Nouveautés',
    channel: 'WHATSAPP',
    type: 'PROMOTION',
    audience: 'ALL',
    subject: 'Nouveaux testeurs authentiques disponibles chez NAY Parfum',
    message: 'Salam {{first_name}}, découvrez nos nouveaux arrivages de testeurs de luxe (Dior, Tom Ford, Creed, YSL) à prix direct importateur sur NAY Parfum. Quantités limitées ! Accédez à la boutique : https://nayparfum.ma/products',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200'
  },
  {
    id: 'winback_reactivation',
    name: 'Réactivation Client Fidèle (Win-Back)',
    tag: 'Réactivation',
    channel: 'WHATSAPP',
    type: 'REACTIVATION',
    audience: 'AT_RISK',
    subject: 'Une attention spéciale pour votre retour chez NAY Parfum',
    message: 'Salam {{first_name}} ✨, vous nous manquez chez NAY Parfum ! Profitez de la livraison gratuite et d\'un cadeau olfactif offert sur votre prochaine commande avec le code RETOURNAY. Découvrez nos nouveautés : https://nayparfum.ma',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200'
  }
];

export default function CampaignBuilderClient({
  initialAudience,
  saveCampaignAction
}: {
  initialAudience: string;
  saveCampaignAction: (formData: FormData) => Promise<void>;
}) {
  const [name, setName] = useState('');
  const [channel, setChannel] = useState<'WHATSAPP' | 'EMAIL'>('WHATSAPP');
  const [type, setType] = useState('VIP');
  const [audience, setAudience] = useState(initialAudience || 'ALL');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState(PRESET_TEMPLATES[0].message);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('vip_privilege');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const applyTemplate = (tpl: TemplatePreset) => {
    setSelectedTemplate(tpl.id);
    setName(tpl.name);
    setChannel(tpl.channel);
    setType(tpl.type);
    setAudience(tpl.audience);
    if (tpl.subject) setSubject(tpl.subject);
    setMessage(tpl.message);
  };

  const previewMessage = message.replace('{{first_name}}', 'Ayoub').replace('{{last_order_date}}', '12 Février');

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Top Breadcrumb & Title */}
      <div className="flex items-center gap-4">
        <Link 
          href="/admin/marketing/campaigns" 
          className="text-neutral-600 hover:text-neutral-900 bg-white hover:bg-neutral-100 p-2.5 rounded-xl border border-neutral-200 transition-colors shadow-sm"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h2 className="text-xl md:text-2xl font-black text-neutral-900 tracking-tight flex items-center gap-2">
            <Sparkles size={22} className="text-[#0ea5e9]" />
            Créateur de Campagne & Studio de Diffusion
          </h2>
          <p className="text-xs md:text-sm text-neutral-500 mt-0.5">
            Sélectionnez un modèle prédéfini ou composez votre message haute conversion pour vos clients marocains.
          </p>
        </div>
      </div>

      {/* Luxury Template Presets Picker */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 flex items-center gap-1.5">
            <Sparkles size={14} className="text-[#0ea5e9]" /> Modèles Haute Performance NAY Parfum (1-Clic)
          </label>
          <span className="text-xs text-neutral-400">Cliquez pour pré-remplir instantanément</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PRESET_TEMPLATES.map((tpl) => (
            <button
              key={tpl.id}
              type="button"
              onClick={() => applyTemplate(tpl)}
              className={`p-4 rounded-2xl border text-left transition-all ${
                selectedTemplate === tpl.id
                  ? 'border-[#0ea5e9] bg-[#0A0A0A] text-white shadow-xl scale-[1.02] ring-1 ring-[#0ea5e9]/50'
                  : 'border-neutral-200/80 bg-white hover:border-neutral-300 text-neutral-900'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  selectedTemplate === tpl.id ? 'bg-[#0ea5e9] text-white border-[#0ea5e9]' : tpl.badgeColor
                }`}>
                  {tpl.tag}
                </span>
                {selectedTemplate === tpl.id && <Check size={14} className="text-[#0ea5e9]" />}
              </div>
              <h4 className="font-bold text-xs line-clamp-1">{tpl.name}</h4>
              <p className={`text-[11px] mt-1 line-clamp-2 ${selectedTemplate === tpl.id ? 'text-gray-300' : 'text-neutral-500'}`}>
                {tpl.message}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Left Form | Right Phone Mockup Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Form Container (7 Cols) */}
        <div className="lg:col-span-7">
          <form 
            action={async (fd) => {
              setIsSubmitting(true);
              await saveCampaignAction(fd);
            }} 
            className="space-y-6"
          >
            <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 shadow-sm space-y-5">
              
              {/* Campaign Name & Channel */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Nom de la Campagne *
                  </label>
                  <input 
                    name="name" 
                    type="text" 
                    required 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Offre VIP Printemps 2026" 
                    className="w-full border border-neutral-200 rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-[#0ea5e9] focus:outline-none" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Canal de Diffusion *
                  </label>
                  <select 
                    name="channel" 
                    value={channel}
                    onChange={(e) => setChannel(e.target.value as any)}
                    className="w-full border border-neutral-200 rounded-xl p-3 text-sm font-medium bg-white focus:ring-2 focus:ring-[#0ea5e9] focus:outline-none"
                  >
                    <option value="WHATSAPP">WhatsApp Direct (Recommandé - Maroc)</option>
                    <option value="EMAIL">E-mail Marketing</option>
                  </select>
                </div>
              </div>

              {/* Type & Audience */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Type de Campagne
                  </label>
                  <select 
                    name="type" 
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full border border-neutral-200 rounded-xl p-3 text-sm font-medium bg-white focus:ring-2 focus:ring-[#0ea5e9] focus:outline-none"
                  >
                    <option value="VIP">Offre Exclusive VIP</option>
                    <option value="PROMOTION">Lancement / Promotion Générale</option>
                    <option value="REACTIVATION">Réactivation & Win-Back</option>
                    <option value="ABANDONED_CART">Relance Panier Abandonné</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Audience Cible *
                  </label>
                  <select 
                    name="audience" 
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                    className="w-full border border-neutral-200 rounded-xl p-3 text-sm font-medium bg-white focus:ring-2 focus:ring-[#0ea5e9] focus:outline-none"
                  >
                    <option value="ALL">Tous les Clients (Base Complète)</option>
                    <option value="VIP">Clients VIP (&gt;3 commandes ou &gt;2000 MAD)</option>
                    <option value="AT_RISK">Clients À Risque (90 à 180 jours sans achat)</option>
                    <option value="INACTIVE">Clients Inactifs (&gt;180 jours)</option>
                    <option value="NEW">Nouveaux Inscrits</option>
                  </select>
                </div>
              </div>

              {/* Subject (if Email) */}
              {channel === 'EMAIL' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Objet de l'E-mail
                  </label>
                  <input 
                    name="subject" 
                    type="text" 
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Ex: Votre privilège exclusif NAY Parfum..." 
                    className="w-full border border-neutral-200 rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-[#0ea5e9] focus:outline-none" 
                  />
                </div>
              )}

              {/* Message Content */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
                    Corps du Message *
                  </label>
                  <div className="text-[11px] text-neutral-500 space-x-1">
                    <span>Variables :</span>
                    <button 
                      type="button" 
                      onClick={() => setMessage(m => m + ' {{first_name}}')} 
                      className="text-[#0ea5e9] font-mono font-bold hover:underline"
                    >
                      {`{{first_name}}`}
                    </button>
                    <span>•</span>
                    <button 
                      type="button" 
                      onClick={() => setMessage(m => m + ' https://nayparfum.ma')} 
                      className="text-[#0ea5e9] font-mono font-bold hover:underline"
                    >
                      lien boutique
                    </button>
                  </div>
                </div>
                <textarea 
                  name="message" 
                  required 
                  rows={6} 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Écrivez votre message..." 
                  className="w-full border border-neutral-200 rounded-xl p-3.5 text-sm font-medium focus:ring-2 focus:ring-[#0ea5e9] focus:outline-none leading-relaxed"
                />
              </div>

            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#0ea5e9] to-blue-600 hover:brightness-110 text-white font-bold rounded-xl shadow-lg shadow-sky-500/20 transition-all active:scale-95 disabled:opacity-50"
              >
                <Save size={18} />
                <span>{isSubmitting ? 'Enregistrement...' : 'Enregistrer la Campagne (Brouillon)'}</span>
              </button>

              <Link
                href="/admin/marketing/campaigns"
                className="px-5 py-3 rounded-xl bg-white hover:bg-neutral-100 text-neutral-700 font-semibold text-sm border border-neutral-200 transition-colors"
              >
                Annuler
              </Link>
            </div>
          </form>
        </div>

        {/* Live Smartphone Simulator Preview (5 Cols) */}
        <div className="lg:col-span-5">
          <div className="sticky top-20 bg-[#0A0A0A] p-6 rounded-3xl border border-[#1e1e1e] text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1e1e1e] pb-3">
              <div className="flex items-center gap-2">
                <Smartphone size={16} className="text-[#0ea5e9]" />
                <span className="text-xs font-bold uppercase tracking-wider text-gray-300">
                  Aperçu Smartphone Direct
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#0ea5e9]/20 text-[#0ea5e9] border border-sky-500/30">
                {channel}
              </span>
            </div>

            {/* Simulated Phone Screen */}
            <div className="bg-[#121212] rounded-2xl p-4 border border-[#222222] space-y-3">
              {/* Top Contact Bar */}
              <div className="flex items-center gap-3 pb-3 border-b border-[#222222]">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0ea5e9] to-blue-600 text-white font-black flex items-center justify-center text-xs shadow-md shadow-sky-500/20">
                  NAY
                </div>
                <div>
                  <div className="font-bold text-xs text-white">NAY Parfum Officiel</div>
                  <div className="text-[10px] text-emerald-400">Compte Professionnel Vérifié</div>
                </div>
              </div>

              {/* Chat Bubble */}
              <div className="bg-[#1f2c34] text-neutral-100 rounded-2xl rounded-tl-sm p-4 text-xs leading-relaxed space-y-2 border border-neutral-800/80 shadow-md">
                {channel === 'EMAIL' && subject && (
                  <div className="text-[11px] font-bold text-[#0ea5e9] pb-1 border-b border-neutral-700">
                    Objet : {subject}
                  </div>
                )}
                <div className="whitespace-pre-wrap">
                  {previewMessage || 'Votre message apparaîtra ici...'}
                </div>
                <div className="text-right text-[10px] text-neutral-400">
                  12:45 • Reçu
                </div>
              </div>

              <div className="text-center pt-2">
                <span className="text-[11px] text-gray-400 flex items-center justify-center gap-1">
                  <Info size={12} /> Exemple avec client test <b>Ayoub</b>
                </span>
              </div>
            </div>

            <div className="bg-[#151515] rounded-xl p-3 border border-[#222222] text-xs text-gray-400 space-y-1">
              <p className="font-bold text-gray-200">💡 Conseil d'optimisation :</p>
              <p>Les messages WhatsApp personnalisés avec code direct et livraison offerte convertissent jusqu'à 3x plus au Maroc.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
