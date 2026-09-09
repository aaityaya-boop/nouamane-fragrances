import React from 'react';
import { 
  Sliders, 
  ShieldCheck, 
  Mail, 
  MessageSquare, 
  Zap, 
  CheckCircle2, 
  Bell, 
  Clock, 
  Sparkles,
  Smartphone,
  Lock,
  ArrowRight
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function MarketingSettingsPage() {
  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <h2 className="text-xl md:text-2xl font-black text-neutral-900 tracking-tight flex items-center gap-2">
          <Sliders size={22} className="text-[#0ea5e9]" />
          Paramètres & Automatisations du Moteur de Rétention
        </h2>
        <p className="text-xs md:text-sm text-neutral-500 mt-1">
          Gérez vos protocoles d'envoi, les déclencheurs automatiques et les règles de sécurité pour NAY Parfum.
        </p>
      </div>

      <div className="grid gap-6">
        
        {/* Module 1: WhatsApp Direct Integration */}
        <div className="bg-white rounded-2xl p-6 border border-neutral-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#25D366] text-white flex items-center justify-center font-bold shadow-sm">
                <MessageSquare size={20} />
              </div>
              <div>
                <h3 className="font-bold text-neutral-900 text-base">Canal WhatsApp Direct (1-Click wa.me)</h3>
                <p className="text-xs text-neutral-500">Relance instantanée optimisée pour les clients marocains sans intermédiaire.</p>
              </div>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              ACTIF & OPÉRATIONNEL
            </span>
          </div>

          <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/70 space-y-2 text-xs">
            <p className="font-bold text-neutral-800">Formatage automatique des numéros :</p>
            <p className="text-neutral-600">
              Tous les numéros marocains (ex: <code className="bg-neutral-200 px-1 py-0.5 rounded text-neutral-800">0661xxxxxx</code> ou <code className="bg-neutral-200 px-1 py-0.5 rounded text-neutral-800">0700xxxxxx</code>) sont automatiquement normalisés au format international <code className="bg-neutral-200 px-1 py-0.5 rounded text-neutral-800">+212</code> pour une ouverture instantanée sur l'application WhatsApp.
            </p>
          </div>
        </div>

        {/* Module 2: Automation Pipelines */}
        <div className="bg-white rounded-2xl p-6 border border-neutral-200/80 shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-neutral-100">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#0ea5e9] flex items-center justify-center font-bold border border-sky-200">
              <Zap size={20} />
            </div>
            <div>
              <h3 className="font-bold text-neutral-900 text-base">Pipelines & Règles d'Automatisation</h3>
              <p className="text-xs text-neutral-500">Déclencheurs intelligents pour maximiser le taux de conversion.</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Rule 1 */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-neutral-50 border border-neutral-200/70 gap-3">
              <div className="space-y-1">
                <div className="font-bold text-sm text-neutral-900 flex items-center gap-2">
                  <Clock size={14} className="text-[#0ea5e9]" />
                  Seuil de détection du Panier Abandonné (60 minutes)
                </div>
                <div className="text-xs text-neutral-500">
                  Un panier est marqué comme abandonné après 1h sans activité et apparaît immédiatement dans la file de relance.
                </div>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-lg bg-emerald-100 text-emerald-800 shrink-0">
                ACTIF (60 min)
              </span>
            </div>

            {/* Rule 2 */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-neutral-50 border border-neutral-200/70 gap-3">
              <div className="space-y-1">
                <div className="font-bold text-sm text-neutral-900 flex items-center gap-2">
                  <Sparkles size={14} className="text-[#0ea5e9]" />
                  Attribution Automatique des Rangs VIP
                </div>
                <div className="text-xs text-neutral-500">
                  Calcul en direct des paliers VIP Diamant (&gt;5k MAD), VIP Or (&gt;2.5k MAD) et VIP Argent (&gt;1k MAD).
                </div>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-lg bg-emerald-100 text-emerald-800 shrink-0">
                ACTIF (En Direct)
              </span>
            </div>

            {/* Rule 3 */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-neutral-50 border border-neutral-200/70 gap-3">
              <div className="space-y-1">
                <div className="font-bold text-sm text-neutral-900 flex items-center gap-2">
                  <ShieldCheck size={14} className="text-indigo-600" />
                  Mode Sécurité & Anti-Spam
                </div>
                <div className="text-xs text-neutral-500">
                  Validation manuelle requise avant tout envoi groupé pour protéger la délivrabilité et éviter les blocages.
                </div>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-lg bg-indigo-100 text-indigo-800 shrink-0">
                PROTECTION ACTIVE
              </span>
            </div>
          </div>
        </div>

        {/* Module 3: Pre-configured Luxury Templates */}
        <div className="bg-[#0A0A0A] text-white rounded-2xl p-6 border border-[#1e1e1e] shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-[#1e1e1e]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0ea5e9]/10 text-[#0ea5e9] flex items-center justify-center font-bold border border-[#0ea5e9]/20">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Modèles de Messages Pré-intégrés</h3>
                <p className="text-xs text-gray-400">Modèles haute conversion français & darija pour les parfums de luxe.</p>
              </div>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#0ea5e9] text-white">
              4 Modèles Prêts
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-[#141414] border border-[#222222] space-y-2">
              <span className="font-bold text-[#0ea5e9]">1. Relance Panier Abandonné + Cadeau</span>
              <p className="text-gray-300 leading-relaxed font-mono text-[11px]">
                "Salam &#123;&#123;first_name&#125;&#125; 👋, votre panier chez NAY Parfum vous attend ! Pour toute commande validée aujourd'hui, nous vous offrons un flacon découverte de 5ml..."
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#141414] border border-[#222222] space-y-2">
              <span className="font-bold text-[#0ea5e9]">2. Offre Privilège Membre VIP</span>
              <p className="text-gray-300 leading-relaxed font-mono text-[11px]">
                "Salam &#123;&#123;first_name&#125;&#125; ✨, en tant que client VIP d'honneur chez NAY Parfum, nous vous réservons une remise exclusive de -15% avec le code VIP15..."
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
