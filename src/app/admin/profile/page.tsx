'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  User, 
  ShieldCheck, 
  History, 
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
  Mail
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
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'activity'>(
    initialTab === 'security' || initialTab === 'activity' ? initialTab : 'profile'
  );

  // User state
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
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

  // Load activity logs (filtered by current user)
  const loadActivityLogs = async (currentPage = page) => {
    if (!currentUser) return;
    setIsLoadingLogs(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(currentPage));
      params.set('limit', '25');
      params.set('userId', currentUser.id);
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
    if (activeTab === 'activity' && currentUser) {
      loadActivityLogs(1);
      setPage(1);
    }
  }, [activeTab, filterType, currentUser]);

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
        setProfileMessage({ type: 'success', text: 'Vos informations personnelles ont été mises à jour avec succès.' });
        setCurrentUser(data.user);
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
      setPasswordMessage({ type: 'error', text: 'Le nouveau mot de passe et sa confirmation ne correspondent pas.' });
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
        setPasswordMessage({ type: 'success', text: 'Votre mot de passe personnel a été modifié avec succès !' });
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
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#0ea5e9]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-[#0ea5e9] to-blue-600 text-white flex items-center justify-center text-xl sm:text-2xl font-bold shadow-lg shadow-sky-500/30 ring-4 ring-white/10 shrink-0 overflow-hidden">
              {currentUser?.avatar ? (
                <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover rounded-2xl" />
              ) : (
                <span>{getInitials(currentUser?.name)}</span>
              )}
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-widest bg-[#0ea5e9]/20 text-[#38bdf8] border border-[#0ea5e9]/30">
                  Propriétaire NAY
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Compte Personnel Actif
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                {currentUser?.name || 'Mon Compte Propriétaire'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                {currentUser?.email}
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
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
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
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'security'
                ? 'bg-[#0ea5e9] text-white shadow-lg shadow-sky-500/30'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <ShieldCheck size={15} />
            <span>Sécurité & Mon Mot de Passe</span>
          </button>

          <button
            onClick={() => setActiveTab('activity')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'activity'
                ? 'bg-[#0ea5e9] text-white shadow-lg shadow-sky-500/30'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <History size={15} />
            <span>Mon Journal d'Activité</span>
          </button>
        </div>
      </div>

      {/* TAB 1: Mon Profil */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm animate-in fade-in duration-200">
          <h2 className="text-lg font-bold text-slate-900 mb-1">Détails de mon compte personnel</h2>
          <p className="text-xs text-slate-500 mb-6">
            Ces informations vous identifient de façon unique et personnelle sur le panneau d'administration.
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

          <form onSubmit={handleSaveProfile} className="space-y-6 max-w-2xl">
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
                    placeholder="Nom complet"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-[#0ea5e9] focus:ring-1 focus:ring-[#0ea5e9] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Email de connexion personnel
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
                    placeholder="nom@nayparfum.ma"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-[#0ea5e9] focus:ring-1 focus:ring-[#0ea5e9] transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Avatar Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Photo de profil / Avatar personnel
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
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center gap-2 transition-all cursor-pointer ${
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
                    className={`p-1 rounded-xl border flex items-center gap-2 text-xs transition-all shrink-0 cursor-pointer ${
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
                    <span>Enregistrer mes modifications</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: Sécurité & Mot de Passe */}
      {activeTab === 'security' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm animate-in fade-in duration-200 max-w-2xl">
          <h2 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
            <Lock size={18} className="text-[#0ea5e9]" />
            <span>Modifier mon mot de passe personnel</span>
          </h2>
          <p className="text-xs text-slate-500 mb-6">
            Votre mot de passe est strictement personnel. Personne d'autre n'y a accès.
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
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Nouveau mot de passe personnel
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
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {newPassword && (
                <div className="mt-2.5">
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-slate-500">Solidité :</span>
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
                    <span>Changer mon mot de passe</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: Mon Activité */}
      {activeTab === 'activity' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm animate-in fade-in duration-200 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Mon Historique d'Activité Personnel</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Historique des actions que vous avez personnellement enregistrées sur le système.
              </p>
            </div>

            <button
              onClick={() => loadActivityLogs(page)}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto cursor-pointer"
            >
              <RefreshCw size={13} className={isLoadingLogs ? 'animate-spin' : ''} />
              <span>Actualiser</span>
            </button>
          </div>

          {isLoadingLogs ? (
            <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
              <div className="w-6 h-6 border-2 border-[#0ea5e9] border-t-transparent rounded-full animate-spin" />
              <span className="text-xs">Chargement de votre journal d'activité...</span>
            </div>
          ) : logs.length === 0 ? (
            <div className="py-16 text-center text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              <History size={32} className="mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-600">Aucune activité récente pour votre compte</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
              {logs.map((log) => (
                <div key={log.id} className="p-4 hover:bg-slate-50/80 transition-colors flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0ea5e9]/10 text-[#0ea5e9]">
                        {log.action}
                      </span>
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

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs">
              <span className="text-slate-500">
                Page <strong>{page}</strong> sur <strong>{totalPages}</strong> ({totalLogs} actions)
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => {
                    setPage(page - 1);
                    loadActivityLogs(page - 1);
                  }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 rounded-lg font-medium text-slate-700 transition-colors cursor-pointer"
                >
                  Précédent
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => {
                    setPage(page + 1);
                    loadActivityLogs(page + 1);
                  }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 rounded-lg font-medium text-slate-700 transition-colors cursor-pointer"
                >
                  Suivant
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
