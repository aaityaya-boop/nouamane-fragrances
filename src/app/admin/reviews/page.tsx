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
  Check
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
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalReviews: 0,
    verifiedCount: 0,
    pendingCount: 0,
    avgRating: 5.0,
    ratingDist: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  });
  const [productsList, setProductsList] = useState<{ slug: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Filters & Pagination State
  const [search, setSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [verifiedFilter, setVerifiedFilter] = useState('all');
  const [productFilter, setProductFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
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
      });

      const res = await fetch(`/api/admin/reviews?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
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
  }, [ratingFilter, verifiedFilter, productFilter, sortBy]);

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
    // Optimistic UI update
    setReviews(prev => prev.map(r => r.id === review.id ? { ...r, verified: updatedStatus } : r));
    
    try {
      const res = await fetch(`/api/admin/reviews/${review.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verified: updatedStatus }),
      });
      if (res.ok) {
        showNotification('success', updatedStatus ? 'Avis marqué comme vérifié.' : 'Avis marqué comme en attente.');
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
      title: 'Très satisfait(e)',
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
        // Update existing
        const res = await fetch(`/api/admin/reviews/${editingReview.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          showNotification('success', 'Avis modifié avec succès.');
          setEditingReview(null);
          fetchReviews(currentPage);
        } else {
          const data = await res.json();
          showNotification('error', data.error || 'Erreur lors de la modification.');
        }
      } else {
        // Create new
        const res = await fetch('/api/admin/reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          showNotification('success', 'Nouvel avis ajouté avec succès.');
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
        showNotification('success', 'Avis supprimé avec succès.');
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

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Auteur', 'Ville', 'Note', 'Titre', 'Commentaire', 'Produit', 'Vérifié', 'Date'];
    const rows = reviews.map(r => [
      r.id,
      `"${r.author.replace(/"/g, '""')}"`,
      `"${(r.city || '').replace(/"/g, '""')}"`,
      r.rating,
      `"${r.title.replace(/"/g, '""')}"`,
      `"${r.comment.replace(/"/g, '""')}"`,
      `"${(r.product?.name || r.productSlug).replace(/"/g, '""')}"`,
      r.verified ? 'Oui' : 'Non',
      new Date(r.createdAt).toLocaleDateString('fr-FR')
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `avis_clients_nay_${new Date().toISOString().slice(0, 10)}.csv`);
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

  return (
    <div className="p-6 lg:p-10 space-y-8 max-w-[1600px] mx-auto min-h-screen text-[#f0f0f0]">
      
      {/* NOTIFICATION TOAST */}
      {notification && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl border transition-all animate-bounce ${
          notification.type === 'success' 
            ? 'bg-[#064e3b] text-emerald-100 border-emerald-500/50' 
            : 'bg-[#7f1d1d] text-red-100 border-red-500/50'
        }`}>
          {notification.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span className="text-sm font-medium">{notification.message}</span>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0ea5e9]/20 to-[#0284c7]/30 border border-[#0ea5e9]/30 flex items-center justify-center text-[#0ea5e9]">
              <MessageSquare size={20} />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                Avis & Retours Clients
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#0ea5e9]/20 text-[#0ea5e9] border border-[#0ea5e9]/30">
                  {stats.totalReviews} avis
                </span>
              </h1>
              <p className="text-xs lg:text-sm text-[#888888] mt-0.5">
                Gérez, modérez, vérifiez et ajoutez les retours d'expérience et témoignages de vos clients.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => fetchReviews(currentPage)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#1a1a1a] hover:bg-[#252525] border border-white/10 text-xs font-semibold text-[#ccc] hover:text-white transition-all shadow-sm"
            title="Rafraîchir"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Actualiser</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#1a1a1a] hover:bg-[#252525] border border-white/10 text-xs font-semibold text-[#ccc] hover:text-white transition-all shadow-sm"
          >
            <Download size={14} />
            <span className="hidden sm:inline">Exporter CSV</span>
          </button>

          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#0ea5e9] to-[#0284c7] hover:from-[#0284c7] hover:to-[#0369a1] text-white text-xs font-bold tracking-wide transition-all shadow-lg shadow-[#0ea5e9]/20 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus size={16} />
            <span>Ajouter un Avis</span>
          </button>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Reviews Card */}
        <div className="bg-[#141414] border border-white/10 rounded-2xl p-5 relative overflow-hidden group hover:border-white/20 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#888]">Total des Avis</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <MessageSquare size={18} />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white tracking-tight">
            {stats.totalReviews}
          </div>
          <div className="flex items-center gap-2 mt-2 text-xs text-[#888]">
            <span className="text-emerald-400 font-medium">100% stockés</span> dans la base Neon
          </div>
        </div>

        {/* Note Moyenne Card */}
        <div className="bg-[#141414] border border-white/10 rounded-2xl p-5 relative overflow-hidden group hover:border-white/20 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#888]">Note Globale</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Star size={18} className="fill-amber-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">{stats.avgRating}</span>
            <span className="text-sm font-semibold text-[#888]">/ 5.0</span>
          </div>
          <div className="flex items-center gap-1 mt-2 text-amber-400">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star 
                key={s} 
                size={13} 
                className={s <= Math.round(stats.avgRating) ? 'fill-amber-400 text-amber-400' : 'text-gray-600'} 
              />
            ))}
            <span className="text-xs text-[#888] ml-1.5">Excellente satisfaction</span>
          </div>
        </div>

        {/* Verified Reviews Card */}
        <div className="bg-[#141414] border border-white/10 rounded-2xl p-5 relative overflow-hidden group hover:border-white/20 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#888]">Avis Vérifiés</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 tracking-tight">
            {stats.verifiedCount}
          </div>
          <div className="text-xs text-[#888] mt-2">
            {stats.totalReviews > 0 ? Math.round((stats.verifiedCount / stats.totalReviews) * 100) : 0}% des avis publiés avec badge
          </div>
        </div>

        {/* Pending Verification Card */}
        <div className="bg-[#141414] border border-white/10 rounded-2xl p-5 relative overflow-hidden group hover:border-white/20 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#888]">En Attente</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Clock size={18} />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-amber-400 tracking-tight">
            {stats.pendingCount}
          </div>
          <div className="text-xs text-[#888] mt-2">
            {stats.pendingCount > 0 ? (
              <button onClick={() => setVerifiedFilter('false')} className="text-amber-400 hover:underline">
                Filtrer pour modérer &rarr;
              </button>
            ) : (
              <span className="text-emerald-400">Tous les avis sont traités</span>
            )}
          </div>
        </div>

      </div>

      {/* RATING DISTRIBUTION PROGRESS BARS */}
      <div className="bg-[#141414] border border-white/10 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Sparkles size={16} className="text-amber-400" /> Répartition des Évaluations Étoiles
            </h2>
            <p className="text-xs text-[#888] mt-0.5">Distribution détaillée des avis par nombre d'étoiles.</p>
          </div>
          <div className="flex items-center gap-2">
            {[5, 4, 3, 2, 1].map((ratingNum) => (
              <button
                key={ratingNum}
                onClick={() => setRatingFilter(ratingFilter === String(ratingNum) ? 'all' : String(ratingNum))}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                  ratingFilter === String(ratingNum)
                    ? 'bg-amber-400/20 border-amber-400 text-amber-300'
                    : 'bg-[#1e1e1e] border-white/5 text-[#aaa] hover:text-white hover:border-white/20'
                }`}
              >
                <span>{ratingNum}</span>
                <Star size={12} className="fill-amber-400 text-amber-400" />
                <span className="text-[10px] opacity-70">({stats.ratingDist[ratingNum] || 0})</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 pt-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = stats.ratingDist[star] || 0;
            const pct = stats.totalReviews > 0 ? Math.round((count / stats.totalReviews) * 100) : 0;
            return (
              <div 
                key={star} 
                onClick={() => setRatingFilter(ratingFilter === String(star) ? 'all' : String(star))}
                className="bg-[#1a1a1a] border border-white/5 p-3 rounded-xl cursor-pointer hover:border-amber-400/40 transition-all"
              >
                <div className="flex items-center justify-between text-xs font-semibold mb-2">
                  <span className="flex items-center gap-1 text-amber-400">
                    {star} <Star size={12} className="fill-amber-400" />
                  </span>
                  <span className="text-[#888]">{count} ({pct}%)</span>
                </div>
                <div className="w-full bg-[#111] h-2 rounded-full overflow-hidden border border-white/5">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-400 to-amber-300 rounded-full transition-all duration-500" 
                    style={{ width: `${pct}%` }} 
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FILTER AND SEARCH TOOLBAR */}
      <div className="bg-[#141414] border border-white/10 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#666]" size={16} />
            <input
              type="text"
              placeholder="Rechercher par client, ville, extrait de commentaire, parfum..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#1c1c1c] border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-xs lg:text-sm text-white placeholder-[#666] focus:outline-none focus:border-[#0ea5e9] transition-all"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#666] hover:text-white">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filter by Product */}
          <div className="w-full lg:w-64">
            <select
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
              className="w-full bg-[#1c1c1c] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#0ea5e9] transition-all cursor-pointer"
            >
              <option value="all">Tous les Produits ({productsList.length})</option>
              {productsList.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filter by Verification */}
          <div className="w-full lg:w-48">
            <select
              value={verifiedFilter}
              onChange={(e) => setVerifiedFilter(e.target.value)}
              className="w-full bg-[#1c1c1c] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#0ea5e9] transition-all cursor-pointer"
            >
              <option value="all">Tous les Statuts</option>
              <option value="true">✅ Vérifiés Uniquement</option>
              <option value="false">⏳ En Attente</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="w-full lg:w-48">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-[#1c1c1c] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#0ea5e9] transition-all cursor-pointer"
            >
              <option value="newest">Plus récents</option>
              <option value="oldest">Plus anciens</option>
              <option value="rating-high">Meilleures notes (5★ &rarr; 1★)</option>
              <option value="rating-low">Moins bonnes notes (1★ &rarr; 5★)</option>
            </select>
          </div>

        </div>

        {/* Active filter tags */}
        {(search || ratingFilter !== 'all' || verifiedFilter !== 'all' || productFilter !== 'all') && (
          <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-white/5 text-xs">
            <span className="text-[#888]">Filtres actifs :</span>
            {search && (
              <span className="bg-[#1e1e1e] text-[#ccc] px-2.5 py-1 rounded-md border border-white/10 flex items-center gap-1.5">
                Recherche: "{search}"
                <button onClick={() => setSearch('')}><X size={12} /></button>
              </span>
            )}
            {ratingFilter !== 'all' && (
              <span className="bg-[#1e1e1e] text-amber-300 px-2.5 py-1 rounded-md border border-white/10 flex items-center gap-1.5">
                Note: {ratingFilter}★
                <button onClick={() => setRatingFilter('all')}><X size={12} /></button>
              </span>
            )}
            {verifiedFilter !== 'all' && (
              <span className="bg-[#1e1e1e] text-emerald-300 px-2.5 py-1 rounded-md border border-white/10 flex items-center gap-1.5">
                {verifiedFilter === 'true' ? 'Vérifiés' : 'En attente'}
                <button onClick={() => setVerifiedFilter('all')}><X size={12} /></button>
              </span>
            )}
            {productFilter !== 'all' && (
              <span className="bg-[#1e1e1e] text-[#0ea5e9] px-2.5 py-1 rounded-md border border-white/10 flex items-center gap-1.5">
                Produit sélectionné
                <button onClick={() => setProductFilter('all')}><X size={12} /></button>
              </span>
            )}
            <button
              onClick={() => {
                setSearch('');
                setRatingFilter('all');
                setVerifiedFilter('all');
                setProductFilter('all');
              }}
              className="text-xs text-[#0ea5e9] hover:underline ml-2"
            >
              Réinitialiser tout
            </button>
          </div>
        )}
      </div>

      {/* REVIEWS LIST / TABLE */}
      <div className="bg-[#141414] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Liste des Avis
            </h3>
            <span className="text-xs text-[#888]">
              ({totalCount} avis trouvés)
            </span>
          </div>
          <div className="text-xs text-[#888]">
            Page {currentPage} sur {totalPages}
          </div>
        </div>

        {isLoading ? (
          <div className="py-24 text-center">
            <RefreshCw size={28} className="animate-spin text-[#0ea5e9] mx-auto mb-3" />
            <p className="text-sm text-[#888]">Chargement des avis clients…</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="py-20 text-center px-4">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#666] mx-auto mb-4">
              <MessageSquare size={28} />
            </div>
            <h4 className="text-base font-bold text-white mb-1">Aucun avis trouvé</h4>
            <p className="text-xs text-[#888] max-w-sm mx-auto mb-6">
              Aucun avis ne correspond à vos critères de recherche ou de filtre actuels.
            </p>
            <button
              onClick={openAddModal}
              className="px-4 py-2 rounded-xl bg-[#0ea5e9] text-white text-xs font-bold hover:bg-[#0284c7] transition-colors"
            >
              Ajouter un premier avis
            </button>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {reviews.map((review) => (
              <div 
                key={review.id} 
                className="p-5 hover:bg-[#181818] transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-6 group"
              >
                
                {/* Left: Client info & comment */}
                <div className="flex-1 space-y-3">
                  
                  {/* Client name, city, rating, date */}
                  <div className="flex items-center gap-3 flex-wrap">
                    {/* Initials Avatar */}
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#0ea5e9]/30 to-[#38bdf8]/10 border border-[#0ea5e9]/40 flex items-center justify-center text-xs font-bold text-white uppercase shadow-sm">
                      {review.author?.slice(0, 2) || 'CL'}
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{review.author}</span>
                        {review.city && (
                          <span className="text-[11px] text-[#888] flex items-center gap-1 bg-[#1e1e1e] px-2 py-0.5 rounded-full border border-white/5">
                            <MapPin size={10} className="text-[#0ea5e9]" /> {review.city}
                          </span>
                        )}
                        {/* Verified badge */}
                        <button
                          onClick={() => handleToggleVerify(review)}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 transition-all border ${
                            review.verified 
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20' 
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                          }`}
                          title="Cliquez pour changer le statut vérifié"
                        >
                          {review.verified ? (
                            <>
                              <Check size={11} /> Achat Vérifié
                            </>
                          ) : (
                            <>
                              <Clock size={11} /> En Attente
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Stars */}
                    <div className="flex items-center gap-1 ml-auto lg:ml-0 bg-[#1a1a1a] px-2.5 py-1 rounded-lg border border-white/5">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            size={12}
                            className={s <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-600'}
                          />
                        ))}
                      </div>
                      <span className="text-xs font-bold text-amber-400 ml-1">{review.rating}.0</span>
                    </div>

                    <span className="text-[11px] text-[#666]">
                      {new Date(review.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>

                  {/* Title & Comment Text */}
                  <div className="pl-12 space-y-1">
                    {review.title && (
                      <h4 className="text-xs font-bold text-white tracking-wide">
                        {review.title}
                      </h4>
                    )}
                    <p className="text-xs lg:text-sm text-[#ccc] leading-relaxed max-w-3xl">
                      "{review.comment}"
                    </p>
                  </div>

                </div>

                {/* Right: Associated Product & Actions */}
                <div className="flex items-center justify-between lg:justify-end gap-5 pl-12 lg:pl-0 border-t lg:border-t-0 border-white/5 pt-3 lg:pt-0">
                  
                  {/* Product Mini Pill */}
                  <Link
                    href={`/fr/product/${review.productSlug}`}
                    target="_blank"
                    className="flex items-center gap-3 p-2 rounded-xl bg-[#1c1c1c] hover:bg-[#252525] border border-white/10 hover:border-[#0ea5e9]/50 transition-all max-w-[240px] group/prod"
                  >
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                      <Image
                        src={getProductImage(review.product)}
                        alt={review.product?.name || review.productSlug}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="overflow-hidden">
                      <span className="text-[10px] uppercase font-bold text-[#888] tracking-wider block truncate">
                        {review.product?.brandLabel || 'Parfum'}
                      </span>
                      <span className="text-xs font-semibold text-white group-hover/prod:text-[#0ea5e9] transition-colors truncate block">
                        {review.product?.name || review.productSlug}
                      </span>
                    </div>
                    <ExternalLink size={13} className="text-[#666] group-hover/prod:text-[#0ea5e9] ml-auto flex-shrink-0" />
                  </Link>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditModal(review)}
                      className="p-2 rounded-xl bg-[#1e1e1e] hover:bg-blue-500/20 hover:text-blue-400 text-[#aaa] border border-white/5 hover:border-blue-500/30 transition-all"
                      title="Modifier cet avis"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      onClick={() => setDeletingReview(review)}
                      className="p-2 rounded-xl bg-[#1e1e1e] hover:bg-red-500/20 hover:text-red-400 text-[#aaa] border border-white/5 hover:border-red-500/30 transition-all"
                      title="Supprimer cet avis"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                </div>

              </div>
            ))}
          </div>
        )}

        {/* PAGINATION FOOTER */}
        {!isLoading && totalPages > 1 && (
          <div className="p-5 border-t border-white/10 flex items-center justify-between gap-4 flex-wrap bg-[#111]/50">
            <div className="text-xs text-[#888]">
              Affichage de {((currentPage - 1) * 20) + 1} à {Math.min(currentPage * 20, totalCount)} sur {totalCount} avis
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchReviews(currentPage - 1)}
                disabled={currentPage <= 1}
                className="p-2 rounded-xl bg-[#1e1e1e] hover:bg-[#282828] border border-white/10 text-[#ccc] hover:text-white disabled:opacity-40 disabled:pointer-events-none transition-all"
              >
                <ChevronLeft size={16} />
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let pageNum = i + 1;
                  if (totalPages > 7) {
                    if (currentPage > 4) {
                      pageNum = currentPage - 3 + i;
                    }
                    if (pageNum > totalPages) return null;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => fetchReviews(pageNum)}
                      className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                        currentPage === pageNum
                          ? 'bg-[#0ea5e9] text-white shadow-md shadow-[#0ea5e9]/30'
                          : 'bg-[#1e1e1e] hover:bg-[#282828] text-[#aaa] hover:text-white border border-white/5'
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
                className="p-2 rounded-xl bg-[#1e1e1e] hover:bg-[#282828] border border-white/10 text-[#ccc] hover:text-white disabled:opacity-40 disabled:pointer-events-none transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* MODAL: ADD / EDIT REVIEW */}
      {/* ============================================================== */}
      {(isAddModalOpen || editingReview) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#141414] border border-white/15 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl">
            
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#0ea5e9]/20 text-[#0ea5e9] flex items-center justify-center">
                  <Star size={18} className="fill-[#0ea5e9]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {editingReview ? 'Modifier l\'Avis Client' : 'Ajouter un Nouvel Avis'}
                  </h3>
                  <p className="text-xs text-[#888]">
                    {editingReview ? `ID de l'avis : #${editingReview.id}` : 'Remplissez les détails du témoignage client'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingReview(null);
                }}
                className="text-[#888] hover:text-white p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveReview} className="p-6 space-y-4">
              
              {/* Product selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#aaa] mb-1.5">
                  Parfum Associé <span className="text-red-400">*</span>
                </label>
                <select
                  required
                  value={formData.productSlug}
                  onChange={(e) => setFormData({ ...formData, productSlug: e.target.value })}
                  className="w-full bg-[#1c1c1c] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#0ea5e9] transition-all cursor-pointer"
                >
                  <option value="" disabled>Sélectionner un produit</option>
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
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#aaa] mb-1.5">
                    Nom du Client <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Mounia T."
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="w-full bg-[#1c1c1c] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#0ea5e9] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#aaa] mb-1.5">
                    Ville au Maroc
                  </label>
                  <input
                    type="text"
                    placeholder="ex: Casablanca, Marrakech, Tanger..."
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-[#1c1c1c] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#0ea5e9] transition-all"
                  />
                </div>
              </div>

              {/* Rating Selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#aaa] mb-1.5">
                  Note Attribuée ({formData.rating}/5)
                </label>
                <div className="flex items-center gap-2 bg-[#1c1c1c] border border-white/10 p-3 rounded-xl">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className="p-1 hover:scale-125 transition-transform"
                    >
                      <Star
                        size={22}
                        className={star <= formData.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-600 hover:text-amber-300'}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-amber-400 ml-2">
                    {formData.rating === 5 ? '5 Étoiles (Excellent)' : `${formData.rating} Étoiles`}
                  </span>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#aaa] mb-1.5">
                  Titre du Témoignage <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: Produit original et livraison rapide"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-[#1c1c1c] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#0ea5e9] transition-all"
                />
              </div>

              {/* Comment text */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#aaa] mb-1.5">
                  Commentaire / Avis <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Rédigez le retour d'expérience du client..."
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  className="w-full bg-[#1c1c1c] border border-white/10 rounded-xl p-3.5 text-xs text-white focus:outline-none focus:border-[#0ea5e9] transition-all leading-relaxed"
                />
              </div>

              {/* Verified Checkbox */}
              <div className="flex items-center gap-3 bg-[#1c1c1c] border border-white/10 p-3.5 rounded-xl">
                <input
                  type="checkbox"
                  id="verified-checkbox"
                  checked={formData.verified}
                  onChange={(e) => setFormData({ ...formData, verified: e.target.checked })}
                  className="w-4 h-4 rounded text-[#0ea5e9] bg-[#111] border-white/20 focus:ring-[#0ea5e9] cursor-pointer"
                />
                <label htmlFor="verified-checkbox" className="text-xs text-[#ccc] cursor-pointer select-none">
                  Marquer comme <strong className="text-emerald-400">Achat Vérifié</strong> (affiche le badge vert de confiance)
                </label>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingReview(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#1e1e1e] hover:bg-[#282828] text-xs font-semibold text-[#ccc] hover:text-white transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#0ea5e9] to-[#0284c7] hover:from-[#0284c7] hover:to-[#0369a1] text-white text-xs font-bold tracking-wide transition-all disabled:opacity-50"
                >
                  {formSubmitting ? 'Enregistrement…' : editingReview ? 'Mettre à jour' : 'Créer l\'avis'}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#141414] border border-red-500/30 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto">
              <Trash2 size={24} />
            </div>

            <div className="text-center">
              <h3 className="text-base font-bold text-white mb-1">
                Supprimer cet avis ?
              </h3>
              <p className="text-xs text-[#888]">
                Êtes-vous sûr de vouloir supprimer l'avis de <strong className="text-white">{deletingReview.author}</strong> ? Cette action recalculera automatiquement la note moyenne du produit.
              </p>
            </div>

            <div className="bg-[#1c1c1c] border border-white/5 p-3 rounded-xl text-xs text-[#aaa] italic line-clamp-3">
              "{deletingReview.comment}"
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingReview(null)}
                className="px-4 py-2 rounded-xl bg-[#1e1e1e] hover:bg-[#282828] text-xs font-semibold text-[#ccc] hover:text-white transition-all"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteReview}
                disabled={formSubmitting}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all disabled:opacity-50 shadow-lg shadow-red-600/30"
              >
                {formSubmitting ? 'Suppression…' : 'Oui, Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
