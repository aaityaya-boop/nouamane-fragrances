'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Trash2, ArrowLeft } from 'lucide-react';
import { PRODUCTS } from '@/lib/products';
import Link from 'next/link';

export default function LandingPageForm({ initialData }: { initialData?: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    slug: initialData?.slug || '',
    title: initialData?.title || 'Le Luxe Authentique, Sans Compromis.',
    subtitle: initialData?.subtitle || 'Offrez-vous les parfums les plus prisés au monde...',
    heroImage: initialData?.heroImage || 'https://images.pexels.com/photos/965993/pexels-photo-965993.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800',
    deadline: initialData?.deadline ? new Date(initialData.deadline).toISOString().slice(0, 16) : '',
    badgeText: initialData?.badgeText || 'Offre Spéciale Maroc',
    status: initialData?.status || 'draft',
    productSlugs: initialData?.productSlugs ? (() => {
      try {
        const parsed = JSON.parse(initialData.productSlugs);
        return parsed.map((item: any) => typeof item === 'string' ? { slug: item, promoPrice: null } : item);
      } catch { return []; }
    })() : []
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const url = initialData 
      ? `/api/admin/landing-pages/${initialData.id}` 
      : '/api/admin/landing-pages';
      
    const method = initialData ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (res.ok) {
      router.push('/admin/landing-pages');
      router.refresh();
    } else {
      alert("Erreur lors de l'enregistrement");
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Voulez-vous vraiment supprimer cette page ?')) return;
    setLoading(true);
    const res = await fetch(`/api/admin/landing-pages/${initialData.id}`, { method: 'DELETE' });
    if (res.ok) {
      router.push('/admin/landing-pages');
      router.refresh();
    } else {
      alert('Erreur lors de la suppression');
      setLoading(false);
    }
  };

  const toggleProduct = (slug: string) => {
    setFormData(prev => {
      const current = prev.productSlugs;
      const exists = current.find((item: any) => item.slug === slug);
      if (exists) {
        return { ...prev, productSlugs: current.filter((item: any) => item.slug !== slug) };
      } else {
        return { ...prev, productSlugs: [...current, { slug, promoPrice: null }] };
      }
    });
  };

  const updatePromoPrice = (slug: string, priceStr: string) => {
    const promoPrice = priceStr === '' ? null : Number(priceStr);
    setFormData(prev => {
      const current = prev.productSlugs;
      return {
        ...prev,
        productSlugs: current.map((item: any) => item.slug === slug ? { ...item, promoPrice } : item)
      };
    });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/landing-pages" className="text-gray-400 hover:text-gray-600">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            {initialData ? 'Modifier la Landing Page' : 'Nouvelle Landing Page'}
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
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL (Slug)</label>
            <div className="flex items-center">
              <span className="bg-gray-50 border border-gray-200 border-r-0 rounded-l-md px-3 text-gray-500 py-2 text-sm">
                /promo/
              </span>
              <input 
                type="text" 
                required
                value={formData.slug}
                onChange={e => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')})}
                placeholder="ex: fete-des-meres"
                className="flex-1 border border-gray-200 rounded-r-md px-3 py-2 text-sm focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
            <select 
              value={formData.status}
              onChange={e => setFormData({...formData, status: e.target.value})}
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-sky-500"
            >
              <option value="draft">Brouillon (Non visible)</option>
              <option value="active">En ligne</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Titre principal (Hero)</label>
          <input 
            type="text" 
            required
            value={formData.title}
            onChange={e => setFormData({...formData, title: e.target.value})}
            className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-sky-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sous-titre (Description)</label>
          <textarea 
            required
            rows={3}
            value={formData.subtitle}
            onChange={e => setFormData({...formData, subtitle: e.target.value})}
            className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-sky-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Texte du Badge (ex: Offre Spéciale)</label>
          <input 
            type="text" 
            required
            value={formData.badgeText}
            onChange={e => setFormData({...formData, badgeText: e.target.value})}
            className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-sky-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin (Vente Flash) - Optionnel</label>
          <input 
            type="datetime-local" 
            value={formData.deadline}
            onChange={e => setFormData({...formData, deadline: e.target.value})}
            className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-sky-500"
          />
          <p className="text-xs text-gray-500 mt-1">Si renseigné, une barre de compte à rebours s'affichera.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Image Hero (URL)</label>
          <input 
            type="text" 
            required
            value={formData.heroImage}
            onChange={e => setFormData({...formData, heroImage: e.target.value})}
            className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-sky-500"
          />
          {formData.heroImage && (
            <div className="mt-3 w-48 h-32 relative rounded-lg overflow-hidden border border-gray-200">
              <img src={formData.heroImage} alt="Preview" className="object-cover w-full h-full" />
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 pt-6">
          <label className="block text-sm font-bold text-gray-900 mb-3">Sélection des Parfums pour l'offre</label>
          <p className="text-xs text-gray-500 mb-4">Cochez les parfums que vous souhaitez afficher sur cette Landing Page.</p>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto p-2 border border-gray-100 rounded-lg bg-gray-50">
            {PRODUCTS.map(p => {
              const selectedItem = formData.productSlugs.find((item: any) => item.slug === p.slug);
              const isSelected = !!selectedItem;
              return (
                <div key={p.id} className={`flex flex-col gap-2 p-3 rounded-lg border transition-colors ${isSelected ? 'bg-sky-50 border-sky-200' : 'bg-white border-gray-200 hover:border-gray-300'}`}>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={isSelected}
                      onChange={() => toggleProduct(p.slug)}
                      className="rounded text-sky-500 focus:ring-sky-500 w-4 h-4"
                    />
                    <div className="flex items-center gap-2 flex-1">
                      <div className="w-8 h-8 relative rounded overflow-hidden bg-gray-100 flex-shrink-0">
                        <img src={p.images[0]} alt="" className="object-cover w-full h-full" />
                      </div>
                      <div className="text-xs font-medium text-gray-700 line-clamp-2">{p.name}</div>
                    </div>
                  </label>
                  
                  {isSelected && (
                    <div className="pl-7 mt-1">
                      <label className="text-[10px] text-gray-500 mb-1 block">Prix promotionnel (Optionnel)</label>
                      <input 
                        type="number"
                        placeholder={`Normal: ${p.price} DH`}
                        value={selectedItem.promoPrice || ''}
                        onChange={e => updatePromoPrice(p.slug, e.target.value)}
                        className="w-full text-xs p-2 border border-gray-300 rounded focus:border-sky-500 focus:outline-none bg-white"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </form>
  );
}
