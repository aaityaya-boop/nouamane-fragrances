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

  // Auto-refresh interval toggle
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
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setLogs(data.logs || []);
          setStats(data.stats || null);
          setUsers(data.users || []);
          setTotalPages(data.pagination.totalPages || 1);
          setTotalLogs(data.pagination.total || 0);
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
        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
          Création
        </span>
      );
    }
    if (action.includes('UPDATE') || action.includes('EDIT') || action.includes('PATCH')) {
      return (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-50 text-[#0ea5e9] border border-sky-200">
          Modification
        </span>
      );
    }
    if (action.includes('DELETE') || action.includes('REMOVE')) {
      return (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-700 border border-red-200">
          Suppression
        </span>
      );
    }
    if (action.includes('LOGIN')) {
      return (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
          Connexion
        </span>
      );
    }
    if (action.includes('TASK')) {
      return (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
          Mission / Tâche
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
        {action}
      </span>
    );
  };

  const getEntityIcon = (entityType: string) => {
    switch (entityType) {
      case 'PRODUCT':
        return <Package size={14} className="text-purple-500" />;
      case 'ORDER':
        return <ShoppingBag size={14} className="text-emerald-500" />;
      case 'TASK':
        return <CheckSquare size={14} className="text-amber-500" />;
      case 'REVIEW':
        return <Star size={14} className="text-amber-400" />;
      case 'CUSTOMER':
        return <Users size={14} className="text-blue-500" />;
      case 'AUTH':
      case 'USER':
        return <ShieldCheck size={14} className="text-indigo-500" />;
      default:
        return <Layers size={14} className="text-slate-400" />;
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#0ea5e9]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-[#0ea5e9] to-blue-600 text-white flex items-center justify-center shadow-lg shadow-sky-500/30 ring-4 ring-white/10 shrink-0">
              <History size={30} />
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-widest bg-[#0ea5e9]/20 text-[#38bdf8] border border-[#0ea5e9]/30">
                  Audit & Traçabilité
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  En Direct
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Journal d'Activité Global
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                Suivez en temps réel toutes les actions réalisées par chaque propriétaire et administrateur sur NAY Workspace.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                autoRefresh 
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' 
                  : 'bg-white/10 text-slate-300 hover:text-white hover:bg-white/15'
              }`}
              title="Actualisation automatique toutes les 15s"
            >
              <Activity size={14} className={autoRefresh ? 'animate-pulse' : ''} />
              <span>{autoRefresh ? 'Auto-refresh : ON' : 'Auto-refresh : OFF'}</span>
            </button>

            <button
              onClick={() => fetchActivities(false)}
              className="px-4 py-2.5 bg-[#0ea5e9] hover:bg-sky-600 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-md shadow-sky-500/20 cursor-pointer"
            >
              <RefreshCw size={14} className={isRefreshing || isLoading ? 'animate-spin' : ''} />
              <span>Actualiser</span>
            </button>
          </div>
        </div>

        {/* Quick KPI stats in header */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-8 pt-6 border-t border-white/10">
          <div className="bg-white/5 border border-white/10 p-3.5 sm:p-4 rounded-2xl backdrop-blur-sm">
            <span className="text-[11px] text-slate-400 font-medium block">Total Événements</span>
            <div className="text-xl sm:text-2xl font-bold text-white mt-1">
              {stats?.total ?? '—'}
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 p-3.5 sm:p-4 rounded-2xl backdrop-blur-sm">
            <span className="text-[11px] text-slate-400 font-medium block">Actions Aujourd'hui</span>
            <div className="text-xl sm:text-2xl font-bold text-emerald-400 mt-1">
              {stats?.todayTotal ?? '—'}
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 p-3.5 sm:p-4 rounded-2xl backdrop-blur-sm">
            <span className="text-[11px] text-slate-400 font-medium block">AYOUB AIT YAHYA</span>
            <div className="text-xl sm:text-2xl font-bold text-[#38bdf8] mt-1">
              {stats?.todayByUser.find((u) => u.name.toLowerCase().includes('ayoub'))?.count ?? 0}
              <span className="text-xs text-slate-400 font-normal ml-1">auj.</span>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 p-3.5 sm:p-4 rounded-2xl backdrop-blur-sm">
            <span className="text-[11px] text-slate-400 font-medium block">NOUAMANE AIT YAHYA</span>
            <div className="text-xl sm:text-2xl font-bold text-purple-400 mt-1">
              {stats?.todayByUser.find((u) => u.name.toLowerCase().includes('nouamane'))?.count ?? 0}
              <span className="text-xs text-slate-400 font-normal ml-1">auj.</span>
            </div>
          </div>
        </div>
      </div>

      {/* FILTER CONTROLS BAR */}
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
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Rechercher une action, nom..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#0ea5e9]"
            />
          </div>

          {/* User Filter */}
          <select
            value={selectedUser}
            onChange={(e) => {
              setSelectedUser(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:bg-white focus:outline-none focus:border-[#0ea5e9]"
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
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:bg-white focus:outline-none focus:border-[#0ea5e9]"
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
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:bg-white focus:outline-none focus:border-[#0ea5e9]"
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
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
            title="Exporter l'historique en fichier CSV"
          >
            <Download size={14} />
            <span>Exporter CSV</span>
          </button>
        </div>
      </div>

      {/* ACTIVITY LOG TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-24 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-[#0ea5e9] border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-medium">Chargement du journal d'activité...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-24 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
              <History size={24} />
            </div>
            <p className="text-sm font-semibold text-slate-700">Aucun enregistrement d'activité trouvé</p>
            <p className="text-xs text-slate-400 max-w-sm">
              Essayez de réinitialiser vos filtres ou effectuez une autre recherche.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] uppercase font-bold text-slate-500 tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">Date & Heure</th>
                  <th className="py-3.5 px-4">Utilisateur / Auteur</th>
                  <th className="py-3.5 px-4">Type d'Action</th>
                  <th className="py-3.5 px-4">Catégorie</th>
                  <th className="py-3.5 px-4">Description de l'action</th>
                  <th className="py-3.5 px-4 text-right">Détails</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Date */}
                    <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap">
                      <div className="font-semibold text-slate-900">{getRelativeTime(log.createdAt)}</div>
                      <div className="text-[11px] text-slate-400">{formatDate(log.createdAt)}</div>
                    </td>

                    {/* User */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#0ea5e9] to-blue-600 text-white flex items-center justify-center text-[10px] font-bold overflow-hidden shrink-0 shadow-sm">
                          {log.user?.avatar ? (
                            <img src={log.user.avatar} alt={log.userName} className="w-full h-full object-cover" />
                          ) : (
                            <span>{getInitials(log.userName)}</span>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 leading-tight">{log.userName}</div>
                          <div className="text-[10px] text-slate-400 leading-tight">
                            {log.userEmail || (log.userId ? 'Administrateur' : 'Système NAY')}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Action Badge */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getActionBadge(log.action)}
                    </td>

                    {/* Entity */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-medium text-slate-600">
                        {getEntityIcon(log.entityType)}
                        <span className="capitalize text-[11px]">{log.entityType.toLowerCase()}</span>
                      </div>
                    </td>

                    {/* Description */}
                    <td className="py-3.5 px-4 max-w-md">
                      <p className="font-medium text-slate-800 line-clamp-2">
                        {log.description}
                      </p>
                    </td>

                    {/* Actions / View Details */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="p-1.5 text-slate-400 hover:text-[#0ea5e9] hover:bg-sky-50 rounded-lg transition-colors cursor-pointer"
                        title="Voir les détails complets"
                      >
                        <Eye size={16} />
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
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50">
            <div>
              Affichage de la page <strong className="text-slate-800">{page}</strong> sur{' '}
              <strong className="text-slate-800">{totalPages}</strong> ({totalLogs} événements au total)
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition-colors cursor-pointer flex items-center gap-1"
              >
                <ChevronLeft size={14} />
                <span>Précédent</span>
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition-colors cursor-pointer flex items-center gap-1"
              >
                <span>Suivant</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* DETAIL MODAL */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#0ea5e9]/10 text-[#0ea5e9] flex items-center justify-center">
                  <FileText size={18} />
                </div>
                <h3 className="font-bold text-slate-900 text-base">Détails de l'événement d'activité</h3>
              </div>

              <button
                onClick={() => setSelectedLog(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Auteur</span>
                  <span className="font-bold text-slate-800 text-sm">{selectedLog.userName}</span>
                  <span className="text-slate-500 block text-[11px]">{selectedLog.userEmail || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Horodatage</span>
                  <span className="font-semibold text-slate-800">{formatDate(selectedLog.createdAt)}</span>
                  <span className="text-slate-500 block text-[11px]">{getRelativeTime(selectedLog.createdAt)}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">Description</span>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 font-medium text-slate-800">
                  {selectedLog.description}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">Action</span>
                  <span className="font-mono bg-slate-100 px-2.5 py-1 rounded-lg text-slate-700 text-[11px] inline-block font-semibold">
                    {selectedLog.action}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">Adresse IP</span>
                  <span className="font-mono bg-slate-100 px-2.5 py-1 rounded-lg text-slate-700 text-[11px] inline-block">
                    {selectedLog.ipAddress || 'Non enregistrée'}
                  </span>
                </div>
              </div>

              {selectedLog.oldValue && (
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">Ancienne valeur</span>
                  <pre className="p-3 bg-slate-900 text-slate-200 rounded-xl text-[11px] font-mono overflow-x-auto max-h-36">
                    {typeof selectedLog.oldValue === 'string' && selectedLog.oldValue.startsWith('{')
                      ? JSON.stringify(JSON.parse(selectedLog.oldValue), null, 2)
                      : selectedLog.oldValue}
                  </pre>
                </div>
              )}

              {selectedLog.newValue && (
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">Nouvelle valeur</span>
                  <pre className="p-3 bg-slate-900 text-slate-200 rounded-xl text-[11px] font-mono overflow-x-auto max-h-36">
                    {typeof selectedLog.newValue === 'string' && selectedLog.newValue.startsWith('{')
                      ? JSON.stringify(JSON.parse(selectedLog.newValue), null, 2)
                      : selectedLog.newValue}
                  </pre>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
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
