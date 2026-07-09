'use client';

import React, { useState, useEffect } from 'react';
import { Ticket, Plus, Trash2 } from 'lucide-react';

export default function AdminPromos() {
  const [promos, setPromos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('');
  const [type, setType] = useState('percentage');
  const [value, setValue] = useState('');

  const fetchPromos = async () => {
    try {
      const res = await fetch('/api/admin/promos');
      const data = await res.json();
      setPromos(data);
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
        alert(data.error);
      }
    } catch (error) {
      console.error(error);
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
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A] mb-2">Codes Promo</h1>
          <p className="text-[#6B6B6B] text-[14px]">Gérez vos offres et réductions.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Créer un code */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-[#e0ddd4] rounded-2xl p-6 shadow-sm">
            <h2 className="text-[16px] font-bold text-[#1A1A1A] mb-6 flex items-center gap-2">
              <Plus size={18} />
              Nouveau code promo
            </h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold tracking-[0.1em] uppercase text-[#9A9A9A] mb-2">Code</label>
                <input 
                  type="text" 
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase().replace(/\s/g, ''))}
                  placeholder="EX: SUMMER20"
                  required
                  className="w-full bg-[#fafaf7] border border-[#e0ddd4] rounded-xl px-4 py-3 text-[13px] font-bold text-[#1A1A1A] focus:outline-none focus:border-[#0ea5e9] uppercase"
                />
              </div>
              
              <div>
                <label className="block text-[11px] font-bold tracking-[0.1em] uppercase text-[#9A9A9A] mb-2">Type de remise</label>
                <select 
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full bg-[#fafaf7] border border-[#e0ddd4] rounded-xl px-4 py-3 text-[13px] focus:outline-none focus:border-[#0ea5e9]"
                >
                  <option value="percentage">Pourcentage (%)</option>
                  <option value="fixed">Montant fixe (DH)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold tracking-[0.1em] uppercase text-[#9A9A9A] mb-2">Valeur</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="EX: 20"
                    required
                    min="1"
                    className="w-full bg-[#fafaf7] border border-[#e0ddd4] rounded-xl pl-4 pr-10 py-3 text-[13px] font-bold text-[#1A1A1A] focus:outline-none focus:border-[#0ea5e9]"
                  />
                  <div className="absolute right-4 top-3 text-[13px] font-bold text-[#9A9A9A]">
                    {type === 'percentage' ? '%' : 'DH'}
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full btn-blue flex justify-center py-3 rounded-xl text-[12px] font-bold tracking-[0.1em] uppercase mt-2"
              >
                Ajouter le code
              </button>
            </form>
          </div>
        </div>

        {/* Liste des codes */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-[#e0ddd4] rounded-2xl p-6 shadow-sm">
            <h2 className="text-[16px] font-bold text-[#1A1A1A] mb-6 flex items-center gap-2">
              <Ticket size={18} />
              Codes existants
            </h2>

            {loading ? (
              <div className="text-center py-8 text-[#9A9A9A] text-[13px]">Chargement...</div>
            ) : promos.length === 0 ? (
              <div className="text-center py-12 text-[#9A9A9A] bg-[#fafaf7] rounded-xl border border-[#e0ddd4] border-dashed">
                <Ticket size={32} className="mx-auto mb-3 opacity-20" />
                <p className="text-[14px]">Aucun code promo créé pour le moment.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {promos.map((promo) => (
                  <div key={promo.id} className="flex items-center justify-between p-4 border border-[#e0ddd4] rounded-xl hover:bg-[#fafaf7] transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-sky-50 text-sky-500 rounded-lg flex items-center justify-center">
                        <Ticket size={20} />
                      </div>
                      <div>
                        <div className="text-[16px] font-bold tracking-wider text-[#1A1A1A]">{promo.code}</div>
                        <div className="text-[12px] font-semibold tracking-[0.1em] uppercase text-[#0ea5e9] mt-0.5">
                          Remise : {promo.type === 'percentage' ? `-${promo.value}%` : `-${promo.value} DH`}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[11px] text-[#9A9A9A]">
                        Créé le {new Date(promo.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                      <button 
                        onClick={() => handleDelete(promo.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 size={18} />
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
