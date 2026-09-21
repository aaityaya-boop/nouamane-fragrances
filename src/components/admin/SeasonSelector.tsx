'use client';

import React from 'react';
import { Check } from 'lucide-react';

export const SEASONS_LIST = [
  { id: 'Printemps', label: 'Printemps', emoji: '🌸', desc: 'Frais & Fleuri' },
  { id: 'Été', label: 'Été', emoji: '☀️', desc: 'Solaire & Aquatique' },
  { id: 'Automne', label: 'Automne', emoji: '🍂', desc: 'Boisé & Épicé' },
  { id: 'Hiver', label: 'Hiver', emoji: '❄️', desc: 'Chaud & Gourmand' },
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
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider">
          Saison Idéale
        </label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSelectAllToggle}
            className={`text-[11px] px-2.5 py-1 rounded-md border font-medium transition-all cursor-pointer ${
              selectedSeasons.length === 4
                ? 'bg-neutral-900 text-white border-neutral-900 shadow-2xs'
                : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
            }`}
          >
            {selectedSeasons.length === 4 ? '✓ 4 Saisons (Toutes)' : 'Sélectionner les 4 saisons'}
          </button>
          {selectedSeasons.length > 0 && selectedSeasons.length < 4 && (
            <span className="text-[11px] font-medium text-neutral-500">
              ({selectedSeasons.length}/4 sélectionnée{selectedSeasons.length > 1 ? 's' : ''})
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {SEASONS_LIST.map((s) => {
          const isSelected = selectedSeasons.includes(s.id);
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => toggleSeason(s.id)}
              className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all flex items-center justify-between gap-2 cursor-pointer ${
                isSelected
                  ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                  : 'bg-neutral-50/80 text-neutral-700 border-neutral-200 hover:bg-white hover:border-neutral-300'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-base sm:text-lg leading-none shrink-0">{s.emoji}</span>
                <div className="min-w-0">
                  <span className={`text-xs font-semibold block truncate ${isSelected ? 'text-white' : 'text-neutral-900'}`}>
                    {s.label}
                  </span>
                  <span className={`text-[10px] block truncate ${isSelected ? 'text-neutral-300' : 'text-neutral-400'}`}>
                    {s.desc}
                  </span>
                </div>
              </div>
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                isSelected ? 'border-white bg-white text-neutral-900' : 'border-neutral-300 bg-white'
              }`}>
                {isSelected && <Check size={11} className="stroke-[3]" />}
              </div>
            </button>
          );
        })}
      </div>

      {value && (
        <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 font-medium">
          <span>Sélection actuelle :</span>
          <span className="font-semibold text-neutral-800 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">
            {value === 'all' ? 'Toutes Saisons' : value}
          </span>
        </div>
      )}
    </div>
  );
}
