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

  return (
    <div className="p-8 lg:p-12 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="heading-font text-3xl font-light text-[#1A1A1A]">Gestion de Stock</h1>
          <p className="text-[#6B6B6B] text-[13px] mt-1">Suivez et mettez à jour les quantités de vos produits en temps réel.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#e0ddd4] overflow-hidden">
        <div className="p-4 border-b border-[#e0ddd4] flex items-center gap-3 bg-[#f8fafc]">
          <Search size={16} className="text-[#9A9A9A]" />
          <input 
            type="text" 
            placeholder="Rechercher par nom, marque ou slug..." 
            className="flex-1 bg-transparent border-none focus:outline-none text-[13px]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-[#f8fafc] text-[#6B6B6B] border-b border-[#e0ddd4]">
              <tr>
                <th className="p-4 font-medium w-[80px]">Image</th>
                <th className="p-4 font-medium">Produit</th>
                <th className="p-4 font-medium">SKU / Réf</th>
                <th className="p-4 font-medium">Marque</th>
                <th className="p-4 font-medium">Statut</th>
                <th className="p-4 font-medium w-[150px]">Quantité en Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e0ddd4]">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[#9A9A9A]">Chargement...</td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[#9A9A9A]">Aucun produit trouvé.</td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isEditing = editingId === p.id;
                  const stockLevel = p.stock;
                  let statusColor = 'bg-green-100 text-green-800';
                  let statusText = 'En stock';
                  
                  if (stockLevel === 0) {
                    statusColor = 'bg-red-100 text-red-800';
                    statusText = 'Rupture';
                  } else if (stockLevel <= 5) {
                    statusColor = 'bg-orange-100 text-orange-800';
                    statusText = 'Stock faible';
                  }

                  return (
                    <tr key={p.id} className="hover:bg-[#f8fafc] transition-colors">
                      <td className="p-4">
                        <div className="w-12 h-12 bg-[#eeece5] rounded-md overflow-hidden relative border border-[#e0ddd4]">
                          {p.images?.[0] ? (
                            <Image src={p.images[0]} alt={p.name} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-[#9A9A9A]">No img</div>
                          )}
                        </div>
                      </td>
                      <td className="p-4 font-medium text-[#1A1A1A]">
                        {p.name}
                        <div className="text-[11px] text-[#9A9A9A] font-normal mt-0.5">{p.slug}</div>
                      </td>
                      <td className="p-4 font-mono text-[12px] text-[#666]">
                        {p.sku || <span className="text-[#999] italic">N/A</span>}
                      </td>
                      <td className="p-4 text-[#6B6B6B]">
                        {p.brandLabel}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-medium ${statusColor}`}>
                          {statusText}
                        </span>
                      </td>
                      <td className="p-4">
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <input 
                              type="number" 
                              min="0"
                              className="w-16 border border-[#0ea5e9] rounded px-2 py-1 text-center outline-none focus:ring-2 ring-[#0ea5e9]/20"
                              value={editStockValue}
                              onChange={(e) => setEditStockValue(parseInt(e.target.value) || 0)}
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveStock(p.id);
                                if (e.key === 'Escape') handleCancelEdit();
                              }}
                            />
                            <button onClick={() => handleSaveStock(p.id)} className="text-green-600 hover:bg-green-50 p-1 rounded">
                              <Check size={14} />
                            </button>
                            <button onClick={handleCancelEdit} className="text-red-500 hover:bg-red-50 p-1 rounded">
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between group">
                            <span className="font-semibold text-[14px]">{p.stock}</span>
                            <button 
                              onClick={() => handleEditClick(p)}
                              className="text-[#9A9A9A] hover:text-[#0ea5e9] p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Edit2 size={14} />
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
