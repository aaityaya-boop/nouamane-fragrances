'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Flame, Search, Check, Loader2, LayoutDashboard, ArrowUp, ArrowDown, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [latestSlug, setLatestSlug] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'bestsellers' | 'seasonal' | 'latest'>('bestsellers');

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/products').then(r => r.json()),
      fetch('/api/admin/settings').then(r => r.json()),
    ]).then(([products, config]) => {
      setAllProducts(Array.isArray(products) ? products : []);
      try {
        setBestsellersSlug(JSON.parse(config.featuredBestsellers || '[]'));
        setSeasonalSlug(JSON.parse(config.featuredSeasonal || '[]'));
        setLatestSlug(JSON.parse(config.featuredLatest || '[]'));
      } catch {
        setBestsellersSlug([]);
        setSeasonalSlug([]);
        setLatestSlug([]);
      }
      setIsLoading(false);
    }).catch(() => setIsLoading(false));
  }, []);

  const currentSlugs = activeTab === 'bestsellers' ? bestsellersSlug : activeTab === 'seasonal' ? seasonalSlug : latestSlug;
  const setCurrentSlugs = activeTab === 'bestsellers' ? setBestsellersSlug : activeTab === 'seasonal' ? setSeasonalSlug : setLatestSlug;

  const toggleProduct = (slug: string) => {
    setCurrentSlugs(prev =>
      prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]
    );
  };

  const moveProduct = (index: number, direction: 'up' | 'down') => {
    setCurrentSlugs(prev => {
      const newSlugs = [...prev];
      if (direction === 'up' && index > 0) {
        [newSlugs[index - 1], newSlugs[index]] = [newSlugs[index], newSlugs[index - 1]];
      } else if (direction === 'down' && index < newSlugs.length - 1) {
        [newSlugs[index + 1], newSlugs[index]] = [newSlugs[index], newSlugs[index + 1]];
      }
      return newSlugs;
    });
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
          featuredLatest: JSON.stringify(latestSlug),
        }),
      });
      if (res.ok) {
        setSaveMsg('Vitrine publiée avec succès !');
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
      <div className="h-full w-full flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-[#0ea5e9] mb-4" size={40} />
        <p className="text-sm text-[#9A9A9A] font-medium tracking-widest uppercase">Chargement de la vitrine...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-[#fafaf7]">
      {/* Sticky Top Header */}
      <div className="flex-shrink-0 bg-white/80 backdrop-blur-xl border-b border-black/5 px-6 lg:px-10 py-5 flex items-center justify-between z-20 shadow-sm">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0ea5e9] to-[#0284c7] flex items-center justify-center text-white shadow-lg shadow-[#0ea5e9]/20">
              <LayoutDashboard size={20} />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-[#1A1A1A] tracking-tight">Vitrine Homepage</h1>
              <p className="text-[12px] text-[#666] font-medium">Configurez les sections mises en avant sur l'accueil</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <AnimatePresence>
            {saveMsg && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`flex items-center gap-2 text-[12px] font-bold px-4 py-2.5 rounded-full shadow-sm ${saveMsg.includes('succès') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}
              >
                <Check size={14} />
                {saveMsg}
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="group relative flex items-center gap-2 bg-[#1A1A1A] text-white px-8 py-3 rounded-full text-[13px] font-bold tracking-wide transition-all hover:bg-[#0ea5e9] hover:shadow-xl hover:shadow-[#0ea5e9]/20 disabled:opacity-60 overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              Publier la vitrine
            </span>
          </button>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT PANEL: Library */}
        <div className="w-full lg:w-[60%] flex flex-col bg-white border-r border-black/5 z-10">
          
          {/* Tabs & Search */}
          <div className="px-8 pt-8 pb-4">
            {/* Elegant Tabs */}
            <div className="flex gap-1 p-1 bg-[#f8fafc] rounded-2xl mb-6 w-max border border-black/5">
              <button
                onClick={() => setActiveTab('bestsellers')}
                className={`relative flex items-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-bold transition-colors ${activeTab === 'bestsellers' ? 'text-[#1A1A1A]' : 'text-[#9A9A9A] hover:text-[#1A1A1A]'}`}
              >
                {activeTab === 'bestsellers' && (
                  <motion.div layoutId="activeTab" className="absolute inset-0 bg-white shadow-sm rounded-xl border border-black/5" />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <Flame size={16} className={activeTab === 'bestsellers' ? 'text-[#ea580c]' : ''} />
                  Bestsellers
                </span>
              </button>
              <button
                onClick={() => setActiveTab('seasonal')}
                className={`relative flex items-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-bold transition-colors ${activeTab === 'seasonal' ? 'text-[#1A1A1A]' : 'text-[#9A9A9A] hover:text-[#1A1A1A]'}`}
              >
                {activeTab === 'seasonal' && (
                  <motion.div layoutId="activeTab" className="absolute inset-0 bg-white shadow-sm rounded-xl border border-black/5" />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <Sparkles size={16} className={activeTab === 'seasonal' ? 'text-[#0ea5e9]' : ''} />
                  Tendances
                </span>
              </button>
              <button
                onClick={() => setActiveTab('latest')}
                className={`relative flex items-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-bold transition-colors ${activeTab === 'latest' ? 'text-[#1A1A1A]' : 'text-[#9A9A9A] hover:text-[#1A1A1A]'}`}
              >
                {activeTab === 'latest' && (
                  <motion.div layoutId="activeTab" className="absolute inset-0 bg-white shadow-sm rounded-xl border border-black/5" />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <Sparkles size={16} className={activeTab === 'latest' ? 'text-[#10b981]' : ''} />
                  Dernières Sorties
                </span>
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search size={18} className="text-[#9A9A9A] group-focus-within:text-[#0ea5e9] transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Rechercher un parfum par nom, marque ou SKU..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="block w-full pl-11 pr-4 py-4 bg-[#f8fafc] border border-transparent rounded-2xl text-[14px] font-medium text-[#1A1A1A] placeholder-[#9A9A9A] focus:bg-white focus:border-[#0ea5e9]/30 focus:ring-4 focus:ring-[#0ea5e9]/10 transition-all outline-none"
              />
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1 overflow-y-auto px-8 pb-8" style={{ scrollbarWidth: 'thin' }}>
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((p) => {
                const isSelected = currentSlugs.includes(p.slug);
                return (
                  <div
                    key={p.slug}
                    onClick={() => toggleProduct(p.slug)}
                    className={`group relative flex flex-col p-4 rounded-3xl cursor-pointer transition-all duration-300 ${
                      isSelected
                        ? 'bg-[#f0f9ff] border-2 border-[#0ea5e9] shadow-sm'
                        : 'bg-white border-2 border-transparent hover:border-black/5 hover:bg-[#f8fafc]'
                    }`}
                  >
                    {/* Checkmark Overlay */}
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#0ea5e9] text-white flex items-center justify-center z-10 shadow-md"
                        >
                          <Check size={14} strokeWidth={3} />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-white mb-4 border border-black/5">
                      <img src={getImage(p)} alt={p.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    </div>
                    <div className="flex-1 flex flex-col justify-end">
                      <div className="text-[10px] font-bold text-[#0ea5e9] uppercase tracking-widest mb-1">{p.brandLabel}</div>
                      <div className="text-[13px] font-bold text-[#1A1A1A] leading-snug line-clamp-2">{p.name}</div>
                    </div>
                  </div>
                );
              })}
              {filtered.length === 0 && (
                <div className="col-span-full py-20 flex flex-col items-center justify-center text-[#9A9A9A]">
                  <Search size={32} className="mb-4 opacity-50" />
                  <p className="text-[14px] font-medium">Aucun produit ne correspond à votre recherche.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Curated Selection */}
        <div className="w-full lg:w-[40%] bg-[#fafaf7] flex flex-col relative border-l border-white shadow-[-10px_0_30px_rgba(0,0,0,0.02)]">
          
          {/* Subtle gradient overlay at top for scroll effect */}
          <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-[#fafaf7] to-transparent z-10 pointer-events-none" />

          <div className="flex-1 overflow-y-auto px-8 py-8" style={{ scrollbarWidth: 'none' }}>
            <div className="flex items-center justify-between mb-8 sticky top-0 bg-[#fafaf7] z-20 pb-4 border-b border-black/5">
              <div>
                <h3 className="text-[16px] font-extrabold text-[#1A1A1A] flex items-center gap-2">
                  {activeTab === 'bestsellers' ? <Flame size={18} className="text-[#ea580c]" /> : <Sparkles size={18} className="text-[#0ea5e9]" />}
                  Sélection actuelle
                </h3>
                <p className="text-[11px] font-medium text-[#9A9A9A] mt-1.5 max-w-xs">
                  Utilisez les flèches pour réorganiser l'affichage sur le site.
                </p>
              </div>
              <div className="text-[28px] font-black text-[#1A1A1A]/10 leading-none">
                {currentSlugs.length}
              </div>
            </div>

            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {currentSlugs.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="border-2 border-dashed border-[#e0ddd4] rounded-3xl p-10 flex flex-col items-center justify-center text-center bg-white/50"
                  >
                    <div className="w-16 h-16 bg-[#f8fafc] rounded-2xl flex items-center justify-center mb-4">
                      <LayoutDashboard size={24} className="text-[#9A9A9A]" />
                    </div>
                    <h4 className="text-[14px] font-bold text-[#1A1A1A] mb-2">La vitrine est vide</h4>
                    <p className="text-[12px] text-[#9A9A9A] max-w-xs leading-relaxed">
                      Sélectionnez des parfums depuis la bibliothèque à gauche pour construire votre sélection.
                    </p>
                  </motion.div>
                ) : (
                  currentSlugs.map((slug, index) => {
                    const p = allProducts.find(x => x.slug === slug);
                    if (!p) return null;
                    return (
                      <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        key={slug}
                        className="group flex items-center gap-4 bg-white p-3 rounded-2xl border border-black/5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all"
                      >
                        {/* Order Number */}
                        <div className="flex flex-col items-center justify-center w-8 text-[#9A9A9A] font-black text-[15px] opacity-40">
                          {index + 1}
                        </div>

                        {/* Image */}
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-[#f8fafc]">
                          <img src={getImage(p)} alt={p.name} className="w-full h-full object-cover border border-black/5" />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0 pr-2">
                          <div className="text-[13px] font-bold text-[#1A1A1A] truncate">{p.name}</div>
                          <div className="text-[10px] text-[#0ea5e9] uppercase tracking-widest font-bold mt-1">{p.brandLabel}</div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-0.5 pr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => moveProduct(index, 'up')}
                            disabled={index === 0}
                            className="p-1.5 hover:bg-[#f8fafc] rounded-md text-[#666] disabled:opacity-20 disabled:hover:bg-transparent transition-colors"
                          >
                            <ArrowUp size={14} strokeWidth={2.5} />
                          </button>
                          <button
                            onClick={() => moveProduct(index, 'down')}
                            disabled={index === currentSlugs.length - 1}
                            className="p-1.5 hover:bg-[#f8fafc] rounded-md text-[#666] disabled:opacity-20 disabled:hover:bg-transparent transition-colors"
                          >
                            <ArrowDown size={14} strokeWidth={2.5} />
                          </button>
                        </div>
                        <div className="pr-3 border-l border-black/5 pl-3">
                          <button
                            onClick={() => toggleProduct(slug)}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-[#9A9A9A] hover:text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
