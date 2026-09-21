'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  History, 
  Search, 
  Filter, 
  RefreshCw, 
  Calendar, 
  Clock, 
  User, 
  ShieldCheck, 
  Sparkles, 
  Package, 
  ShoppingBag, 
  CheckSquare, 
  Star, 
  Users, 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  ArrowUpDown,
  FileText,
  Activity,
  Layers,
  CheckCircle2,
  AlertCircle,
  Eye,
  X
} from 'lucide-react';

interface ActivityUser {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  role: string;
}

interface ActivityLog {
  id: string;
  userId?: string | null;
  userName: string;
  userEmail?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  description: string;
  oldValue?: string | null;
  newValue?: string | null;
  ipAddress?: string | null;
  createdAt: string;
  user?: ActivityUser | null;
}

interface ActivityStats {
  total: number;
  todayTotal: number;
  todayByUser: { name: string; count: number }[];
}

export default function AdminActivityPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [users, setUsers] = useState<ActivityUser[]>([]);
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters
  const [selectedUser, setSelectedUser] = useState('ALL');
  const [selectedEntity, setSelectedEntity] = useState('ALL');
  const [selectedPeriod, setSelectedPeriod] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);

  // Detail Modal
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);

  const [isForbidden, setIsForbidden] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchActivities = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '25');
      if (selectedUser !== 'ALL') params.set('userId', selectedUser);
      if (selectedEntity !== 'ALL') params.set('entityType', selectedEntity);
      if (selectedPeriod !== 'ALL') params.set('period', selectedPeriod);
      if (searchQuery.trim()) params.set('search', searchQuery.trim());

      const res = await fetch(`/api/admin/activity?${params.toString()}`);
      if (res.status === 403) {
        setIsForbidden(true);
        return;
      }
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setLogs(data.logs || []);
          setStats(data.stats || null);
          setUsers(data.users || []);
          setTotalPages(data.pagination.totalPages || 1);
          setTotalLogs(data.pagination.total || 0);
        } else {
          setIsForbidden(true);
        }
      }
    } catch (err) {
      console.error('Failed to load activity logs:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [page, selectedUser, selectedEntity, selectedPeriod, searchQuery]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  // Auto-refresh timer
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchActivities(true);
    }, 15000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchActivities]);

  const getInitials = (nameStr?: string) => {
    if (!nameStr) return 'NA';
    const parts = nameStr.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return nameStr.slice(0, 2).toUpperCase();
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
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
    if (action.includes('CREATE') || action.includes('ADD')) {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          Création
        </span>
      );
    }
    if (action.includes('UPDATE') || action.includes('EDIT') || action.includes('PATCH')) {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-sky-50 text-sky-700 border border-sky-200">
          Modification
        </span>
      );
    }
    if (action.includes('DELETE') || action.includes('REMOVE')) {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
          Suppression
        </span>
      );
    }
    if (action.includes('LOGIN')) {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-50 text-purple-700 border border-purple-200">
          Connexion
        </span>
      );
    }
    if (action.includes('TASK')) {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
          Mission / Tâche
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-neutral-100 text-neutral-700 border border-neutral-200">
        {action}
      </span>
    );
  };

  const getEntityIcon = (entityType: string) => {
    switch (entityType) {
      case 'PRODUCT':
        return <Package size={14} className="text-neutral-600" />;
      case 'ORDER':
        return <ShoppingBag size={14} className="text-neutral-600" />;
      case 'TASK':
        return <CheckSquare size={14} className="text-neutral-600" />;
      case 'REVIEW':
        return <Star size={14} className="text-amber-500" />;
      case 'CUSTOMER':
        return <Users size={14} className="text-neutral-600" />;
      case 'AUTH':
      case 'USER':
        return <ShieldCheck size={14} className="text-neutral-600" />;
      default:
        return <Layers size={14} className="text-neutral-400" />;
    }
  };

  const exportToCSV = () => {
    if (!logs.length) return;
    const headers = ['Date', 'Utilisateur', 'Email', 'Action', 'Entite', 'Description', 'IP'];
    const rows = logs.map((l) => [
      formatDate(l.createdAt),
      `"${l.userName.replace(/"/g, '""')}"`,
      `"${(l.userEmail || '').replace(/"/g, '""')}"`,
      `"${l.action.replace(/"/g, '""')}"`,
      `"${l.entityType.replace(/"/g, '""')}"`,
      `"${l.description.replace(/"/g, '""')}"`,
      `"${(l.ipAddress || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `journal_activite_nay_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isForbidden) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white border border-slate-200/90 rounded-2xl shadow-xl text-center space-y-4 animate-in fade-in zoom-in-95">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shadow-inner">
          <ShieldCheck size={28} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Accès Réservé</h2>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Le journal d&apos;activité global et l&apos;audit des actions des employés sont strictement réservés à la <strong>Direction</strong> et aux <strong>Responsables de Département</strong>.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/admin"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
          >
            <span>Retour au tableau de bord</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-neutral-100 text-neutral-700 border border-neutral-200">
              Audit & Traçabilité
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              En direct
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            Journal d'Activité Global
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Suivez en temps réel toutes les actions réalisées par chaque propriétaire et collaborateur.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer border ${
              autoRefresh 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
            }`}
            title="Actualisation automatique toutes les 15s"
          >
            <Activity size={13} className={autoRefresh ? 'animate-pulse text-emerald-600' : 'text-neutral-400'} />
            <span>{autoRefresh ? 'Auto-refresh : Actif' : 'Auto-refresh : Inactif'}</span>
          </button>

          <button
            onClick={() => fetchActivities(false)}
            className="px-3.5 py-2 bg-neutral-900 hover:bg-black text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <RefreshCw size={13} className={isRefreshing || isLoading ? 'animate-spin' : ''} />
            <span>Actualiser</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white border border-neutral-200 p-4 rounded-xl shadow-2xs">
          <span className="text-[11px] text-neutral-500 font-medium block">Total Événements</span>
          <div className="text-xl font-bold text-neutral-900 mt-1">
            {stats?.total ?? '—'}
          </div>
        </div>

        <div className="bg-white border border-neutral-200 p-4 rounded-xl shadow-2xs">
          <span className="text-[11px] text-neutral-500 font-medium block">Actions Aujourd'hui</span>
          <div className="text-xl font-bold text-neutral-900 mt-1">
            {stats?.todayTotal ?? '—'}
          </div>
        </div>

        <div className="bg-white border border-neutral-200 p-4 rounded-xl shadow-2xs">
          <span className="text-[11px] text-neutral-500 font-medium block">AYOUB AIT YAHYA</span>
          <div className="text-xl font-bold text-neutral-900 mt-1">
            {stats?.todayByUser.find((u) => u.name.toLowerCase().includes('ayoub'))?.count ?? 0}
            <span className="text-xs text-neutral-400 font-normal ml-1">auj.</span>
          </div>
        </div>

        <div className="bg-white border border-neutral-200 p-4 rounded-xl shadow-2xs">
          <span className="text-[11px] text-neutral-500 font-medium block">NOUAMANE AIT YAHYA</span>
          <div className="text-xl font-bold text-neutral-900 mt-1">
            {stats?.todayByUser.find((u) => u.name.toLowerCase().includes('nouamane'))?.count ?? 0}
            <span className="text-xs text-neutral-400 font-normal ml-1">auj.</span>
          </div>
        </div>
      </div>

      {/* FILTER CONTROLS BAR */}
      <div className="bg-white rounded-xl border border-neutral-200 p-3 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 w-full md:w-auto flex-1">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
              <Search size={14} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Rechercher une action, nom..."
              className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs text-neutral-900 focus:bg-white focus:outline-none focus:border-neutral-900 transition-colors"
            />
          </div>

          {/* User Filter */}
          <select
            value={selectedUser}
            onChange={(e) => {
              setSelectedUser(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs text-neutral-800 font-medium focus:bg-white focus:outline-none focus:border-neutral-900 transition-colors cursor-pointer"
          >
            <option value="ALL">Tous les utilisateurs</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.role === 'OWNER' ? 'Propriétaire' : u.role})
              </option>
            ))}
            <option value="SYSTEM">Système automatique</option>
          </select>

          {/* Entity Type Filter */}
          <select
            value={selectedEntity}
            onChange={(e) => {
              setSelectedEntity(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs text-neutral-800 font-medium focus:bg-white focus:outline-none focus:border-neutral-900 transition-colors cursor-pointer"
          >
            <option value="ALL">Toutes les catégories</option>
            <option value="TASK">Missions & Tâches</option>
            <option value="PRODUCT">Testeurs & Produits</option>
            <option value="ORDER">Commandes</option>
            <option value="CUSTOMER">Clients & CRM</option>
            <option value="REVIEW">Avis Clients</option>
            <option value="AUTH">Connexions & Sécurité</option>
            <option value="BRAND">Marques</option>
            <option value="MARKETING">Marketing</option>
          </select>

          {/* Period Filter */}
          <select
            value={selectedPeriod}
            onChange={(e) => {
              setSelectedPeriod(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs text-neutral-800 font-medium focus:bg-white focus:outline-none focus:border-neutral-900 transition-colors cursor-pointer"
          >
            <option value="ALL">Toutes les dates</option>
            <option value="TODAY">Aujourd'hui</option>
            <option value="WEEK">7 derniers jours</option>
            <option value="MONTH">30 derniers jours</option>
          </select>
        </div>

        {/* Export Button */}
        <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
          <button
            onClick={exportToCSV}
            disabled={logs.length === 0}
            className="px-3.5 py-2 bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer shadow-2xs"
            title="Exporter l'historique en fichier CSV"
          >
            <Download size={13} className="text-neutral-500" />
            <span>Exporter CSV</span>
          </button>
        </div>
      </div>

      {/* ACTIVITY LOG TABLE */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="py-24 text-center text-neutral-400 flex flex-col items-center justify-center gap-2.5">
            <div className="w-7 h-7 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-medium text-neutral-500">Chargement du journal d'activité...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-20 text-center text-neutral-400 flex flex-col items-center justify-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-400">
              <History size={20} />
            </div>
            <p className="text-sm font-semibold text-neutral-800">Aucun enregistrement d'activité trouvé</p>
            <p className="text-xs text-neutral-500 max-w-sm">
              Essayez de réinitialiser vos filtres ou effectuez une autre recherche.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200 text-[11px] font-semibold text-neutral-600 uppercase tracking-wider">
                  <th className="py-3 px-4 sm:px-5">Date & Heure</th>
                  <th className="py-3 px-4">Utilisateur</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Catégorie</th>
                  <th className="py-3 px-4">Description de l'action</th>
                  <th className="py-3 px-4 text-right">Détails</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-xs text-neutral-700">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-neutral-50/60 transition-colors">
                    {/* Date */}
                    <td className="py-3 px-4 sm:px-5 whitespace-nowrap">
                      <div className="font-semibold text-neutral-900">{getRelativeTime(log.createdAt)}</div>
                      <div className="text-[11px] text-neutral-400">{formatDate(log.createdAt)}</div>
                    </td>

                    {/* User */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-neutral-900 text-white flex items-center justify-center text-[10px] font-bold overflow-hidden shrink-0">
                          {log.user?.avatar ? (
                            <img src={log.user.avatar} alt={log.userName} className="w-full h-full object-cover" />
                          ) : (
                            <span>{getInitials(log.userName)}</span>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-neutral-900 leading-tight">{log.userName}</div>
                          <div className="text-[10px] text-neutral-400 leading-tight">
                            {log.userEmail || (log.userId ? 'Collaborateur' : 'Système NAY')}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Action Badge */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {getActionBadge(log.action)}
                    </td>

                    {/* Entity */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-medium text-neutral-600">
                        {getEntityIcon(log.entityType)}
                        <span className="capitalize text-[11px]">{log.entityType.toLowerCase()}</span>
                      </div>
                    </td>

                    {/* Description */}
                    <td className="py-3 px-4 max-w-md">
                      <p className="font-normal text-neutral-800 line-clamp-2">
                        {log.description}
                      </p>
                    </td>

                    {/* Actions / View Details */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="p-1.5 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
                        title="Voir les détails complets"
                      >
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-3.5 border-t border-neutral-200 flex items-center justify-between text-xs text-neutral-500 bg-neutral-50/50">
            <div>
              Affichage de la page <strong className="text-neutral-800">{page}</strong> sur{' '}
              <strong className="text-neutral-800">{totalPages}</strong> ({totalLogs} événements au total)
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 disabled:opacity-40 transition-colors cursor-pointer flex items-center gap-1 text-neutral-700 font-medium"
              >
                <ChevronLeft size={13} />
                <span>Précédent</span>
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 disabled:opacity-40 transition-colors cursor-pointer flex items-center gap-1 text-neutral-700 font-medium"
              >
                <span>Suivant</span>
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* DETAIL MODAL */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-neutral-950/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-neutral-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-neutral-100 text-neutral-800 flex items-center justify-center">
                  <FileText size={16} />
                </div>
                <h3 className="font-semibold text-neutral-900 text-base">Détails de l'événement</h3>
              </div>

              <button
                onClick={() => setSelectedLog(null)}
                className="p-1 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-neutral-50 p-3.5 rounded-xl border border-neutral-200/60">
                <div>
                  <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Auteur</span>
                  <span className="font-semibold text-neutral-800 text-sm">{selectedLog.userName}</span>
                  <span className="text-neutral-500 block text-[11px]">{selectedLog.userEmail || '—'}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Horodatage</span>
                  <span className="font-medium text-neutral-800">{formatDate(selectedLog.createdAt)}</span>
                  <span className="text-neutral-500 block text-[11px]">{getRelativeTime(selectedLog.createdAt)}</span>
                </div>
              </div>

              <div>
                <span className="text-neutral-500 block text-[10px] uppercase font-semibold mb-1">Description</span>
                <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200/60 font-medium text-neutral-800">
                  {selectedLog.description}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-neutral-500 block text-[10px] uppercase font-semibold mb-1">Action</span>
                  <span className="font-mono bg-neutral-100 px-2.5 py-1 rounded text-neutral-800 text-[11px] inline-block font-medium">
                    {selectedLog.action}
                  </span>
                </div>

                <div>
                  <span className="text-neutral-500 block text-[10px] uppercase font-semibold mb-1">Adresse IP</span>
                  <span className="font-mono bg-neutral-100 px-2.5 py-1 rounded text-neutral-800 text-[11px] inline-block">
                    {selectedLog.ipAddress || 'Non enregistrée'}
                  </span>
                </div>
              </div>

              {selectedLog.oldValue && (
                <div>
                  <span className="text-neutral-500 block text-[10px] uppercase font-semibold mb-1">Ancienne valeur</span>
                  <pre className="p-3 bg-neutral-900 text-neutral-200 rounded-lg text-[11px] font-mono overflow-x-auto max-h-36">
                    {typeof selectedLog.oldValue === 'string' && selectedLog.oldValue.startsWith('{')
                      ? JSON.stringify(JSON.parse(selectedLog.oldValue), null, 2)
                      : selectedLog.oldValue}
                  </pre>
                </div>
              )}

              {selectedLog.newValue && (
                <div>
                  <span className="text-neutral-500 block text-[10px] uppercase font-semibold mb-1">Nouvelle valeur</span>
                  <pre className="p-3 bg-neutral-900 text-neutral-200 rounded-lg text-[11px] font-mono overflow-x-auto max-h-36">
                    {typeof selectedLog.newValue === 'string' && selectedLog.newValue.startsWith('{')
                      ? JSON.stringify(JSON.parse(selectedLog.newValue), null, 2)
                      : selectedLog.newValue}
                  </pre>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-neutral-100 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-medium rounded-lg text-xs transition-colors cursor-pointer"
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
