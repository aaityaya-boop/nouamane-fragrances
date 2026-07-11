'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Trash2, ArrowLeft, Image as ImageIcon, Bold, Heading2, Link as LinkIcon, Quote } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

export default function BlogForm({ initialData, dbProducts = [] }: { initialData?: any, dbProducts?: any[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    slug: initialData?.slug || '',
    title: initialData?.title || '',
    excerpt: initialData?.excerpt || '',
    content: initialData?.content || '',
    coverImage: initialData?.coverImage || '',
    author: initialData?.author || 'Nouamane',
    status: initialData?.status || 'draft',
    metaTitle: initialData?.metaTitle || '',
    metaDescription: initialData?.metaDescription || '',
    category: initialData?.category || 'Général',
    tags: initialData?.tags ? JSON.parse(initialData.tags).join(', ') : '',
    ctaText: initialData?.ctaText || '',
    ctaLink: initialData?.ctaLink || '',
    relatedProductSlugs: initialData?.relatedProductSlugs ? JSON.parse(initialData.relatedProductSlugs) : []
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const url = initialData 
      ? `/api/admin/blog/${initialData.id}` 
      : '/api/admin/blog';
      
    const method = initialData ? 'PUT' : 'POST';

    // Parse tags back into array before sending
    const tagsArray = formData.tags
      .split(',')
      .map((t: string) => t.trim())
      .filter((t: string) => t.length > 0);

    const dataToSend = {
      ...formData,
      tags: JSON.stringify(tagsArray),
      relatedProductSlugs: JSON.stringify(formData.relatedProductSlugs)
    };

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dataToSend)
    });

    if (res.ok) {
      router.push('/admin/blog');
      router.refresh();
    } else {
      alert("Erreur lors de l'enregistrement");
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Voulez-vous vraiment supprimer cet article ?')) return;
    setLoading(true);
    const res = await fetch(`/api/admin/blog/${initialData.id}`, { method: 'DELETE' });
    if (res.ok) {
      router.push('/admin/blog');
      router.refresh();
    } else {
      alert('Erreur lors de la suppression');
      setLoading(false);
    }
  };



  const toggleProduct = (slug: string) => {
    setFormData(prev => {
      const current = prev.relatedProductSlugs;
      if (current.includes(slug)) {
        return { ...prev, relatedProductSlugs: current.filter((s: string) => s !== slug) };
      } else {
        return { ...prev, relatedProductSlugs: [...current, slug] };
      }
    });
  };

  const googleTitle = formData.metaTitle || formData.title || 'Titre de l\'article';
  const googleDesc = formData.metaDescription || formData.excerpt || 'Description de l\'article qui apparaîtra dans les résultats de recherche Google...';

  return (
    <form onSubmit={handleSubmit} className="max-w-6xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/blog" className="text-gray-400 hover:text-gray-600">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            {initialData ? 'Modifier l\'article' : 'Nouvel Article'}
          </h1>
        </div>
        <div className="flex gap-3">
          {initialData && (
            <button 
              type="button" 
              onClick={handleDelete}
              className="text-red-600 px-4 py-2 bg-red-50 rounded-lg hover:bg-red-100 font-medium text-sm flex items-center gap-2"
            >
              <Trash2 size={16} /> Supprimer
            </button>
          )}
          <button 
            type="submit" 
            disabled={loading}
            className="bg-sky-600 text-white px-6 py-2 rounded-lg font-medium text-sm flex items-center gap-2 hover:bg-sky-700 transition-colors disabled:opacity-50"
          >
            <Save size={16} /> {loading ? '...' : 'Enregistrer'}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-6">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Titre de l'article</label>
              <input 
                type="text" 
                required
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                placeholder="Ex: Top 5 des parfums d'été"
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-xl font-bold focus:outline-none focus:border-sky-500"
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Extrait (Affiché sur la page d'accueil du blog)</label>
              <textarea 
                required
                rows={2}
                value={formData.excerpt}
                onChange={e => setFormData({...formData, excerpt: e.target.value})}
                placeholder="Un court résumé qui donne envie de lire la suite..."
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contenu de l'article</label>
              <div className="bg-white">
                <ReactQuill 
                  theme="snow" 
                  value={formData.content} 
                  onChange={(val) => setFormData({...formData, content: val})} 
                  className="h-[400px] mb-12"
                  modules={{
                    toolbar: [
                      [{ 'header': [1, 2, 3, false] }],
                      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                      [{'list': 'ordered'}, {'list': 'bullet'}],
                      ['link', 'image'],
                      ['clean']
                    ],
                  }}
                />
              </div>
            </div>
          </div>
          
          {/* SEO Marketing Panel */}
          <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Optimisation SEO (Google)</h3>
            
            {/* Live Google Preview */}
            <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-white">
              <p className="text-xs text-gray-500 mb-2 uppercase font-bold tracking-wider">Aperçu Google</p>
              <div className="flex flex-col gap-1 max-w-xl">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold">N</div>
                  <div className="flex flex-col">
                    <span className="text-[14px] text-[#202124]">Nouamane Parfums</span>
                    <span className="text-[12px] text-[#4d5156]">https://nouamane.ma › fr › blog › {formData.slug || 'slug'}</span>
                  </div>
                </div>
                <h3 className="text-[20px] text-[#1a0dab] font-medium hover:underline cursor-pointer truncate">
                  {googleTitle}
                </h3>
                <p className="text-[14px] text-[#4d5156] line-clamp-2">
                  {googleDesc}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Méta Titre (Optionnel)</label>
                <input 
                  type="text" 
                  value={formData.metaTitle}
                  onChange={e => setFormData({...formData, metaTitle: e.target.value})}
                  placeholder="Laissez vide pour utiliser le titre de l'article"
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Méta Description (Optionnelle)</label>
                <textarea 
                  rows={2}
                  value={formData.metaDescription}
                  onChange={e => setFormData({...formData, metaDescription: e.target.value})}
                  placeholder="Laissez vide pour utiliser l'extrait de l'article"
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>
          </div>

          {/* Call To Action Panel */}
          <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-6 mt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Marketing (Call To Action)</h3>
            <p className="text-sm text-gray-500 mb-4">Ajoutez un bouton personnalisé à la fin de l'article pour convertir vos lecteurs.</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Texte du bouton</label>
                <input 
                  type="text" 
                  value={formData.ctaText}
                  onChange={e => setFormData({...formData, ctaText: e.target.value})}
                  placeholder="ex: Découvrir nos parfums d'été"
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lien du bouton</label>
                <input 
                  type="text" 
                  value={formData.ctaLink}
                  onChange={e => setFormData({...formData, ctaLink: e.target.value})}
                  placeholder="ex: /shop/femme"
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar settings */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
              <select 
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-sky-500"
              >
                <option value="Général">Général</option>
                <option value="Guides">Guides</option>
                <option value="Nouveautés">Nouveautés</option>
                <option value="Conseils">Conseils</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mots-clés (Tags)</label>
              <input 
                type="text" 
                value={formData.tags}
                onChange={e => setFormData({...formData, tags: e.target.value})}
                placeholder="parfum, été, femme..."
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-sky-500"
              />
              <p className="text-xs text-gray-500 mt-1">Séparés par des virgules</p>
            </div>

            <hr className="border-gray-200" />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL (Slug)</label>
              <input 
                type="text" 
                required
                value={formData.slug}
                onChange={e => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')})}
                placeholder="ex: top-5-parfums"
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-sky-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
              <select 
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value})}
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-sky-500"
              >
                <option value="draft">Brouillon</option>
                <option value="published">Publié</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Auteur</label>
              <input 
                type="text" 
                required
                value={formData.author}
                onChange={e => setFormData({...formData, author: e.target.value})}
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-sky-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image de couverture (URL)</label>
              <input 
                type="text" 
                required
                value={formData.coverImage}
                onChange={e => setFormData({...formData, coverImage: e.target.value})}
                placeholder="https://..."
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-sky-500 mb-3"
              />
              {formData.coverImage ? (
                <div className="w-full aspect-video relative rounded-lg overflow-hidden border border-gray-200">
                  <img src={formData.coverImage} alt="Preview" className="object-cover w-full h-full" />
                </div>
              ) : (
                <div className="w-full aspect-video rounded-lg border border-dashed border-gray-300 flex items-center justify-center bg-gray-50 text-gray-400">
                  <ImageIcon size={32} />
                </div>
              )}
            </div>
          </div>

          {/* Related Products Panel */}
          <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-6">
            <h3 className="text-sm font-bold text-gray-900 mb-1">Parfums mentionnés</h3>
            <p className="text-xs text-gray-500 mb-4">Ces parfums s'afficheront à la fin de l'article pour inciter à l'achat.</p>
            
            <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-2">
              {dbProducts.map(p => {
                const isSelected = formData.relatedProductSlugs.includes(p.slug);
                return (
                  <button
                    key={p.slug}
                    type="button"
                    onClick={() => toggleProduct(p.slug)}
                    className={`w-full text-left p-3 rounded-lg border text-sm transition-all ${
                      isSelected 
                        ? 'border-[#0ea5e9] bg-[#0ea5e9]/5' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-gray-900">{p.name}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider">{p.brandId || p.brandLabel || 'Nouamane'}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
