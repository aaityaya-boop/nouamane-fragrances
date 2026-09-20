'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Bell, 
  ShoppingBag, 
  AlertTriangle, 
  CheckSquare, 
  MessageSquare, 
  Info, 
  Check, 
  Trash2, 
  RefreshCw, 
  Search, 
  ExternalLink, 
  Clock, 
  Sparkles,
  Filter,
  CheckCircle2,
  Package,
  ArrowRight
} from 'lucide-react';

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string | null;
  isRead: boolean;
  metadata?: string | null;
  createdAt: string;
}

export default function AdminNotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('limit', '50');
      if (activeTab === 'UNREAD') {
        params.set('unreadOnly', 'true');
      } else if (activeTab !== 'ALL') {
        params.set('type', activeTab);
      }

      const res = await fetch(`/api/admin/notifications?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setNotifications(data.notifications || []);
          setUnreadCount(data.unreadCount || 0);
        }
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAllAsRead = async () => {
    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true }),
      });
      if (res.ok) {
        setUnreadCount(0);
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      }
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  };

  const markSingleAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      await fetch('/api/admin/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const deleteSingle = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      await fetch('/api/admin/notifications', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const clearAllRead = async () => {
    if (!window.confirm('Voulez-vous supprimer toutes les notifications déjà lues ?')) return;
    try {
      setNotifications((prev) => prev.filter((n) => !n.isRead));
      await fetch('/api/admin/notifications', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clearRead: true }),
      });
    } catch (err) {
      console.error('Failed to clear read notifications:', err);
    }
  };

  const handleRowClick = (notif: NotificationItem) => {
    if (!notif.isRead) {
      fetch('/api/admin/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: notif.id }),
      }).catch(() => {});
    }
    if (notif.link) {
      router.push(notif.link);
    }
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'ORDER':
        return <ShoppingBag size={18} className="text-emerald-500" />;
      case 'STOCK':
        return <AlertTriangle size={18} className="text-amber-500" />;
      case 'TASK':
        return <CheckSquare size={18} className="text-sky-500" />;
      case 'MESSAGE':
        return <MessageSquare size={18} className="text-purple-500" />;
      default:
        return <Info size={18} className="text-slate-400" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'ORDER':
        return 'Commande';
      case 'STOCK':
        return 'Alerte Stock';
      case 'TASK':
        return 'Mission / Tâche';
      case 'MESSAGE':
        return 'Message Équipe';
      default:
        return 'Système';
    }
  };

  const getRelativeTime = (dateStr: string) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "À l'instant";
    if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)} h`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  const filteredNotifications = notifications.filter((n) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      n.title.toLowerCase().includes(q) ||
      n.message.toLowerCase().includes(q) ||
      n.type.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#0ea5e9]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-[#0ea5e9] to-blue-600 text-white flex items-center justify-center shadow-lg shadow-sky-500/30 ring-4 ring-white/10 shrink-0">
              <Bell size={30} />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-widest bg-[#0ea5e9]/20 text-[#38bdf8] border border-[#0ea5e9]/30">
                  Centre d'Alertes
                </span>
                {unreadCount > 0 && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-red-400 font-bold bg-red-500/20 px-2.5 py-0.5 rounded-full border border-red-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"></span>
                    {unreadCount} alerte{unreadCount > 1 ? 's' : ''} en attente
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Notifications du Projet
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                Restez informés en temps réel de l'état des stocks, des nouvelles commandes et des missions de l'équipe.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer backdrop-blur-sm"
              >
                <Check size={14} />
                <span>Tout marquer comme lu</span>
              </button>
            )}

            <button
              onClick={() => fetchNotifications()}
              className="p-2.5 bg-[#0ea5e9] hover:bg-sky-600 text-white rounded-xl transition-all shadow-md shadow-sky-500/20 cursor-pointer"
              title="Actualiser"
            >
              <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Category Tabs in Header */}
        <div className="flex items-center gap-2 mt-8 pt-6 border-t border-white/10 overflow-x-auto custom-scrollbar">
          {[
            { id: 'ALL', label: 'Toutes', count: notifications.length },
            { id: 'UNREAD', label: 'Non lues', count: unreadCount },
            { id: 'ORDER', label: 'Commandes' },
            { id: 'STOCK', label: 'Alertes Stock' },
            { id: 'TASK', label: 'Missions' },
            { id: 'MESSAGE', label: 'Messages' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'bg-[#0ea5e9] text-white shadow-lg shadow-sky-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className="px-1.5 py-0.2 bg-white/20 rounded-full text-[10px] font-bold">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Filter & Actions Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search size={15} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher dans les notifications..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#0ea5e9]"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <button
            onClick={clearAllRead}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Trash2 size={13} />
            <span>Effacer les lues</span>
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-24 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-[#0ea5e9] border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-medium">Chargement des notifications...</span>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="py-24 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
              <Bell size={24} />
            </div>
            <p className="text-sm font-semibold text-slate-700">Aucune notification à afficher</p>
            <p className="text-xs text-slate-400 max-w-sm">
              Vous recevrez ici des alertes instantanées pour les commandes, les ruptures de stock et les missions.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleRowClick(notif)}
                className={`p-4 sm:p-5 flex items-start sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors cursor-pointer group ${
                  !notif.isRead ? 'bg-sky-50/40' : ''
                }`}
              >
                <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                    {getNotifIcon(notif.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded-md text-[10px] uppercase font-bold tracking-wider bg-slate-100 text-slate-600">
                        {getTypeLabel(notif.type)}
                      </span>
                      <h4 className={`text-sm font-bold truncate ${!notif.isRead ? 'text-slate-900' : 'text-slate-700'}`}>
                        {notif.title}
                      </h4>
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-[#0ea5e9] shrink-0" />
                      )}
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed">
                      {notif.message}
                    </p>

                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                      <Clock size={11} />
                      <span>{getRelativeTime(notif.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {notif.link && (
                    <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-[#0ea5e9] group-hover:translate-x-1 transition-transform">
                      <span>Voir</span>
                      <ArrowRight size={13} />
                    </span>
                  )}

                  {!notif.isRead && (
                    <button
                      onClick={(e) => markSingleAsRead(notif.id, e)}
                      className="p-2 text-slate-400 hover:text-[#0ea5e9] hover:bg-sky-50 rounded-xl transition-colors cursor-pointer"
                      title="Marquer comme lu"
                    >
                      <Check size={16} />
                    </button>
                  )}

                  <button
                    onClick={(e) => deleteSingle(notif.id, e)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                    title="Supprimer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
