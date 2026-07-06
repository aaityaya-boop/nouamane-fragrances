'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, MoreHorizontal, ChevronDown, Edit, X, Printer } from 'lucide-react';
import { formatMAD } from '@/lib/products';

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'refused' | 'returned' | 'unconfirmed';

interface MockOrder {
  id: string;
  customerName: string;
  city: string;
  date: string;
  total: number;
  status: OrderStatus;
  items: number;
}

const INITIAL_ORDERS: MockOrder[] = [
  { id: 'NF-A1X9B', customerName: 'Youssef Bennis', city: 'Casablanca', date: 'Aujourd\'hui, 14:30', total: 1850, status: 'pending', items: 2 },
  { id: 'NF-K8M2P', customerName: 'Salma Chraibi', city: 'Rabat', date: 'Aujourd\'hui, 10:15', total: 950, status: 'processing', items: 1 },
  { id: 'NF-L9T4C', customerName: 'Amine Lahlou', city: 'Marrakech', date: 'Hier, 18:45', total: 2750, status: 'shipped', items: 3 },
  { id: 'NF-W2N7F', customerName: 'Kenza Tazi', city: 'Tanger', date: 'Hier, 09:20', total: 1100, status: 'delivered', items: 1 },
  { id: 'NF-P5R3K', customerName: 'Omar Benjelloun', city: 'Agadir', date: 'Il y a 2 jours', total: 3200, status: 'delivered', items: 4 },
];

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
  pending: 'bg-amber-100 text-amber-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  refused: 'bg-red-100 text-red-800',
  returned: 'bg-gray-100 text-gray-800',
  unconfirmed: 'bg-orange-100 text-orange-800',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);
  const [editingOrder, setEditingOrder] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
    // Optimistic update
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
    setOpenDropdownId(null);

    // Persist
    await fetch('/api/admin/orders', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: orderId, status: newStatus }),
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;
    
    // Optimistic update
    setOrders((prev) =>
      prev.map((order) =>
        order.id === editingOrder.id ? editingOrder : order
      )
    );
    const orderToSave = { ...editingOrder };
    setEditingOrder(null);

    // Persist
    await fetch('/api/admin/orders', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: orderToSave.id,
        customerName: orderToSave.customerName,
        city: orderToSave.shippingCity,
        total: orderToSave.total,
      }),
    });
  };

  const getParsedItems = (itemsString: string) => {
    try {
      return JSON.parse(itemsString || '[]');
    } catch {
      return [];
    }
  };


  return (
    <div className="p-8 lg:p-12 relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="heading-font text-3xl font-light tracking-tight text-[#1A1A1A] mb-2">
            Commandes
          </h1>
          <p className="text-[#6B6B6B] text-[13px]">
            Gérez vos commandes et mettez à jour leur statut de livraison.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-4 h-4 text-[#9A9A9A] absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher (NF-...)"
              className="pl-10 pr-4 py-2.5 bg-white border border-[#e0ddd4] rounded-lg text-[13px] w-[250px] focus:outline-none focus:border-[#1A1A1A] transition-colors"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#e0ddd4] rounded-lg text-[13px] font-medium text-[#1A1A1A] hover:bg-[#fafaf7] transition-colors">
            <Filter size={16} />
            Filtrer
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#e0ddd4] rounded-2xl shadow-sm pb-32 relative">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#fafaf7] border-b border-[#e0ddd4]">
              <th className="px-6 py-4 text-[10px] font-bold tracking-[0.1em] uppercase text-[#9A9A9A]">ID Commande</th>
              <th className="px-6 py-4 text-[10px] font-bold tracking-[0.1em] uppercase text-[#9A9A9A]">Client</th>
              <th className="px-6 py-4 text-[10px] font-bold tracking-[0.1em] uppercase text-[#9A9A9A]">Date</th>
              <th className="px-6 py-4 text-[10px] font-bold tracking-[0.1em] uppercase text-[#9A9A9A]">Total</th>
              <th className="px-6 py-4 text-[10px] font-bold tracking-[0.1em] uppercase text-[#9A9A9A]">Statut</th>
              <th className="px-6 py-4 text-[10px] font-bold tracking-[0.1em] uppercase text-[#9A9A9A] text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className="text-center py-10 text-[#9A9A9A]">Chargement des commandes...</td></tr>
            ) : orders.map((order) => {
              const parsedItems = typeof order.items === 'string' ? JSON.parse(order.items) : [];
              const itemsCount = parsedItems.reduce((acc: number, item: any) => acc + item.quantity, 0);
              const formattedDate = new Date(order.createdAt).toLocaleDateString('fr-MA', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
              <tr key={order.id} className="border-b border-[#e0ddd4] hover:bg-[#fafaf7]/50 transition-colors">
                <td className="px-6 py-4">
                  <span className="font-mono text-[13px] font-medium text-[#1A1A1A]">{order.orderNumber}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-[13px] font-medium text-[#1A1A1A]">{order.customerName}</div>
                  <div className="text-[12px] text-[#9A9A9A]">{order.shippingCity}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-[13px] text-[#6B6B6B]">{formattedDate}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-[13px] font-semibold text-[#1A1A1A]">{formatMAD(order.total)}</div>
                  <div className="text-[11px] text-[#9A9A9A]">{itemsCount} article(s)</div>
                </td>
                <td className="px-6 py-4 relative">
                  {/* Status Dropdown */}
                  <div className={`relative inline-block ${openDropdownId === order.id ? 'z-[100]' : 'z-10'}`}>
                    <button 
                      onClick={() => {
                        setOpenDropdownId(openDropdownId === order.id ? null : order.id);
                      }}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-medium uppercase tracking-wider cursor-pointer transition-colors ${STATUS_COLORS[order.status as OrderStatus] || STATUS_COLORS.pending}`}
                    >
                      {STATUS_LABELS[order.status as OrderStatus] || 'En attente'}
                      <ChevronDown size={12} className="opacity-50" />
                    </button>

                    {/* Dropdown Menu */}
                    {openDropdownId === order.id && (
                      <>
                        <div 
                          className="fixed inset-0 z-[40]" 
                          onClick={() => setOpenDropdownId(null)} 
                        />
                        <div className="absolute top-full left-0 mt-2 w-40 bg-white border border-[#e0ddd4] shadow-lg rounded-xl overflow-hidden z-[50] animate-in fade-in zoom-in-95 duration-100">
                          {(['pending', 'processing', 'shipped', 'delivered', 'refused', 'returned', 'unconfirmed'] as OrderStatus[]).map((status) => (
                            <button
                              key={status}
                              onClick={() => handleStatusChange(order.id, status)}
                              className="w-full text-left px-4 py-2.5 text-[12px] hover:bg-[#fafaf7] text-[#1A1A1A] transition-colors flex items-center justify-between"
                            >
                              {STATUS_LABELS[status]}
                              {order.status === status && <div className="w-1.5 h-1.5 rounded-full bg-[#1A1A1A]" />}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingOrder(order);
                      setOpenDropdownId(null);
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-bold tracking-[0.1em] uppercase text-[#1A1A1A] hover:bg-[#e0ddd4]/50 transition-colors ml-auto"
                  >
                    Voir Détails
                  </button>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>

      {/* Order Details Modal */}
      {editingOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-8 py-6 border-b border-[#e0ddd4] shrink-0">
              <div>
                <h2 className="heading-font text-xl font-medium tracking-wide">
                  Détails de la Commande {editingOrder.orderNumber}
                </h2>
                <div className="text-[12px] text-[#6B6B6B] mt-1">
                  Passée le {new Date(editingOrder.createdAt).toLocaleDateString('fr-MA', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <a 
                  href={`/invoice/${editingOrder.orderNumber}`}
                  target="_blank"
                  className="flex items-center gap-2 text-[11px] font-bold tracking-[0.1em] uppercase text-[#0ea5e9] hover:text-[#7e22ce] transition-colors"
                >
                  <Printer size={16} /> Imprimer (PDF)
                </a>
                <button 
                  onClick={() => setEditingOrder(null)}
                  className="text-[#9A9A9A] hover:text-[#1A1A1A] transition-colors p-2 hover:bg-[#fafaf7] rounded-full"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <div className="p-8 overflow-y-auto space-y-8 flex-1">
              {/* Informations Client & Livraison */}
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#9A9A9A] mb-4">Informations Client</h3>
                  <div className="space-y-3 text-[13px] text-[#1A1A1A]">
                    <p><span className="font-semibold w-20 inline-block">Nom:</span> {editingOrder.customerName}</p>
                    <p><span className="font-semibold w-20 inline-block">Email:</span> {editingOrder.customerEmail || 'Non renseigné'}</p>
                    <p><span className="font-semibold w-20 inline-block">Tél:</span> {editingOrder.customerPhone || 'Non renseigné'}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#9A9A9A] mb-4">Adresse de Livraison</h3>
                  <div className="space-y-3 text-[13px] text-[#1A1A1A]">
                    <p><span className="font-semibold w-20 inline-block">Adresse:</span> {editingOrder.shippingAddress}</p>
                    <p><span className="font-semibold w-20 inline-block">Ville:</span> {editingOrder.shippingCity}</p>
                    <p><span className="font-semibold w-20 inline-block">Code Postal:</span> {editingOrder.shippingPostalCode || 'Non renseigné'}</p>
                  </div>
                </div>
              </div>

              {/* Articles Commandés */}
              <div>
                <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#9A9A9A] mb-4">Articles Commandés</h3>
                <div className="border border-[#e0ddd4] rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-[#fafaf7] border-b border-[#e0ddd4]">
                      <tr>
                        <th className="px-4 py-3 text-[10px] font-bold tracking-[0.1em] uppercase text-[#6B6B6B]">Produit</th>
                        <th className="px-4 py-3 text-[10px] font-bold tracking-[0.1em] uppercase text-[#6B6B6B] text-center">Quantité</th>
                        <th className="px-4 py-3 text-[10px] font-bold tracking-[0.1em] uppercase text-[#6B6B6B] text-right">Prix Unitaire</th>
                        <th className="px-4 py-3 text-[10px] font-bold tracking-[0.1em] uppercase text-[#6B6B6B] text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getParsedItems(editingOrder.items).map((item: any, idx: number) => (
                        <tr key={idx} className="border-b border-[#e0ddd4] last:border-0">
                          <td className="px-4 py-3 text-[13px] font-medium text-[#1A1A1A]">
                            {item.name}
                            <div className="text-[11px] font-normal text-[#9A9A9A]">{item.size}</div>
                          </td>
                          <td className="px-4 py-3 text-[13px] text-center">{item.quantity}</td>
                          <td className="px-4 py-3 text-[13px] text-right">{formatMAD(item.price)}</td>
                          <td className="px-4 py-3 text-[13px] font-semibold text-right">{formatMAD(item.price * item.quantity)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Résumé de Paiement */}
              <div className="bg-[#fafaf7] p-6 rounded-xl border border-[#e0ddd4]">
                <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#9A9A9A] mb-4">Résumé de Paiement</h3>
                <div className="space-y-3 text-[13px]">
                  <div className="flex justify-between">
                    <span className="text-[#6B6B6B]">Sous-total</span>
                    <span className="font-medium text-[#1A1A1A]">{formatMAD(editingOrder.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B6B6B]">Frais de livraison</span>
                    <span className="font-medium text-[#1A1A1A]">{formatMAD(editingOrder.shippingCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B6B6B]">Méthode de paiement</span>
                    <span className="font-medium text-[#1A1A1A] uppercase tracking-wider text-[11px]">{editingOrder.paymentMethod}</span>
                  </div>
                  <div className="h-px w-full bg-[#e0ddd4] my-2" />
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-[#1A1A1A]">Total de la commande</span>
                    <span className="text-xl font-semibold text-[#0ea5e9]">{formatMAD(editingOrder.total)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="px-8 py-6 border-t border-[#e0ddd4] bg-[#fafaf7] shrink-0 flex justify-end">
              <button 
                onClick={() => setEditingOrder(null)}
                className="px-6 py-2.5 bg-black text-white rounded-lg text-[11px] font-bold tracking-[0.1em] uppercase hover:bg-black/80 transition-colors"
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
