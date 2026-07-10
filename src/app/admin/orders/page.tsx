'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, ChevronDown, Edit, X, Printer, PackageOpen, CreditCard, Truck } from 'lucide-react';

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'refused' | 'returned' | 'unconfirmed';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  size?: string;
  sku?: string;
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'En attente',
  processing: 'En préparation',
  shipped: 'En livraison',
  delivered: 'Livrée',
  refused: 'Refusée',
  returned: 'Retour',
  unconfirmed: 'Non confirmé',
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-amber-50 text-amber-600 ring-amber-500/20',
  processing: 'bg-blue-50 text-blue-600 ring-blue-500/20',
  shipped: 'bg-purple-50 text-purple-600 ring-purple-500/20',
  delivered: 'bg-emerald-50 text-emerald-600 ring-emerald-500/20',
  refused: 'bg-red-50 text-red-600 ring-red-500/20',
  returned: 'bg-gray-50 text-gray-600 ring-gray-500/20',
  unconfirmed: 'bg-orange-50 text-orange-600 ring-orange-500/20',
};

const formatMAD = (amount: number) => {
  return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 }).format(amount);
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [editingOrder, setEditingOrder] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/admin/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
    setOpenDropdownId(null);
    if (editingOrder && editingOrder.id === orderId) {
      setEditingOrder((prev: any) => ({ ...prev, status: newStatus }));
    }

    await fetch('/api/admin/orders', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: orderId, status: newStatus }),
    });
  };

  const getParsedItems = (itemsString: string): OrderItem[] => {
    try {
      return JSON.parse(itemsString || '[]');
    } catch {
      return [];
    }
  };

  const filteredOrders = orders.filter((o: any) => 
    o.orderNumber.toLowerCase().includes(search.toLowerCase()) || 
    o.customerName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 lg:p-12 max-w-[1600px] mx-auto relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-[#111] mb-2 tracking-tight">Commandes</h1>
          <p className="text-[14px] text-[#666]">
            Gérez vos commandes, mettez à jour les statuts et expédiez les colis. ({orders.length} au total).
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#eaeaea] shadow-sm overflow-hidden pb-32">
        <div className="p-4 border-b border-[#eaeaea] flex items-center justify-between gap-4 bg-white">
          <div className="flex items-center gap-3 flex-1">
            <Search size={16} className="text-[#999]" />
            <input 
              type="text" 
              placeholder="Rechercher par ID (NF-...) ou Client..." 
              className="flex-1 bg-transparent border-none focus:outline-none text-[14px] text-[#111] placeholder:text-[#999]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-[#eaeaea] rounded-lg text-[13px] font-medium text-[#111] transition-colors">
            <Filter size={16} /> Filtrer
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#fafafa] border-b border-[#eaeaea]">
              <tr>
                <th className="px-6 py-4 text-[11px] font-bold text-[#666] uppercase tracking-wider">ID Commande</th>
                <th className="px-6 py-4 text-[11px] font-bold text-[#666] uppercase tracking-wider">Client</th>
                <th className="px-6 py-4 text-[11px] font-bold text-[#666] uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-[11px] font-bold text-[#666] uppercase tracking-wider">Total</th>
                <th className="px-6 py-4 text-[11px] font-bold text-[#666] uppercase tracking-wider">Statut</th>
                <th className="px-6 py-4 text-[11px] font-bold text-[#666] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eaeaea]">
              {isLoading ? (
                <tr><td colSpan={6} className="text-center py-12 text-[#666] text-[13px]">Chargement des commandes...</td></tr>
              ) : filteredOrders.map((order) => {
                const parsedItems = getParsedItems(order.items);
                const itemsCount = parsedItems.reduce((acc: number, item: any) => acc + item.quantity, 0);
                const formattedDate = new Date(order.createdAt).toLocaleDateString('fr-MA', {
                  day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                });

                return (
                <tr key={order.id} className="hover:bg-[#fafafa] transition-colors group cursor-pointer" onClick={() => { setEditingOrder(order); setOpenDropdownId(null); }}>
                  <td className="px-6 py-4">
                    <span className="font-mono text-[13px] font-semibold text-[#111] bg-gray-100 px-2 py-1 rounded-md">{order.orderNumber}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-100 to-gray-200 flex items-center justify-center text-[12px] font-bold text-gray-600 shadow-sm border border-white">
                        {order.customerName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-[13px] font-medium text-[#111]">{order.customerName}</div>
                        <div className="text-[12px] text-[#666] mt-0.5">{order.shippingCity}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[13px] text-[#666]">
                    {formattedDate}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-[13px] font-bold text-[#111]">{formatMAD(order.total)}</div>
                    <div className="text-[11px] text-[#888] font-medium">{itemsCount} article(s)</div>
                  </td>
                  <td className="px-6 py-4 relative" onClick={(e) => e.stopPropagation()}>
                    <div className="relative inline-block w-[130px]">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                        className={`w-full appearance-none flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wide cursor-pointer transition-colors ring-1 ring-inset focus:outline-none focus:ring-2 ${STATUS_COLORS[order.status as OrderStatus] || STATUS_COLORS.pending}`}
                      >
                        {(Object.keys(STATUS_LABELS) as OrderStatus[]).map((status) => (
                          <option key={status} value={status}>
                            {STATUS_LABELS[status]}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      className="text-[12px] font-semibold text-[#0ea5e9] hover:text-blue-600 transition-colors"
                    >
                      Détails
                    </button>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over Details Panel */}
      {editingOrder && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
            onClick={() => setEditingOrder(null)}
          />
          
          {/* Panel */}
          <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-[#eaeaea]">
            
            {/* Header */}
            <div className="px-8 py-6 border-b border-[#eaeaea] bg-white flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-2xl font-bold text-[#111] tracking-tight flex items-center gap-3">
                  Commande {editingOrder.orderNumber}
                  <select
                    value={editingOrder.status}
                    onChange={(e) => handleStatusChange(editingOrder.id, e.target.value as OrderStatus)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wide ring-1 ring-inset appearance-none cursor-pointer focus:outline-none focus:ring-2 ${STATUS_COLORS[editingOrder.status as OrderStatus]}`}
                  >
                    {(Object.keys(STATUS_LABELS) as OrderStatus[]).map((status) => (
                      <option key={status} value={status}>
                        {STATUS_LABELS[status]}
                      </option>
                    ))}
                  </select>
                </h2>
                <div className="text-[13px] text-[#666] mt-1.5 font-medium">
                  Passée le {new Date(editingOrder.createdAt).toLocaleDateString('fr-MA', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              <div className="flex gap-2">
                <a 
                  href={`/invoice/${editingOrder.orderNumber}`}
                  target="_blank"
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 text-[#111] hover:bg-gray-100 transition-colors border border-[#eaeaea]"
                  title="Imprimer Facture"
                >
                  <Printer size={18} />
                </a>
                <button 
                  onClick={() => setEditingOrder(null)}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-white text-[#666] hover:bg-gray-50 transition-colors border border-[#eaeaea]"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            {/* Body */}
            <div className="p-8 overflow-y-auto space-y-10 flex-1 bg-[#fafafa]">
              
              {/* Clients & Shipping Cards */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-[#eaeaea] shadow-sm">
                  <div className="flex items-center gap-2 text-[#111] font-bold mb-4">
                    <CreditCard size={18} className="text-[#0ea5e9]" /> Client
                  </div>
                  <div className="space-y-2 text-[13px] text-[#111]">
                    <p className="font-semibold text-[15px]">{editingOrder.customerName}</p>
                    <p className="text-[#666]">{editingOrder.customerEmail || 'Aucun email'}</p>
                    <p className="text-[#666]">{editingOrder.customerPhone || 'Aucun téléphone'}</p>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-2xl border border-[#eaeaea] shadow-sm">
                  <div className="flex items-center gap-2 text-[#111] font-bold mb-4">
                    <Truck size={18} className="text-indigo-500" /> Livraison
                  </div>
                  <div className="space-y-2 text-[13px] text-[#111]">
                    <p className="font-semibold">{editingOrder.shippingCity}</p>
                    <p className="text-[#666] leading-relaxed">{editingOrder.shippingAddress}</p>
                    {editingOrder.shippingPostalCode && <p className="text-[#666]">{editingOrder.shippingPostalCode}</p>}
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="bg-white rounded-2xl border border-[#eaeaea] shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-[#eaeaea] bg-white flex items-center gap-2 text-[#111] font-bold">
                  <PackageOpen size={18} className="text-amber-500" /> Articles commandés
                </div>
                <table className="w-full text-left">
                  <thead className="bg-[#fafafa] border-b border-[#eaeaea]">
                    <tr>
                      <th className="px-6 py-3 text-[11px] font-bold tracking-wider uppercase text-[#666]">Produit</th>
                      <th className="px-6 py-3 text-[11px] font-bold tracking-wider uppercase text-[#666] text-center">Qté</th>
                      <th className="px-6 py-3 text-[11px] font-bold tracking-wider uppercase text-[#666] text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eaeaea]">
                    {getParsedItems(editingOrder.items).map((item, idx) => (
                      <tr key={idx}>
                        <td className="px-6 py-4">
                          <div className="text-[13px] font-semibold text-[#111]">{item.name}</div>
                          <div className="text-[12px] text-[#666] mt-0.5">
                            {item.size} {item.sku && `• Réf: ${item.sku}`}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-[13px] font-medium text-center text-[#111]">{item.quantity}</td>
                        <td className="px-6 py-4 text-[13px] font-bold text-right text-[#111]">{formatMAD(item.price * item.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary */}
              <div className="bg-white p-6 rounded-2xl border border-[#eaeaea] shadow-sm">
                <h3 className="text-[13px] font-bold text-[#111] mb-4 uppercase tracking-wider">Paiement</h3>
                <div className="space-y-3 text-[13px]">
                  <div className="flex justify-between text-[#666]">
                    <span>Sous-total</span>
                    <span className="font-medium text-[#111]">{formatMAD(editingOrder.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-[#666]">
                    <span>Frais de livraison</span>
                    <span className="font-medium text-[#111]">{formatMAD(editingOrder.shippingCost)}</span>
                  </div>
                  <div className="flex justify-between text-[#666] pt-3 border-t border-dashed border-[#eaeaea]">
                    <span>Méthode de paiement</span>
                    <span className="font-bold text-[#111] uppercase tracking-wider">{editingOrder.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between items-center pt-4 mt-2 border-t border-[#eaeaea]">
                    <span className="font-bold text-[#111] text-[15px]">Total TTC</span>
                    <span className="text-2xl font-bold text-[#0ea5e9] tracking-tight">{formatMAD(editingOrder.total)}</span>
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
