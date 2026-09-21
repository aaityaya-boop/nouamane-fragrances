'use client';

import React, { useState, useEffect } from 'react';
import { Search, Edit2, Check, X } from 'lucide-react';
import Image from 'next/image';

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editStockValue, setEditStockValue] = useState<number>(0);
  const [categories, setCategories] = useState<string[]>([]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/products');
      const data = await res.json();
      // Ensure JSON strings are parsed
      const parsedData = data.map((p: any) => ({
        ...p,
        images: typeof p.images === 'string' ? JSON.parse(p.images) : p.images
      }));
      setProducts(parsedData);
      
      const uniqueSubcategories = Array.from(new Set(data.map((p: any) => p.subcategoryLabel))) as string[];
      setCategories(['Toutes', ...uniqueSubcategories]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleEditClick = (product: any) => {
    setEditingId(product.id);
    setEditStockValue(product.stock);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleSaveStock = async (id: number) => {
    // Optimistic UI update
    setProducts(products.map(p => 
      p.id === id 
        ? { ...p, stock: editStockValue, inStock: editStockValue > 0 } 
        : p
    ));
    setEditingId(null);

    try {
      await fetch('/api/admin/inventory', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, stock: editStockValue })
      });
    } catch (error) {
      console.error(error);
      alert('Erreur lors de la mise à jour du stock');
      fetchProducts(); // Refresh to get real data
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.brandLabel.toLowerCase().includes(search.toLowerCase()) ||
    p.slug.toLowerCase().includes(search.toLowerCase()) ||
    (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()))
  );

  const inStockCount = products.filter(p => (p.stock || 0) > 5).length;
  const lowStockCount = products.filter(p => (p.stock || 0) > 0 && (p.stock || 0) <= 5).length;
  const outOfStockCount = products.filter(p => (p.stock || 0) === 0).length;

  return (
    <div className="p-6 md:p-10 max-w-[1600px] mx-auto text-neutral-900 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Gestion de Stock</h1>
          <p className="text-[13px] text-neutral-500 mt-1">Suivez et mettez à jour les quantités de vos produits en temps réel.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-2xs">
          <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Total Références</div>
          <div className="text-2xl font-bold text-neutral-900 mt-1.5">{products.length}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-2xs">
          <div className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">En Stock (&gt;5)</div>
          <div className="text-2xl font-bold text-neutral-900 mt-1.5">{inStockCount}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-2xs">
          <div className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider">Stock Faible (1-5)</div>
          <div className="text-2xl font-bold text-neutral-900 mt-1.5">{lowStockCount}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-2xs">
          <div className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider">Rupture de Stock</div>
          <div className="text-2xl font-bold text-neutral-900 mt-1.5">{outOfStockCount}</div>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-2xs">
        <div className="p-3.5 border-b border-neutral-100 flex items-center gap-3 bg-white">
          <Search size={15} className="text-neutral-400 ml-1" />
          <input 
            type="text" 
            placeholder="Rechercher par nom, marque, SKU ou slug..." 
            className="flex-1 bg-transparent border-none focus:outline-none text-xs sm:text-[13px] text-neutral-900 placeholder:text-neutral-400"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 text-[11px] uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-5 py-3 w-[70px]">Image</th>
                <th className="px-5 py-3">Produit</th>
                <th className="px-5 py-3">SKU / Réf</th>
                <th className="px-5 py-3">Marque</th>
                <th className="px-5 py-3">Statut</th>
                <th className="px-5 py-3 w-[180px] text-right">Quantité en Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-neutral-400 text-xs">Chargement des données d'inventaire...</td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-neutral-400 text-xs">Aucun produit trouvé.</td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isEditing = editingId === p.id;
                  const stockLevel = p.stock || 0;
                  let statusBadge = (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      EN STOCK
                    </span>
                  );
                  
                  if (stockLevel === 0) {
                    statusBadge = (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                        RUPTURE
                      </span>
                    );
                  } else if (stockLevel <= 5) {
                    statusBadge = (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        STOCK FAIBLE ({stockLevel})
                      </span>
                    );
                  }

                  return (
                    <tr key={p.id} className="hover:bg-neutral-50/70 transition-colors group">
                      <td className="px-5 py-3.5">
                        <div className="w-11 h-11 bg-neutral-100 rounded-xl overflow-hidden relative border border-neutral-200 shrink-0">
                          {p.images?.[0] ? (
                            <Image src={p.images[0]} alt={p.name} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-neutral-400">N/A</div>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-neutral-900 text-[13px]">{p.name}</div>
                        <div className="text-[11px] text-neutral-500 font-normal mt-0.5">{p.slug}</div>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-[11px] text-neutral-600">
                        {p.sku || <span className="text-neutral-400 italic">Non renseigné</span>}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-neutral-100 text-neutral-700 border border-neutral-200 uppercase tracking-wider">
                          {p.brandLabel}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        {statusBadge}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <input 
                              type="number" 
                              min="0"
                              className="w-16 bg-white border border-neutral-900 rounded-lg px-2 py-1 text-center text-xs font-semibold text-neutral-900 outline-none"
                              value={editStockValue}
                              onChange={(e) => setEditStockValue(parseInt(e.target.value) || 0)}
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveStock(p.id);
                                if (e.key === 'Escape') handleCancelEdit();
                              }}
                            />
                            <button onClick={() => handleSaveStock(p.id)} className="w-7 h-7 flex items-center justify-center text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200">
                              <Check size={13} />
                            </button>
                            <button onClick={handleCancelEdit} className="w-7 h-7 flex items-center justify-center text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors border border-neutral-200">
                              <X size={13} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-2.5">
                            <span className="font-bold text-[14px] text-neutral-900">{p.stock || 0}</span>
                            <button 
                              onClick={() => handleEditClick(p)}
                              className="w-7 h-7 flex items-center justify-center rounded-lg bg-white text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors border border-neutral-200 shadow-2xs opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
                              title="Modifier le stock"
                            >
                              <Edit2 size={12} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
