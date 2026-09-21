import React from "react";
import prisma from "@/lib/prisma";
import { Calendar, Sparkles, TrendingUp, Clock, Tag, ShoppingBag, ArrowRight } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

const MOROCCO_SEASONS = [
  {
    period: "Février - Mars",
    title: "Saint-Valentin & Soirées Romantiques",
    intent: "Idée cadeau parfum couple, coffrets duo, parfums séduction",
    keywords: ["parfum saint valentin maroc", "coffret parfum femme maroc", "parfum homme seduction"],
    targetCategory: "Coffrets Cadeaux & Parfums Gourmands",
    badge: "Terminé",
    badgeColor: "bg-slate-100 text-slate-600 border-slate-200",
    impact: "Moyen",
  },
  {
    period: "Mars - Avril",
    title: "Ramadan & Aïd Al-Fitr (Pic Annuel)",
    intent: "Parfums orientaux, Oud royal, Musc blanc, Coffrets prestige Aïd",
    keywords: ["parfum oud maroc", "coffret aid maroc", "parfum oriental casablanca", "musc tahara"],
    targetCategory: "Oud, Ambre, Orientaux & Coffrets Prestige",
    badge: "Pic Majeur",
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
    impact: "Très Élevé (+350% trafic)",
  },
  {
    period: "Mai",
    title: "Fête des Mères & Printemps Floral",
    intent: "Cadeaux mamans, parfums floraux doux, coffrets personnalisés",
    keywords: ["cadeau fete des meres maroc", "meilleur parfum femme maroc", "eau de parfum florale"],
    targetCategory: "Floraux, Jasmin, Rose de Damas, Vanille",
    badge: "À Venir",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    impact: "Élevé",
  },
  {
    period: "Juin - Août",
    title: "Saison des Mariages & Chaleur Estivale",
    intent: "Parfums frais longue tenue, agrumes, brumes parfumées, cadeaux mariés",
    keywords: ["parfum ete longue tenue", "parfum frais homme maroc", "parfum mariage maroc"],
    targetCategory: "Agrumes, Fraîcheur Marine, Hespéridés, Testeurs voyage",
    badge: "Planifié",
    badgeColor: "bg-sky-50 text-sky-700 border-sky-200",
    impact: "Élevé (+180% volume)",
  },
  {
    period: "Septembre - Octobre",
    title: "Rentrée & Parfums Signature Automne",
    intent: "Parfums bureau / travail, sillage distingué, boisés chaleureux",
    keywords: ["parfum travail homme", "parfum boise femme", "parfum automne maroc"],
    targetCategory: "Boisés, Épicés, Cuir, Santal",
    badge: "Planifié",
    badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
    impact: "Moyen-Haut",
  },
  {
    period: "Novembre - Décembre",
    title: "White Friday / Black Friday & Fêtes Fin d'Année",
    intent: "Grosses promotions, packs 2+1, achats de Noël et Nouvel An",
    keywords: ["black friday parfum maroc", "promo parfum rabat", "coffret parfum noel"],
    targetCategory: "Toutes gammes, offres bundles, livraison express",
    badge: "Pic Stratégique",
    badgeColor: "bg-rose-50 text-rose-700 border-rose-200",
    impact: "Maximum (+400% ventes)",
  },
];

export default async function CalendarPage() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
              Calendrier Commercial & SEO Maroc
            </span>
          </div>
          <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
            <Calendar size={20} className="text-neutral-900" />
            <span>Saisonnalité & Pics de Vente E-Commerce au Maroc</span>
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Anticipez les campagnes Google SEO et TikTok Ads 3 à 4 semaines avant chaque pic culturel et commercial marocain.
          </p>
        </div>

        <Link
          href="/admin/marketing/campaigns/new"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-black text-white text-xs font-semibold shadow-2xs transition-colors"
        >
          <Sparkles size={13} />
          <span>Créer une Campagne</span>
        </Link>
      </div>

      {/* Season Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {MOROCCO_SEASONS.map((season, idx) => (
          <div
            key={idx}
            className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-mono font-semibold text-neutral-500 flex items-center gap-1.5">
                  <Clock size={13} className="text-neutral-400" />
                  <span>{season.period}</span>
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${season.badgeColor}`}>
                  {season.badge}
                </span>
              </div>

              <h3 className="font-bold text-neutral-900 text-sm">
                {season.title}
              </h3>

              <p className="text-xs text-neutral-600 leading-relaxed">
                {season.intent}
              </p>

              <div className="space-y-1.5 pt-2 border-t border-neutral-100 text-xs">
                <div className="text-[11px] font-semibold text-neutral-500">Mots-clés cibles :</div>
                <div className="flex flex-wrap gap-1.5">
                  {season.keywords.map((kw, kIdx) => (
                    <span
                      key={kIdx}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-neutral-50 border border-neutral-200 text-[11px] font-mono text-neutral-700"
                    >
                      <Tag size={10} className="text-neutral-400" />
                      <span>{kw}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
              <span className="text-[11px] text-neutral-500">Impact estimé :</span>
              <span className="font-semibold text-neutral-900">{season.impact}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
