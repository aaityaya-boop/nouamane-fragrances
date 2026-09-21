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
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="pb-4 border-b border-neutral-200">
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900 flex items-center gap-2">
          <Sliders size={20} className="text-neutral-700" />
          Paramètres & Automatisations du Moteur de Rétention
        </h2>
        <p className="text-xs text-neutral-500 mt-1">
          Gérez vos protocoles d'envoi, les déclencheurs automatiques et les règles de sécurité pour NAY Parfum.
        </p>
      </div>

      <div className="grid gap-6">
        
        {/* Module 1: WhatsApp Direct Integration */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-neutral-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-medium">
                <MessageSquare size={18} />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 text-sm">Canal WhatsApp Direct (1-Click wa.me)</h3>
                <p className="text-xs text-neutral-500">Relance instantanée optimisée pour les clients marocains sans intermédiaire.</p>
              </div>
            </div>
            <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Actif & Opérationnel
            </span>
          </div>

          <div className="p-3.5 rounded-lg bg-neutral-50 border border-neutral-200 space-y-1.5 text-xs">
            <p className="font-medium text-neutral-800">Formatage automatique des numéros :</p>
            <p className="text-neutral-600 leading-relaxed">
              Tous les numéros marocains (ex: <code className="bg-white px-1.5 py-0.5 border border-neutral-200 rounded text-neutral-800 font-mono text-[11px]">0661xxxxxx</code> ou <code className="bg-white px-1.5 py-0.5 border border-neutral-200 rounded text-neutral-800 font-mono text-[11px]">0700xxxxxx</code>) sont automatiquement normalisés au format international <code className="bg-white px-1.5 py-0.5 border border-neutral-200 rounded text-neutral-800 font-mono text-[11px]">+212</code> pour une ouverture instantanée sur l'application WhatsApp.
            </p>
          </div>
        </div>

        {/* Module 2: Automation Pipelines */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-neutral-200 shadow-2xs space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-neutral-100">
            <div className="w-9 h-9 rounded-lg bg-neutral-100 text-neutral-700 border border-neutral-200 flex items-center justify-center font-medium">
              <Zap size={18} />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900 text-sm">Pipelines & Règles d'Automatisation</h3>
              <p className="text-xs text-neutral-500">Déclencheurs intelligents pour maximiser le taux de conversion.</p>
            </div>
          </div>

          <div className="space-y-3">
            {/* Rule 1 */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-lg bg-neutral-50 border border-neutral-200 gap-3">
              <div className="space-y-0.5">
                <div className="font-medium text-xs text-neutral-900 flex items-center gap-1.5">
                  <Clock size={13} className="text-neutral-500" />
                  Seuil de détection du Panier Abandonné (60 minutes)
                </div>
                <div className="text-[11px] text-neutral-500">
                  Un panier est marqué comme abandonné après 1h sans activité et apparaît immédiatement dans la file de relance.
                </div>
              </div>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0 self-start sm:self-auto">
                Actif (60 min)
              </span>
            </div>

            {/* Rule 2 */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-lg bg-neutral-50 border border-neutral-200 gap-3">
              <div className="space-y-0.5">
                <div className="font-medium text-xs text-neutral-900 flex items-center gap-1.5">
                  <Sparkles size={13} className="text-amber-600" />
                  Attribution Automatique des Rangs VIP
                </div>
                <div className="text-[11px] text-neutral-500">
                  Calcul en direct des paliers VIP Diamant (&gt;5k MAD), VIP Or (&gt;2.5k MAD) et VIP Argent (&gt;1k MAD).
                </div>
              </div>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0 self-start sm:self-auto">
                Actif (En direct)
              </span>
            </div>

            {/* Rule 3 */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-lg bg-neutral-50 border border-neutral-200 gap-3">
              <div className="space-y-0.5">
                <div className="font-medium text-xs text-neutral-900 flex items-center gap-1.5">
                  <ShieldCheck size={13} className="text-neutral-600" />
                  Mode Sécurité & Anti-Spam
                </div>
                <div className="text-[11px] text-neutral-500">
                  Validation manuelle requise avant tout envoi groupé pour protéger la délivrabilité et éviter les blocages.
                </div>
              </div>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700 border border-neutral-200 shrink-0 self-start sm:self-auto">
                Protection active
              </span>
            </div>
          </div>
        </div>

        {/* Module 3: Pre-configured Luxury Templates */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-neutral-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-neutral-100 text-neutral-700 border border-neutral-200 flex items-center justify-center font-medium">
                <Sparkles size={18} />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 text-sm">Modèles de Messages Pré-intégrés</h3>
                <p className="text-xs text-neutral-500">Modèles haute conversion français & darija pour les parfums de luxe.</p>
              </div>
            </div>
            <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-md bg-neutral-100 text-neutral-700 border border-neutral-200">
              4 Modèles Prêts
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-lg bg-neutral-50 border border-neutral-200 space-y-2">
              <span className="font-semibold text-neutral-900 text-xs">1. Relance Panier Abandonné + Cadeau</span>
              <p className="text-neutral-600 leading-relaxed font-mono text-[11px] bg-white p-2.5 rounded-md border border-neutral-200">
                "Salam &#123;&#123;first_name&#125;&#125; 👋, votre panier chez NAY Parfum vous attend ! Pour toute commande validée aujourd'hui, nous vous offrons un flacon découverte de 5ml..."
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-neutral-50 border border-neutral-200 space-y-2">
              <span className="font-semibold text-neutral-900 text-xs">2. Offre Privilège Membre VIP</span>
              <p className="text-neutral-600 leading-relaxed font-mono text-[11px] bg-white p-2.5 rounded-md border border-neutral-200">
                "Salam &#123;&#123;first_name&#125;&#125; ✨, en tant que client VIP d'honneur chez NAY Parfum, nous vous réservons une remise exclusive de -15% avec le code VIP15..."
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
