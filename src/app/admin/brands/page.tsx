'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, X, Hash } from 'lucide-react';

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<any | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<any>({});

  const fetchBrands = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/brands');
      const data = await res.json();
      setBrands(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette marque ? Cela ne fonctionnera que si aucun produit n'y est associé.")) return;
    
    try {
      const res = await fetch(`/api/admin/brands/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
      } else {
        fetchBrands();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const openAddModal = () => {
    setEditingBrand(null);
    setFormData({
      slug: '',
      name: '',
      label: '',
      description: '',
      image: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (brand: any) => {
    setEditingBrand(brand);
    setFormData({ ...brand });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingBrand ? 'PUT' : 'POST';
      const url = editingBrand ? `/api/admin/brands/${editingBrand.id}` : '/api/admin/brands';
      
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      setIsModalOpen(false);
      fetchBrands();
    } catch (error) {
      console.error(error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  const filteredBrands = brands.filter(b => 
    b.name.toLowerCase().includes(search.toLowerCase()) || 
    b.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 lg:p-12 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-[#111] mb-2 tracking-tight">Marques</h1>
          <p className="text-[#666] text-[14px]">Gérez vos marques partenaires et fournisseurs ({brands.length} au total)</p>
        </div>
        
        <button 
          onClick={openAddModal}
          className="flex items-center gap-2 bg-[#111] text-white px-5 py-2.5 rounded-lg text-[13px] font-medium hover:bg-gray-800 transition-colors shadow-sm"
        >
          <Plus size={16} /> Ajouter une marque
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-[#eaeaea] overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[#eaeaea] flex items-center gap-3 bg-white">
          <Search size={16} className="text-[#999]" />
          <input 
            type="text" 
            placeholder="Rechercher une marque..." 
            className="flex-1 bg-transparent border-none focus:outline-none text-[14px] text-[#111] placeholder:text-[#999]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#fafafa] border-b border-[#eaeaea]">
              <tr>
                <th className="px-6 py-4 text-[11px] font-bold text-[#666] uppercase tracking-wider">Marque</th>
                <th className="px-6 py-4 text-[11px] font-bold text-[#666] uppercase tracking-wider">Slug (URL)</th>
                <th className="px-6 py-4 text-[11px] font-bold text-[#666] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eaeaea]">
              {isLoading ? (
                <tr>
                  <td colSpan={3} className="p-12 text-center text-[#666] text-[13px]">Chargement des marques...</td>
                </tr>
              ) : filteredBrands.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-12 text-center text-[#666] text-[13px]">Aucune marque trouvée.</td>
                </tr>
              ) : (
                filteredBrands.map((b) => (
                  <tr key={b.id} className="hover:bg-[#fafafa] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-[14px] font-black text-gray-800 shadow-sm border border-[#eaeaea] shrink-0 font-serif italic">
                          {b.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-[14px] font-bold text-[#111]">{b.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-[12px] font-mono text-[#666] bg-gray-50 inline-flex px-2 py-1 rounded-md border border-[#eaeaea]">
                        <Hash size={12} className="text-[#999]" />
                        {b.slug}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => openEditModal(b)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white text-[#666] hover:text-[#0ea5e9] hover:bg-sky-50 transition-colors border border-[#eaeaea] shadow-sm"
                          aria-label="Modifier"
                          title="Modifier"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={() => handleDelete(b.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white text-[#666] hover:text-red-500 hover:bg-red-50 transition-colors border border-[#eaeaea] shadow-sm"
                          aria-label="Supprimer"
                          title="Supprimer"
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-white border-b border-[#eaeaea] px-6 py-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#111] tracking-tight">{editingBrand ? 'Modifier la marque' : 'Nouvelle marque'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[#999] hover:text-[#111] bg-gray-50 hover:bg-gray-100 p-1.5 rounded-full transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-6 bg-[#fafafa]">
              <div className="bg-white p-5 rounded-xl border border-[#eaeaea] space-y-5 shadow-sm">
                <div>
                  <label className="block text-[11px] font-bold text-[#666] uppercase tracking-wider mb-2">Nom de la marque</label>
                  <input required type="text" className="w-full border border-[#eaeaea] bg-[#fafafa] rounded-lg p-2.5 text-[13px] font-medium text-[#111] focus:outline-none focus:ring-2 focus:ring-[#111]/10 focus:border-[#111] transition-all"
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ex: Dior, Chanel..." />
                </div>
                
                <div>
                  <label className="block text-[11px] font-bold text-[#666] uppercase tracking-wider mb-2 flex items-center justify-between gap-2">
                    <span>Slug (Identifiant URL)</span>
                    <span className="font-mono text-[10px] text-[#888] normal-case bg-gray-100 px-1.5 py-0.5 rounded">nouamane.ma/fr/brands/<span className="text-[#0ea5e9] font-bold">{formData.slug || 'slug'}</span></span>
                  </label>
                  <input required type="text" className="w-full border border-[#eaeaea] bg-[#fafafa] rounded-lg p-2.5 text-[13px] font-mono text-[#111] focus:outline-none focus:ring-2 focus:ring-[#111]/10 focus:border-[#111] transition-all"
                    value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} placeholder="Ex: dior" />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#666] uppercase tracking-wider mb-2">Label affiché</label>
                  <input required type="text" className="w-full border border-[#eaeaea] bg-[#fafafa] rounded-lg p-2.5 text-[13px] font-medium text-[#111] focus:outline-none focus:ring-2 focus:ring-[#111]/10 focus:border-[#111] transition-all"
                    value={formData.label} onChange={e => setFormData({...formData, label: e.target.value})} placeholder="Ex: Dior" />
                </div>
                
                <div>
                  <label className="block text-[11px] font-bold text-[#666] uppercase tracking-wider mb-2">Description / Histoire</label>
                  <textarea className="w-full border border-[#eaeaea] bg-[#fafafa] rounded-lg p-3 text-[13px] text-[#111] min-h-[100px] focus:outline-none focus:ring-2 focus:ring-[#111]/10 focus:border-[#111] transition-all resize-y"
                    value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Histoire de la marque..." />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-[13px] font-medium text-[#666] hover:text-[#111] bg-white border border-[#eaeaea] rounded-lg hover:bg-gray-50 transition-colors shadow-sm">Annuler</button>
                <button type="submit" className="bg-[#111] text-white px-6 py-2.5 rounded-lg text-[13px] font-bold hover:bg-gray-800 transition-colors shadow-sm">
                  {editingBrand ? 'Enregistrer les modifications' : 'Créer la marque'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
