'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AffiliateForm({ initialData }: { initialData?: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    code: initialData?.code || '',
    commissionRate: initialData?.commissionRate || 10,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const url = initialData 
      ? `/api/admin/affiliates/${initialData.id}` 
      : '/api/admin/affiliates';
      
    const method = initialData ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (res.ok) {
      router.push('/admin/affiliates');
      router.refresh();
    } else {
      alert("Erreur lors de l'enregistrement. Le code VIP est peut-être déjà utilisé.");
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Voulez-vous vraiment supprimer cet ambassadeur ?')) return;
    setLoading(true);
    const res = await fetch(`/api/admin/affiliates/${initialData.id}`, { method: 'DELETE' });
    if (res.ok) {
      router.push('/admin/affiliates');
      router.refresh();
    } else {
      alert('Erreur lors de la suppression');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/affiliates" className="text-gray-400 hover:text-gray-600">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            {initialData ? 'Modifier l\'ambassadeur' : 'Nouvel Ambassadeur'}
          </h1>
        </div>
        <div className="flex gap-3">
          {initialData && (
            <button 
              type="button" 
              onClick={handleDelete}
              className="text-red-600 px-4 py-2 bg-red-50 rounded-lg hover:bg-red-100 font-medium text-sm flex items-center gap-2"
            >
              <Trash2 size={16} /> Supprimer
            </button>
          )}
          <button 
            type="submit" 
            disabled={loading}
            className="bg-sky-600 text-white px-6 py-2 rounded-lg font-medium text-sm flex items-center gap-2 hover:bg-sky-700 transition-colors disabled:opacity-50"
          >
            <Save size={16} /> {loading ? '...' : 'Enregistrer'}
          </button>
        </div>
      </div>

      <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'influenceur / partenaire</label>
          <input 
            type="text" 
            required
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
            placeholder="Ex: Simo Life, ou Page Instagram Parfums..."
            className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-sky-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Code VIP (pour l'URL)</label>
          <div className="flex">
            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
              nouamane.ma/vip/
            </span>
            <input 
              type="text" 
              required
              value={formData.code}
              onChange={e => setFormData({...formData, code: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '')})}
              placeholder="simo"
              className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:outline-none focus:border-sky-500 text-sm"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Sera utilisé dans le lien : nouamane.ma/vip/{formData.code || '...'}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Commission (%)</label>
          <input 
            type="number" 
            required
            min="0"
            max="100"
            value={formData.commissionRate}
            onChange={e => setFormData({...formData, commissionRate: Number(e.target.value)})}
            className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      {initialData && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mt-6">
          <h3 className="text-sm font-bold text-gray-900 mb-4">Statistiques</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Visites générées</p>
              <p className="font-bold text-lg">{initialData.visits}</p>
            </div>
            <div>
              <p className="text-gray-500">Ventes générées</p>
              <p className="font-bold text-lg">{initialData.sales}</p>
            </div>
            <div>
              <p className="text-gray-500">Chiffre d'Affaires</p>
              <p className="font-bold text-lg text-green-600">{initialData.revenueGenerated} MAD</p>
            </div>
            <div>
              <p className="text-gray-500">Commissions Dues</p>
              <p className="font-bold text-lg text-orange-600">{initialData.commissionEarned} MAD</p>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
