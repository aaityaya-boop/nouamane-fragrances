'use client';

import React, { useState, useEffect } from 'react';
import { Ticket, Plus, Trash2, Tag, Loader2, Sparkles } from 'lucide-react';

export default function AdminPromos() {
  const [promos, setPromos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('');
  const [type, setType] = useState('percentage');
  const [value, setValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPromos = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/promos');
      const data = await res.json();
      setPromos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromos();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !value) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/promos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, type, value })
      });

      if (res.ok) {
        setCode('');
        setValue('');
        fetchPromos();
      } else {
        const data = await res.json();
        alert(data.error || 'Erreur lors de la création du code promo');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer ce code promo ?')) return;

    try {
      const res = await fetch(`/api/admin/promos?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchPromos();
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-semibold tracking-wider bg-neutral-100 text-neutral-700 border border-neutral-200">
              Marketing & Offres
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 flex items-center gap-2">
            <Ticket size={22} className="text-neutral-900" />
            <span>Codes Promo & Réductions</span>
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Créez des remises en pourcentage ou en montant fixe à partager avec vos clients.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Créer un code */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-neutral-200 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-neutral-100">
              <div className="w-8 h-8 rounded-lg bg-neutral-100 text-neutral-800 flex items-center justify-center border border-neutral-200">
                <Plus size={16} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-neutral-900">Nouveau Code Promo</h2>
                <p className="text-[11px] text-neutral-500">Ajoutez un code actif pour le panier</p>
              </div>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-neutral-700 mb-1">Code Promo *</label>
                <input 
                  type="text" 
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase().replace(/\s/g, ''))}
                  placeholder="EX: EID2026"
                  required
                  className="w-full bg-[#f8fafc] border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-neutral-900 placeholder:font-normal focus:bg-white focus:outline-none focus:border-neutral-900 uppercase transition-colors"
                />
              </div>
              
              <div>
                <label className="block font-medium text-neutral-700 mb-1">Type de remise</label>
                <select 
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full bg-[#f8fafc] border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 focus:bg-white focus:outline-none focus:border-neutral-900 transition-colors"
                >
                  <option value="percentage">Pourcentage (%)</option>
                  <option value="fixed">Montant fixe (MAD)</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">Valeur de la remise *</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="EX: 15"
                    required
                    min="1"
                    className="w-full bg-[#f8fafc] border border-neutral-200 rounded-xl pl-3.5 pr-10 py-2.5 text-xs font-semibold text-neutral-900 focus:bg-white focus:outline-none focus:border-neutral-900 transition-colors"
                  />
                  <div className="absolute right-3.5 top-2.5 text-xs font-bold text-neutral-400">
                    {type === 'percentage' ? '%' : 'MAD'}
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-neutral-900 hover:bg-black text-white py-2.5 rounded-xl text-xs font-medium transition-all shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
                  <span>Créer le code promo</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Liste des codes */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-neutral-200 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-neutral-100 text-neutral-800 flex items-center justify-center border border-neutral-200">
                  <Ticket size={16} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-neutral-900">Codes Actifs ({promos.length})</h2>
                  <p className="text-[11px] text-neutral-500">Liste de tous vos codes promo actifs</p>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-16 text-neutral-400 text-xs">Chargement des codes...</div>
            ) : promos.length === 0 ? (
              <div className="text-center py-14 text-neutral-400 bg-neutral-50/50 rounded-xl border border-neutral-200 border-dashed flex flex-col items-center justify-center gap-2">
                <Ticket size={28} className="opacity-30" />
                <p className="text-xs font-semibold text-neutral-700">Aucun code promo créé</p>
                <p className="text-[11px] text-neutral-400 max-w-xs">Utilisez le formulaire à gauche pour créer votre premier code promo.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {promos.map((promo) => (
                  <div key={promo.id} className="flex items-center justify-between p-3.5 border border-neutral-200 rounded-xl bg-[#f8fafc] hover:bg-neutral-100/60 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-white border border-neutral-200 rounded-lg flex items-center justify-center text-neutral-900 shadow-2xs">
                        <Tag size={16} />
                      </div>
                      <div>
                        <div className="text-xs font-bold font-mono tracking-wider text-neutral-900">{promo.code}</div>
                        <div className="text-[11px] font-semibold text-emerald-700 mt-0.5">
                          Remise : {promo.type === 'percentage' ? `-${promo.value}%` : `-${promo.value} MAD`}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-neutral-400">
                        {new Date(promo.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                      <button 
                        onClick={() => handleDelete(promo.id)}
                        className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Supprimer le code"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
