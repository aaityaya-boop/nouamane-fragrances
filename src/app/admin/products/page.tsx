'use client';

import React, { useState, useEffect } from 'react';
import { Product } from '@/lib/products';
import { Plus, Edit2, Trash2, Search, X, Upload } from 'lucide-react';
import Image from 'next/image';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
    
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<any>({});
  const [isUploading, setIsUploading] = useState(false);

  const [brands, setBrands] = useState<any[]>([]);

  const fetchBrands = async () => {
    try {
      const res = await fetch('/api/admin/brands');
      const data = await res.json();
      setBrands(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/products');
      const data = await res.json();
      
      const parsedData = data.map((p: any) => ({
        ...p,
        images: typeof p.images === 'string' ? JSON.parse(p.images) : p.images,
        sizes: typeof p.sizes === 'string' ? JSON.parse(p.sizes) : p.sizes,
        notes: typeof p.notes === 'string' ? JSON.parse(p.notes) : p.notes,
        tags: typeof p.tags === 'string' ? JSON.parse(p.tags) : p.tags,
      }));
      
      setProducts(parsedData);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchBrands();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return;
    
    try {
      await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      fetchProducts();
    } catch (error) {
      console.error(error);
    }
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      id: `p-${Date.now()}`,
      slug: '',
      name: '',
      brand: 'valentino',
      brandLabel: 'Valentino',
      gender: 'women',
      subcategory: 'floral',
      subcategoryLabel: 'Floral',
      price: 0,
      originalPrice: 0,
      images: [],
      rating: 5.0,
      reviewCount: 0,
      description: '',
      longDescription: '',
      notes: { top: [], heart: [], base: [] },
      ingredients: '',
      sizes: [{ label: '50ml', price: 0 }],
      tags: [],
      bottleColor: 'transparent',
      bottleMaterial: 'glass',
      perfectSeason: 'all',
      tagline: '',
      releaseDate: new Date().toISOString(),
      inStock: true,
      isTester: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({ ...product });
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const uploadData = new FormData();
    uploadData.append('file', file);
    
    setIsUploading(true);
    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: uploadData,
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Erreur serveur lors de l\'upload');
      }
      
      if (data.url) {
        setFormData((prev: any) => ({
          ...prev,
          images: [...(prev.images || []), data.url]
        }));
      }
    } catch (error: any) {
      console.error('Failed to upload image', error);
      alert(`Erreur lors du téléchargement de l'image: ${error.message}`);
    } finally {
      setIsUploading(false);
      e.target.value = ''; // Reset input to allow re-uploading the same file
    }
  };

  const handleAddSize = () => {
    setFormData((prev: any) => ({
      ...prev,
      sizes: [...(prev.sizes || []), { label: '', price: 0 }]
    }));
  };

  const handleUpdateSize = (index: number, field: string, value: any) => {
    setFormData((prev: any) => {
      const newSizes = [...(prev.sizes || [])];
      newSizes[index] = { ...newSizes[index], [field]: value };
      return { ...prev, sizes: newSizes };
    });
  };

  const handleRemoveSize = (index: number) => {
    setFormData((prev: any) => {
      const newSizes = [...(prev.sizes || [])];
      newSizes.splice(index, 1);
      return { ...prev, sizes: newSizes };
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingProduct ? 'PUT' : 'POST';
      const url = editingProduct ? `/api/admin/products/${editingProduct.id}` : '/api/admin/products';
      
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      setIsModalOpen(false);
      fetchProducts();
    } catch (error) {
      console.error(error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  const filteredProducts = products
    .filter((p: any) => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                            p.brandLabel.toLowerCase().includes(search.toLowerCase());
      return matchesSearch;
    })
    .sort((a: any, b: any) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }));


  return (
    <div className="p-8 lg:p-12 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="heading-font text-3xl font-light text-[#1A1A1A]">Produits</h1>
          <p className="text-[#6B6B6B] text-[13px] mt-1">Gérez votre catalogue de parfums ({products.length} au total)</p>
        </div>
        
        <button 
          onClick={openAddModal}
          className="flex items-center gap-2 bg-[#1A1A1A] text-white px-5 py-2.5 rounded-lg text-[13px] hover:bg-[#0ea5e9] transition-colors"
        >
          <Plus size={16} /> Ajouter un produit
        </button>
      </div>


      <div className="bg-white rounded-2xl border border-[#e0ddd4] overflow-hidden">
        <div className="p-4 border-b border-[#e0ddd4] flex items-center gap-3">
          <Search size={16} className="text-[#9A9A9A]" />
          <input 
            type="text" 
            placeholder="Rechercher un parfum..." 
            className="flex-1 bg-transparent border-none focus:outline-none text-[13px]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-[#f8fafc] text-[#6B6B6B] border-b border-[#e0ddd4]">
              <tr>
                <th className="p-4 font-medium">Produit</th>
                <th className="p-4 font-medium">Marque</th>
                <th className="p-4 font-medium">Prix (MAD)</th>
                <th className="p-4 font-medium">Stock/Statut</th>
                <th className="p-4 font-medium text-right">Actions</th>
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
                filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-[#f8fafc] transition-colors">
                    <td className="p-4 flex items-center gap-4">
                      <div className="w-10 h-10 bg-[#eeece5] rounded-lg overflow-hidden relative border border-[#e0ddd4]">
                        {p.images[0] && <Image src={p.images[0]} alt={p.name} fill className="object-cover" />}
                      </div>
                      <div>
                        <div className="font-semibold text-[#1A1A1A]">{p.name}</div>
                        <div className="text-[11px] text-[#9A9A9A] mt-0.5">{p.sizes[0]?.label}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="bg-[#f0f9ff] text-[#0ea5e9] px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider border border-[#e0f2fe]">
                        {p.brandLabel}
                      </span>
                    </td>
                    <td className="p-4 font-medium text-[#1A1A1A]">
                      {p.price} Dh
                    </td>
                    <td className="p-4 flex gap-1 items-center">
                      {p.inStock ? (
                        <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold">EN STOCK</span>
                      ) : (
                        <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-[10px] font-bold">RUPTURE</span>
                      )}
                      {(p as any).isTester && (
                        <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-[10px] font-bold">TESTEUR</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => openEditModal(p)}
                          className="w-8 h-8 flex items-center justify-center rounded bg-[#f8fafc] text-[#6B6B6B] hover:text-[#0ea5e9] hover:bg-[#e0f2fe] transition-colors border border-[#e0ddd4]"
                          aria-label="Modifier"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={() => handleDelete(p.id)}
                          className="w-8 h-8 flex items-center justify-center rounded bg-[#f8fafc] text-[#6B6B6B] hover:text-red-500 hover:bg-red-50 transition-colors border border-[#e0ddd4]"
                          aria-label="Supprimer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-[#e0ddd4] p-5 flex items-center justify-between z-10">
              <h2 className="heading-font text-xl">{editingProduct ? 'Modifier le produit' : 'Ajouter un produit'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[#9A9A9A] hover:text-[#1A1A1A]">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-[11px] font-bold text-[#6B6B6B] uppercase mb-2">Nom du parfum</label>
                  <input required type="text" className="w-full border border-[#e0ddd4] rounded-lg p-2.5 text-[13px] focus:outline-none focus:border-[#0ea5e9]"
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#6B6B6B] uppercase mb-2">Slug (URL)</label>
                  <input required type="text" className="w-full border border-[#e0ddd4] rounded-lg p-2.5 text-[13px] focus:outline-none focus:border-[#0ea5e9]"
                    value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} />
                </div>
                
                <div>
                  <label className="block text-[11px] font-bold text-[#6B6B6B] uppercase mb-2">Marque</label>
                  <select className="w-full border border-[#e0ddd4] rounded-lg p-2.5 text-[13px] focus:outline-none focus:border-[#0ea5e9]"
                    value={formData.brand} onChange={e => {
                      const selectedBrand = brands.find(b => b.slug === e.target.value);
                      setFormData({
                        ...formData, 
                        brand: e.target.value,
                        brandLabel: selectedBrand ? selectedBrand.label : ''
                      });
                    }}>
                    <option value="">Sélectionnez une marque</option>
                    {brands.map(b => (
                      <option key={b.id} value={b.slug}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#6B6B6B] uppercase mb-2">Label Marque (Affichage)</label>
                  <input type="text" className="w-full border border-[#e0ddd4] rounded-lg p-2.5 text-[13px] focus:outline-none focus:border-[#0ea5e9]"
                    value={formData.brandLabel} onChange={e => setFormData({...formData, brandLabel: e.target.value})} />
                </div>
                
                <div>
                  <label className="block text-[11px] font-bold text-[#6B6B6B] uppercase mb-2">Prix de Vente (MAD)</label>
                  <input required type="number" className="w-full border border-[#e0ddd4] rounded-lg p-2.5 text-[13px] focus:outline-none focus:border-[#0ea5e9]"
                    value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#6B6B6B] uppercase mb-2 flex justify-between">
                    <span>Ancien Prix (pour remises)</span>
                    <span className="text-red-500 font-normal lowercase italic">Optionnel</span>
                  </label>
                  <input type="number" className="w-full border border-[#e0ddd4] rounded-lg p-2.5 text-[13px] focus:outline-none focus:border-red-500"
                    value={formData.originalPrice || ''} onChange={e => setFormData({...formData, originalPrice: e.target.value ? Number(e.target.value) : null})} 
                    placeholder="Ex: 850 (Si le prix de vente est 650)" />
                </div>
                <div className="col-span-2 flex items-center gap-3 bg-[#f8fafc] p-4 rounded-lg border border-[#e0ddd4]">
                  <input 
                    type="checkbox" 
                    id="isTesterToggle"
                    className="w-5 h-5 accent-[#0ea5e9] cursor-pointer"
                    checked={formData.isTester} 
                    onChange={e => setFormData({...formData, isTester: e.target.checked})} 
                  />
                  <label htmlFor="isTesterToggle" className="text-[13px] font-bold text-[#1A1A1A] cursor-pointer">
                    Est-ce un testeur ?
                  </label>
                  <span className="text-[11px] text-[#9A9A9A] ml-auto">
                    Cochez cette case si le produit est un format testeur.
                  </span>
                </div>
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-[#6B6B6B] uppercase mb-2">Genre</label>
                  <select className="w-full border border-[#e0ddd4] rounded-lg p-2.5 text-[13px] focus:outline-none focus:border-[#0ea5e9]"
                    value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                    <option value="women">Femme</option>
                    <option value="men">Homme</option>
                    <option value="unisex">Unisex</option>
                  </select>
                </div>
                
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-[#6B6B6B] uppercase mb-2">Famille olfactive</label>
                  <select className="w-full border border-[#e0ddd4] rounded-lg p-2.5 text-[13px] focus:outline-none focus:border-[#0ea5e9]"
                    value={formData.subcategory} 
                    onChange={e => {
                      const labelMap: any = {
                        floral: 'Floral', oriental: 'Oriental', fresh: 'Frais', woody: 'Boisé', 
                        aromatic: 'Aromatique', 'discovery-sets': 'Coffrets Découverte', 
                        'gift-bundles': 'Coffrets Cadeaux', 'limited-editions': 'Éditions Limitées'
                      };
                      setFormData({...formData, subcategory: e.target.value, subcategoryLabel: labelMap[e.target.value]});
                    }}>
                    <option value="floral">Floral</option>
                    <option value="oriental">Oriental</option>
                    <option value="fresh">Frais</option>
                    <option value="woody">Boisé</option>
                    <option value="aromatic">Aromatique</option>
                    <option value="discovery-sets">Coffrets Découverte</option>
                    <option value="gift-bundles">Coffrets Cadeaux</option>
                    <option value="limited-editions">Éditions Limitées</option>
                  </select>
                </div>

                <div className="col-span-2 flex items-center gap-3 bg-[#f8fafc] p-4 rounded-lg border border-[#e0ddd4]">
                  <input 
                    type="checkbox" 
                    id="inStockToggle"
                    className="w-5 h-5 accent-[#0ea5e9] cursor-pointer"
                    checked={formData.inStock} 
                    onChange={e => setFormData({...formData, inStock: e.target.checked})} 
                  />
                  <label htmlFor="inStockToggle" className="text-[13px] font-bold text-[#1A1A1A] cursor-pointer">
                    Produit en stock
                  </label>
                  <span className="text-[11px] text-[#9A9A9A] ml-auto">
                    Décochez cette case pour afficher le produit en "Rupture de stock" sur le site.
                  </span>
                </div>
                
                <div className="col-span-2 border-t border-b border-[#e0ddd4] py-4 my-2">
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-[11px] font-bold text-[#6B6B6B] uppercase">Contenances et Prix (ML)</label>
                    <button type="button" onClick={handleAddSize} className="text-[#0ea5e9] text-[11px] font-semibold hover:underline flex items-center gap-1">
                      <Plus size={12} /> Ajouter une taille
                    </button>
                  </div>
                  <div className="space-y-3">
                    {formData.sizes?.map((size: any, idx: number) => (
                      <div key={idx} className="flex gap-3 items-center">
                        <input type="text" placeholder="Ex: 50ml" className="flex-1 border border-[#e0ddd4] rounded-lg p-2.5 text-[13px]"
                          value={size.label} onChange={e => handleUpdateSize(idx, 'label', e.target.value)} />
                        <input type="number" placeholder="Prix" className="flex-1 border border-[#e0ddd4] rounded-lg p-2.5 text-[13px]"
                          value={size.price} onChange={e => handleUpdateSize(idx, 'price', Number(e.target.value))} />
                        <button type="button" onClick={() => handleRemoveSize(idx)} className="text-red-500 p-2 hover:bg-red-50 rounded">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-[#6B6B6B] uppercase mb-2">Images du parfum</label>
                  <div className="flex gap-4 mb-3 flex-wrap">
                    {formData.images?.map((img: string, idx: number) => (
                      <div key={idx} className="relative w-16 h-16 border border-[#e0ddd4] rounded-lg overflow-hidden group">
                        <Image src={img} alt="Preview" fill className="object-cover" />
                        <button type="button" 
                          onClick={() => setFormData((prev: any) => ({ ...prev, images: prev.images.filter((_: any, i: number) => i !== idx) }))}
                          className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                    <label className={`w-16 h-16 border-2 border-dashed border-[#e0ddd4] rounded-lg flex items-center justify-center text-[#9A9A9A] hover:text-[#0ea5e9] hover:border-[#0ea5e9] cursor-pointer transition-colors ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      {isUploading ? (
                        <div className="w-5 h-5 border-2 border-gray-400 border-t-[#0ea5e9] rounded-full animate-spin"></div>
                      ) : (
                        <Upload size={20} />
                      )}
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploading} />
                    </label>
                  </div>
                  <input type="text" className="w-full border border-[#e0ddd4] rounded-lg p-2.5 text-[13px] focus:outline-none focus:border-[#0ea5e9]"
                    value={formData.images?.join(', ')} 
                    onChange={e => setFormData({...formData, images: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean)})} 
                    placeholder="Ou collez des URLs directement (séparées par des virgules)" />
                </div>
                
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-[#6B6B6B] uppercase mb-2">Description</label>
                  <textarea className="w-full border border-[#e0ddd4] rounded-lg p-2.5 text-[13px] min-h-[80px] focus:outline-none focus:border-[#0ea5e9]"
                    value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                </div>
                
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-[#6B6B6B] uppercase mb-2">Longue Description</label>
                  <textarea className="w-full border border-[#e0ddd4] rounded-lg p-2.5 text-[13px] min-h-[120px] focus:outline-none focus:border-[#0ea5e9]"
                    value={formData.longDescription} onChange={e => setFormData({...formData, longDescription: e.target.value})} />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-[#e0ddd4]">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-[13px] text-[#6B6B6B] hover:text-[#1A1A1A]">Annuler</button>
                <button type="submit" className="bg-[#0ea5e9] text-white px-6 py-2.5 rounded-lg text-[13px] font-medium hover:bg-blue-600 transition-colors">
                  {editingProduct ? 'Enregistrer les modifications' : 'Ajouter le produit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
