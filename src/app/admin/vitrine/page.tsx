'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Flame, Search, Plus, X, Save, Check, Loader2, LayoutDashboard } from 'lucide-react';

interface Product {
  id: number;
  slug: string;
  name: string;
  brandLabel: string;
  price: number;
  gender: string;
  images: string;
}

export default function VitrinePage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [bestsellersSlug, setBestsellersSlug] = useState<string[]>([]);
  const [seasonalSlug, setSeasonalSlug] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'bestsellers' | 'seasonal'>('bestsellers');

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/products').then(r => r.json()),
      fetch('/api/admin/settings').then(r => r.json()),
    ]).then(([products, config]) => {
      setAllProducts(Array.isArray(products) ? products : []);
      try {
        setBestsellersSlug(JSON.parse(config.featuredBestsellers || '[]'));
        setSeasonalSlug(JSON.parse(config.featuredSeasonal || '[]'));
      } catch {
        setBestsellersSlug([]);
        setSeasonalSlug([]);
      }
      setIsLoading(false);
    }).catch(() => setIsLoading(false));
  }, []);

  const currentSlugs = activeTab === 'bestsellers' ? bestsellersSlug : seasonalSlug;
  const setCurrentSlugs = activeTab === 'bestsellers' ? setBestsellersSlug : setSeasonalSlug;

  const toggleProduct = (slug: string) => {
    setCurrentSlugs(prev =>
      prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMsg('');
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          featuredBestsellers: JSON.stringify(bestsellersSlug),
          featuredSeasonal: JSON.stringify(seasonalSlug),
        }),
      });
      if (res.ok) {
        setSaveMsg('Vitrine mise à jour avec succès !');
        setTimeout(() => setSaveMsg(''), 3000);
      } else {
        setSaveMsg('Erreur lors de la sauvegarde.');
      }
    } catch {
      setSaveMsg('Erreur lors de la sauvegarde.');
    } finally {
      setIsSaving(false);
    }
  };

  const filtered = allProducts.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.brandLabel.toLowerCase().includes(search.toLowerCase()) ||
    p.slug.toLowerCase().includes(search.toLowerCase())
  );

  const getImage = (p: Product) => {
    try { return JSON.parse(p.images)[0] || '/images/hero.png'; } catch { return '/images/hero.png'; }
  };

  if (isLoading) {
    return (
      <div className="p-8 lg:p-12 flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-[#0ea5e9]" size={32} />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <LayoutDashboard size={20} className="text-[#0ea5e9]" />
            <h1 className="text-2xl font-bold text-[#1A1A1A]">Vitrine Homepage</h1>
          </div>
          <p className="text-[13px] text-[#9A9A9A]">
            Choisissez les produits à afficher dans les sections Bestsellers et Tendances sur la page d'accueil.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 bg-[#1A1A1A] hover:bg-[#0ea5e9] text-white px-6 py-3 rounded-xl text-[13px] font-bold transition-colors disabled:opacity-60"
        >
          {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Enregistrer la vitrine
        </button>
      </div>

      {saveMsg && (
        <div className={`flex items-center gap-2 text-[13px] px-4 py-3 rounded-xl ${saveMsg.includes('succès') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          <Check size={14} />
          {saveMsg}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#e0ddd4] pb-0">
        <button
          onClick={() => setActiveTab('bestsellers')}
          className={`flex items-center gap-2 px-5 py-3 text-[13px] font-bold border-b-2 transition-colors ${activeTab === 'bestsellers' ? 'border-[#0ea5e9] text-[#0ea5e9]' : 'border-transparent text-[#9A9A9A] hover:text-[#1A1A1A]'}`}
        >
          <Flame size={14} />
          Bestsellers
          <span className="bg-[#0ea5e9]/10 text-[#0ea5e9] text-[10px] font-bold px-2 py-0.5 rounded-full">
            {bestsellersSlug.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('seasonal')}
          className={`flex items-center gap-2 px-5 py-3 text-[13px] font-bold border-b-2 transition-colors ${activeTab === 'seasonal' ? 'border-[#0ea5e9] text-[#0ea5e9]' : 'border-transparent text-[#9A9A9A] hover:text-[#1A1A1A]'}`}
        >
          <Sparkles size={14} />
          Tendances Printemps-Été
          <span className="bg-[#0ea5e9]/10 text-[#0ea5e9] text-[10px] font-bold px-2 py-0.5 rounded-full">
            {seasonalSlug.length}
          </span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product picker */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9A9A9A]" />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-[#e0ddd4] rounded-xl text-[13px] focus:outline-none focus:border-[#0ea5e9] bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto pr-1">
            {filtered.map(p => {
              const selected = currentSlugs.includes(p.slug);
              return (
                <button
                  key={p.slug}
                  onClick={() => toggleProduct(p.slug)}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                    selected
                      ? 'border-[#0ea5e9] bg-[#0ea5e9]/5 shadow-sm'
                      : 'border-[#e0ddd4] bg-white hover:border-[#0ea5e9]/50'
                  }`}
                >
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-[#f8fafc]">
                    <img src={getImage(p)} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-bold text-[#0ea5e9] uppercase tracking-wide">{p.brandLabel}</div>
                    <div className="text-[13px] font-semibold text-[#1A1A1A] truncate">{p.name}</div>
                    <div className="text-[12px] text-[#9A9A9A]">{p.price} MAD</div>
                  </div>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                    selected ? 'bg-[#0ea5e9] text-white' : 'bg-[#f0f0f0] text-[#9A9A9A]'
                  }`}>
                    {selected ? <Check size={12} /> : <Plus size={12} />}
                  </div>
                </button>
              );
            })}
            {filtered.length === 0 && (
              <div className="col-span-2 text-center py-12 text-[#9A9A9A] text-[13px]">
                Aucun produit trouvé
              </div>
            )}
          </div>
        </div>

        {/* Selected products */}
        <div className="space-y-4">
          <div className="bg-white border border-[#e0ddd4] rounded-2xl p-5">
            <h3 className="text-[13px] font-bold text-[#1A1A1A] mb-1">
              {activeTab === 'bestsellers' ? '🔥 Bestsellers sélectionnés' : '🌸 Tendances sélectionnées'}
            </h3>
            <p className="text-[11px] text-[#9A9A9A] mb-4">
              {currentSlugs.length} produit{currentSlugs.length !== 1 ? 's' : ''} sélectionné{currentSlugs.length !== 1 ? 's' : ''}
            </p>
            {currentSlugs.length === 0 ? (
              <div className="text-center py-8 text-[#9A9A9A] text-[12px] border-2 border-dashed border-[#e0ddd4] rounded-xl">
                Aucun produit sélectionné.<br />
                Cliquez sur un produit pour l'ajouter.
              </div>
            ) : (
              <div className="space-y-2">
                {currentSlugs.map((slug, i) => {
                  const p = allProducts.find(x => x.slug === slug);
                  if (!p) return null;
                  return (
                    <div key={slug} className="flex items-center gap-2 p-2 bg-[#fafaf7] rounded-lg">
                      <span className="text-[10px] font-bold text-[#9A9A9A] w-5">{i + 1}.</span>
                      <img src={getImage(p)} alt={p.name} className="w-8 h-8 rounded object-cover" />
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-semibold text-[#1A1A1A] truncate">{p.name}</div>
                        <div className="text-[10px] text-[#9A9A9A]">{p.brandLabel}</div>
                      </div>
                      <button
                        onClick={() => setCurrentSlugs(prev => prev.filter(s => s !== slug))}
                        className="text-[#9A9A9A] hover:text-red-500 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-[#f8fafc] border border-[#e0ddd4] rounded-2xl p-5 text-[12px] text-[#9A9A9A] space-y-2">
            <p className="font-semibold text-[#1A1A1A]">💡 Conseil</p>
            <p>Sélectionnez <strong>4 à 8 produits</strong> pour un affichage optimal sur la page d'accueil.</p>
            <p>Si vous ne sélectionnez rien, le site affichera automatiquement les produits tagués.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
