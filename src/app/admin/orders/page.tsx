'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  ChevronDown,
  X,
  Printer,
  PackageOpen,
  CreditCard,
  Truck,
  Phone,
  Clock,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  UserCheck,
  RefreshCw,
  ExternalLink,
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
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'En attente',
  processing: 'En préparation',
  shipped: 'En livraison',
  delivered: 'Livrée',
  refused: 'Refusée',
  returned: 'Retour',
  unconfirmed: 'Non confirmé',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 ring-amber-500/30 border-amber-200',
  processing: 'bg-indigo-50 text-indigo-700 ring-indigo-500/30 border-indigo-200',
  shipped: 'bg-purple-50 text-purple-700 ring-purple-500/30 border-purple-200',
  delivered: 'bg-emerald-50 text-emerald-700 ring-emerald-500/30 border-emerald-200',
  refused: 'bg-red-50 text-red-700 ring-red-500/30 border-red-200',
  returned: 'bg-gray-100 text-gray-700 ring-gray-500/30 border-gray-300',
  unconfirmed: 'bg-orange-50 text-orange-700 ring-orange-500/30 border-orange-200',
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
        // If an order is currently open in modal, update it with new timeline
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
    // Optimistic UI update
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
          actorNameOverride: currentUser?.name || 'Nouamane Ait Yahya',
        }),
      });

      if (res.ok) {
        // Refresh orders to fetch latest timeline
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
          actorNameOverride: currentUser?.name || 'Nouamane Ait Yahya',
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

  const filteredOrders = orders.filter((o: any) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      (o.shippingCity && o.shippingCity.toLowerCase().includes(search.toLowerCase())) ||
      (o.customerPhone && o.customerPhone.includes(search));

    if (!matchesSearch) return false;

    if (activeTab === 'ALL') return true;
    if (activeTab === 'PENDING') return o.status === 'pending' || o.status === 'unconfirmed';
    if (activeTab === 'PROCESSING') return o.status === 'processing';
    if (activeTab === 'SHIPPED') return o.status === 'shipped';
    if (activeTab === 'DELIVERED') return o.status === 'delivered';
    if (activeTab === 'ISSUES') return o.status === 'refused' || o.status === 'returned';

    return true;
  });

  const tabCounts = {
    ALL: orders.length,
    PENDING: orders.filter((o) => o.status === 'pending' || o.status === 'unconfirmed').length,
    PROCESSING: orders.filter((o) => o.status === 'processing').length,
    SHIPPED: orders.filter((o) => o.status === 'shipped').length,
    DELIVERED: orders.filter((o) => o.status === 'delivered').length,
    ISSUES: orders.filter((o) => o.status === 'refused' || o.status === 'returned').length,
  };

  return (
    <div className="p-4 md:p-8 lg:p-10 max-w-[1700px] mx-auto relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Commandes & Timeline</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-black text-white text-[11px] font-mono font-bold">
              {orders.length} total
            </span>
          </div>
          <p className="text-[14px] text-gray-500">
            Suivi complet en temps réel du parcours de chaque commande NAY (Création → Confirmation → Préparation → Expédition → Livraison).
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-[13px] font-semibold shadow-xs transition-colors"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} /> Actualiser
        </button>
      </div>

      {/* Tabs Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
        {[
          { id: 'ALL', label: 'Toutes les commandes', count: tabCounts.ALL },
          { id: 'PENDING', label: 'En attente de confirmation', count: tabCounts.PENDING, dot: 'bg-amber-400' },
          { id: 'PROCESSING', label: 'En préparation', count: tabCounts.PROCESSING, dot: 'bg-indigo-400' },
          { id: 'SHIPPED', label: 'En livraison / Expédiées', count: tabCounts.SHIPPED, dot: 'bg-purple-400' },
          { id: 'DELIVERED', label: 'Livrées & Encaissées', count: tabCounts.DELIVERED, dot: 'bg-emerald-500' },
          { id: 'ISSUES', label: 'Refus & Retours', count: tabCounts.ISSUES, dot: 'bg-red-500' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-gray-900 text-white shadow-sm'
                : 'bg-white hover:bg-gray-100 text-gray-600 border border-gray-200'
            }`}
          >
            {tab.dot && <span className={`w-2 h-2 rounded-full ${tab.dot}`} />}
            <span>{tab.label}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-mono ${
                activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between gap-4 bg-white">
          <div className="flex items-center gap-3 flex-1 bg-gray-50 px-3.5 py-2.5 rounded-xl border border-gray-200">
            <Search size={16} className="text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par Référence (NF-...), Nom du client, Téléphone, Ville..."
              className="flex-1 bg-transparent border-none focus:outline-none text-[13px] text-gray-900 placeholder:text-gray-400 font-medium"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-gray-400 hover:text-gray-600">
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/80 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Commande</th>
                <th className="px-6 py-3.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Client & Ville</th>
                <th className="px-6 py-3.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Timeline / Parcours</th>
                <th className="px-6 py-3.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Montant</th>
                <th className="px-6 py-3.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-gray-500 text-[13px]">
                    <RefreshCw className="animate-spin inline-block mr-2" size={16} /> Chargement des commandes NAY...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-gray-500 text-[13px]">
                    Aucune commande trouvée pour ces critères.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const parsedItems = getParsedItems(order.items);
                  const itemsCount = parsedItems.reduce((acc: number, item: any) => acc + item.quantity, 0);
                  const formattedDate = new Date(order.createdAt).toLocaleDateString('fr-MA', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <tr
                      key={order.id}
                      onClick={() => setEditingOrder(order)}
                      className="hover:bg-gray-50/80 transition-colors cursor-pointer group"
                    >
                      {/* Order Number & Date */}
                      <td className="px-6 py-4">
                        <div className="font-mono text-[13px] font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {order.orderNumber}
                        </div>
                        <div className="text-[11px] text-gray-400 mt-0.5">{formattedDate}</div>
                      </td>

                      {/* Customer */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[12px] font-bold text-gray-700 border border-gray-200">
                            {order.customerName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-[13px] font-bold text-gray-900">{order.customerName}</div>
                            <div className="text-[12px] text-gray-500 mt-0.5 flex items-center gap-1.5">
                              <span>{order.shippingCity}</span>
                              {order.customerPhone && (
                                <span className="text-gray-400 font-mono text-[11px]">
                                  • {order.customerPhone}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Timeline Stepper */}
                      <td className="px-6 py-4 min-w-[340px]">
                        <OrderTimelineStepper
                          status={order.status}
                          timeline={order.timeline || []}
                          compact={true}
                        />
                      </td>

                      {/* Total */}
                      <td className="px-6 py-4">
                        <div className="text-[13px] font-extrabold text-gray-900">{formatMAD(order.total)}</div>
                        <div className="text-[11px] text-gray-500 font-medium">{itemsCount} article(s)</div>
                      </td>

                      {/* Status Dropdown */}
                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        <div className="relative inline-block w-[130px]">
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            className={`w-full appearance-none flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wide cursor-pointer transition-colors border focus:outline-none focus:ring-2 ${
                              STATUS_COLORS[order.status] || STATUS_COLORS.pending
                            }`}
                          >
                            {Object.keys(STATUS_LABELS).map((status) => (
                              <option key={status} value={status}>
                                {STATUS_LABELS[status]}
                              </option>
                            ))}
                          </select>
                          <ChevronDown
                            size={14}
                            className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-60"
                          />
                        </div>
                      </td>

                      {/* Action */}
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setEditingOrder(order)}
                          className="px-3 py-1.5 bg-gray-100 group-hover:bg-gray-900 group-hover:text-white rounded-lg text-[12px] font-semibold text-gray-700 transition-all"
                        >
                          Détails & Timeline
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

      {/* Slide-over Order Details & Full Timeline Drawer */}
      {editingOrder && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setEditingOrder(null)}
          />

          {/* Panel */}
          <div className="relative w-full max-w-3xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-gray-200">
            {/* Drawer Header */}
            <div className="px-8 py-5 border-b border-gray-200 bg-white flex items-center justify-between shrink-0">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                    {editingOrder.orderNumber}
                  </h2>
                  <span
                    className={`px-3 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider border ${
                      STATUS_COLORS[editingOrder.status] || STATUS_COLORS.pending
                    }`}
                  >
                    {STATUS_LABELS[editingOrder.status] || editingOrder.status}
                  </span>
                </div>
                <div className="text-[12px] text-gray-500 mt-1">
                  Commande passée le{' '}
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
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors border border-gray-200"
                  title="Imprimer le bon / Facture"
                >
                  <Printer size={18} />
                </a>
                <button
                  onClick={() => setEditingOrder(null)}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors border border-gray-200"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Drawer Body */}
            <div className="p-8 overflow-y-auto space-y-8 flex-1 bg-gray-50/50">
              {/* TIMELINE & AUDIT TRAIL (CORE FEATURE) */}
              <OrderTimelineFull
                order={editingOrder}
                currentUser={currentUser}
                onUpdateStatus={async (newStatus, options) => {
                  await handleStatusChange(editingOrder.id, newStatus, options);
                }}
                onAddNote={handleAddTimelineNote}
                onAddAttachment={handleAddAttachment}
              />

              {/* Customer & Shipping Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
                  <div className="flex items-center gap-2 text-gray-900 font-bold mb-3 text-[13px] uppercase tracking-wider">
                    <CreditCard size={16} className="text-[#0ea5e9]" /> Coordonnées Client
                  </div>
                  <div className="space-y-1.5 text-[13px] text-gray-800">
                    <p className="font-bold text-[14px] text-gray-900">{editingOrder.customerName}</p>
                    <p className="text-gray-600">{editingOrder.customerEmail || 'Aucun email renseigné'}</p>
                    <p className="text-gray-900 font-mono font-semibold">
                      {editingOrder.customerPhone || 'Aucun téléphone'}
                    </p>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
                  <div className="flex items-center gap-2 text-gray-900 font-bold mb-3 text-[13px] uppercase tracking-wider">
                    <Truck size={16} className="text-purple-600" /> Adresse de Livraison
                  </div>
                  <div className="space-y-1.5 text-[13px] text-gray-800">
                    <p className="font-bold text-gray-900">{editingOrder.shippingCity}</p>
                    <p className="text-gray-600 leading-relaxed">{editingOrder.shippingAddress}</p>
                    {editingOrder.shippingPostalCode && (
                      <p className="text-gray-400 font-mono text-[11px]">{editingOrder.shippingPostalCode}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Ordered Items */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-white flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-900 font-bold text-[13px] uppercase tracking-wider">
                    <PackageOpen size={16} className="text-amber-500" /> Articles commandés
                  </div>
                </div>
                <table className="w-full text-left">
                  <thead className="bg-gray-50/80 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-[11px] font-bold tracking-wider uppercase text-gray-500">Produit</th>
                      <th className="px-6 py-3 text-[11px] font-bold tracking-wider uppercase text-gray-500 text-center">Qté</th>
                      <th className="px-6 py-3 text-[11px] font-bold tracking-wider uppercase text-gray-500 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {getParsedItems(editingOrder.items).map((item, idx) => (
                      <tr key={idx}>
                        <td className="px-6 py-3.5">
                          <div className="text-[13px] font-bold text-gray-900">{item.name}</div>
                          <div className="text-[11px] text-gray-500 mt-0.5">
                            {item.size} {item.sku && `• Réf: ${item.sku}`}
                          </div>
                        </td>
                        <td className="px-6 py-3.5 text-[13px] font-semibold text-center text-gray-900">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-3.5 text-[13px] font-bold text-right text-gray-900">
                          {formatMAD(item.price * item.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Payment Summary */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
                <h3 className="text-[12px] font-bold text-gray-900 mb-3 uppercase tracking-wider">Récapitulatif financier</h3>
                <div className="space-y-2.5 text-[13px]">
                  <div className="flex justify-between text-gray-600">
                    <span>Sous-total</span>
                    <span className="font-semibold text-gray-900">{formatMAD(editingOrder.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Frais de livraison</span>
                    <span className="font-semibold text-gray-900">{formatMAD(editingOrder.shippingCost)}</span>
                  </div>
                  {editingOrder.discount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Remise appliquée</span>
                      <span className="font-semibold">-{formatMAD(editingOrder.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600 pt-2.5 border-t border-dashed border-gray-200">
                    <span>Mode de paiement</span>
                    <span className="font-bold text-gray-900 uppercase tracking-wider">{editingOrder.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                    <span className="font-bold text-gray-900 text-[15px]">Total Net à Encaisser</span>
                    <span className="text-2xl font-black text-gray-900 tracking-tight">{formatMAD(editingOrder.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
