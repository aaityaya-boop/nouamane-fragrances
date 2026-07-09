'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, X } from 'lucide-react';

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
    <div className="p-8 lg:p-12 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="heading-font text-3xl font-light text-[#1A1A1A]">Marques</h1>
          <p className="text-[#6B6B6B] text-[13px] mt-1">Gérez vos marques ({brands.length} au total)</p>
        </div>
        
        <button 
          onClick={openAddModal}
          className="flex items-center gap-2 bg-[#1A1A1A] text-white px-5 py-2.5 rounded-lg text-[13px] hover:bg-[#0ea5e9] transition-colors"
        >
          <Plus size={16} /> Ajouter une marque
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-[#e0ddd4] overflow-hidden">
        <div className="p-4 border-b border-[#e0ddd4] flex items-center gap-3">
          <Search size={16} className="text-[#9A9A9A]" />
          <input 
            type="text" 
            placeholder="Rechercher une marque..." 
            className="flex-1 bg-transparent border-none focus:outline-none text-[13px]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-[#f8fafc] text-[#6B6B6B] border-b border-[#e0ddd4]">
              <tr>
                <th className="p-4 font-medium">Marque</th>
                <th className="p-4 font-medium">Slug</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e0ddd4]">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-[#9A9A9A]">Chargement...</td>
                </tr>
              ) : filteredBrands.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-[#9A9A9A]">Aucune marque trouvée.</td>
                </tr>
              ) : (
                filteredBrands.map((b) => (
                  <tr key={b.id} className="hover:bg-[#f8fafc] transition-colors">
                    <td className="p-4 font-medium text-[#1A1A1A]">
                      {b.name}
                    </td>
                    <td className="p-4 text-[#9A9A9A]">
                      {b.slug}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => openEditModal(b)}
                          className="w-8 h-8 flex items-center justify-center rounded bg-[#f8fafc] text-[#6B6B6B] hover:text-[#0ea5e9] hover:bg-[#e0f2fe] transition-colors border border-[#e0ddd4]"
                          aria-label="Modifier"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={() => handleDelete(b.id)}
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
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="bg-white border-b border-[#e0ddd4] p-5 flex items-center justify-between">
              <h2 className="heading-font text-xl">{editingBrand ? 'Modifier la marque' : 'Ajouter une marque'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[#9A9A9A] hover:text-[#1A1A1A]">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-5">
              <div>
                <label className="block text-[11px] font-bold text-[#6B6B6B] uppercase mb-2">Nom de la marque</label>
                <input required type="text" className="w-full border border-[#e0ddd4] rounded-lg p-2.5 text-[13px] focus:outline-none focus:border-[#0ea5e9]"
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ex: Dior" />
              </div>
              
              <div>
                <label className="block text-[11px] font-bold text-[#6B6B6B] uppercase mb-2 flex items-center gap-2">
                  <span>Slug (Identifiant dans l'URL)</span>
                  <span className="bg-gray-100 px-2 py-0.5 rounded text-[10px]">nouamane.ma/fr/brands/<span className="text-blue-500">{formData.slug || 'dior'}</span></span>
                </label>
                <input required type="text" className="w-full border border-[#e0ddd4] rounded-lg p-2.5 text-[13px] focus:outline-none focus:border-[#0ea5e9]"
                  value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} placeholder="Ex: dior" />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#6B6B6B] uppercase mb-2">Label (Identique au nom en général)</label>
                <input required type="text" className="w-full border border-[#e0ddd4] rounded-lg p-2.5 text-[13px] focus:outline-none focus:border-[#0ea5e9]"
                  value={formData.label} onChange={e => setFormData({...formData, label: e.target.value})} placeholder="Ex: Dior" />
              </div>
              
              <div>
                <label className="block text-[11px] font-bold text-[#6B6B6B] uppercase mb-2">Description / Histoire</label>
                <textarea className="w-full border border-[#e0ddd4] rounded-lg p-2.5 text-[13px] min-h-[80px] focus:outline-none focus:border-[#0ea5e9]"
                  value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-[#e0ddd4]">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-[13px] text-[#6B6B6B] hover:text-[#1A1A1A]">Annuler</button>
                <button type="submit" className="bg-[#0ea5e9] text-white px-6 py-2.5 rounded-lg text-[13px] font-medium hover:bg-blue-600 transition-colors">
                  {editingBrand ? 'Enregistrer' : 'Ajouter la marque'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
