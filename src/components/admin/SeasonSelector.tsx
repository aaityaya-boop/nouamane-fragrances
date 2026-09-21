'use client';

import React from 'react';
import { Check, Flower2, Sun, Leaf, Snowflake, Sparkles } from 'lucide-react';

export const SEASONS_LIST = [
  { 
    id: 'Printemps', 
    label: 'Printemps', 
    icon: Flower2,
    iconColor: 'text-rose-500 group-hover:text-rose-600',
    iconBg: 'bg-rose-50 border-rose-100',
    desc: 'Frais & Floral' 
  },
  { 
    id: 'Été', 
    label: 'Été', 
    icon: Sun,
    iconColor: 'text-amber-500 group-hover:text-amber-600',
    iconBg: 'bg-amber-50 border-amber-100',
    desc: 'Solaire & Hespéridé' 
  },
  { 
    id: 'Automne', 
    label: 'Automne', 
    icon: Leaf,
    iconColor: 'text-orange-500 group-hover:text-orange-600',
    iconBg: 'bg-orange-50 border-orange-100',
    desc: 'Boisé & Épicé' 
  },
  { 
    id: 'Hiver', 
    label: 'Hiver', 
    icon: Snowflake,
    iconColor: 'text-sky-500 group-hover:text-sky-600',
    iconBg: 'bg-sky-50 border-sky-100',
    desc: 'Chaud & Gourmand' 
  },
];

export function parseSeasons(seasonStr?: string): string[] {
  if (!seasonStr) return [];
  const s = seasonStr.trim();
  if (s.toLowerCase() === 'all' || s.toLowerCase() === 'toutes saisons' || s.toLowerCase() === 'toutes les saisons') {
    return ['Printemps', 'Été', 'Automne', 'Hiver'];
  }
  const parts = s.split(',').map(p => p.trim()).filter(Boolean);
  const matched: string[] = [];
  parts.forEach(part => {
    const pLow = part.toLowerCase();
    if (pLow.includes('printemps')) matched.push('Printemps');
    else if (pLow.includes('été') || pLow.includes('ete')) matched.push('Été');
    else if (pLow.includes('automne')) matched.push('Automne');
    else if (pLow.includes('hiver')) matched.push('Hiver');
    else if (pLow === 'all' || pLow === 'toutes saisons') {
      matched.push('Printemps', 'Été', 'Automne', 'Hiver');
    } else {
      matched.push(part);
    }
  });
  return Array.from(new Set(matched));
}

interface SeasonSelectorProps {
  value: string;
  onChange: (newValue: string) => void;
}

export default function SeasonSelector({ value, onChange }: SeasonSelectorProps) {
  const selectedSeasons = parseSeasons(value);

  const toggleSeason = (seasonId: string) => {
    let next: string[];
    if (selectedSeasons.includes(seasonId)) {
      next = selectedSeasons.filter(s => s !== seasonId);
    } else {
      const order = ['Printemps', 'Été', 'Automne', 'Hiver'];
      const set = new Set([...selectedSeasons, seasonId]);
      next = order.filter(s => set.has(s));
    }

    if (next.length === 4) {
      onChange('Toutes Saisons');
    } else if (next.length === 0) {
      onChange('');
    } else {
      onChange(next.join(', '));
    }
  };

  const handleSelectAllToggle = () => {
    if (selectedSeasons.length === 4) {
      onChange('');
    } else {
      onChange('Toutes Saisons');
    }
  };

  return (
    <div className="space-y-2.5">
      
      {/* Header Label & Quick 4 Saisons Action */}
      <div className="flex items-center justify-between">
        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
          Saison Idéale de Port
        </label>
        
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSelectAllToggle}
            className={`text-[11px] px-2.5 py-1 rounded-lg border font-semibold transition-all cursor-pointer ${
              selectedSeasons.length === 4
                ? 'bg-[#1D9BF0] text-white border-[#1D9BF0] shadow-2xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            {selectedSeasons.length === 4 ? '✓ 4 Saisons (Toutes)' : 'Sélectionner les 4 saisons'}
          </button>
          
          {selectedSeasons.length > 0 && selectedSeasons.length < 4 && (
            <span className="text-[11px] font-medium text-slate-400">
              ({selectedSeasons.length}/4)
            </span>
          )}
        </div>
      </div>

      {/* Grid of 4 Vector Season Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {SEASONS_LIST.map((s) => {
          const isSelected = selectedSeasons.includes(s.id);
          const IconComponent = s.icon;

          return (
            <button
              key={s.id}
              type="button"
              onClick={() => toggleSeason(s.id)}
              className={`p-2.5 sm:p-3 rounded-2xl border text-left transition-all flex items-center justify-between gap-2.5 cursor-pointer group ${
                isSelected
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm ring-2 ring-slate-900/10'
                  : 'bg-white text-slate-700 border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/80'
              }`}
            >
              {/* Vector Icon + Label */}
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border transition-transform group-hover:scale-105 ${
                  isSelected 
                    ? 'bg-white/10 border-white/10 text-white' 
                    : `${s.iconBg} ${s.iconColor}`
                }`}>
                  <IconComponent size={16} strokeWidth={2.2} />
                </div>

                <div className="min-w-0">
                  <span className={`text-xs font-bold block truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                    {s.label}
                  </span>
                  <span className={`text-[10px] block truncate font-medium ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                    {s.desc}
                  </span>
                </div>
              </div>

              {/* Check Indicator */}
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                isSelected 
                  ? 'border-[#1D9BF0] bg-[#1D9BF0] text-white' 
                  : 'border-slate-300 bg-slate-50 group-hover:border-slate-400'
              }`}>
                {isSelected && <Check size={10} strokeWidth={3.5} />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Current Selection Tag */}
      {value && (
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium pt-0.5">
          <span>Sélection enregistrée :</span>
          <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/80">
            {value === 'all' ? 'Toutes Saisons' : value}
          </span>
        </div>
      )}

    </div>
  );
}
