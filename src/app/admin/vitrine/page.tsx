'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Flame, 
  Search, 
  Check, 
  Loader2, 
  LayoutDashboard, 
  ArrowUp, 
  ArrowDown, 
  Trash2, 
  User, 
  Users, 
  Gift, 
  ShoppingBag, 
  Moon, 
  Copy,
  ExternalLink,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Product {
  id: number;
  slug: string;
  name: string;
  brandLabel: string;
  price: number;
  gender: string;
  subcategory: string;
  images: string;
}

type TabKey = 
  | 'bestsellers' 
  | 'seasonal' 
  | 'latest' 
  | 'recommendedMen' 
  | 'recommendedWomen' 
  | 'recommendedUnisex' 
  | 'recommendedOriental' 
  | 'recommendedMaster' 
  | 'recommendedCoffrets' 
  | 'recommendedShop';

interface TabConfig {
  key: TabKey;
  label: string;
  group: 'home' | 'shop';
  icon: React.ReactNode;
  pageUrl: string;
  pageLabel: string;
  description: string;
  defaultSubcategory?: string;
  defaultGender?: string;
}

const TABS: TabConfig[] = [
  // Boutique & Catégories
  {
    key: 'recommendedMen',
    label: 'Homme',
    group: 'shop',
    icon: <User size={15} className="text-[#3b82f6]" />,
    pageUrl: '/fr/shop/men',
    pageLabel: '/shop/men',
    description: 'Parfums recommandés affichés en premier dans la catégorie Homme.',
    defaultGender: 'men'
  },
  {
    key: 'recommendedWomen',
    label: 'Femme',
    group: 'shop',
    icon: <User size={15} className="text-[#ec4899]" />,
    pageUrl: '/fr/shop/women',
    pageLabel: '/shop/women',
    description: 'Parfums recommandés affichés en premier dans la catégorie Femme.',
    defaultGender: 'women'
  },
  {
    key: 'recommendedUnisex',
    label: 'Unisexe',
    group: 'shop',
    icon: <Users size={15} className="text-[#8b5cf6]" />,
    pageUrl: '/fr/shop/unisex',
    pageLabel: '/shop/unisex',
    description: 'Parfums recommandés affichés en premier dans la catégorie Unisexe.',
    defaultGender: 'unisex'
  },
  {
    key: 'recommendedOriental',
    label: 'Originaux',
    group: 'shop',
    icon: <Sparkles size={15} className="text-[#0ea5e9]" />,
    pageUrl: '/fr/parfums-originaux',
    pageLabel: '/parfums-originaux',
    description: 'Parfums recommandés affichés en premier dans Parfums Originaux.',
    defaultSubcategory: 'arabic'
  },
  {
    key: 'recommendedMaster',
    label: 'Master Copy',
    group: 'shop',
    icon: <Copy size={15} className="text-[#6366f1]" />,
    pageUrl: '/fr/master-copier',
    pageLabel: '/master-copier',
    description: 'Parfums recommandés affichés en premier dans Master Copy.',
    defaultSubcategory: 'master-copier'
  },
  {
    key: 'recommendedCoffrets',
    label: 'Coffrets',
    group: 'shop',
    icon: <Gift size={15} className="text-[#dc2626]" />,
    pageUrl: '/fr/coffrets',
    pageLabel: '/coffrets',
    description: 'Coffrets recommandés affichés en premier dans la page Coffrets Cadeaux.',
    defaultSubcategory: 'coffrets'
  },
  {
    key: 'recommendedShop',
    label: 'Toute la Boutique',
    group: 'shop',
    icon: <ShoppingBag size={15} className="text-[#0ea5e9]" />,
    pageUrl: '/fr/shop',
    pageLabel: '/shop',
    description: 'Parfums recommandés affichés en premier sur la Boutique Globale (Testeurs).'
  },
  // Accueil
  {
    key: 'bestsellers',
    label: 'Bestsellers Accueil',
    group: 'home',
    icon: <Flame size={15} className="text-[#ea580c]" />,
    pageUrl: '/fr',
    pageLabel: 'Accueil',
    description: 'Section "Nos Bestsellers" sur la page d\'accueil.'
  },
  {
    key: 'seasonal',
    label: 'Tendances Accueil',
    group: 'home',
    icon: <Sparkles size={15} className="text-[#0ea5e9]" />,
    pageUrl: '/fr',
    pageLabel: 'Accueil',
    description: 'Section "Tendances Saisonnières" sur la page d\'accueil.'
  },
  {
    key: 'latest',
    label: 'Nouveautés Accueil',
    group: 'home',
    icon: <Sparkles size={15} className="text-[#10b981]" />,
    pageUrl: '/fr',
    pageLabel: 'Accueil',
    description: 'Section "Dernières Sorties" sur la page d\'accueil.'
  }
];

export default function VitrinePage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  
  // Home states
  const [bestsellersSlug, setBestsellersSlug] = useState<string[]>([]);
  const [seasonalSlug, setSeasonalSlug] = useState<string[]>([]);
  const [latestSlug, setLatestSlug] = useState<string[]>([]);
  const [seasonalTrendTitle, setSeasonalTrendTitle] = useState('Tendances Printemps-Été');
  const [seasonalTrendSubtitle, setSeasonalTrendSubtitle] = useState('Nos fragrances fraîches, solaires et florales pour la belle saison.');

  // Category & Shop recommended states
  const [recommendedMen, setRecommendedMen] = useState<string[]>([]);
  const [recommendedWomen, setRecommendedWomen] = useState<string[]>([]);
  const [recommendedUnisex, setRecommendedUnisex] = useState<string[]>([]);
  const [recommendedOriental, setRecommendedOriental] = useState<string[]>([]);
  const [recommendedMaster, setRecommendedMaster] = useState<string[]>([]);
  const [recommendedCoffrets, setRecommendedCoffrets] = useState<string[]>([]);
  const [recommendedShop, setRecommendedShop] = useState<string[]>([]);

  const [activeTab, setActiveTab] = useState<TabKey>('recommendedMen');
  const [search, setSearch] = useState('');
  const [filterByCategoryOnly, setFilterByCategoryOnly] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

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
        if (config.seasonalTrendTitle) setSeasonalTrendTitle(config.seasonalTrendTitle);
        if (config.seasonalTrendSubtitle) setSeasonalTrendSubtitle(config.seasonalTrendSubtitle);

        setRecommendedMen(JSON.parse(config.recommendedMen || '[]'));
        setRecommendedWomen(JSON.parse(config.recommendedWomen || '[]'));
        setRecommendedUnisex(JSON.parse(config.recommendedUnisex || '[]'));
        setRecommendedOriental(JSON.parse(config.recommendedOriental || '[]'));
        setRecommendedMaster(JSON.parse(config.recommendedMaster || '[]'));
        setRecommendedCoffrets(JSON.parse(config.recommendedCoffrets || '[]'));
        setRecommendedShop(JSON.parse(config.recommendedShop || '[]'));
      } catch {
        // Safe fallbacks
      }
      setIsLoading(false);
    }).catch(() => setIsLoading(false));
  }, []);

  const getActiveSlugs = (): string[] => {
    switch (activeTab) {
      case 'bestsellers': return bestsellersSlug;
      case 'seasonal': return seasonalSlug;
      case 'latest': return latestSlug;
      case 'recommendedMen': return recommendedMen;
      case 'recommendedWomen': return recommendedWomen;
      case 'recommendedUnisex': return recommendedUnisex;
      case 'recommendedOriental': return recommendedOriental;
      case 'recommendedMaster': return recommendedMaster;
      case 'recommendedCoffrets': return recommendedCoffrets;
      case 'recommendedShop': return recommendedShop;
    }
  };

  const setActiveSlugs = (updater: (prev: string[]) => string[]) => {
    switch (activeTab) {
      case 'bestsellers': setBestsellersSlug(updater); break;
      case 'seasonal': setSeasonalSlug(updater); break;
      case 'latest': setLatestSlug(updater); break;
      case 'recommendedMen': setRecommendedMen(updater); break;
      case 'recommendedWomen': setRecommendedWomen(updater); break;
      case 'recommendedUnisex': setRecommendedUnisex(updater); break;
      case 'recommendedOriental': setRecommendedOriental(updater); break;
      case 'recommendedMaster': setRecommendedMaster(updater); break;
      case 'recommendedCoffrets': setRecommendedCoffrets(updater); break;
      case 'recommendedShop': setRecommendedShop(updater); break;
    }
  };

  const currentSlugs = getActiveSlugs();
  const currentTabConfig = TABS.find(t => t.key === activeTab)!;

  const toggleProduct = (slug: string) => {
    setActiveSlugs(prev =>
      prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]
    );
  };

  const moveProduct = (index: number, direction: 'up' | 'down') => {
    setActiveSlugs(prev => {
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
          seasonalTrendTitle,
          seasonalTrendSubtitle,
          recommendedMen: JSON.stringify(recommendedMen),
          recommendedWomen: JSON.stringify(recommendedWomen),
          recommendedUnisex: JSON.stringify(recommendedUnisex),
          recommendedOriental: JSON.stringify(recommendedOriental),
          recommendedMaster: JSON.stringify(recommendedMaster),
          recommendedCoffrets: JSON.stringify(recommendedCoffrets),
          recommendedShop: JSON.stringify(recommendedShop),
        }),
      });
      if (res.ok) {
        setSaveMsg('Recommandations enregistrées avec succès !');
        setTimeout(() => setSaveMsg(''), 4000);
      } else {
        setSaveMsg('Erreur lors de la sauvegarde.');
      }
    } catch {
      setSaveMsg('Erreur lors de la sauvegarde.');
    } finally {
      setIsSaving(false);
    }
  };

  // Filter products for library
  const filtered = allProducts.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brandLabel.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (!filterByCategoryOnly) return true;

    // Smart contextual filtering based on active tab
    if (currentTabConfig.defaultGender) {
      return p.gender === currentTabConfig.defaultGender || p.gender === 'unisex';
    }
    if (currentTabConfig.defaultSubcategory) {
      return p.subcategory === currentTabConfig.defaultSubcategory;
    }

    return true;
  });

  const getImage = (p: Product) => {
    try { return JSON.parse(p.images)[0] || '/images/hero.png'; } catch { return '/images/hero.png'; }
  };

  if (isLoading) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-[#0ea5e9] mb-4" size={40} />
        <p className="text-sm text-[#9A9A9A] font-medium tracking-widest uppercase">Chargement des recommandations...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-[#fafaf7]">
      {/* Sticky Top Header */}
      <div className="flex-shrink-0 bg-white/90 backdrop-blur-xl border-b border-black/5 px-6 lg:px-10 py-4 flex items-center justify-between z-20 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0ea5e9] to-[#0284c7] flex items-center justify-center text-white shadow-lg shadow-[#0ea5e9]/20">
              <Sparkles size={20} />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-[#1A1A1A] tracking-tight">Vitrine & Parfums Recommandés</h1>
              <p className="text-[12px] text-[#666] font-medium">Choisissez et ordonnez les parfums mis en avant pour chaque catégorie</p>
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
            className="group relative flex items-center gap-2 bg-[#1A1A1A] text-white px-8 py-3 rounded-full text-[13px] font-bold tracking-wide transition-all hover:bg-[#0ea5e9] hover:shadow-xl hover:shadow-[#0ea5e9]/20 disabled:opacity-60 overflow-hidden cursor-pointer"
          >
            <span className="relative z-10 flex items-center gap-2">
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              Publier les recommandations
            </span>
          </button>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT PANEL: Library */}
        <div className="w-full lg:w-[58%] flex flex-col bg-white border-r border-black/5 z-10">
          
          {/* Navigation Tabs */}
          <div className="px-6 pt-5 pb-3 border-b border-black/5">
            {/* Category Groups Header */}
            <div className="space-y-3">
              {/* Boutique & Catégories Tabs */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9A9A9A] mb-2 block">
                  Recommandés par Catégorie & Genre
                </span>
                <div className="flex flex-wrap gap-1.5 p-1 bg-[#f8fafc] rounded-2xl border border-black/5">
                  {TABS.filter(t => t.group === 'shop').map((tab) => {
                    const count = tab.key === 'recommendedMen' ? recommendedMen.length
                      : tab.key === 'recommendedWomen' ? recommendedWomen.length
                      : tab.key === 'recommendedUnisex' ? recommendedUnisex.length
                      : tab.key === 'recommendedOriental' ? recommendedOriental.length
                      : tab.key === 'recommendedMaster' ? recommendedMaster.length
                      : tab.key === 'recommendedCoffrets' ? recommendedCoffrets.length
                      : recommendedShop.length;
                    
                    const isActive = activeTab === tab.key;
                    return (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12px] font-bold transition-all cursor-pointer ${
                          isActive ? 'text-[#1A1A1A]' : 'text-[#6B6B6B] hover:text-[#1A1A1A]'
                        }`}
                      >
                        {isActive && (
                          <motion.div layoutId="activeTabBadge" className="absolute inset-0 bg-white shadow-sm rounded-xl border border-black/5" />
                        )}
                        <span className="relative z-10 flex items-center gap-1.5">
                          {tab.icon}
                          {tab.label}
                          {count > 0 && (
                            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${isActive ? 'bg-[#0ea5e9] text-white' : 'bg-gray-200 text-gray-700'}`}>
                              {count}
                            </span>
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Homepage Tabs */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9A9A9A] mb-2 block">
                  Sections Page d'Accueil
                </span>
                <div className="flex flex-wrap gap-1.5 p-1 bg-[#f8fafc] rounded-2xl border border-black/5 w-max">
                  {TABS.filter(t => t.group === 'home').map((tab) => {
                    const count = tab.key === 'bestsellers' ? bestsellersSlug.length
                      : tab.key === 'seasonal' ? seasonalSlug.length
                      : latestSlug.length;
                    const isActive = activeTab === tab.key;
                    return (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12px] font-bold transition-all cursor-pointer ${
                          isActive ? 'text-[#1A1A1A]' : 'text-[#6B6B6B] hover:text-[#1A1A1A]'
                        }`}
                      >
                        {isActive && (
                          <motion.div layoutId="activeTabBadge" className="absolute inset-0 bg-white shadow-sm rounded-xl border border-black/5" />
                        )}
                        <span className="relative z-10 flex items-center gap-1.5">
                          {tab.icon}
                          {tab.label}
                          {count > 0 && (
                            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${isActive ? 'bg-[#0ea5e9] text-white' : 'bg-gray-200 text-gray-700'}`}>
                              {count}
                            </span>
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Search Bar & Filter Toggle */}
            <div className="flex items-center gap-3 mt-4">
              <div className="relative group flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Search size={16} className="text-[#9A9A9A] group-focus-within:text-[#0ea5e9] transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder={`Rechercher un parfum dans ${currentTabConfig.label}...`}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2.5 bg-[#f8fafc] border border-transparent rounded-xl text-[13px] font-medium text-[#1A1A1A] placeholder-[#9A9A9A] focus:bg-white focus:border-[#0ea5e9]/30 focus:ring-4 focus:ring-[#0ea5e9]/10 transition-all outline-none"
                />
              </div>

              {(currentTabConfig.defaultGender || currentTabConfig.defaultSubcategory) && (
                <button
                  onClick={() => setFilterByCategoryOnly(!filterByCategoryOnly)}
                  className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-[12px] font-semibold border transition-all cursor-pointer ${
                    filterByCategoryOnly 
                      ? 'bg-blue-50 border-blue-200 text-[#0ea5e9]' 
                      : 'bg-white border-black/10 text-[#6B6B6B] hover:text-[#1A1A1A]'
                  }`}
                  title={filterByCategoryOnly ? 'Afficher uniquement les parfums de cette catégorie' : 'Tous les parfums affichés'}
                >
                  <Filter size={14} />
                  <span>{filterByCategoryOnly ? `Filtre ${currentTabConfig.label}` : 'Tous les parfums'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1 overflow-y-auto px-6 py-4" style={{ scrollbarWidth: 'thin' }}>
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-3.5">
              {filtered.map((p) => {
                const isSelected = currentSlugs.includes(p.slug);
                return (
                  <div
                    key={p.slug}
                    onClick={() => toggleProduct(p.slug)}
                    className={`group relative flex flex-col p-3.5 rounded-2xl cursor-pointer transition-all duration-300 ${
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
                          className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-[#0ea5e9] text-white flex items-center justify-center z-10 shadow-md"
                        >
                          <Check size={14} strokeWidth={3} />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-white mb-3 border border-black/5">
                      <img src={getImage(p)} alt={p.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    </div>
                    <div className="flex-1 flex flex-col justify-end">
                      <div className="flex items-center justify-between text-[10px] font-bold text-[#0ea5e9] uppercase tracking-widest mb-1">
                        <span>{p.brandLabel}</span>
                        <span className="text-gray-400 font-normal capitalize">{p.gender}</span>
                      </div>
                      <div className="text-[12px] font-bold text-[#1A1A1A] leading-snug line-clamp-2">{p.name}</div>
                      <div className="text-[11px] font-semibold text-gray-500 mt-1">{p.price} MAD</div>
                    </div>
                  </div>
                );
              })}
              {filtered.length === 0 && (
                <div className="col-span-full py-16 flex flex-col items-center justify-center text-[#9A9A9A]">
                  <Search size={32} className="mb-3 opacity-40" />
                  <p className="text-[13px] font-medium">Aucun parfum ne correspond à vos filtres.</p>
                  {(currentTabConfig.defaultGender || currentTabConfig.defaultSubcategory) && filterByCategoryOnly && (
                    <button
                      onClick={() => setFilterByCategoryOnly(false)}
                      className="mt-3 text-[12px] text-[#0ea5e9] font-bold hover:underline cursor-pointer"
                    >
                      Afficher tous les parfums du catalogue
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Curated Selection */}
        <div className="w-full lg:w-[42%] bg-[#fafaf7] flex flex-col relative border-l border-white shadow-[-10px_0_30px_rgba(0,0,0,0.02)]">
          
          <div className="flex-1 overflow-y-auto px-6 py-6" style={{ scrollbarWidth: 'none' }}>
            
            {/* Header info for active tab */}
            <div className="bg-white p-5 rounded-2xl border border-black/5 shadow-sm mb-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {currentTabConfig.icon}
                    <h3 className="text-[15px] font-extrabold text-[#1A1A1A]">
                      {currentTabConfig.label} — Parfums Recommandés
                    </h3>
                  </div>
                  <p className="text-[12px] text-[#6B6B6B] leading-relaxed">
                    {currentTabConfig.description}
                  </p>
                </div>
                <a
                  href={currentTabConfig.pageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[11px] font-bold text-[#0ea5e9] bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full transition-colors"
                >
                  <span>Voir page</span>
                  <ExternalLink size={12} />
                </a>
              </div>
              <div className="flex items-center justify-between pt-3 mt-3 border-t border-black/5 text-[11px] text-[#9A9A9A]">
                <span>{currentSlugs.length} parfum{currentSlugs.length > 1 ? 's' : ''} sélectionné{currentSlugs.length > 1 ? 's' : ''}</span>
                <span className="italic">Triés du 1er au dernier affiché</span>
              </div>
            </div>

            {/* Special Trend Titles for Seasonal tab */}
            {activeTab === 'seasonal' && (
              <div className="mb-6 space-y-4 bg-white p-5 rounded-2xl border border-black/5">
                <h4 className="text-[13px] font-bold text-[#1A1A1A]">Textes de la section (Page d'accueil)</h4>
                <div>
                  <label className="block text-[11px] font-bold text-[#9A9A9A] mb-1.5 uppercase tracking-wider">Saison(s) affichée(s)</label>
                  <select 
                    value={seasonalTrendTitle}
                    onChange={(e) => setSeasonalTrendTitle(e.target.value)}
                    className="w-full text-[13px] p-2.5 bg-[#f8fafc] border border-black/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/20 focus:border-[#0ea5e9] appearance-none"
                  >
                    <option value="Tendances Automne-Hiver">Automne-Hiver</option>
                    <option value="Tendances Printemps-Été">Printemps-Été</option>
                    <option value="Tendances Été-Automne">Été-Automne</option>
                    <option value="Tendances Printemps">Printemps</option>
                    <option value="Tendances Été">Été</option>
                    <option value="Tendances Automne">Automne</option>
                    <option value="Tendances Hiver">Hiver</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#9A9A9A] mb-1.5 uppercase tracking-wider">Sous-titre</label>
                  <textarea 
                    value={seasonalTrendSubtitle}
                    onChange={(e) => setSeasonalTrendSubtitle(e.target.value)}
                    className="w-full text-[13px] p-2.5 bg-[#f8fafc] border border-black/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/20 focus:border-[#0ea5e9] resize-none h-20"
                    placeholder="Ex: Nos fragrances fraîches..."
                  />
                </div>
              </div>
            )}

            {/* Curated list items */}
            <div className="space-y-2.5">
              <AnimatePresence mode="popLayout">
                {currentSlugs.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="border-2 border-dashed border-[#e0ddd4] rounded-3xl p-10 flex flex-col items-center justify-center text-center bg-white/50"
                  >
                    <div className="w-14 h-14 bg-[#f8fafc] rounded-2xl flex items-center justify-center mb-3">
                      <LayoutDashboard size={22} className="text-[#9A9A9A]" />
                    </div>
                    <h4 className="text-[14px] font-bold text-[#1A1A1A] mb-1.5">Aucun parfum recommandé configuré</h4>
                    <p className="text-[12px] text-[#9A9A9A] max-w-xs leading-relaxed">
                      Cliquez sur des parfums dans la bibliothèque à gauche pour les ajouter en tête de liste sur cette page.
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
                        className="group flex items-center gap-3 bg-white p-3 rounded-2xl border border-black/5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all"
                      >
                        {/* Order Position Badge */}
                        <div className="flex flex-col items-center justify-center w-7 h-7 rounded-xl bg-gray-100 text-gray-700 font-extrabold text-[12px]">
                          #{index + 1}
                        </div>

                        {/* Image */}
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-[#f8fafc] flex-shrink-0">
                          <img src={getImage(p)} alt={p.name} className="w-full h-full object-cover border border-black/5" />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0 pr-2">
                          <div className="text-[12px] font-bold text-[#1A1A1A] truncate">{p.name}</div>
                          <div className="text-[10px] text-[#0ea5e9] uppercase tracking-widest font-bold">{p.brandLabel}</div>
                        </div>

                        {/* Reorder Arrows */}
                        <div className="flex flex-col gap-0.5 pr-1 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => moveProduct(index, 'up')}
                            disabled={index === 0}
                            className="p-1 hover:bg-[#f8fafc] rounded text-[#666] disabled:opacity-20 disabled:hover:bg-transparent transition-colors cursor-pointer"
                            title="Monter"
                          >
                            <ArrowUp size={13} strokeWidth={2.5} />
                          </button>
                          <button
                            onClick={() => moveProduct(index, 'down')}
                            disabled={index === currentSlugs.length - 1}
                            className="p-1 hover:bg-[#f8fafc] rounded text-[#666] disabled:opacity-20 disabled:hover:bg-transparent transition-colors cursor-pointer"
                            title="Descendre"
                          >
                            <ArrowDown size={13} strokeWidth={2.5} />
                          </button>
                        </div>
                        <div className="pr-1 border-l border-black/5 pl-2">
                          <button
                            onClick={() => toggleProduct(slug)}
                            className="w-7 h-7 rounded-full flex items-center justify-center text-[#9A9A9A] hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Retirer des recommandés"
                          >
                            <Trash2 size={14} />
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
