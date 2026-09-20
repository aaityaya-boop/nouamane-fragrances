'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Video, 
  Image as ImageIcon, 
  UploadCloud, 
  Plus, 
  Search, 
  Filter, 
  Flame, 
  Play, 
  Pause, 
  Copy, 
  Check, 
  Download, 
  Trash2, 
  Edit3, 
  ExternalLink, 
  Sparkles, 
  Share2, 
  Film, 
  Layers, 
  Eye, 
  X, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  Tag, 
  FileText,
  Volume2,
  VolumeX,
  Maximize2
} from 'lucide-react';

interface CreativeItem {
  id: string;
  title: string;
  description?: string | null;
  mediaUrl: string;
  mediaType: 'IMAGE' | 'VIDEO';
  thumbnailUrl?: string | null;
  platform: string;
  aspectRatio: string;
  category: string;
  status: 'TESTING' | 'WINNER' | 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
  adCopy?: string | null;
  productSlug?: string | null;
  productName?: string | null;
  creatorName: string;
  tags?: string | null;
  createdAt: string;
  creator?: {
    name: string;
    avatar?: string | null;
  } | null;
}

interface CreativeStats {
  total: number;
  winners: number;
  testing: number;
  active: number;
  videos: number;
  images: number;
}

const PLATFORMS = [
  { id: 'META', label: 'Meta (Instagram / FB)', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { id: 'TIKTOK', label: 'TikTok Ads', color: 'bg-black text-white border-slate-700' },
  { id: 'SNAPCHAT', label: 'Snapchat Ads', color: 'bg-amber-50 text-amber-800 border-amber-200' },
  { id: 'GOOGLE', label: 'Google / YouTube', color: 'bg-red-50 text-red-700 border-red-200' },
  { id: 'INFLUENCE', label: 'Influence & UGC', color: 'bg-purple-50 text-purple-700 border-purple-200' },
];

const CATEGORIES = [
  { id: 'UGC', label: 'Vidéo UGC / Créateur' },
  { id: 'UNBOXING', label: 'Unboxing & Déballage' },
  { id: 'PRODUCT_SHOT', label: 'Packshot Produit Studio' },
  { id: 'HOOK', label: 'Hook Accrocheur (3s)' },
  { id: 'TESTIMONIAL', label: 'Avis & Témoignage Client' },
  { id: 'PROMO', label: 'Offre Promo / Coffret' },
];

const STATUSES = [
  { id: 'WINNER', label: 'Winner 🔥', badge: 'bg-amber-100 text-amber-800 border-amber-300 ring-2 ring-amber-400/30' },
  { id: 'TESTING', label: 'En Test', badge: 'bg-sky-50 text-sky-700 border-sky-200' },
  { id: 'ACTIVE', label: 'Actif', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { id: 'PAUSED', label: 'En Pause', badge: 'bg-slate-100 text-slate-600 border-slate-200' },
  { id: 'ARCHIVED', label: 'Archivé', badge: 'bg-slate-50 text-slate-400 border-slate-200' },
];

export default function AdminCreativesPage() {
  const [creatives, setCreatives] = useState<CreativeItem[]>([]);
  const [stats, setStats] = useState<CreativeStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [filterPlatform, setFilterPlatform] = useState('ALL');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterMediaType, setFilterMediaType] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Upload State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditingCreative, setIsEditingCreative] = useState<CreativeItem | null>(null);
  const [selectedPreviewCreative, setSelectedPreviewCreative] = useState<CreativeItem | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formMediaUrl, setFormMediaUrl] = useState('');
  const [formMediaType, setFormMediaType] = useState<'IMAGE' | 'VIDEO'>('VIDEO');
  const [formPlatform, setFormPlatform] = useState('META');
  const [formAspectRatio, setFormAspectRatio] = useState('9:16');
  const [formCategory, setFormCategory] = useState('UGC');
  const [formStatus, setFormStatus] = useState<CreativeItem['status']>('TESTING');
  const [formAdCopy, setFormAdCopy] = useState('');
  const [formProductName, setFormProductName] = useState('');
  const [formTags, setFormTags] = useState('');
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load Creatives
  const loadCreatives = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterPlatform !== 'ALL') params.set('platform', filterPlatform);
      if (filterCategory !== 'ALL') params.set('category', filterCategory);
      if (filterStatus !== 'ALL') params.set('status', filterStatus);
      if (filterMediaType !== 'ALL') params.set('mediaType', filterMediaType);
      if (searchQuery.trim()) params.set('search', searchQuery.trim());

      const res = await fetch(`/api/admin/creatives?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setCreatives(data.creatives || []);
          setStats(data.stats || null);
        }
      }
    } catch (err) {
      console.error('Failed to load creatives:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filterPlatform, filterCategory, filterStatus, filterMediaType, searchQuery]);

  useEffect(() => {
    loadCreatives();
  }, [loadCreatives]);

  // Open Upload Modal
  const openCreateModal = () => {
    setIsEditingCreative(null);
    setFormTitle('');
    setFormDescription('');
    setFormMediaUrl('');
    setFormMediaType('VIDEO');
    setFormPlatform('META');
    setFormAspectRatio('9:16');
    setFormCategory('UGC');
    setFormStatus('TESTING');
    setFormAdCopy('');
    setFormProductName('');
    setFormTags('');
    setUploadError(null);
    setIsUploadModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (item: CreativeItem) => {
    setIsEditingCreative(item);
    setFormTitle(item.title);
    setFormDescription(item.description || '');
    setFormMediaUrl(item.mediaUrl);
    setFormMediaType(item.mediaType);
    setFormPlatform(item.platform);
    setFormAspectRatio(item.aspectRatio || '9:16');
    setFormCategory(item.category);
    setFormStatus(item.status);
    setFormAdCopy(item.adCopy || '');
    setFormProductName(item.productName || '');
    setFormTags(item.tags || '');
    setUploadError(null);
    setIsUploadModalOpen(true);
  };

  // Handle Direct File Upload (Image or Video)
  const handleFileUpload = async (file: File) => {
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');

    if (!isVideo && !isImage) {
      setUploadError('Veuillez sélectionner un fichier vidéo (MP4, WebM, MOV) ou une image (PNG, JPG, WebP).');
      return;
    }

    // Set media type
    setFormMediaType(isVideo ? 'VIDEO' : 'IMAGE');
    if (!formTitle) {
      // Auto-set clean title from filename
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setFormTitle(cleanName);
    }

    setIsUploadingFile(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        setFormMediaUrl(data.url);
      } else {
        setUploadError(data.error || 'Erreur lors du téléversement du média.');
      }
    } catch (err) {
      console.error('File upload error:', err);
      setUploadError('Erreur de connexion lors de l\'envoi du fichier.');
    } finally {
      setIsUploadingFile(false);
    }
  };

  // Save Creative (Create or Update)
  const handleSaveCreative = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setUploadError('Veuillez saisir un titre pour le créatif.');
      return;
    }

    if (!formMediaUrl.trim()) {
      setUploadError('Veuillez téléverser un fichier média (vidéo ou image).');
      return;
    }

    setIsSubmitting(true);
    setUploadError(null);

    try {
      const payload = {
        title: formTitle.trim(),
        description: formDescription.trim() || null,
        mediaUrl: formMediaUrl.trim(),
        mediaType: formMediaType,
        platform: formPlatform,
        aspectRatio: formAspectRatio,
        category: formCategory,
        status: formStatus,
        adCopy: formAdCopy.trim() || null,
        productName: formProductName.trim() || null,
        tags: formTags.trim() || null,
      };

      const url = isEditingCreative ? `/api/admin/creatives/${isEditingCreative.id}` : '/api/admin/creatives';
      const method = isEditingCreative ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsUploadModalOpen(false);
        loadCreatives(false);
      } else {
        setUploadError(data.error || 'Erreur lors de l\'enregistrement.');
      }
    } catch (err) {
      setUploadError('Erreur réseau lors de la sauvegarde.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Creative
  const deleteCreative = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce créatif publicitaire ?')) return;

    try {
      setCreatives((prev) => prev.filter((c) => c.id !== id));
      await fetch(`/api/admin/creatives/${id}`, { method: 'DELETE' });
      loadCreatives(false);
    } catch (err) {
      console.error('Failed to delete creative:', err);
    }
  };

  // Copy Media URL to Clipboard
  const copyMediaUrl = (url: string, id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Status Badge Helper
  const getStatusBadge = (status: CreativeItem['status']) => {
    const s = STATUSES.find((item) => item.id === status);
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${s?.badge || 'bg-slate-100 text-slate-700'}`}>
        {s?.label || status}
      </span>
    );
  };

  // Platform Badge Helper
  const getPlatformBadge = (platform: string) => {
    const p = PLATFORMS.find((item) => item.id === platform);
    return (
      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${p?.color || 'bg-slate-100 text-slate-700'}`}>
        {p?.label || platform}
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#0ea5e9]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-[#0ea5e9] to-blue-600 text-white flex items-center justify-center shadow-lg shadow-sky-500/30 ring-4 ring-white/10 shrink-0">
              <Film size={30} />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-widest bg-[#0ea5e9]/20 text-[#38bdf8] border border-[#0ea5e9]/30">
                  Ads & Marketing Vault
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Banque de Créatifs
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Créatifs Publicitaires (Ads Hub)
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                Centralisez, téléversez et organisez vos vidéos TikTok, Reels Instagram, UGC et visuels publicitaires.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={openCreateModal}
              className="px-5 py-3 bg-[#0ea5e9] hover:bg-sky-600 text-white rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg shadow-sky-500/30 cursor-pointer"
            >
              <Plus size={16} />
              <span>Ajouter un Créatif</span>
            </button>
          </div>
        </div>

        {/* Top KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-8 pt-6 border-t border-white/10">
          <div className="bg-white/5 border border-white/10 p-3.5 sm:p-4 rounded-2xl backdrop-blur-sm">
            <span className="text-[11px] text-slate-400 font-medium block">Total Créatifs Pubs</span>
            <div className="text-xl sm:text-2xl font-bold text-white mt-1">
              {stats?.total ?? '—'}
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 p-3.5 sm:p-4 rounded-2xl backdrop-blur-sm">
            <span className="text-[11px] text-slate-400 font-medium block">Créatifs Gagnants (Winners)</span>
            <div className="text-xl sm:text-2xl font-bold text-amber-400 mt-1 flex items-center gap-1.5">
              <span>{stats?.winners ?? 0}</span>
              <Flame size={18} className="text-amber-400" />
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 p-3.5 sm:p-4 rounded-2xl backdrop-blur-sm">
            <span className="text-[11px] text-slate-400 font-medium block">En Phase de Test</span>
            <div className="text-xl sm:text-2xl font-bold text-[#38bdf8] mt-1">
              {stats?.testing ?? 0}
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 p-3.5 sm:p-4 rounded-2xl backdrop-blur-sm">
            <span className="text-[11px] text-slate-400 font-medium block">Vidéos & Reels (9:16)</span>
            <div className="text-xl sm:text-2xl font-bold text-purple-400 mt-1">
              {stats?.videos ?? 0}
            </div>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 w-full md:w-auto flex-1">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search size={15} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un créatif, produit, hook..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#0ea5e9]"
            />
          </div>

          {/* Platform Filter */}
          <select
            value={filterPlatform}
            onChange={(e) => setFilterPlatform(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:bg-white focus:outline-none focus:border-[#0ea5e9]"
          >
            <option value="ALL">Toutes les plateformes</option>
            <option value="META">Meta (Instagram / FB)</option>
            <option value="TIKTOK">TikTok Ads</option>
            <option value="SNAPCHAT">Snapchat Ads</option>
            <option value="GOOGLE">Google / YouTube</option>
            <option value="INFLUENCE">Influence & UGC</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:bg-white focus:outline-none focus:border-[#0ea5e9]"
          >
            <option value="ALL">Tous les statuts</option>
            <option value="WINNER">Winners 🔥</option>
            <option value="TESTING">En Test</option>
            <option value="ACTIVE">Actifs</option>
            <option value="PAUSED">En Pause</option>
            <option value="ARCHIVED">Archivés</option>
          </select>

          {/* Media Type Filter */}
          <select
            value={filterMediaType}
            onChange={(e) => setFilterMediaType(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:bg-white focus:outline-none focus:border-[#0ea5e9]"
          >
            <option value="ALL">Tous les formats (Vidéos & Images)</option>
            <option value="VIDEO">Vidéos / Reels uniquement</option>
            <option value="IMAGE">Photos / Visuels uniquement</option>
          </select>
        </div>
      </div>

      {/* CREATIVES GRID VIEW */}
      {isLoading ? (
        <div className="py-24 text-center text-slate-400 bg-white rounded-3xl border border-slate-200 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-2 border-[#0ea5e9] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-medium">Chargement de la bibliothèque de créatifs...</span>
        </div>
      ) : creatives.length === 0 ? (
        <div className="py-24 text-center text-slate-400 bg-white rounded-3xl border border-dashed border-slate-300 flex flex-col items-center justify-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-sky-50 text-[#0ea5e9] flex items-center justify-center">
            <Film size={28} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">Aucun créatif publicitaire trouvé</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Téléversez vos vidéos et photos pour vos campagnes publicitaires (Meta, TikTok, Snapchat).
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 bg-[#0ea5e9] hover:bg-sky-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md shadow-sky-500/20 cursor-pointer"
          >
            <Plus size={15} />
            <span>Ajouter votre premier créatif</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {creatives.map((item) => {
            const isVideo = item.mediaType === 'VIDEO';

            return (
              <div
                key={item.id}
                className={`bg-white rounded-3xl border overflow-hidden shadow-sm hover:shadow-xl transition-all duration-200 flex flex-col group ${
                  item.status === 'WINNER' ? 'border-amber-300 ring-2 ring-amber-400/20' : 'border-slate-200/80'
                }`}
              >
                {/* Media Container / Player */}
                <div 
                  onClick={() => setSelectedPreviewCreative(item)}
                  className="relative aspect-[9/14] bg-slate-950 overflow-hidden cursor-pointer flex items-center justify-center"
                >
                  {isVideo ? (
                    <video
                      src={item.mediaUrl}
                      controls={false}
                      muted
                      loop
                      playsInline
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <img
                      src={item.mediaUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/30 pointer-events-none" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
                    <div className="flex items-center gap-1.5">
                      {getStatusBadge(item.status)}
                      {getPlatformBadge(item.platform)}
                    </div>

                    <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-[10px] font-bold text-white">
                      {item.aspectRatio || '9:16'}
                    </span>
                  </div>

                  {/* Center Play Button Overlay for Videos */}
                  {isVideo && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-12 h-12 rounded-full bg-white/30 backdrop-blur-md text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-[#0ea5e9] transition-all">
                        <Play size={20} className="ml-1 fill-white" />
                      </div>
                    </div>
                  )}

                  {/* Bottom Info on media */}
                  <div className="absolute bottom-3 left-3 right-3 text-white z-10">
                    <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-0.5">
                      {CATEGORIES.find((c) => c.id === item.category)?.label || item.category}
                    </div>
                    <h4 className="font-bold text-sm leading-snug line-clamp-2 text-white">
                      {item.title}
                    </h4>
                  </div>
                </div>

                {/* Card Body & Details */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between text-xs">
                  {/* Product & Copy */}
                  <div className="space-y-2">
                    {item.productName && (
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-[#0ea5e9] truncate">
                        <Sparkles size={12} className="shrink-0" />
                        <span>{item.productName}</span>
                      </div>
                    )}

                    {item.adCopy && (
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-slate-600 text-[11px] line-clamp-2 italic leading-relaxed">
                        "{item.adCopy}"
                      </div>
                    )}
                  </div>

                  {/* Footer Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-slate-400">
                    <span className="text-[10px] text-slate-400">
                      Par {item.creatorName}
                    </span>

                    <div className="flex items-center gap-1">
                      {/* Copy Media URL */}
                      <button
                        onClick={(e) => copyMediaUrl(item.mediaUrl, item.id, e)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          copiedId === item.id
                            ? 'bg-emerald-50 text-emerald-600 font-bold'
                            : 'hover:bg-slate-100 text-slate-500 hover:text-[#0ea5e9]'
                        }`}
                        title="Copier le lien direct du média pour Facebook/TikTok Ads"
                      >
                        {copiedId === item.id ? <Check size={14} /> : <Copy size={14} />}
                      </button>

                      {/* Download */}
                      <a
                        href={item.mediaUrl}
                        download
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-[#0ea5e9] rounded-lg transition-colors cursor-pointer"
                        title="Télécharger le fichier original"
                      >
                        <Download size={14} />
                      </a>

                      {/* Edit */}
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-[#0ea5e9] rounded-lg transition-colors cursor-pointer"
                        title="Modifier le créatif"
                      >
                        <Edit3 size={14} />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={(e) => deleteCreative(item.id, e)}
                        className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                        title="Supprimer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* UPLOAD & EDIT CREATIVE MODAL */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150 custom-scrollbar">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#0ea5e9]/10 text-[#0ea5e9] flex items-center justify-center">
                  <UploadCloud size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {isEditingCreative ? 'Modifier le créatif publicitaire' : 'Téléverser un nouveau créatif publicitaire'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Importez vos vidéos TikTok, Reels, UGC et visuels publicitaires.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {uploadError && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2 text-xs text-red-700">
                <AlertCircle size={16} className="shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            <form onSubmit={handleSaveCreative} className="space-y-5 text-xs">
              {/* MEDIA UPLOAD DROPZONE */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Fichier Vidéo ou Image *
                </label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime,image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                />

                {formMediaUrl ? (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-16 h-20 rounded-xl bg-slate-900 overflow-hidden shrink-0 flex items-center justify-center">
                        {formMediaType === 'VIDEO' ? (
                          <video src={formMediaUrl} className="w-full h-full object-cover" />
                        ) : (
                          <img src={formMediaUrl} alt="Preview" className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md text-[10px] mb-1">
                          <CheckCircle2 size={11} />
                          Fichier média prêt ({formMediaType})
                        </span>
                        <p className="text-slate-600 text-xs font-semibold truncate max-w-sm">
                          {formMediaUrl}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 bg-white border border-slate-200 hover:border-[#0ea5e9] text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer shrink-0"
                    >
                      Remplacer
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="p-8 rounded-3xl border-2 border-dashed border-slate-300 hover:border-[#0ea5e9] bg-slate-50/50 hover:bg-sky-50/30 transition-all flex flex-col items-center justify-center text-center cursor-pointer group"
                  >
                    {isUploadingFile ? (
                      <div className="flex flex-col items-center gap-2 py-4">
                        <Loader2 size={30} className="animate-spin text-[#0ea5e9]" />
                        <span className="text-xs font-semibold text-slate-700">
                          Téléversement du média en cours...
                        </span>
                      </div>
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-2xl bg-[#0ea5e9]/10 text-[#0ea5e9] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                          <UploadCloud size={24} />
                        </div>
                        <h4 className="text-sm font-bold text-slate-800 group-hover:text-[#0ea5e9] transition-colors">
                          Cliquez pour téléverser votre vidéo ou photo
                        </h4>
                        <p className="text-xs text-slate-400 mt-1 max-w-sm">
                          Vidéos MP4, MOV, WebM ou Images PNG, JPG, WebP jusqu'à 100 Mo.
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Title & Product Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Titre du Créatif *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Ex: Reel Hook Testeur Baccarat Rouge 540"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#0ea5e9]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Produit Associé (optionnel)
                  </label>
                  <input
                    type="text"
                    value={formProductName}
                    onChange={(e) => setFormProductName(e.target.value)}
                    placeholder="Ex: Baccarat Rouge 540, Sauvage Elixir..."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#0ea5e9]"
                  />
                </div>
              </div>

              {/* Platform, Category & Status Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Plateforme Cible
                  </label>
                  <select
                    value={formPlatform}
                    onChange={(e) => setFormPlatform(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold focus:bg-white focus:outline-none focus:border-[#0ea5e9]"
                  >
                    <option value="META">Meta (Instagram / FB)</option>
                    <option value="TIKTOK">TikTok Ads</option>
                    <option value="SNAPCHAT">Snapchat Ads</option>
                    <option value="GOOGLE">Google / YouTube</option>
                    <option value="INFLUENCE">Influence & UGC</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Type de Créatif
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold focus:bg-white focus:outline-none focus:border-[#0ea5e9]"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Statut de Performance
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold focus:bg-white focus:outline-none focus:border-[#0ea5e9]"
                  >
                    <option value="TESTING">En Test</option>
                    <option value="WINNER">Winner 🔥</option>
                    <option value="ACTIVE">Actif</option>
                    <option value="PAUSED">En Pause</option>
                    <option value="ARCHIVED">Archivé</option>
                  </select>
                </div>
              </div>

              {/* Ad Copy / Hook / Caption Script */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Texte Publicitaire, Hook & Script (Ad Copy)
                </label>
                <textarea
                  rows={3}
                  value={formAdCopy}
                  onChange={(e) => setFormAdCopy(e.target.value)}
                  placeholder="Accroche (Hook 3s), texte principal, offre promotionnelle et appel à l'action (CTA)..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#0ea5e9] leading-relaxed"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isUploadingFile}
                  className="px-6 py-2.5 bg-[#0ea5e9] hover:bg-sky-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-sky-500/20 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Enregistrement...' : isEditingCreative ? 'Mettre à jour' : 'Ajouter à la bibliothèque'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULL PREVIEW MODAL / VIDEO PLAYER */}
      {selectedPreviewCreative && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]">
            {/* Media side */}
            <div className="flex-1 bg-black flex items-center justify-center relative min-h-[350px]">
              {selectedPreviewCreative.mediaType === 'VIDEO' ? (
                <video
                  src={selectedPreviewCreative.mediaUrl}
                  controls
                  autoPlay
                  playsInline
                  className="max-h-[80vh] w-full object-contain"
                />
              ) : (
                <img
                  src={selectedPreviewCreative.mediaUrl}
                  alt={selectedPreviewCreative.title}
                  className="max-h-[80vh] w-full object-contain"
                />
              )}
            </div>

            {/* Meta side */}
            <div className="w-full md:w-80 p-6 flex flex-col justify-between border-t md:border-t-0 md:border-l border-slate-200 bg-white">
              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between">
                  {getStatusBadge(selectedPreviewCreative.status)}
                  <button
                    onClick={() => setSelectedPreviewCreative(null)}
                    className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div>
                  <h3 className="font-bold text-base text-slate-900 leading-snug">
                    {selectedPreviewCreative.title}
                  </h3>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Ajouté par {selectedPreviewCreative.creatorName}
                  </p>
                </div>

                <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Plateforme:</span>
                    <span className="font-bold text-slate-800">{selectedPreviewCreative.platform}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Type:</span>
                    <span className="font-semibold text-slate-700">{selectedPreviewCreative.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Format:</span>
                    <span className="font-mono text-slate-700">{selectedPreviewCreative.aspectRatio}</span>
                  </div>
                  {selectedPreviewCreative.productName && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Produit:</span>
                      <span className="font-semibold text-[#0ea5e9] truncate max-w-[130px]">{selectedPreviewCreative.productName}</span>
                    </div>
                  )}
                </div>

                {selectedPreviewCreative.adCopy && (
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">Texte / Hook</span>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-slate-700 text-xs whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto">
                      {selectedPreviewCreative.adCopy}
                    </div>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
                <button
                  onClick={() => copyMediaUrl(selectedPreviewCreative.mediaUrl, selectedPreviewCreative.id)}
                  className="w-full py-2.5 bg-[#0ea5e9] hover:bg-sky-600 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                >
                  <Copy size={14} />
                  <span>{copiedId === selectedPreviewCreative.id ? 'Lien copié !' : 'Copier le lien direct du média'}</span>
                </button>

                <a
                  href={selectedPreviewCreative.mediaUrl}
                  download
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Download size={14} />
                  <span>Télécharger le fichier</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
