'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  User, 
  ShieldCheck, 
  History, 
  Users, 
  Save, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Calendar, 
  Clock, 
  Globe, 
  Search, 
  RefreshCw,
  Eye,
  EyeOff,
  Lock,
  Mail,
  UserCheck,
  Activity,
  Layers,
  ShoppingBag,
  PackageSearch,
  Star
} from 'lucide-react';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  avatar?: string | null;
  lastLoginAt?: string | null;
  lastActivityAt?: string | null;
  createdAt?: string | null;
}

interface ActivityLog {
  id: string;
  userId?: string | null;
  userName?: string | null;
  userEmail?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  description: string;
  oldValue?: string | null;
  newValue?: string | null;
  ipAddress?: string | null;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
    role: string;
  } | null;
}

const AVATAR_PRESETS = [
  { id: '1', label: 'Noir & Or', url: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=150&auto=format&fit=crop&q=80' },
  { id: '2', label: 'Bleu NAY', url: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=150&auto=format&fit=crop&q=80' },
  { id: '3', label: 'Ambre Luxe', url: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=150&auto=format&fit=crop&q=80' },
  { id: '4', label: 'Flacon Cristal', url: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=150&auto=format&fit=crop&q=80' },
  { id: '5', label: 'Oud Royal', url: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=150&auto=format&fit=crop&q=80' },
];

export default function AdminProfilePage() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'profile';
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'activity' | 'team'>(
    initialTab === 'security' || initialTab === 'activity' || initialTab === 'team'
      ? initialTab
      : 'profile'
  );

  // User state
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [teamMembers, setTeamMembers] = useState<AdminUser[]>([]);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  // Profile Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Security Form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Activity Logs state
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [filterUser, setFilterUser] = useState<string>('ALL');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);

  // Load user data
  const loadUserData = async () => {
    setIsLoadingUser(true);
    try {
      const res = await fetch('/api/admin/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setCurrentUser(data.user);
          setName(data.user.name || '');
          setEmail(data.user.email || '');
          setAvatar(data.user.avatar || '');
          setTeamMembers(data.teamMembers || []);
        }
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setIsLoadingUser(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  // Load activity logs
  const loadActivityLogs = async (currentPage = page) => {
    setIsLoadingLogs(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(currentPage));
      params.set('limit', '25');
      if (filterUser !== 'ALL') params.set('userId', filterUser);
      if (filterType !== 'ALL') params.set('entityType', filterType);
      if (searchQuery.trim()) params.set('search', searchQuery.trim());

      const res = await fetch(`/api/admin/auth/activity?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setLogs(data.logs || []);
          setTotalPages(data.pagination.totalPages || 1);
          setTotalLogs(data.pagination.total || 0);
        }
      }
    } catch (err) {
      console.error('Failed to load activity logs:', err);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'activity') {
      loadActivityLogs(1);
      setPage(1);
    }
  }, [activeTab, filterUser, filterType]);

  // Handle Profile Update
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMessage(null);
    setIsSavingProfile(true);

    try {
      const res = await fetch('/api/admin/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          avatar: avatar.trim() || null,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setProfileMessage({ type: 'success', text: 'Vos informations ont été mises à jour avec succès.' });
        setCurrentUser(data.user);
        // Refresh team members list
        loadUserData();
      } else {
        setProfileMessage({ type: 'error', text: data.error || 'Erreur lors de la mise à jour.' });
      }
    } catch (err) {
      setProfileMessage({ type: 'error', text: 'Erreur réseau lors de la mise à jour.' });
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Handle Password Update
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Les deux mots de passe ne correspondent pas.' });
      return;
    }

    if (newPassword.length < 8) {
      setPasswordMessage({ type: 'error', text: 'Le nouveau mot de passe doit comporter au moins 8 caractères.' });
      return;
    }

    setIsSavingPassword(true);

    try {
      const res = await fetch('/api/admin/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setPasswordMessage({ type: 'success', text: 'Mot de passe modifié avec succès !' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordMessage({ type: 'error', text: data.error || 'Erreur lors du changement de mot de passe.' });
      }
    } catch (err) {
      setPasswordMessage({ type: 'error', text: 'Erreur réseau lors du changement de mot de passe.' });
    } finally {
      setIsSavingPassword(false);
    }
  };

  const getInitials = (nameStr?: string) => {
    if (!nameStr) return 'NA';
    const parts = nameStr.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return nameStr.slice(0, 2).toUpperCase();
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return 'Jamais';
    return new Date(dateStr).toLocaleString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRelativeTime = (dateStr: string) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "À l'instant";
    if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)} h`;
    if (diffInSeconds < 604800) return `Il y a ${Math.floor(diffInSeconds / 86400)} j`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  const getActionBadge = (action: string) => {
    if (action === 'LOGIN') {
      return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-200">Connexion</span>;
    }
    if (action === 'LOGOUT') {
      return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">Déconnexion</span>;
    }
    if (action.includes('UPDATE') || action.includes('EDIT')) {
      return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-200">Modification</span>;
    }
    if (action.includes('CREATE') || action.includes('ADD')) {
      return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">Création</span>;
    }
    if (action.includes('DELETE')) {
      return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-600 border border-red-200">Suppression</span>;
    }
    return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">{action}</span>;
  };

  const calculatePasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (pass.length >= 12) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const passStrength = calculatePasswordStrength(newPassword);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#0ea5e9]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-[#0ea5e9] to-blue-600 text-white flex items-center justify-center text-xl sm:text-2xl font-bold shadow-lg shadow-sky-500/30 ring-4 ring-white/10 shrink-0">
              {currentUser?.avatar ? (
                <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover rounded-2xl" />
              ) : (
                <span>{getInitials(currentUser?.name)}</span>
              )}
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-widest bg-[#0ea5e9]/20 text-[#38bdf8] border border-[#0ea5e9]/30">
                  {currentUser?.role === 'OWNER' ? 'Propriétaire NAY' : 'Administrateur'}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Compte Actif
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                {currentUser?.name || 'Mon Compte Propriétaire'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                {currentUser?.email} • NAY Workspace Multi-Propriétaires
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2.5 rounded-2xl backdrop-blur-sm text-xs text-slate-300">
            <Calendar size={14} className="text-[#38bdf8]" />
            <span>Dernière connexion : <strong>{formatDate(currentUser?.lastLoginAt)}</strong></span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-8 pt-6 border-t border-white/10 overflow-x-auto custom-scrollbar">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'profile'
                ? 'bg-[#0ea5e9] text-white shadow-lg shadow-sky-500/30'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <User size={15} />
            <span>Informations Personnelles</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'security'
                ? 'bg-[#0ea5e9] text-white shadow-lg shadow-sky-500/30'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <ShieldCheck size={15} />
            <span>Sécurité & Mot de Passe</span>
          </button>

          <button
            onClick={() => setActiveTab('activity')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'activity'
                ? 'bg-[#0ea5e9] text-white shadow-lg shadow-sky-500/30'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <History size={15} />
            <span>Journal d'Activité</span>
          </button>

          <button
            onClick={() => setActiveTab('team')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'team'
                ? 'bg-[#0ea5e9] text-white shadow-lg shadow-sky-500/30'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Users size={15} />
            <span>Co-Propriétaires ({teamMembers.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: Mon Profil */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
          {/* Left Column: Form */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Détails de mon profil</h2>
            <p className="text-xs text-slate-500 mb-6">
              Mettez à jour vos coordonnées personnelles utilisées dans le panneau d'administration NAY.
            </p>

            {profileMessage && (
              <div className={`p-4 mb-6 rounded-2xl flex items-center gap-3 text-xs font-medium ${
                profileMessage.type === 'success' 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {profileMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                <span>{profileMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                    Nom & Prénom
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User size={16} />
                    </div>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex: Ayoub Ait Yahya"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-[#0ea5e9] focus:ring-1 focus:ring-[#0ea5e9] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                    Email de connexion
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail size={16} />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Ex: ayoub@nayparfum.ma"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-[#0ea5e9] focus:ring-1 focus:ring-[#0ea5e9] transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Avatar Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Photo de profil / Avatar
                </label>
                <div className="mb-3">
                  <input
                    type="url"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    placeholder="URL de votre photo ou choisissez un modèle ci-dessous"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-[#0ea5e9] focus:ring-1 focus:ring-[#0ea5e9] transition-all"
                  />
                </div>

                <div className="flex items-center gap-3 overflow-x-auto py-2">
                  <button
                    type="button"
                    onClick={() => setAvatar('')}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center gap-2 transition-all ${
                      !avatar ? 'border-[#0ea5e9] bg-[#0ea5e9]/10 text-[#0ea5e9]' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>Initiales ({getInitials(name)})</span>
                  </button>

                  {AVATAR_PRESETS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setAvatar(p.url)}
                      className={`p-1 rounded-xl border flex items-center gap-2 text-xs transition-all shrink-0 ${
                        avatar === p.url ? 'border-[#0ea5e9] ring-2 ring-[#0ea5e9]/30' : 'border-slate-200 hover:border-slate-400'
                      }`}
                    >
                      <img src={p.url} alt={p.label} className="w-8 h-8 rounded-lg object-cover" />
                      <span className="pr-2 font-medium text-slate-700">{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-6 py-3 bg-[#0ea5e9] hover:bg-sky-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-sky-500/20 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isSavingProfile ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Enregistrement...</span>
                    </>
                  ) : (
                    <>
                      <Save size={15} />
                      <span>Enregistrer les modifications</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Account Status & Privileges */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Sparkles size={16} className="text-[#0ea5e9]" />
                <span>Privilèges Propriétaire</span>
              </h3>

              <div className="space-y-3 text-xs text-slate-600">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-800">Accès Total aux Données</span>
                    <p className="text-slate-500 text-[11px] mt-0.5">Produits, commandes, clients, rapports financiers et inventaire partagés en temps réel.</p>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-800">Traçabilité Personnelle</span>
                    <p className="text-slate-500 text-[11px] mt-0.5">Chaque action est signée avec votre compte personnel dans le journal d'activité.</p>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-800">Sécurité Indépendante</span>
                    <p className="text-slate-500 text-[11px] mt-0.5">Mot de passe personnel et sessions sécurisées séparées.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-sm relative overflow-hidden">
              <div className="text-xs uppercase font-bold tracking-widest text-[#38bdf8] mb-1">NAY Workspace</div>
              <div className="text-base font-bold text-white mb-2">Co-Gestion d'Entreprise</div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Ce compte appartient au collège des co-propriétaires fondateurs de NAY Parfum Maroc.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Sécurité & Mot de Passe */}
      {activeTab === 'security' && (
        <div className="max-w-2xl bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm animate-in fade-in duration-200">
          <h2 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
            <Lock size={18} className="text-[#0ea5e9]" />
            <span>Modifier mon mot de passe</span>
          </h2>
          <p className="text-xs text-slate-500 mb-6">
            Pour sécuriser votre compte, choisissez un mot de passe fort comportant au moins 8 caractères.
          </p>

          {passwordMessage && (
            <div className={`p-4 mb-6 rounded-2xl flex items-center gap-3 text-xs font-medium ${
              passwordMessage.type === 'success' 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {passwordMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{passwordMessage.text}</span>
            </div>
          )}

          <form onSubmit={handleSavePassword} className="space-y-5">
            {/* Current Password */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Mot de passe actuel
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-[#0ea5e9] focus:ring-1 focus:ring-[#0ea5e9] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700"
                >
                  {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Nouveau mot de passe
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-[#0ea5e9] focus:ring-1 focus:ring-[#0ea5e9] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700"
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Password Strength Meter */}
              {newPassword && (
                <div className="mt-2.5">
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-slate-500">Solidité du mot de passe :</span>
                    <span className={`font-semibold ${
                      passStrength <= 2 ? 'text-amber-600' : passStrength <= 4 ? 'text-blue-600' : 'text-emerald-600'
                    }`}>
                      {passStrength <= 2 ? 'Moyen' : passStrength <= 4 ? 'Bon' : 'Excellent'}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden flex gap-1">
                    <div className={`h-full flex-1 rounded-full ${passStrength >= 1 ? (passStrength <= 2 ? 'bg-amber-500' : 'bg-[#0ea5e9]') : 'bg-slate-200'}`} />
                    <div className={`h-full flex-1 rounded-full ${passStrength >= 3 ? (passStrength <= 4 ? 'bg-blue-500' : 'bg-emerald-500') : 'bg-slate-200'}`} />
                    <div className={`h-full flex-1 rounded-full ${passStrength >= 5 ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Confirmer le nouveau mot de passe
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-[#0ea5e9] focus:ring-1 focus:ring-[#0ea5e9] transition-all"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={isSavingPassword}
                className="px-6 py-3 bg-[#0ea5e9] hover:bg-sky-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-sky-500/20 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isSavingPassword ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Modification...</span>
                  </>
                ) : (
                  <>
                    <KeyRound size={15} />
                    <span>Mettre à jour le mot de passe</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: Journal d'Activité */}
      {activeTab === 'activity' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm animate-in fade-in duration-200 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Journal d'Activité & Traçabilité</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Historique transparent des actions administratives effectuées par chaque propriétaire.
              </p>
            </div>

            <button
              onClick={() => loadActivityLogs(page)}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
            >
              <RefreshCw size={13} className={isLoadingLogs ? 'animate-spin' : ''} />
              <span>Actualiser</span>
            </button>
          </div>

          {/* Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200/60">
            {/* User Filter */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Filtrer par auteur
              </label>
              <select
                value={filterUser}
                onChange={(e) => setFilterUser(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#0ea5e9]"
              >
                <option value="ALL">Tous les propriétaires</option>
                {currentUser && <option value={currentUser.id}>Moi ({currentUser.name})</option>}
                {teamMembers
                  .filter((m) => m.id !== currentUser?.id)
                  .map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
              </select>
            </div>

            {/* Entity Type Filter */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Type d'activité
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#0ea5e9]"
              >
                <option value="ALL">Toutes les rubriques</option>
                <option value="AUTH">Connexion & Sécurité</option>
                <option value="PRODUCT">Produits & Testeurs</option>
                <option value="ORDER">Commandes & Ventes</option>
                <option value="CUSTOMER">Clients & VIP</option>
                <option value="REVIEW">Avis Clients</option>
                <option value="MARKETING">Marketing & Codes Promo</option>
                <option value="USER">Comptes Utilisateurs</option>
                <option value="SYSTEM">Paramètres Système</option>
              </select>
            </div>

            {/* Search Input */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Rechercher
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && loadActivityLogs(1)}
                  placeholder="Mot-clé..."
                  className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#0ea5e9]"
                />
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
          </div>

          {/* Table / Logs List */}
          {isLoadingLogs ? (
            <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
              <div className="w-6 h-6 border-2 border-[#0ea5e9] border-t-transparent rounded-full animate-spin" />
              <span className="text-xs">Chargement du journal d'activité...</span>
            </div>
          ) : logs.length === 0 ? (
            <div className="py-16 text-center text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              <History size={32} className="mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-600">Aucune activité enregistrée</p>
              <p className="text-xs text-slate-400 mt-1">Les actions effectuées sur le panneau admin apparaîtront ici.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
              {logs.map((log) => (
                <div key={log.id} className="p-4 hover:bg-slate-50/80 transition-colors flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    {log.user?.avatar ? (
                      <img src={log.user.avatar} alt={log.userName || ''} className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <span>{getInitials(log.userName || 'NA')}</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-bold text-xs text-slate-900">
                        {log.userName || 'Administrateur'}
                      </span>
                      {getActionBadge(log.action)}
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-100 px-1.5 py-0.5 rounded">
                        {log.entityType}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed break-words">
                      {log.description}
                    </p>

                    <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {getRelativeTime(log.createdAt)} ({formatDate(log.createdAt)})
                      </span>
                      {log.ipAddress && (
                        <span className="flex items-center gap-1">
                          <Globe size={12} />
                          IP: {log.ipAddress}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs">
              <span className="text-slate-500">
                Page <strong>{page}</strong> sur <strong>{totalPages}</strong> ({totalLogs} activités)
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => {
                    setPage(page - 1);
                    loadActivityLogs(page - 1);
                  }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 rounded-lg font-medium text-slate-700 transition-colors"
                >
                  Précédent
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => {
                    setPage(page + 1);
                    loadActivityLogs(page + 1);
                  }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 rounded-lg font-medium text-slate-700 transition-colors"
                >
                  Suivant
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: Co-Propriétaires */}
      {activeTab === 'team' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Membres Fondateurs & Co-Propriétaires</h2>
            <p className="text-xs text-slate-500 mb-6">
              Les deux comptes propriétaires disposent d'un accès intégral et équivalent à toutes les données de NAY Parfums.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {teamMembers.map((member) => {
                const isMe = member.id === currentUser?.id;
                return (
                  <div
                    key={member.id}
                    className={`p-5 rounded-2xl border transition-all ${
                      isMe
                        ? 'border-[#0ea5e9] bg-[#0ea5e9]/5 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0ea5e9] to-blue-600 text-white flex items-center justify-center text-sm font-bold shadow-md shadow-sky-500/20 shrink-0">
                        {member.avatar ? (
                          <img src={member.avatar} alt={member.name} className="w-full h-full object-cover rounded-2xl" />
                        ) : (
                          <span>{getInitials(member.name)}</span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-900 truncate">{member.name}</h3>
                          {isMe && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0ea5e9] text-white">
                              Vous
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 truncate">{member.email}</p>
                        
                        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                          <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Propriétaire Actif
                          </span>
                          <span className="text-slate-400">
                            Dernière activité : {formatDate(member.lastActivityAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
