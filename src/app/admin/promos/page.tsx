'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import {
  Ticket,
  Plus,
  Trash2,
  Tag,
  Loader2,
  Sparkles,
  Search,
  Check,
  Percent,
  Coins,
  Globe,
  Layers,
  Calendar,
  Eye,
  X,
  Copy,
  CheckCircle2,
  AlertCircle,
  Filter,
  CheckSquare,
  Square,
  Power,
  Package
} from 'lucide-react';

interface ProductItem {
  id: number;
  slug: string;
  name: string;
  brandLabel?: string;
  subcategoryLabel?: string;
  gender?: string;
  price: number;
  images?: string | string[];
}

interface PromoCodeItem {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  applicableScope: 'ALL' | 'SPECIFIC_PRODUCTS';
  productIds: number[];
  minOrderAmount?: number | null;
  maxUses?: number | null;
  usageCount?: number;
  expiresAt?: string | null;
  description?: string | null;
  isActive: boolean;
  createdAt: string;
}

export default function AdminPromos() {
  const [promos, setPromos] = useState<PromoCodeItem[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Form State
  const [code, setCode] = useState('');
  const [type, setType] = useState<'percentage' | 'fixed'>('percentage');
  const [value, setValue] = useState('');
  const [applicableScope, setApplicableScope] = useState<'ALL' | 'SPECIFIC_PRODUCTS'>('ALL');
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [minOrderAmount, setMinOrderAmount] = useState('');
  const [maxUses, setMaxUses] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Product Selector Filter State
  const [productSearch, setProductSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState<'all' | 'men' | 'women' | 'unisex'>('all');
  const [selectionFilter, setSelectionFilter] = useState<'all' | 'selected' | 'unselected'>('all');

  // Modal State for Viewing Target Products
  const [viewingPromo, setViewingPromo] = useState<PromoCodeItem | null>(null);

  // Copy Feedback State
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Promo Search in List
  const [listSearch, setListSearch] = useState('');
  const [listScopeFilter, setListScopeFilter] = useState<'all' | 'ALL' | 'SPECIFIC_PRODUCTS'>('all');

  const fetchPromos = async () => {
    try {
      const res = await fetch('/api/admin/promos');
      const data = await res.json();
      setPromos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching promos:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/admin/products');
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchPromos();
    fetchProducts();
  }, []);

  // Helper to extract image URL
  const getProductImage = (images: string | string[] | undefined): string => {
    if (!images) return '/images/nay/nay-logo-blue.png';
    if (Array.isArray(images)) return images[0] || '/images/nay/nay-logo-blue.png';
    if (typeof images === 'string') {
      try {
        if (images.startsWith('[')) {
          const parsed = JSON.parse(images);
          return Array.isArray(parsed) && parsed[0] ? parsed[0] : '/images/nay/nay-logo-blue.png';
        }
      } catch {
        return images;
      }
      return images;
    }
    return '/images/nay/nay-logo-blue.png';
  };

  // Filtered Products for the Selector
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        !productSearch ||
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        (p.brandLabel && p.brandLabel.toLowerCase().includes(productSearch.toLowerCase())) ||
        (p.subcategoryLabel && p.subcategoryLabel.toLowerCase().includes(productSearch.toLowerCase()));

      const matchesGender =
        genderFilter === 'all' || (p.gender && p.gender.toLowerCase() === genderFilter);

      const isSelected = selectedProductIds.includes(p.id);
      const matchesSelection =
        selectionFilter === 'all' ||
        (selectionFilter === 'selected' && isSelected) ||
        (selectionFilter === 'unselected' && !isSelected);

      return matchesSearch && matchesGender && matchesSelection;
    });
  }, [products, productSearch, genderFilter, selectionFilter, selectedProductIds]);

  const toggleProductSelection = (id: number) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllFiltered = () => {
    const idsToAdd = filteredProducts.map((p) => p.id);
    setSelectedProductIds((prev) => Array.from(new Set([...prev, ...idsToAdd])));
  };

  const handleDeselectAllFiltered = () => {
    const idsToRemove = new Set(filteredProducts.map((p) => p.id));
    setSelectedProductIds((prev) => prev.filter((id) => !idsToRemove.has(id)));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !value) return;

    if (applicableScope === 'SPECIFIC_PRODUCTS' && selectedProductIds.length === 0) {
      alert('Veuillez sélectionner au moins un produit pour ce code promo ciblé.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/promos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          type,
          value,
          applicableScope,
          productIds: applicableScope === 'SPECIFIC_PRODUCTS' ? selectedProductIds : [],
          minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount) : null,
          maxUses: maxUses ? parseInt(maxUses, 10) : null,
          expiresAt: expiresAt || null,
          description: description || null,
          isActive: true,
        }),
      });

      if (res.ok) {
        setCode('');
        setValue('');
        setMinOrderAmount('');
        setMaxUses('');
        setExpiresAt('');
        setDescription('');
        setSelectedProductIds([]);
        setApplicableScope('ALL');
        setShowAdvanced(false);
        fetchPromos();
      } else {
        const data = await res.json();
        alert(data.error || 'Erreur lors de la création du code promo');
      }
    } catch (error) {
      console.error(error);
      alert('Erreur serveur lors de la création du code promo');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/admin/promos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          isActive: !currentStatus,
        }),
      });
      if (res.ok) {
        setPromos((prev) =>
          prev.map((p) => (p.id === id ? { ...p, isActive: !currentStatus } : p))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer définitivement ce code promo ?')) return;

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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Filtered List of Promos
  const filteredPromosList = useMemo(() => {
    return promos.filter((p) => {
      const matchesSearch =
        !listSearch ||
        p.code.toLowerCase().includes(listSearch.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(listSearch.toLowerCase()));

      const matchesScope =
        listScopeFilter === 'all' || p.applicableScope === listScopeFilter;

      return matchesSearch && matchesScope;
    });
  }, [promos, listSearch, listScopeFilter]);

  // Lookup map for products
  const productMap = useMemo(() => {
    const map = new Map<number, ProductItem>();
    products.forEach((p) => map.set(p.id, p));
    return map;
  }, [products]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-neutral-100 text-neutral-800 border border-neutral-200 flex items-center gap-1.5">
              <Ticket size={11} className="text-neutral-700" />
              Marketing & Offres
            </span>
            <span className="text-xs text-neutral-400">•</span>
            <span className="text-xs text-neutral-500 font-medium">Gestionnaire de Réductions</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 flex items-center gap-2.5">
            <span>Codes Promo & Réductions</span>
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Créez des remises globales ou ciblez spécifiquement des parfums précis avec des règles personnalisées.
          </p>
        </div>

        {/* Quick KPI stats */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 bg-white border border-neutral-200 rounded-xl shadow-2xs text-center">
            <div className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold">Actifs</div>
            <div className="text-sm font-bold text-neutral-900">
              {promos.filter((p) => p.isActive).length}
            </div>
          </div>
          <div className="px-3 py-1.5 bg-white border border-neutral-200 rounded-xl shadow-2xs text-center">
            <div className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold">Ciblés</div>
            <div className="text-sm font-bold text-blue-600">
              {promos.filter((p) => p.applicableScope === 'SPECIFIC_PRODUCTS').length}
            </div>
          </div>
          <div className="px-3 py-1.5 bg-white border border-neutral-200 rounded-xl shadow-2xs text-center">
            <div className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold">Total</div>
            <div className="text-sm font-bold text-neutral-900">{promos.length}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ============================================================
            CREATE PROMO FORM (5 cols on lg)
            ============================================================ */}
        <div className="lg:col-span-5">
          <div className="bg-white border border-neutral-200 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-5 sticky top-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-neutral-100">
              <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center">
                <Plus size={16} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-neutral-900">Nouveau Code Promo</h2>
                <p className="text-[11px] text-neutral-500">Configurez le code et sa portée d'application</p>
              </div>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              {/* Code Name */}
              <div>
                <label className="block font-semibold text-neutral-800 mb-1.5">
                  Code Promo <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase().replace(/\s/g, ''))}
                    placeholder="EX: EID2026, SUMMER20, OUD50"
                    required
                    className="w-full bg-[#f8fafc] border border-neutral-200 rounded-xl pl-3.5 pr-10 py-2.5 text-xs font-mono font-bold text-neutral-900 placeholder:font-normal placeholder:font-sans focus:bg-white focus:outline-none focus:border-neutral-900 uppercase transition-colors"
                  />
                  <div className="absolute right-3 top-2.5 text-neutral-400">
                    <Tag size={15} />
                  </div>
                </div>
              </div>

              {/* Remise Type & Value Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-800 mb-1.5">Type de remise</label>
                  <div className="grid grid-cols-2 gap-1.5 bg-[#f8fafc] p-1 rounded-xl border border-neutral-200">
                    <button
                      type="button"
                      onClick={() => setType('percentage')}
                      className={`py-1.5 rounded-lg font-semibold text-[11px] flex items-center justify-center gap-1 transition-all ${
                        type === 'percentage'
                          ? 'bg-neutral-900 text-white shadow-xs'
                          : 'text-neutral-600 hover:text-neutral-900'
                      }`}
                    >
                      <Percent size={12} />
                      <span>Pourcent %</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setType('fixed')}
                      className={`py-1.5 rounded-lg font-semibold text-[11px] flex items-center justify-center gap-1 transition-all ${
                        type === 'fixed'
                          ? 'bg-neutral-900 text-white shadow-xs'
                          : 'text-neutral-600 hover:text-neutral-900'
                      }`}
                    >
                      <Coins size={12} />
                      <span>Fixe MAD</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-800 mb-1.5">
                    Valeur de remise <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      placeholder={type === 'percentage' ? '20' : '100'}
                      required
                      min="1"
                      step="any"
                      className="w-full bg-[#f8fafc] border border-neutral-200 rounded-xl pl-3.5 pr-12 py-2 text-xs font-bold text-neutral-900 focus:bg-white focus:outline-none focus:border-neutral-900 transition-colors"
                    />
                    <div className="absolute right-3 top-2 font-bold text-xs text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-200">
                      {type === 'percentage' ? '%' : 'MAD'}
                    </div>
                  </div>
                </div>
              </div>

              {/* ============================================================
                  TARGETING SCOPE (APPLICATION DU CODE)
                  ============================================================ */}
              <div className="pt-2 border-t border-neutral-100 space-y-2.5">
                <label className="block font-semibold text-neutral-800">
                  Portée & Ciblage des Produits <span className="text-rose-500">*</span>
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setApplicableScope('ALL')}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      applicableScope === 'ALL'
                        ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                        : 'bg-[#f8fafc] hover:bg-neutral-100 text-neutral-700 border-neutral-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <Globe size={15} className={applicableScope === 'ALL' ? 'text-white' : 'text-neutral-500'} />
                      <div
                        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          applicableScope === 'ALL'
                            ? 'border-white bg-white'
                            : 'border-neutral-300 bg-transparent'
                        }`}
                      >
                        {applicableScope === 'ALL' && <div className="w-1.5 h-1.5 rounded-full bg-neutral-900" />}
                      </div>
                    </div>
                    <div>
                      <div className="font-bold text-[11px]">Tout le catalogue</div>
                      <div
                        className={`text-[10px] leading-tight mt-0.5 ${
                          applicableScope === 'ALL' ? 'text-neutral-300' : 'text-neutral-500'
                        }`}
                      >
                        Tous les parfums du panier
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setApplicableScope('SPECIFIC_PRODUCTS')}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      applicableScope === 'SPECIFIC_PRODUCTS'
                        ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                        : 'bg-[#f8fafc] hover:bg-neutral-100 text-neutral-700 border-neutral-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <Layers
                        size={15}
                        className={applicableScope === 'SPECIFIC_PRODUCTS' ? 'text-white' : 'text-neutral-500'}
                      />
                      <div
                        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          applicableScope === 'SPECIFIC_PRODUCTS'
                            ? 'border-white bg-white'
                            : 'border-neutral-300 bg-transparent'
                        }`}
                      >
                        {applicableScope === 'SPECIFIC_PRODUCTS' && (
                          <div className="w-1.5 h-1.5 rounded-full bg-neutral-900" />
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="font-bold text-[11px]">Produits Spécifiques</div>
                      <div
                        className={`text-[10px] leading-tight mt-0.5 ${
                          applicableScope === 'SPECIFIC_PRODUCTS' ? 'text-neutral-300' : 'text-neutral-500'
                        }`}
                      >
                        {selectedProductIds.length > 0
                          ? `${selectedProductIds.length} parfum(s) choisi(s)`
                          : 'Choisir les parfums'}
                      </div>
                    </div>
                  </button>
                </div>

                {/* SPECIFIC PRODUCTS SELECTOR */}
                {applicableScope === 'SPECIFIC_PRODUCTS' && (
                  <div className="bg-[#f8fafc] border border-blue-200 rounded-xl p-3.5 space-y-3 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                        <span className="text-[11px] font-bold text-neutral-900">
                          Sélectionnez les parfums éligibles
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200">
                        {selectedProductIds.length} sélectionné{selectedProductIds.length > 1 ? 's' : ''}
                      </span>
                    </div>

                    {/* Search & Action bar */}
                    <div className="space-y-2">
                      <div className="relative">
                        <Search size={13} className="absolute left-2.5 top-2.5 text-neutral-400" />
                        <input
                          type="text"
                          value={productSearch}
                          onChange={(e) => setProductSearch(e.target.value)}
                          placeholder="Rechercher un parfum par nom..."
                          className="w-full bg-white border border-neutral-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900"
                        />
                      </div>

                      {/* Quick filters & Batch buttons */}
                      <div className="flex items-center justify-between text-[10px]">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setSelectionFilter('all')}
                            className={`px-2 py-0.5 rounded-md font-medium ${
                              selectionFilter === 'all'
                                ? 'bg-neutral-800 text-white'
                                : 'bg-white text-neutral-600 border border-neutral-200'
                            }`}
                          >
                            Tous ({products.length})
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectionFilter('selected')}
                            className={`px-2 py-0.5 rounded-md font-medium ${
                              selectionFilter === 'selected'
                                ? 'bg-blue-700 text-white'
                                : 'bg-white text-neutral-600 border border-neutral-200'
                            }`}
                          >
                            Cochés ({selectedProductIds.length})
                          </button>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={handleSelectAllFiltered}
                            className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer hover:underline"
                          >
                            Tout cocher
                          </button>
                          <span className="text-neutral-300">|</span>
                          <button
                            type="button"
                            onClick={handleDeselectAllFiltered}
                            className="text-neutral-500 hover:text-neutral-800 font-medium cursor-pointer hover:underline"
                          >
                            Décocher
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Product List Scrollable */}
                    <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1 border border-neutral-200/80 rounded-lg bg-white p-2">
                      {loadingProducts ? (
                        <div className="py-8 text-center text-neutral-400 text-xs flex items-center justify-center gap-2">
                          <Loader2 size={14} className="animate-spin" />
                          <span>Chargement du catalogue...</span>
                        </div>
                      ) : filteredProducts.length === 0 ? (
                        <div className="py-6 text-center text-neutral-400 text-xs">
                          Aucun parfum ne correspond aux filtres
                        </div>
                      ) : (
                        filteredProducts.map((prod) => {
                          const isSelected = selectedProductIds.includes(prod.id);
                          const imgUrl = getProductImage(prod.images);

                          return (
                            <div
                              key={prod.id}
                              onClick={() => toggleProductSelection(prod.id)}
                              className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-all ${
                                isSelected
                                  ? 'bg-blue-50/70 border-blue-300 text-neutral-900'
                                  : 'bg-white border-neutral-150 hover:bg-neutral-50 text-neutral-700'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div
                                  className={`w-4 h-4 rounded flex items-center justify-center transition-colors flex-shrink-0 ${
                                    isSelected
                                      ? 'bg-blue-600 text-white'
                                      : 'border border-neutral-300 bg-white'
                                  }`}
                                >
                                  {isSelected && <Check size={11} strokeWidth={3} />}
                                </div>
                                <div className="w-8 h-8 rounded-md bg-neutral-100 border border-neutral-200 overflow-hidden relative flex-shrink-0">
                                  <Image
                                    src={imgUrl}
                                    alt={prod.name}
                                    fill
                                    className="object-cover"
                                    sizes="32px"
                                  />
                                </div>
                                <div className="min-w-0">
                                  <div className="text-[11px] font-bold text-neutral-900 truncate">
                                    {prod.name}
                                  </div>
                                  <div className="text-[10px] text-neutral-400 truncate">
                                    {prod.brandLabel || prod.subcategoryLabel || 'Parfum'}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right flex-shrink-0 pl-2">
                                <span className="text-[11px] font-bold text-neutral-900">
                                  {prod.price} MAD
                                </span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* ============================================================
                  ADVANCED RULES TOGGLE
                  ============================================================ */}
              <div className="pt-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-[11px] font-semibold text-neutral-600 hover:text-neutral-900 flex items-center justify-between w-full py-1 cursor-pointer"
                >
                  <span>Paramètres et restrictions avancés</span>
                  <span className="text-neutral-400">{showAdvanced ? '− Masquer' : '+ Dérouler'}</span>
                </button>

                {showAdvanced && (
                  <div className="space-y-3 pt-3 animate-in fade-in duration-150">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-medium text-neutral-700 mb-1">Panier minimum (MAD)</label>
                        <input
                          type="number"
                          value={minOrderAmount}
                          onChange={(e) => setMinOrderAmount(e.target.value)}
                          placeholder="EX: 300"
                          min="0"
                          className="w-full bg-[#f8fafc] border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:bg-white focus:outline-none focus:border-neutral-900"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-neutral-700 mb-1">Max d'utilisations</label>
                        <input
                          type="number"
                          value={maxUses}
                          onChange={(e) => setMaxUses(e.target.value)}
                          placeholder="EX: 50"
                          min="1"
                          className="w-full bg-[#f8fafc] border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:bg-white focus:outline-none focus:border-neutral-900"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-medium text-neutral-700 mb-1">Date d'expiration</label>
                      <input
                        type="date"
                        value={expiresAt}
                        onChange={(e) => setExpiresAt(e.target.value)}
                        className="w-full bg-[#f8fafc] border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:bg-white focus:outline-none focus:border-neutral-900"
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-neutral-700 mb-1">Note / Description interne</label>
                      <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="EX: Offre spéciale Influenceuse Sarah"
                        className="w-full bg-[#f8fafc] border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:bg-white focus:outline-none focus:border-neutral-900"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-neutral-900 hover:bg-black text-white py-3 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <Plus size={15} />
                  )}
                  <span>
                    {applicableScope === 'SPECIFIC_PRODUCTS'
                      ? `Créer le code (${selectedProductIds.length} produit${selectedProductIds.length > 1 ? 's' : ''})`
                      : 'Créer le code promo'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* ============================================================
            PROMO CODES LIST & MANAGEMENT (7 cols on lg)
            ============================================================ */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-neutral-200 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
            {/* Header & Filter Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-neutral-100 text-neutral-800 flex items-center justify-center border border-neutral-200">
                  <Ticket size={16} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-neutral-900">
                    Codes Promo Actifs ({promos.length})
                  </h2>
                  <p className="text-[11px] text-neutral-500">
                    Gérez la validité, la portée et les remises de vos codes
                  </p>
                </div>
              </div>

              {/* Scope filter pill */}
              <div className="flex items-center gap-1.5 bg-neutral-100 p-1 rounded-xl border border-neutral-200 text-[10px]">
                <button
                  type="button"
                  onClick={() => setListScopeFilter('all')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    listScopeFilter === 'all'
                      ? 'bg-white text-neutral-900 shadow-2xs'
                      : 'text-neutral-500 hover:text-neutral-800'
                  }`}
                >
                  Tous ({promos.length})
                </button>
                <button
                  type="button"
                  onClick={() => setListScopeFilter('ALL')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    listScopeFilter === 'ALL'
                      ? 'bg-white text-neutral-900 shadow-2xs'
                      : 'text-neutral-500 hover:text-neutral-800'
                  }`}
                >
                  Catalogue ({promos.filter((p) => p.applicableScope === 'ALL').length})
                </button>
                <button
                  type="button"
                  onClick={() => setListScopeFilter('SPECIFIC_PRODUCTS')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    listScopeFilter === 'SPECIFIC_PRODUCTS'
                      ? 'bg-white text-blue-700 shadow-2xs'
                      : 'text-neutral-500 hover:text-neutral-800'
                  }`}
                >
                  Ciblés ({promos.filter((p) => p.applicableScope === 'SPECIFIC_PRODUCTS').length})
                </button>
              </div>
            </div>

            {/* Search list bar */}
            {promos.length > 0 && (
              <div className="relative">
                <Search size={14} className="absolute left-3 top-2.5 text-neutral-400" />
                <input
                  type="text"
                  value={listSearch}
                  onChange={(e) => setListSearch(e.target.value)}
                  placeholder="Rechercher par nom de code promo ou description..."
                  className="w-full bg-[#f8fafc] border border-neutral-200 rounded-xl pl-9 pr-3 py-2 text-xs text-neutral-900 focus:bg-white focus:outline-none focus:border-neutral-900"
                />
              </div>
            )}

            {loading ? (
              <div className="py-20 text-center text-neutral-400 text-xs flex items-center justify-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                <span>Chargement des codes promo...</span>
              </div>
            ) : filteredPromosList.length === 0 ? (
              <div className="text-center py-16 text-neutral-400 bg-neutral-50/60 rounded-2xl border border-neutral-200 border-dashed flex flex-col items-center justify-center gap-2.5">
                <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400">
                  <Ticket size={24} />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-neutral-800">Aucun code promo trouvé</p>
                  <p className="text-[11px] text-neutral-400 max-w-xs">
                    {promos.length === 0
                      ? 'Utilisez le formulaire à gauche pour créer votre premier code promo.'
                      : 'Aucun code ne correspond à vos filtres de recherche.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredPromosList.map((promo) => {
                  const isSpecific = promo.applicableScope === 'SPECIFIC_PRODUCTS';
                  const targetCount = Array.isArray(promo.productIds) ? promo.productIds.length : 0;
                  const isExpired = promo.expiresAt && new Date(promo.expiresAt) < new Date();

                  return (
                    <div
                      key={promo.id}
                      className={`p-4 border rounded-2xl transition-all ${
                        promo.isActive && !isExpired
                          ? 'bg-white border-neutral-200 hover:border-neutral-300 shadow-2xs'
                          : 'bg-neutral-50/70 border-neutral-200 opacity-75'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        {/* Code + Value Badge */}
                        <div className="flex items-start sm:items-center gap-3">
                          <div className="w-11 h-11 bg-neutral-900 text-white rounded-xl flex flex-col items-center justify-center flex-shrink-0 shadow-2xs font-mono">
                            <Tag size={16} />
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-black font-mono tracking-wider text-neutral-900 bg-neutral-100 px-2.5 py-0.5 rounded-lg border border-neutral-200 select-all">
                                {promo.code}
                              </span>

                              {/* 1-Click Copy */}
                              <button
                                type="button"
                                onClick={() => copyToClipboard(promo.code)}
                                className="text-neutral-400 hover:text-neutral-900 p-1 rounded hover:bg-neutral-100 transition-colors"
                                title="Copier le code"
                              >
                                {copiedCode === promo.code ? (
                                  <Check size={13} className="text-emerald-600" />
                                ) : (
                                  <Copy size={13} />
                                )}
                              </button>

                              {/* Discount Value Badge */}
                              <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                {promo.type === 'percentage'
                                  ? `-${promo.value}%`
                                  : `-${promo.value} MAD`}
                              </span>

                              {/* Status Badge */}
                              {isExpired ? (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                  Expiré
                                </span>
                              ) : promo.isActive ? (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                  Actif
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-neutral-100 text-neutral-600 border border-neutral-200">
                                  En pause
                                </span>
                              )}
                            </div>

                            {/* Description if set */}
                            {promo.description && (
                              <div className="text-[11px] text-neutral-500 italic">
                                {promo.description}
                              </div>
                            )}

                            {/* Scope & Rules Pills */}
                            <div className="flex items-center gap-2 flex-wrap pt-0.5">
                              {/* Scope Pill */}
                              {isSpecific ? (
                                <button
                                  type="button"
                                  onClick={() => setViewingPromo(promo)}
                                  className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors flex items-center gap-1 cursor-pointer"
                                >
                                  <Layers size={11} />
                                  <span>{targetCount} parfum{targetCount > 1 ? 's' : ''} ciblé{targetCount > 1 ? 's' : ''}</span>
                                  <Eye size={11} className="ml-0.5 text-blue-500" />
                                </button>
                              ) : (
                                <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-neutral-100 text-neutral-700 border border-neutral-200 flex items-center gap-1">
                                  <Globe size={11} />
                                  <span>Tout le catalogue</span>
                                </span>
                              )}

                              {/* Minimum order */}
                              {promo.minOrderAmount && (
                                <span className="px-2 py-0.5 rounded-md text-[10px] text-neutral-600 bg-neutral-50 border border-neutral-200">
                                  Min. {promo.minOrderAmount} MAD
                                </span>
                              )}

                              {/* Expiry Date */}
                              {promo.expiresAt && (
                                <span className="px-2 py-0.5 rounded-md text-[10px] text-neutral-500 bg-neutral-50 border border-neutral-200 flex items-center gap-1">
                                  <Calendar size={10} />
                                  <span>
                                    Expire le{' '}
                                    {new Date(promo.expiresAt).toLocaleDateString('fr-FR', {
                                      day: '2-digit',
                                      month: 'short',
                                      year: 'numeric',
                                    })}
                                  </span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Actions: Toggle & Delete */}
                        <div className="flex items-center gap-2 self-end sm:self-center">
                          {/* Toggle Active Button */}
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(promo.id, promo.isActive)}
                            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
                              promo.isActive
                                ? 'bg-white hover:bg-neutral-50 text-neutral-700 border-neutral-200'
                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                            }`}
                            title={promo.isActive ? 'Mettre en pause' : 'Activer'}
                          >
                            <Power size={13} className={promo.isActive ? 'text-neutral-400' : 'text-emerald-600'} />
                            <span>{promo.isActive ? 'Pause' : 'Activer'}</span>
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => handleDelete(promo.id)}
                            className="p-2 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-rose-100"
                            title="Supprimer définitivement"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================
          MODAL: VIEW TARGET PRODUCTS FOR A PROMO CODE
          ============================================================ */}
      {viewingPromo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xl max-w-lg w-full max-h-[85vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-neutral-150 flex items-center justify-between bg-neutral-50/70">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Layers size={15} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                    <span>Parfums ciblés pour</span>
                    <span className="font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {viewingPromo.code}
                    </span>
                  </h3>
                  <p className="text-[11px] text-neutral-500">
                    Seuls ces {viewingPromo.productIds.length} parfums bénéficieront de la remise de{' '}
                    {viewingPromo.type === 'percentage'
                      ? `-${viewingPromo.value}%`
                      : `-${viewingPromo.value} MAD`}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setViewingPromo(null)}
                className="p-1.5 text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <X size={17} />
              </button>
            </div>

            {/* Modal Product List */}
            <div className="p-4 overflow-y-auto space-y-2 flex-1 max-h-[60vh]">
              {viewingPromo.productIds.length === 0 ? (
                <div className="py-8 text-center text-neutral-400 text-xs">
                  Aucun parfum sélectionné
                </div>
              ) : (
                viewingPromo.productIds.map((pid) => {
                  const prod = productMap.get(pid);
                  if (!prod) {
                    return (
                      <div
                        key={pid}
                        className="p-2.5 rounded-xl border border-neutral-200 bg-[#f8fafc] text-xs text-neutral-500"
                      >
                        Produit ID #{pid} (non trouvé ou supprimé)
                      </div>
                    );
                  }

                  const imgUrl = getProductImage(prod.images);

                  return (
                    <div
                      key={prod.id}
                      className="flex items-center justify-between p-2.5 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50/70 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-neutral-100 border border-neutral-200 overflow-hidden relative flex-shrink-0">
                          <Image
                            src={imgUrl}
                            alt={prod.name}
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-neutral-900 truncate">
                            {prod.name}
                          </div>
                          <div className="text-[11px] text-neutral-400 truncate">
                            {prod.brandLabel || prod.subcategoryLabel || 'Parfum'}
                          </div>
                        </div>
                      </div>

                      <div className="text-right pl-3 flex-shrink-0">
                        <span className="text-xs font-bold text-neutral-900">{prod.price} MAD</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-neutral-150 bg-neutral-50/70 flex justify-end">
              <button
                type="button"
                onClick={() => setViewingPromo(null)}
                className="px-4 py-2 bg-neutral-900 hover:bg-black text-white text-xs font-semibold rounded-xl cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
