'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  ChevronDown,
  X,
  Printer,
  PackageOpen,
  CreditCard,
  Truck,
  RefreshCw,
  ShoppingBag,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Phone,
  MessageCircle,
  MapPin,
  ExternalLink,
  Copy,
  Check,
  Eye,
  Calendar,
  Filter,
  Download,
  Sparkles,
  Layers,
  ArrowUpRight,
  TrendingUp,
  User,
  Package
} from 'lucide-react';
import OrderTimelineStepper from '@/components/OrderTimelineStepper';
import OrderTimelineFull from '@/components/OrderTimelineFull';

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'refused' | 'returned' | 'unconfirmed';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  size?: string;
  sku?: string;
  image?: string;
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'En attente',
  unconfirmed: 'Non confirmé',
  processing: 'En préparation',
  shipped: 'En livraison',
  delivered: 'Livrée & Encaissée',
  refused: 'Refusée',
  returned: 'Retour',
};

const STATUS_CLASSES: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  pending: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200', dot: 'bg-slate-400' },
  unconfirmed: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200', dot: 'bg-amber-500' },
  processing: { bg: 'bg-sky-50', text: 'text-[#0284c7]', border: 'border-sky-200', dot: 'bg-[#1D9BF0]' },
  shipped: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', dot: 'bg-indigo-500' },
  delivered: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  refused: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', dot: 'bg-rose-500' },
  returned: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', dot: 'bg-rose-500' },
};

const formatMAD = (amount: number) => {
  return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 }).format(amount);
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [editingOrder, setEditingOrder] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [cityFilter, setCityFilter] = useState<string>('ALL');
  const [copiedRef, setCopiedRef] = useState<string | null>(null);

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch('/api/admin/auth/me');
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
      }
    } catch (e) {
      console.error('Failed to fetch current user:', e);
    }
  };

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
        if (editingOrder) {
          const updatedCurrent = data.find((o: any) => o.id === editingOrder.id);
          if (updatedCurrent) setEditingOrder(updatedCurrent);
        }
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchCurrentUser();
  }, []);

  const handleStatusChange = async (
    orderId: string,
    newStatus: string,
    options?: { carrier?: string; trackingNumber?: string; customNote?: string; actorNameOverride?: string }
  ) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );

    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: orderId,
          status: newStatus,
          carrier: options?.carrier,
          trackingNumber: options?.trackingNumber,
          customNote: options?.customNote,
          actorNameOverride: options?.actorNameOverride || currentUser?.name,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
        if (editingOrder && editingOrder.id === orderId) {
          setEditingOrder(updated);
        }
      }
    } catch (err) {
      console.error('Failed to update order status:', err);
    }
  };

  const handleAddTimelineNote = async (note: string, type: string = 'NOTE') => {
    if (!editingOrder) return;
    try {
      const res = await fetch(`/api/admin/orders/${editingOrder.id}/timeline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: type,
          title: type === 'CALL_ATTEMPT' ? 'Tentative d\'appel' : 'Note interne',
          description: note,
          actorNameOverride: currentUser?.name || 'Admin NAY',
        }),
      });

      if (res.ok) {
        await fetchOrders();
      }
    } catch (e) {
      console.error('Failed to add timeline note:', e);
    }
  };

  const handleAddAttachment = async (data: { attachmentUrl: string; attachmentName: string; attachmentType: string; description?: string }) => {
    if (!editingOrder) return;
    try {
      const res = await fetch(`/api/admin/orders/${editingOrder.id}/attachment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attachmentUrl: data.attachmentUrl,
          attachmentName: data.attachmentName,
          attachmentType: data.attachmentType,
          description: data.description,
          actorNameOverride: currentUser?.name || 'Admin NAY',
        }),
      });

      if (res.ok) {
        await fetchOrders();
      }
    } catch (e) {
      console.error('Failed to add attachment:', e);
    }
  };

  const getParsedItems = (itemsString: string): OrderItem[] => {
    try {
      return JSON.parse(itemsString || '[]');
    } catch {
      return [];
    }
  };

  const handleCopyRef = (ref: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(ref);
    setCopiedRef(ref);
    setTimeout(() => setCopiedRef(null), 2000);
  };

  // Extract unique cities
  const uniqueCities = useMemo(() => {
    const set = new Set<string>();
    orders.forEach((o) => {
      if (o.shippingCity && o.shippingCity.trim()) {
        set.add(o.shippingCity.trim());
      }
    });
    return Array.from(set).sort();
  }, [orders]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o: any) => {
      const matchesSearch =
        o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
        o.customerName.toLowerCase().includes(search.toLowerCase()) ||
        (o.shippingCity && o.shippingCity.toLowerCase().includes(search.toLowerCase())) ||
        (o.customerPhone && o.customerPhone.includes(search));

      if (!matchesSearch) return false;

      if (cityFilter !== 'ALL' && o.shippingCity !== cityFilter) {
        return false;
      }

      if (activeTab === 'ALL') return true;
      if (activeTab === 'PENDING') return o.status === 'pending' || o.status === 'unconfirmed';
      if (activeTab === 'PROCESSING') return o.status === 'processing';
      if (activeTab === 'SHIPPED') return o.status === 'shipped';
      if (activeTab === 'DELIVERED') return o.status === 'delivered';
      if (activeTab === 'ISSUES') return o.status === 'refused' || o.status === 'returned';

      return true;
    });
  }, [orders, search, activeTab, cityFilter]);

  // Tab counts
  const tabCounts = useMemo(() => {
    return {
      ALL: orders.length,
      PENDING: orders.filter((o) => o.status === 'pending' || o.status === 'unconfirmed').length,
      PROCESSING: orders.filter((o) => o.status === 'processing').length,
      SHIPPED: orders.filter((o) => o.status === 'shipped').length,
      DELIVERED: orders.filter((o) => o.status === 'delivered').length,
      ISSUES: orders.filter((o) => o.status === 'refused' || o.status === 'returned').length,
    };
  }, [orders]);

  // Key Metrics
  const totalRevenue = useMemo(() => orders.reduce((acc, o) => acc + (Number(o.total) || 0), 0), [orders]);
  const deliveredRevenue = useMemo(() => orders.filter(o => o.status === 'delivered').reduce((acc, o) => acc + (Number(o.total) || 0), 0), [orders]);
  const deliverySuccessRate = tabCounts.ALL > 0 ? ((tabCounts.DELIVERED / tabCounts.ALL) * 100).toFixed(1) : '0';

  // Format WhatsApp Link
  const getWhatsAppLink = (phone: string, customerName: string, orderNumber: string) => {
    let cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '212' + cleanPhone.substring(1);
    }
    const message = encodeURIComponent(`Bonjour ${customerName}, concernant votre commande NAY Parfums #${orderNumber}...`);
    return `https://wa.me/${cleanPhone}?text=${message}`;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/90 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-100/70 text-[#0284c7] border border-sky-200">
              Logistique & Ventes
            </span>
            <span className="text-xs text-slate-400 font-medium">Maison NAY</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <ShoppingBag size={22} className="text-[#1D9BF0]" />
            <span>Gestion des Commandes & Expéditions</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Suivi en direct des confirmations, de l'emballage, des livraisons et des encaissements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchOrders}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs transition-all cursor-pointer"
          >
            <RefreshCw size={14} className={`text-slate-500 ${isLoading ? 'animate-spin text-[#1D9BF0]' : ''}`} />
            <span>Actualiser</span>
          </button>
        </div>
      </div>

      {/* Real-time KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Orders */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-sky-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Volume Global</span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-[#1D9BF0] flex items-center justify-center">
              <ShoppingBag size={16} />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{orders.length}</div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">Total: {formatMAD(totalRevenue)}</div>
        </div>

        {/* To Confirm / Pending */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-amber-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">À Confirmer & Préparer</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock size={16} />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-600 mt-2">{tabCounts.PENDING + tabCounts.PROCESSING}</div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">{tabCounts.PENDING} en attente • {tabCounts.PROCESSING} en atelier</div>
        </div>

        {/* In Delivery */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-indigo-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">En Cours de Livraison</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Truck size={16} />
            </div>
          </div>
          <div className="text-2xl font-bold text-indigo-600 mt-2">{tabCounts.SHIPPED}</div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">Colis avec transporteurs (Amana...)</div>
        </div>

        {/* Delivered Success Rate */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Livrées & Encaissées</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-600 mt-2">{tabCounts.DELIVERED}</div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">CA Livré: {formatMAD(deliveredRevenue)} ({deliverySuccessRate}%)</div>
        </div>

      </div>

      {/* Filter Tabs Bar with Status Colors */}
      <div className="bg-white p-1.5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-1 overflow-x-auto custom-scrollbar">
        {[
          { id: 'ALL', label: 'Toutes', count: tabCounts.ALL, color: 'text-slate-700', activeBg: 'bg-slate-900 text-white' },
          { id: 'PENDING', label: 'À Confirmer', count: tabCounts.PENDING, color: 'text-amber-600', activeBg: 'bg-amber-500 text-white' },
          { id: 'PROCESSING', label: 'En Préparation', count: tabCounts.PROCESSING, color: 'text-[#1D9BF0]', activeBg: 'bg-[#1D9BF0] text-white' },
          { id: 'SHIPPED', label: 'En Livraison', count: tabCounts.SHIPPED, color: 'text-indigo-600', activeBg: 'bg-indigo-600 text-white' },
          { id: 'DELIVERED', label: 'Livrées & Encaissées', count: tabCounts.DELIVERED, color: 'text-emerald-600', activeBg: 'bg-emerald-600 text-white' },
          { id: 'ISSUES', label: 'Refus & Retours', count: tabCounts.ISSUES, color: 'text-rose-600', activeBg: 'bg-rose-600 text-white' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === tab.id
                ? `${tab.activeBg} shadow-2xs`
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold ${
              activeTab === tab.id
                ? 'bg-white/20 text-white'
                : 'bg-slate-100 text-slate-600'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search & City Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs">
        
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par n° commande, nom client, ville, téléphone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-8 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#1D9BF0] focus:ring-2 focus:ring-[#1D9BF0]/15 transition-all font-medium"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* City Filter */}
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-slate-400 shrink-0" />
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="text-xs bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:bg-white focus:outline-none focus:border-[#1D9BF0] cursor-pointer font-medium"
          >
            <option value="ALL">Toutes les villes ({uniqueCities.length})</option>
            {uniqueCities.map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>

      </div>

      {/* Orders Table Container */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            
            {/* Table Header */}
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-[11px] uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-5 py-3.5">Référence & Date</th>
                <th className="px-5 py-3.5">Client & Contact</th>
                <th className="px-5 py-3.5">Ville & Destination</th>
                <th className="px-5 py-3.5">Articles</th>
                <th className="px-5 py-3.5">Étape & Avancement</th>
                <th className="px-5 py-3.5">Total TTC</th>
                <th className="px-5 py-3.5">Statut</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw size={20} className="animate-spin text-[#1D9BF0]" />
                      <span className="text-xs font-medium">Chargement des commandes...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <ShoppingBag size={28} className="text-slate-300" />
                      <span className="font-semibold text-slate-700 text-sm">Aucune commande trouvée</span>
                      <p className="text-xs text-slate-400 max-w-sm">
                        Modifiez votre recherche ou vos filtres pour afficher des résultats.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const parsedItems = getParsedItems(order.items);
                  const itemsCount = parsedItems.reduce((acc: number, item: any) => acc + (item.quantity || 1), 0);
                  const formattedDate = new Date(order.createdAt).toLocaleDateString('fr-MA', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  const stConfig = STATUS_CLASSES[order.status] || STATUS_CLASSES.pending;

                  return (
                    <tr
                      key={order.id}
                      onClick={() => setEditingOrder(order)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      
                      {/* Ref & Date */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-slate-900 group-hover:text-[#1D9BF0] transition-colors">
                            {order.orderNumber}
                          </span>
                          <button
                            onClick={(e) => handleCopyRef(order.orderNumber, e)}
                            className="p-1 text-slate-300 hover:text-slate-600 rounded hover:bg-slate-100 transition-colors opacity-0 group-hover:opacity-100"
                            title="Copier la référence"
                          >
                            {copiedRef === order.orderNumber ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                          </button>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {formattedDate}
                        </div>
                      </td>

                      {/* Customer with Quick WhatsApp Button */}
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                          <span>{order.customerName}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                          {order.customerPhone ? (
                            <>
                              <span className="font-mono">{order.customerPhone}</span>
                              <a
                                href={getWhatsAppLink(order.customerPhone, order.customerName, order.orderNumber)}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-600 hover:text-white transition-all text-[10px] font-semibold"
                                title="Contacter sur WhatsApp"
                              >
                                <MessageCircle size={11} />
                                <span>WhatsApp</span>
                              </a>
                            </>
                          ) : (
                            <span className="italic text-slate-400">Sans téléphone</span>
                          )}
                        </div>
                      </td>

                      {/* City */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100/80 border border-slate-200/70 text-slate-700 font-semibold text-xs">
                          <MapPin size={11} className="text-[#1D9BF0]" />
                          <span>{order.shippingCity || 'Casablanca'}</span>
                        </div>
                      </td>

                      {/* Items */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                          <Package size={13} className="text-slate-400" />
                          <span>{itemsCount} article(s)</span>
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[140px] mt-0.5">
                          {parsedItems.map(i => i.name).join(', ') || 'Fragrance NAY'}
                        </div>
                      </td>

                      {/* Timeline / Progress Bar */}
                      <td className="px-5 py-3.5">
                        <OrderTimelineStepper
                          status={order.status}
                          timeline={order.timeline || []}
                          compact={true}
                        />
                      </td>

                      {/* Total */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="font-bold text-slate-900 text-xs">
                          {formatMAD(order.total)}
                        </div>
                        <div className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 mt-0.5">
                          <span>Paiement à la livraison</span>
                        </div>
                      </td>

                      {/* Status Dropdown */}
                      <td className="px-5 py-3.5 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="relative inline-block w-[140px]">
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            className={`w-full appearance-none pl-2.5 pr-6 py-1.5 rounded-xl text-[11px] font-bold border cursor-pointer focus:outline-none transition-all ${stConfig.bg} ${stConfig.text} ${stConfig.border}`}
                          >
                            {Object.keys(STATUS_LABELS).map((status) => (
                              <option key={status} value={status}>
                                {STATUS_LABELS[status]}
                              </option>
                            ))}
                          </select>
                          <ChevronDown
                            size={12}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-60"
                          />
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <button
                          onClick={() => setEditingOrder(order)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-[#1D9BF0] text-[#0284c7] hover:text-white border border-sky-200 transition-all font-semibold text-xs cursor-pointer"
                        >
                          <Eye size={12} />
                          <span>Détails</span>
                        </button>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details & Timeline Drawer Modal */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setEditingOrder(null)}
          />

          <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
            
            {/* Drawer Header */}
            <div className="px-6 py-4 border-b border-slate-200/90 flex items-center justify-between bg-slate-50/50">
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-lg font-bold text-slate-900 font-mono">
                    #{editingOrder.orderNumber}
                  </h2>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                    STATUS_CLASSES[editingOrder.status]?.bg || 'bg-slate-100'
                  } ${STATUS_CLASSES[editingOrder.status]?.text || 'text-slate-700'} ${
                    STATUS_CLASSES[editingOrder.status]?.border || 'border-slate-200'
                  }`}>
                    {STATUS_LABELS[editingOrder.status] || editingOrder.status}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                  {new Date(editingOrder.createdAt).toLocaleDateString('fr-MA', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`/invoice/${editingOrder.orderNumber}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors"
                  title="Imprimer la facture"
                >
                  <Printer size={16} />
                </a>
                <button
                  onClick={() => setEditingOrder(null)}
                  className="p-2 text-slate-400 hover:text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Drawer Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              
              {/* Timeline Full Stepper */}
              <OrderTimelineFull
                order={editingOrder}
                currentUser={currentUser}
                onUpdateStatus={async (newStatus, options) => {
                  await handleStatusChange(editingOrder.id, newStatus, options);
                }}
                onAddNote={handleAddTimelineNote}
                onAddAttachment={handleAddAttachment}
              />

              {/* Client & Shipping Info Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                
                {/* Client Card */}
                <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-2">
                  <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
                    <User size={13} className="text-[#1D9BF0]" />
                    <span>Client</span>
                  </div>
                  <div className="font-bold text-slate-900 text-sm">{editingOrder.customerName}</div>
                  
                  {editingOrder.customerPhone && (
                    <div className="flex items-center gap-2 pt-1">
                      <span className="font-mono text-slate-600">{editingOrder.customerPhone}</span>
                      <a
                        href={getWhatsAppLink(editingOrder.customerPhone, editingOrder.customerName, editingOrder.orderNumber)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500 text-white text-[11px] font-semibold hover:bg-emerald-600 transition-colors"
                      >
                        <MessageCircle size={12} />
                        <span>WhatsApp</span>
                      </a>
                    </div>
                  )}
                  {editingOrder.customerEmail && (
                    <div className="text-slate-500 text-[11px]">{editingOrder.customerEmail}</div>
                  )}
                </div>

                {/* Delivery Card */}
                <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-2">
                  <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
                    <MapPin size={13} className="text-[#1D9BF0]" />
                    <span>Destination</span>
                  </div>
                  <div className="font-bold text-slate-900 text-sm">{editingOrder.shippingCity || 'Casablanca'}</div>
                  <div className="text-slate-600 leading-relaxed font-normal">{editingOrder.shippingAddress || 'Adresse client'}</div>
                </div>

              </div>

              {/* Items List */}
              <div className="pt-4 border-t border-slate-100">
                <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold mb-3 flex items-center gap-1.5">
                  <Package size={13} className="text-[#1D9BF0]" />
                  <span>Articles Commandés</span>
                </div>
                <div className="space-y-2">
                  {getParsedItems(editingOrder.items).map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 border border-slate-200/60">
                      <div>
                        <div className="font-semibold text-slate-900 text-xs">{item.name}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {item.size ? `Format: ${item.size} • ` : ''}Quantité: {item.quantity}
                        </div>
                      </div>
                      <div className="font-bold text-slate-900 text-xs">
                        {formatMAD((item.price || 0) * (item.quantity || 1))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Summary */}
              <div className="p-4 rounded-2xl bg-slate-900 text-white flex justify-between items-center shadow-lg shadow-slate-900/10">
                <div>
                  <span className="text-xs text-slate-400">Total à encaisser à la livraison (COD)</span>
                  <p className="text-lg font-bold text-white mt-0.5">{formatMAD(editingOrder.total)}</p>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
                  Paiement Cash
                </span>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
