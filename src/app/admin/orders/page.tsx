'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  ChevronDown,
  X,
  Printer,
  PackageOpen,
  CreditCard,
  Truck,
  RefreshCw,
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

const STATUS_CLASSES: Record<string, string> = {
  pending: 'bg-neutral-100 text-neutral-700 border-neutral-200',
  processing: 'bg-sky-50 text-sky-700 border-sky-200',
  shipped: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  refused: 'bg-rose-50 text-rose-700 border-rose-200',
  returned: 'bg-neutral-100 text-neutral-700 border-neutral-300',
  unconfirmed: 'bg-amber-50 text-amber-700 border-amber-200',
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
          actorNameOverride: currentUser?.name || 'Nouamane Ait Yahya',
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
    <div className="p-6 md:p-10 max-w-[1600px] mx-auto text-neutral-900 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Commandes</h1>
          <p className="text-[13px] text-neutral-500 mt-1">
            Suivi des commandes et historique des actions ({orders.length} au total).
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-800 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors shadow-2xs inline-flex items-center gap-1.5"
        >
          <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
          Actualiser
        </button>
      </div>

      {/* Clean Horizontal Filter Tabs */}
      <div className="flex items-center gap-6 overflow-x-auto border-b border-neutral-200 pb-0 scrollbar-none">
        {[
          { id: 'ALL', label: 'Toutes', count: tabCounts.ALL },
          { id: 'PENDING', label: 'En attente', count: tabCounts.PENDING },
          { id: 'PROCESSING', label: 'En préparation', count: tabCounts.PROCESSING },
          { id: 'SHIPPED', label: 'En livraison', count: tabCounts.SHIPPED },
          { id: 'DELIVERED', label: 'Livrées', count: tabCounts.DELIVERED },
          { id: 'ISSUES', label: 'Refus & Retours', count: tabCounts.ISSUES },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 text-[13px] font-medium transition-colors relative whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === tab.id
                ? 'text-neutral-900 font-semibold'
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`text-[11px] font-mono px-1.5 py-0.5 rounded ${
              activeTab === tab.id ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-500'
            }`}>
              {tab.count}
            </span>
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-900" />
            )}
          </button>
        ))}
      </div>

      {/* Orders Table Card */}
      <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-2xs">
        <div className="p-3.5 border-b border-neutral-100 flex items-center gap-3 bg-white">
          <Search size={15} className="text-neutral-400 ml-1" />
          <input
            type="text"
            placeholder="Rechercher une commande, client, ville, téléphone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent border-none focus:outline-none text-xs sm:text-[13px] text-neutral-900 placeholder:text-neutral-400"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="text-neutral-400 hover:text-neutral-700 p-1"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 text-[11px] uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-5 py-3">Réf</th>
                <th className="px-5 py-3">Client</th>
                <th className="px-5 py-3">Étape actuelle</th>
                <th className="px-5 py-3">Total</th>
                <th className="px-5 py-3">Statut</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-neutral-400">
                    Chargement...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-neutral-400">
                    Aucune commande trouvée.
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
                      className="hover:bg-neutral-50/70 transition-colors cursor-pointer group"
                    >
                      {/* Ref & Date */}
                      <td className="px-5 py-3.5">
                        <div className="font-mono font-semibold text-neutral-900 group-hover:text-black">
                          {order.orderNumber}
                        </div>
                        <div className="text-[11px] text-neutral-400 mt-0.5">
                          {formattedDate}
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="px-5 py-3.5">
                        <div className="font-medium text-neutral-900">
                          {order.customerName}
                        </div>
                        <div className="text-[11px] text-neutral-500 mt-0.5">
                          {order.shippingCity} {order.customerPhone ? `• ${order.customerPhone}` : ''}
                        </div>
                      </td>

                      {/* Timeline Summary (Handmade minimal progress) */}
                      <td className="px-5 py-3.5">
                        <OrderTimelineStepper
                          status={order.status}
                          timeline={order.timeline || []}
                          compact={true}
                        />
                      </td>

                      {/* Total */}
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-neutral-900">
                          {formatMAD(order.total)}
                        </div>
                        <div className="text-[11px] text-neutral-400">
                          {itemsCount} art.
                        </div>
                      </td>

                      {/* Status Dropdown */}
                      <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                        <div className="relative inline-block w-[125px]">
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            className={`w-full appearance-none px-2.5 py-1 rounded-md text-[11px] font-medium border cursor-pointer focus:outline-none ${
                              STATUS_CLASSES[order.status] || STATUS_CLASSES.pending
                            }`}
                          >
                            {Object.keys(STATUS_LABELS).map((status) => (
                              <option key={status} value={status}>
                                {STATUS_LABELS[status]}
                              </option>
                            ))}
                          </select>
                          <ChevronDown
                            size={12}
                            className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-50"
                          />
                        </div>
                      </td>

                      {/* Action */}
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => setEditingOrder(order)}
                          className="text-[12px] font-medium text-neutral-600 hover:text-neutral-900 underline decoration-neutral-300"
                        >
                          Détails
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

      {/* Details & Timeline Drawer */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-black/20 transition-opacity"
            onClick={() => setEditingOrder(null)}
          />

          <div className="relative w-full max-w-2xl bg-white h-full shadow-xl flex flex-col border-l border-neutral-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-neutral-900">
                    {editingOrder.orderNumber}
                  </h2>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${
                    STATUS_CLASSES[editingOrder.status] || STATUS_CLASSES.pending
                  }`}>
                    {STATUS_LABELS[editingOrder.status] || editingOrder.status}
                  </span>
                </div>
                <div className="text-[11px] text-neutral-400 mt-0.5">
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
                  className="p-2 text-neutral-600 hover:text-neutral-900 border border-neutral-200 rounded-lg hover:bg-neutral-50"
                  title="Facture"
                >
                  <Printer size={15} />
                </a>
                <button
                  onClick={() => setEditingOrder(null)}
                  className="p-2 text-neutral-400 hover:text-neutral-900 border border-neutral-200 rounded-lg hover:bg-neutral-50"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-[13px]">
              {/* Timeline Section */}
              <OrderTimelineFull
                order={editingOrder}
                currentUser={currentUser}
                onUpdateStatus={async (newStatus, options) => {
                  await handleStatusChange(editingOrder.id, newStatus, options);
                }}
                onAddNote={handleAddTimelineNote}
                onAddAttachment={handleAddAttachment}
              />

              {/* Client & Shipping */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-neutral-200">
                <div className="space-y-1">
                  <div className="text-[11px] uppercase tracking-wider text-neutral-400 font-semibold">Client</div>
                  <div className="font-semibold text-neutral-900">{editingOrder.customerName}</div>
                  <div className="text-neutral-500">{editingOrder.customerPhone || 'Sans téléphone'}</div>
                  <div className="text-neutral-500">{editingOrder.customerEmail || 'Sans email'}</div>
                </div>

                <div className="space-y-1">
                  <div className="text-[11px] uppercase tracking-wider text-neutral-400 font-semibold">Livraison</div>
                  <div className="font-semibold text-neutral-900">{editingOrder.shippingCity}</div>
                  <div className="text-neutral-500 leading-snug">{editingOrder.shippingAddress}</div>
                </div>
              </div>

              {/* Items */}
              <div className="pt-4 border-t border-neutral-200">
                <div className="text-[11px] uppercase tracking-wider text-neutral-400 font-semibold mb-3">Articles</div>
                <div className="space-y-2">
                  {getParsedItems(editingOrder.items).map((item, idx) => (
                    <div key={idx} className="flex justify-between py-1 border-b border-neutral-100 last:border-0">
                      <div>
                        <span className="font-medium text-neutral-900">{item.name}</span>
                        {item.size && <span className="text-neutral-400 text-xs ml-1">({item.size})</span>}
                        <span className="text-neutral-500 text-xs ml-2">× {item.quantity}</span>
                      </div>
                      <span className="font-semibold text-neutral-900">{formatMAD(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Summary */}
              <div className="pt-4 border-t border-neutral-200 flex justify-between items-center text-sm">
                <span className="font-semibold text-neutral-700">Total</span>
                <span className="text-lg font-bold text-neutral-900">{formatMAD(editingOrder.total)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
