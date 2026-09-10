'use client';

import React, { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Star, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Plus, 
  Trash2, 
  Edit3, 
  ExternalLink, 
  Sparkles, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  MessageSquare, 
  ThumbsUp, 
  Download,
  SlidersHorizontal,
  MapPin,
  Check,
  Share2,
  Copy,
  LayoutGrid,
  List,
  ShieldCheck,
  TrendingUp,
  Award
} from 'lucide-react';

interface ProductInfo {
  id: number;
  name: string;
  slug: string;
  images: string;
  brandLabel: string;
  price: number;
}

interface ReviewItem {
  id: number;
  productSlug: string;
  author: string;
  city: string;
  rating: number;
  title: string;
  comment: string;
  verified: boolean;
  createdAt: string;
  product?: ProductInfo;
}

interface Stats {
  totalReviews: number;
  verifiedCount: number;
  pendingCount: number;
  avgRating: number;
  ratingDist: Record<number, number>;
  recentCount: number;
  csatPercentage: number;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [latestSpotlight, setLatestSpotlight] = useState<ReviewItem[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalReviews: 0,
    verifiedCount: 0,
    pendingCount: 0,
    avgRating: 5.0,
    ratingDist: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    recentCount: 0,
    csatPercentage: 99,
  });
  const [productsList, setProductsList] = useState<{ slug: string; name: string; brandLabel?: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Filters & Pagination State
  const [search, setSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [verifiedFilter, setVerifiedFilter] = useState('all');
  const [productFilter, setProductFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [recentOnly, setRecentOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<ReviewItem | null>(null);
  const [deletingReview, setDeletingReview] = useState<ReviewItem | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    author: '',
    city: 'Casablanca',
    productSlug: '',
    rating: 5,
    title: '',
    comment: '',
    verified: true,
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchReviews = async (page = currentPage) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '20',
        q: search,
        rating: ratingFilter,
        verified: verifiedFilter,
        productSlug: productFilter,
        sortBy,
        recentOnly: String(recentOnly),
      });

      const res = await fetch(`/api/admin/reviews?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
        setLatestSpotlight(data.latestSpotlight || []);
        setStats(data.stats || stats);
        setProductsList(data.productsList || []);
        setCurrentPage(data.pagination.page);
        setTotalPages(data.pagination.totalPages);
        setTotalCount(data.pagination.total);
      }
    } catch (err) {
      console.error('Failed to load reviews:', err);
      showNotification('error', 'Erreur lors du chargement des avis.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews(1);
  }, [ratingFilter, verifiedFilter, productFilter, sortBy, recentOnly]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchReviews(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  // Toggle quick verify
  const handleToggleVerify = async (review: ReviewItem) => {
    const updatedStatus = !review.verified;
    setReviews(prev => prev.map(r => r.id === review.id ? { ...r, verified: updatedStatus } : r));
    
    try {
      const res = await fetch(`/api/admin/reviews/${review.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verified: updatedStatus }),
      });
      if (res.ok) {
        showNotification('success', updatedStatus ? 'Avis certifié et vérifié avec succès.' : 'Avis marqué comme en attente.');
        fetchReviews(currentPage);
      } else {
        throw new Error();
      }
    } catch {
      showNotification('error', 'Échec de la mise à jour.');
      fetchReviews(currentPage);
    }
  };

  // Open Edit Modal
  const openEditModal = (review: ReviewItem) => {
    setEditingReview(review);
    setFormData({
      author: review.author,
      city: review.city || 'Maroc',
      productSlug: review.productSlug,
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      verified: review.verified,
    });
  };

  // Open Add Modal
  const openAddModal = () => {
    setFormData({
      author: '',
      city: 'Casablanca',
      productSlug: productsList[0]?.slug || '',
      rating: 5,
      title: 'Excellente fragrance et tenue parfaite',
      comment: '',
      verified: true,
    });
    setIsAddModalOpen(true);
  };

  // Save Add or Edit
  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);

    try {
      if (editingReview) {
        const res = await fetch(`/api/admin/reviews/${editingReview.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          showNotification('success', 'Avis client mis à jour avec succès.');
          setEditingReview(null);
          fetchReviews(currentPage);
        } else {
          const data = await res.json();
          showNotification('error', data.error || 'Erreur lors de la modification.');
        }
      } else {
        const res = await fetch('/api/admin/reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          showNotification('success', 'Nouvel avis ajouté au sommet de la première page.');
          setIsAddModalOpen(false);
          fetchReviews(1);
        } else {
          const data = await res.json();
          showNotification('error', data.error || 'Erreur lors de la création.');
        }
      }
    } catch {
      showNotification('error', 'Une erreur est survenue.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Delete review
  const handleDeleteReview = async () => {
    if (!deletingReview) return;
    setFormSubmitting(true);
    try {
      const res = await fetch(`/api/admin/reviews/${deletingReview.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        showNotification('success', 'Avis client supprimé avec succès.');
        setDeletingReview(null);
        fetchReviews(currentPage);
      } else {
        showNotification('error', 'Erreur lors de la suppression.');
      }
    } catch {
      showNotification('error', 'Une erreur est survenue.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Copy for Story / Social Media
  const handleCopyStory = (review: ReviewItem) => {
    const stars = '⭐'.repeat(review.rating);
    const prodName = review.product?.name || review.productSlug;
    const text = `✨ AVIS CLIENT CERTIFIÉ NAY PARFUMS\n${stars} ${review.rating}/5\n\n"${review.comment}"\n\n👤 ${review.author} (${review.city || 'Maroc'})\n🛍️ Parfum : ${prodName}\n🌐 nayparfum.ma`;
    
    navigator.clipboard.writeText(text);
    setCopiedId(review.id);
    showNotification('success', 'Témoignage copié dans le presse-papier pour WhatsApp / Instagram Story !');
    setTimeout(() => setCopiedId(null), 3000);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Client', 'Ville', 'Note', 'Titre', 'Commentaire', 'Produit', 'Statut', 'Date'];
    const rows = reviews.map(r => [
      r.id,
      `"${r.author.replace(/"/g, '""')}"`,
      `"${(r.city || '').replace(/"/g, '""')}"`,
      r.rating,
      `"${r.title.replace(/"/g, '""')}"`,
      `"${r.comment.replace(/"/g, '""')}"`,
      `"${(r.product?.name || r.productSlug).replace(/"/g, '""')}"`,
      r.verified ? 'Vérifié' : 'En attente',
      new Date(r.createdAt).toLocaleDateString('fr-FR')
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `avis_nay_parfums_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper for product image
  const getProductImage = (product?: ProductInfo) => {
    if (!product?.images) return '/images/placeholder.jpg';
    try {
      const imgs = JSON.parse(product.images);
      return Array.isArray(imgs) && imgs.length > 0 ? imgs[0] : '/images/placeholder.jpg';
    } catch {
      return '/images/placeholder.jpg';
    }
  };

  // Helper for checking if review is recent (less than 48 hours)
  const isRecentReview = (dateStr: string) => {
    const reviewDate = new Date(dateStr).getTime();
    const now = Date.now();
    return (now - reviewDate) < (48 * 60 * 60 * 1000);
  };

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto min-h-screen text-[#111827] pb-24">
      
      {/* NOTIFICATION TOAST */}
      {notification && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border transition-all ${
          notification.type === 'success' 
            ? 'bg-[#0f172a] text-white border-emerald-500/50' 
            : 'bg-red-900 text-white border-red-500/50'
        }`}>
          {notification.type === 'success' ? <CheckCircle2 size={18} className="text-emerald-400" /> : <AlertCircle size={18} className="text-red-400" />}
          <span className="text-sm font-medium">{notification.message}</span>
        </div>
      )}

      {/* LUXURY HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 lg:p-8 rounded-3xl border border-[#e5e7eb] shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em] text-[#9ca3af] uppercase mb-1.5">
            <span>Maison de Parfum</span>
            <span>·</span>
            <span className="text-[#0284c7]">Satisfaction Client & E-Réputation</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-[#0f172a] flex items-center gap-3">
            Avis & Témoignages
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {stats.totalReviews.toLocaleString('fr-FR')} avis certifiés
            </span>
          </h1>
          <p className="text-xs lg:text-sm text-[#64748b] mt-1.5 max-w-2xl leading-relaxed">
            Supervisez la réputation olfactive de vos fragrances, modérez les retours clients et valorisez les meilleurs témoignages en direct.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => fetchReviews(currentPage)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#f8fafc] hover:bg-[#f1f5f9] border border-[#e2e8f0] text-xs font-semibold text-[#475569] hover:text-[#0f172a] transition-all shadow-sm"
            title="Rafraîchir"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            <span>Actualiser</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#f8fafc] hover:bg-[#f1f5f9] border border-[#e2e8f0] text-xs font-semibold text-[#475569] hover:text-[#0f172a] transition-all shadow-sm"
          >
            <Download size={14} />
            <span>Exporter CSV</span>
          </button>

          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#0f172a] hover:bg-[#1e293b] text-white text-xs font-bold tracking-wide transition-all shadow-md hover:shadow-lg active:scale-95"
          >
            <Plus size={16} />
            <span>+ Ajouter un Avis</span>
          </button>
        </div>
      </div>

      {/* KPI METRIC CARDS (HAUTE PARFUMERIE STYLE) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* CSAT / Satisfaction Index */}
        <div className="bg-white border border-[#e5e7eb] rounded-3xl p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-bold tracking-[0.15em] uppercase text-[#64748b]">Indice de Satisfaction</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200/60">
              <Award size={20} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl lg:text-4xl font-black text-[#0f172a] tracking-tight">{stats.csatPercentage}%</span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Excellence
            </span>
          </div>
          <p className="text-xs text-[#64748b] mt-3 flex items-center gap-1.5">
            <CheckCircle2 size={13} className="text-emerald-500" />
            <span>Basé sur les avis 4★ et 5★</span>
          </p>
        </div>

        {/* Note Moyenne Globale */}
        <div className="bg-white border border-[#e5e7eb] rounded-3xl p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-bold tracking-[0.15em] uppercase text-[#64748b]">Note Moyenne</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center border border-amber-200/60">
              <Star size={20} className="fill-amber-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl lg:text-4xl font-black text-[#0f172a] tracking-tight">{stats.avgRating}</span>
            <span className="text-sm font-semibold text-[#94a3b8]">/ 5.0</span>
          </div>
          <div className="flex items-center gap-1 mt-3">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star 
                key={s} 
                size={14} 
                className={s <= Math.round(stats.avgRating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'} 
              />
            ))}
            <span className="text-xs font-semibold text-[#64748b] ml-1.5">1 779 évaluations</span>
          </div>
        </div>

        {/* Avis Vérifiés */}
        <div className="bg-white border border-[#e5e7eb] rounded-3xl p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-bold tracking-[0.15em] uppercase text-[#64748b]">Avis Certifiés</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200/60">
              <ShieldCheck size={20} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl lg:text-4xl font-black text-[#0f172a] tracking-tight">
              {stats.verifiedCount.toLocaleString('fr-FR')}
            </span>
            <span className="text-xs font-semibold text-[#64748b]">
              ({stats.totalReviews > 0 ? Math.round((stats.verifiedCount / stats.totalReviews) * 100) : 0}%)
            </span>
          </div>
          <p className="text-xs text-[#64748b] mt-3 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Badge de confiance visible en boutique</span>
          </p>
        </div>

        {/* Nouveaux Avis Récents (Always highlighted) */}
        <div 
          onClick={() => setRecentOnly(!recentOnly)}
          className={`cursor-pointer rounded-3xl p-6 border transition-all relative overflow-hidden group ${
            recentOnly 
              ? 'bg-[#0f172a] text-white border-[#0f172a] shadow-lg' 
              : 'bg-white border-[#e5e7eb] text-[#0f172a] shadow-sm hover:border-[#0f172a]/30'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <span className={`text-[11px] font-bold tracking-[0.15em] uppercase ${recentOnly ? 'text-blue-300' : 'text-[#64748b]'}`}>
              {recentOnly ? '⚡ Filtre Nouveaux Actif' : 'Nouveaux Avis Récents'}
            </span>
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${
              recentOnly 
                ? 'bg-blue-500/20 text-blue-400 border-blue-400/30' 
                : 'bg-blue-50 text-blue-600 border-blue-200/60'
            }`}>
              <Clock size={20} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl lg:text-4xl font-black tracking-tight">
              {stats.recentCount > 0 ? `+${stats.recentCount}` : stats.totalReviews}
            </span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              recentOnly ? 'bg-blue-400/20 text-blue-300' : 'bg-blue-50 text-blue-700'
            }`}>
              {recentOnly ? 'Désactiver' : 'Cliquez pour filtrer'}
            </span>
          </div>
          <p className={`text-xs mt-3 ${recentOnly ? 'text-blue-200' : 'text-[#64748b]'}`}>
            {recentOnly ? 'Affichage exclusif des récents' : 'Toujours affichés en tête de page 1'}
          </p>
        </div>

      </div>

      {/* RATING BREAKDOWN (CLEAN LUXURY ACCORDION) */}
      <div className="bg-white border border-[#e5e7eb] rounded-3xl p-6 lg:p-7 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-[#0f172a] flex items-center gap-2">
              <Sparkles size={16} className="text-amber-500" /> Structure Olfactive des Évaluations
            </h2>
            <p className="text-xs text-[#64748b] mt-0.5">
              Cliquez sur un nombre d'étoiles pour filtrer instantanément les avis clients.
            </p>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {[5, 4, 3, 2, 1].map((starNum) => {
              const count = stats.ratingDist[starNum] || 0;
              const isSelected = ratingFilter === String(starNum);
              return (
                <button
                  key={starNum}
                  onClick={() => setRatingFilter(isSelected ? 'all' : String(starNum))}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border ${
                    isSelected 
                      ? 'bg-amber-50 border-amber-300 text-amber-800 shadow-sm ring-2 ring-amber-400/30' 
                      : 'bg-[#f8fafc] border-[#e2e8f0] text-[#475569] hover:bg-[#f1f5f9] hover:text-[#0f172a]'
                  }`}
                >
                  <span>{starNum}</span>
                  <Star size={12} className="fill-amber-400 text-amber-400" />
                  <span className="text-[11px] font-normal text-[#94a3b8]">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = stats.ratingDist[star] || 0;
            const pct = stats.totalReviews > 0 ? Math.round((count / stats.totalReviews) * 100) : 0;
            const isSelected = ratingFilter === String(star);

            return (
              <div 
                key={star} 
                onClick={() => setRatingFilter(isSelected ? 'all' : String(star))}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  isSelected 
                    ? 'bg-amber-50/50 border-amber-300 shadow-sm' 
                    : 'bg-[#f8fafc] border-[#e2e8f0] hover:border-amber-300 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold mb-2">
                  <span className="flex items-center gap-1 text-[#0f172a]">
                    {star} <Star size={13} className="fill-amber-400 text-amber-400" />
                  </span>
                  <span className="text-[#64748b] font-medium">{count} ({pct}%)</span>
                </div>
                <div className="w-full bg-[#e2e8f0] h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500" 
                    style={{ width: `${pct}%` }} 
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FILTER AND SEARCH TOOLBAR */}
      <div className="bg-white border border-[#e5e7eb] rounded-3xl p-5 lg:p-6 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8]" size={16} />
            <input
              type="text"
              placeholder="Rechercher par client, ville (Casablanca, Marrakech...), extrait de commentaire, parfum..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl pl-11 pr-10 py-3 text-xs lg:text-sm text-[#0f172a] placeholder-[#94a3b8] focus:outline-none focus:border-[#0f172a] focus:bg-white transition-all shadow-inner"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#0f172a]">
                <X size={15} />
              </button>
            )}
          </div>

          {/* Product Select */}
          <div className="w-full lg:w-72">
            <select
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
              className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl px-4 py-3 text-xs font-medium text-[#0f172a] focus:outline-none focus:border-[#0f172a] transition-all cursor-pointer"
            >
              <option value="all">Tous les Parfums ({productsList.length})</option>
              {productsList.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Verification Status */}
          <div className="w-full lg:w-48">
            <select
              value={verifiedFilter}
              onChange={(e) => setVerifiedFilter(e.target.value)}
              className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl px-4 py-3 text-xs font-medium text-[#0f172a] focus:outline-none focus:border-[#0f172a] transition-all cursor-pointer"
            >
              <option value="all">Tous les Statuts</option>
              <option value="true">✅ Achat Vérifié</option>
              <option value="false">⏳ En Attente</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="w-full lg:w-48">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl px-4 py-3 text-xs font-medium text-[#0f172a] focus:outline-none focus:border-[#0f172a] transition-all cursor-pointer"
            >
              <option value="newest">✨ Plus récents (Tête de liste)</option>
              <option value="oldest">Plus anciens</option>
              <option value="rating-high">Meilleures notes (5★ &rarr; 1★)</option>
              <option value="rating-low">Moins bonnes notes (1★ &rarr; 5★)</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-[#f8fafc] border border-[#e2e8f0] p-1 rounded-2xl self-end lg:self-auto">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-2 rounded-xl transition-all ${
                viewMode === 'cards' 
                  ? 'bg-white text-[#0f172a] shadow-sm font-bold' 
                  : 'text-[#94a3b8] hover:text-[#0f172a]'
              }`}
              title="Vue Cartes Prestige"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-xl transition-all ${
                viewMode === 'table' 
                  ? 'bg-white text-[#0f172a] shadow-sm font-bold' 
                  : 'text-[#94a3b8] hover:text-[#0f172a]'
              }`}
              title="Vue Tableau Détaillé"
            >
              <List size={16} />
            </button>
          </div>

        </div>

        {/* Active Filter Chips */}
        {(search || ratingFilter !== 'all' || verifiedFilter !== 'all' || productFilter !== 'all' || recentOnly) && (
          <div className="flex items-center gap-2 flex-wrap pt-3 border-t border-[#f1f5f9] text-xs">
            <span className="text-[#94a3b8] font-medium">Filtres actifs :</span>
            {search && (
              <span className="bg-[#f1f5f9] text-[#0f172a] px-3 py-1 rounded-xl border border-[#e2e8f0] flex items-center gap-1.5 font-medium">
                Recherche: "{search}"
                <button onClick={() => setSearch('')}><X size={13} /></button>
              </span>
            )}
            {ratingFilter !== 'all' && (
              <span className="bg-amber-50 text-amber-800 px-3 py-1 rounded-xl border border-amber-200 flex items-center gap-1.5 font-medium">
                Note: {ratingFilter}★
                <button onClick={() => setRatingFilter('all')}><X size={13} /></button>
              </span>
            )}
            {verifiedFilter !== 'all' && (
              <span className="bg-emerald-50 text-emerald-800 px-3 py-1 rounded-xl border border-emerald-200 flex items-center gap-1.5 font-medium">
                {verifiedFilter === 'true' ? 'Vérifiés' : 'En attente'}
                <button onClick={() => setVerifiedFilter('all')}><X size={13} /></button>
              </span>
            )}
            {productFilter !== 'all' && (
              <span className="bg-blue-50 text-blue-800 px-3 py-1 rounded-xl border border-blue-200 flex items-center gap-1.5 font-medium">
                Produit sélectionné
                <button onClick={() => setProductFilter('all')}><X size={13} /></button>
              </span>
            )}
            {recentOnly && (
              <span className="bg-purple-50 text-purple-800 px-3 py-1 rounded-xl border border-purple-200 flex items-center gap-1.5 font-medium">
                Nouveaux 7 jours
                <button onClick={() => setRecentOnly(false)}><X size={13} /></button>
              </span>
            )}
            <button
              onClick={() => {
                setSearch('');
                setRatingFilter('all');
                setVerifiedFilter('all');
                setProductFilter('all');
                setRecentOnly(false);
              }}
              className="text-xs text-[#0284c7] hover:underline ml-2 font-semibold"
            >
              Effacer tous les filtres
            </button>
          </div>
        )}
      </div>

      {/* REVIEWS LIST / FEED */}
      <div className="space-y-4">
        
        {/* Results Header */}
        <div className="flex items-center justify-between px-2">
          <div className="text-xs font-bold uppercase tracking-[0.15em] text-[#64748b]">
            Affichage de {totalCount > 0 ? ((currentPage - 1) * 20) + 1 : 0} à {Math.min(currentPage * 20, totalCount)} sur {totalCount.toLocaleString('fr-FR')} avis
          </div>
          <div className="text-xs font-semibold text-[#64748b]">
            Page {currentPage} / {totalPages}
          </div>
        </div>

        {isLoading ? (
          <div className="bg-white border border-[#e5e7eb] rounded-3xl py-24 text-center shadow-sm">
            <RefreshCw size={32} className="animate-spin text-[#0f172a] mx-auto mb-3" />
            <p className="text-sm font-semibold text-[#0f172a]">Chargement des avis de la Maison...</p>
            <p className="text-xs text-[#94a3b8] mt-1">Synchronisation des 1 779 témoignages</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-white border border-[#e5e7eb] rounded-3xl py-20 text-center px-4 shadow-sm">
            <div className="w-16 h-16 rounded-3xl bg-[#f8fafc] border border-[#e2e8f0] flex items-center justify-center text-[#94a3b8] mx-auto mb-4">
              <MessageSquare size={28} />
            </div>
            <h4 className="text-lg font-bold text-[#0f172a] mb-1">Aucun avis correspondant</h4>
            <p className="text-xs text-[#64748b] max-w-sm mx-auto mb-6">
              Ajustez vos filtres de recherche pour afficher les retours d'expérience clients.
            </p>
            <button
              onClick={openAddModal}
              className="px-5 py-2.5 rounded-2xl bg-[#0f172a] text-white text-xs font-bold hover:bg-[#1e293b] transition-colors"
            >
              + Ajouter un avis client
            </button>
          </div>
        ) : viewMode === 'cards' ? (
          
          /* ============================================================== */
          /* VUE CARTES PRESTIGE */
          /* ============================================================== */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {reviews.map((review) => {
              const isRecent = isRecentReview(review.createdAt);
              return (
                <div 
                  key={review.id} 
                  className="bg-white border border-[#e5e7eb] hover:border-[#0f172a]/40 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group relative"
                >
                  
                  {/* Top Bar: Client & Stars */}
                  <div>
                    <div className="flex items-start justify-between gap-4 mb-3">
                      
                      {/* Avatar & Client Info */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#0f172a] to-[#334155] text-white flex items-center justify-center text-xs font-bold uppercase shadow-sm">
                          {review.author?.slice(0, 2) || 'CL'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-[#0f172a]">{review.author}</span>
                            {isRecent && (
                              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200 animate-pulse">
                                Nouveau
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            {review.city && (
                              <span className="text-[11px] font-medium text-[#64748b] flex items-center gap-1">
                                <MapPin size={10} className="text-[#0284c7]" /> {review.city}
                              </span>
                            )}
                            <span className="text-[11px] text-[#94a3b8]">·</span>
                            <span className="text-[11px] text-[#94a3b8]">
                              {new Date(review.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Star Rating Badge */}
                      <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200/70">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              size={13}
                              className={s <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}
                            />
                          ))}
                        </div>
                        <span className="text-xs font-black text-amber-700 ml-1">{review.rating}.0</span>
                      </div>

                    </div>

                    {/* Review Title & Comment Quote */}
                    <div className="mt-4 space-y-1.5">
                      {review.title && (
                        <h4 className="text-sm font-bold text-[#0f172a] tracking-tight">
                          {review.title}
                        </h4>
                      )}
                      <p className="text-xs lg:text-[13px] text-[#334155] leading-relaxed italic">
                        "{review.comment}"
                      </p>
                    </div>
                  </div>

                  {/* Bottom Bar: Associated Product & Actions */}
                  <div className="mt-6 pt-4 border-t border-[#f1f5f9] flex items-center justify-between gap-4 flex-wrap">
                    
                    {/* Product Pill */}
                    <Link
                      href={`/fr/product/${review.productSlug}`}
                      target="_blank"
                      className="flex items-center gap-2.5 p-1.5 pr-3 rounded-2xl bg-[#f8fafc] hover:bg-[#f1f5f9] border border-[#e2e8f0] transition-all max-w-[240px] group/item"
                    >
                      <div className="relative w-8 h-8 rounded-xl overflow-hidden bg-white border border-[#e5e7eb] flex-shrink-0">
                        <Image
                          src={getProductImage(review.product)}
                          alt={review.product?.name || review.productSlug}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="overflow-hidden">
                        <span className="text-[9px] uppercase font-bold text-[#94a3b8] tracking-wider block truncate">
                          {review.product?.brandLabel || 'Maison'}
                        </span>
                        <span className="text-xs font-bold text-[#0f172a] group-hover/item:text-[#0284c7] transition-colors truncate block">
                          {review.product?.name || review.productSlug}
                        </span>
                      </div>
                    </Link>

                    {/* Quick Status Pill + Actions */}
                    <div className="flex items-center gap-2">
                      
                      {/* Verification status toggle */}
                      <button
                        onClick={() => handleToggleVerify(review)}
                        className={`text-[11px] font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all border shadow-sm ${
                          review.verified 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                            : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                        }`}
                        title="Cliquer pour basculer le statut vérifié"
                      >
                        {review.verified ? (
                          <>
                            <CheckCircle2 size={13} className="text-emerald-600" /> Achat Vérifié
                          </>
                        ) : (
                          <>
                            <Clock size={13} className="text-amber-600" /> En Attente
                          </>
                        )}
                      </button>

                      {/* Story Copy button */}
                      <button
                        onClick={() => handleCopyStory(review)}
                        className={`p-2 rounded-xl border transition-all ${
                          copiedId === review.id 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                            : 'bg-[#f8fafc] text-[#475569] border-[#e2e8f0] hover:bg-[#f1f5f9] hover:text-[#0f172a]'
                        }`}
                        title="Copier le format Story pour WhatsApp / Instagram"
                      >
                        {copiedId === review.id ? <Check size={14} /> : <Share2 size={14} />}
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => openEditModal(review)}
                        className="p-2 rounded-xl bg-[#f8fafc] text-[#475569] border border-[#e2e8f0] hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all"
                        title="Modifier cet avis"
                      >
                        <Edit3 size={14} />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => setDeletingReview(review)}
                        className="p-2 rounded-xl bg-[#f8fafc] text-[#475569] border border-[#e2e8f0] hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
                        title="Supprimer cet avis"
                      >
                        <Trash2 size={14} />
                      </button>

                    </div>

                  </div>

                </div>
              );
            })}
          </div>

        ) : (
          
          /* ============================================================== */
          /* VUE TABLEAU DÉTAILLÉ */
          /* ============================================================== */
          <div className="bg-white border border-[#e5e7eb] rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f8fafc] border-b border-[#e5e7eb] text-[#64748b] uppercase font-bold tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Client & Ville</th>
                    <th className="px-6 py-4">Note & Date</th>
                    <th className="px-6 py-4">Commentaire</th>
                    <th className="px-6 py-4">Parfum</th>
                    <th className="px-6 py-4">Statut</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1f5f9]">
                  {reviews.map((review) => (
                    <tr key={review.id} className="hover:bg-[#f8fafc] transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-[#0f172a]">{review.author}</div>
                        <div className="text-[11px] text-[#64748b] flex items-center gap-1 mt-0.5">
                          <MapPin size={10} className="text-[#0284c7]" /> {review.city || 'Maroc'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 font-bold text-amber-600">
                          <span>{review.rating}.0</span>
                          <Star size={12} className="fill-amber-400 text-amber-400" />
                        </div>
                        <div className="text-[11px] text-[#94a3b8] mt-0.5">
                          {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                        </div>
                      </td>
                      <td className="px-6 py-4 max-w-md">
                        <div className="font-bold text-[#0f172a] mb-0.5">{review.title}</div>
                        <div className="text-[#475569] line-clamp-2 leading-relaxed">"{review.comment}"</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link 
                          href={`/fr/product/${review.productSlug}`} 
                          target="_blank"
                          className="font-bold text-[#0f172a] hover:text-[#0284c7] transition-colors flex items-center gap-1.5"
                        >
                          <span>{review.product?.name || review.productSlug}</span>
                          <ExternalLink size={12} className="text-[#94a3b8]" />
                        </Link>
                        <div className="text-[10px] text-[#94a3b8] uppercase font-semibold">
                          {review.product?.brandLabel}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleVerify(review)}
                          className={`text-[11px] font-bold px-3 py-1 rounded-xl border flex items-center gap-1.5 ${
                            review.verified 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {review.verified ? <Check size={12} /> : <Clock size={12} />}
                          {review.verified ? 'Vérifié' : 'En attente'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleCopyStory(review)}
                            className="p-2 rounded-xl bg-[#f8fafc] text-[#475569] hover:bg-emerald-50 hover:text-emerald-700 border border-[#e2e8f0]"
                            title="Copier Story"
                          >
                            <Share2 size={13} />
                          </button>
                          <button
                            onClick={() => openEditModal(review)}
                            className="p-2 rounded-xl bg-[#f8fafc] text-[#475569] hover:bg-blue-50 hover:text-blue-700 border border-[#e2e8f0]"
                            title="Modifier"
                          >
                            <Edit3 size={13} />
                          </button>
                          <button
                            onClick={() => setDeletingReview(review)}
                            className="p-2 rounded-xl bg-[#f8fafc] text-[#475569] hover:bg-red-50 hover:text-red-700 border border-[#e2e8f0]"
                            title="Supprimer"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PAGINATION CONTROLS */}
        {!isLoading && totalPages > 1 && (
          <div className="bg-white border border-[#e5e7eb] rounded-3xl p-5 flex items-center justify-between gap-4 flex-wrap shadow-sm">
            <div className="text-xs font-semibold text-[#64748b]">
              Page {currentPage} sur {totalPages} ({totalCount.toLocaleString('fr-FR')} avis au total)
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchReviews(currentPage - 1)}
                disabled={currentPage <= 1}
                className="px-3.5 py-2 rounded-xl bg-[#f8fafc] hover:bg-[#f1f5f9] border border-[#e2e8f0] text-xs font-bold text-[#475569] hover:text-[#0f172a] disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1"
              >
                <ChevronLeft size={14} /> Précédent
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum = i + 1;
                  if (totalPages > 5 && currentPage > 3) {
                    pageNum = currentPage - 2 + i;
                    if (pageNum > totalPages) pageNum = totalPages - (4 - i);
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => fetchReviews(pageNum)}
                      className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                        currentPage === pageNum
                          ? 'bg-[#0f172a] text-white shadow-md'
                          : 'bg-[#f8fafc] hover:bg-[#f1f5f9] text-[#64748b] hover:text-[#0f172a] border border-[#e2e8f0]'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => fetchReviews(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="px-3.5 py-2 rounded-xl bg-[#f8fafc] hover:bg-[#f1f5f9] border border-[#e2e8f0] text-xs font-bold text-[#475569] hover:text-[#0f172a] disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1"
              >
                Suivant <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}

      </div>

      {/* ============================================================== */}
      {/* MODAL: ADD / EDIT REVIEW (HAUTE PARFUMERIE DESIGN) */}
      {/* ============================================================== */}
      {(isAddModalOpen || editingReview) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
          <div className="bg-white border border-[#e5e7eb] rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl">
            
            <div className="p-6 lg:p-7 border-b border-[#f1f5f9] flex items-center justify-between bg-[#f8fafc]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200/60 text-amber-600 flex items-center justify-center">
                  <Star size={20} className="fill-amber-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#0f172a]">
                    {editingReview ? 'Modifier le Témoignage Client' : 'Rédiger un Nouvel Avis Client'}
                  </h3>
                  <p className="text-xs text-[#64748b]">
                    {editingReview ? `Référence avis : #${editingReview.id}` : 'L\'avis apparaîtra immédiatement en tête de liste.'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingReview(null);
                }}
                className="text-[#94a3b8] hover:text-[#0f172a] p-2 rounded-xl hover:bg-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveReview} className="p-6 lg:p-7 space-y-5">
              
              {/* Product selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#475569] mb-1.5">
                  Parfum Associé <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.productSlug}
                  onChange={(e) => setFormData({ ...formData, productSlug: e.target.value })}
                  className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl px-4 py-3 text-xs font-medium text-[#0f172a] focus:outline-none focus:border-[#0f172a] focus:bg-white transition-all cursor-pointer"
                >
                  <option value="" disabled>Sélectionner une fragrance</option>
                  {productsList.map((p) => (
                    <option key={p.slug} value={p.slug}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Author and City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#475569] mb-1.5">
                    Nom du Client <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Mounia T."
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl px-4 py-3 text-xs font-medium text-[#0f172a] focus:outline-none focus:border-[#0f172a] focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#475569] mb-1.5">
                    Ville au Maroc
                  </label>
                  <input
                    type="text"
                    placeholder="ex: Casablanca, Marrakech, Tanger..."
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl px-4 py-3 text-xs font-medium text-[#0f172a] focus:outline-none focus:border-[#0f172a] focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Rating Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#475569] mb-1.5">
                  Note Attribuée ({formData.rating}/5 Étoiles)
                </label>
                <div className="flex items-center gap-3 bg-[#f8fafc] border border-[#e2e8f0] p-3.5 rounded-2xl">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormData({ ...formData, rating: star })}
                        className="p-1 hover:scale-125 transition-transform"
                      >
                        <Star
                          size={24}
                          className={star <= formData.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300 hover:text-amber-300'}
                        />
                      </button>
                    ))}
                  </div>
                  <span className="text-xs font-bold text-amber-700 ml-2">
                    {formData.rating === 5 ? '5.0 (Recommandé / Parfait)' : `${formData.rating}.0 Étoiles`}
                  </span>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#475569] mb-1.5">
                  Titre du Témoignage <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: Parfum 100% original, sillage exceptionnel"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl px-4 py-3 text-xs font-medium text-[#0f172a] focus:outline-none focus:border-[#0f172a] focus:bg-white transition-all"
                />
              </div>

              {/* Comment text */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#475569] mb-1.5">
                  Commentaire / Avis Client <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Rédigez l'avis ou collez le message WhatsApp du client..."
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl p-4 text-xs font-medium text-[#0f172a] focus:outline-none focus:border-[#0f172a] focus:bg-white transition-all leading-relaxed"
                />
              </div>

              {/* Verified Checkbox */}
              <div className="flex items-center gap-3 bg-emerald-50/50 border border-emerald-200 p-4 rounded-2xl">
                <input
                  type="checkbox"
                  id="verified-checkbox"
                  checked={formData.verified}
                  onChange={(e) => setFormData({ ...formData, verified: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <label htmlFor="verified-checkbox" className="text-xs text-[#0f172a] font-medium cursor-pointer select-none">
                  Certifier comme <strong className="text-emerald-700">Achat Vérifié</strong> (affiche le badge vert de confiance et d'authenticité)
                </label>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#f1f5f9]">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingReview(null);
                  }}
                  className="px-5 py-2.5 rounded-2xl bg-[#f8fafc] hover:bg-[#f1f5f9] border border-[#e2e8f0] text-xs font-bold text-[#64748b] hover:text-[#0f172a] transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-6 py-2.5 rounded-2xl bg-[#0f172a] hover:bg-[#1e293b] text-white text-xs font-bold tracking-wide transition-all shadow-md disabled:opacity-50"
                >
                  {formSubmitting ? 'Enregistrement…' : editingReview ? 'Mettre à jour l\'avis' : 'Publier au sommet'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: DELETE CONFIRMATION */}
      {/* ============================================================== */}
      {deletingReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
          <div className="bg-white border border-[#e5e7eb] rounded-3xl w-full max-w-md p-6 lg:p-7 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 size={22} />
            </div>

            <div className="text-center">
              <h3 className="text-lg font-bold text-[#0f172a] mb-1">
                Supprimer cet avis ?
              </h3>
              <p className="text-xs text-[#64748b]">
                Êtes-vous certain de vouloir supprimer l'avis de <strong className="text-[#0f172a]">{deletingReview.author}</strong> ? La note globale du produit sera automatiquement recalculée.
              </p>
            </div>

            <div className="bg-[#f8fafc] border border-[#e2e8f0] p-4 rounded-2xl text-xs text-[#475569] italic line-clamp-3">
              "{deletingReview.comment}"
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingReview(null)}
                className="px-5 py-2.5 rounded-2xl bg-[#f8fafc] hover:bg-[#f1f5f9] border border-[#e2e8f0] text-xs font-bold text-[#64748b] hover:text-[#0f172a] transition-all"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteReview}
                disabled={formSubmitting}
                className="px-6 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all disabled:opacity-50 shadow-md shadow-red-600/20"
              >
                {formSubmitting ? 'Suppression…' : 'Confirmer la suppression'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
