'use client';

import React from 'react';
import { Check, Flower2, Sun, Leaf, Snowflake } from 'lucide-react';

export const SEASONS_LIST = [
  { 
    id: 'Printemps', 
    label: 'Printemps', 
    icon: Flower2,
    activeColor: 'text-[#0284c7]',
    activeBg: 'bg-sky-50 border-[#1D9BF0] ring-1 ring-[#1D9BF0]/30',
  },
  { 
    id: 'Été', 
    label: 'Été', 
    icon: Sun,
    activeColor: 'text-[#0284c7]',
    activeBg: 'bg-sky-50 border-[#1D9BF0] ring-1 ring-[#1D9BF0]/30',
  },
  { 
    id: 'Automne', 
    label: 'Automne', 
    icon: Leaf,
    activeColor: 'text-[#0284c7]',
    activeBg: 'bg-sky-50 border-[#1D9BF0] ring-1 ring-[#1D9BF0]/30',
  },
  { 
    id: 'Hiver', 
    label: 'Hiver', 
    icon: Snowflake,
    activeColor: 'text-[#0284c7]',
    activeBg: 'bg-sky-50 border-[#1D9BF0] ring-1 ring-[#1D9BF0]/30',
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
    <div className="space-y-1.5">
      {/* Label & Quick Toggle */}
      <div className="flex items-center justify-between">
        <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
          Saison Idéale
        </label>
        
        <button
          type="button"
          onClick={handleSelectAllToggle}
          className="text-[11px] font-medium text-slate-500 hover:text-[#1D9BF0] transition-colors cursor-pointer"
        >
          {selectedSeasons.length === 4 ? 'Effacer la sélection' : 'Toutes les saisons (4)'}
        </button>
      </div>

      {/* 4 Clean Segmented Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {SEASONS_LIST.map((s) => {
          const isSelected = selectedSeasons.includes(s.id);
          const IconComponent = s.icon;

          return (
            <button
              key={s.id}
              type="button"
              onClick={() => toggleSeason(s.id)}
              className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isSelected
                  ? 'bg-sky-50 text-[#0284c7] border-[#1D9BF0] font-semibold shadow-2xs'
                  : 'bg-slate-50/70 text-slate-600 border-slate-200 hover:bg-white hover:border-slate-300 hover:text-slate-900'
              }`}
            >
              <IconComponent 
                size={14} 
                className={isSelected ? 'text-[#1D9BF0]' : 'text-slate-400'} 
              />
              <span>{s.label}</span>
              {isSelected && (
                <Check size={12} className="text-[#1D9BF0] stroke-[3]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
