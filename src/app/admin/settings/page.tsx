'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Shield, Bell, CreditCard, LayoutTemplate, Phone, Save, Share2, Lock } from 'lucide-react';

export default function SettingsPage() {
  const [config, setConfig] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(res => res.json())
      .then(data => {
        setConfig(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setConfig((prev: any) => ({ ...prev, [name]: value }));
  };

  const updateConfig = (key: string, value: any) => {
    setConfig((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage('');
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      if (res.ok) {
        setSaveMessage('Paramètres enregistrés avec succès !');
        setTimeout(() => setSaveMessage(''), 3000);
      } else {
        setSaveMessage('Erreur lors de la sauvegarde.');
      }
    } catch (err) {
      console.error(err);
      setSaveMessage('Erreur lors de la sauvegarde.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 lg:p-12 text-[#9A9A9A]">Chargement des paramètres...</div>;
  }

  return (
    <div className="p-8 lg:p-12">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="heading-font text-3xl font-medium text-[#1A1A1A] mb-2">Paramètres du Site</h1>
          <p className="text-[14px] text-[#6B6B6B]">Gérez les configurations générales de votre boutique (Frais, Accueil, Contact...).</p>
        </div>
        {saveMessage && (
          <div className="bg-green-50 text-green-700 px-4 py-2 rounded-lg text-[13px] font-medium border border-green-100">
            {saveMessage}
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="grid lg:grid-cols-2 gap-8">
        {/* Sécurité */}
        <div className="lg:col-span-2 bg-white border border-[#e0ddd4] p-8 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-6">
            <Lock size={20} className="text-sky-600" /> Sécurité
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                Identifiant Admin
              </label>
              <input
                type="text"
                value={config.adminUsername || ''}
                onChange={e => updateConfig('adminUsername', e.target.value)}
                className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm outline-none focus:border-sky-500 transition-colors"
              />
              <p className="text-xs text-gray-400 mt-2">L'identifiant pour accéder à ce panneau (par défaut: admin).</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                Mot de Passe Admin
              </label>
              <input
                type="text"
                value={config.adminPassword || ''}
                onChange={e => updateConfig('adminPassword', e.target.value)}
                className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm outline-none focus:border-sky-500 transition-colors"
              />
              <p className="text-xs text-gray-400 mt-2">Ce mot de passe est visible ici uniquement car vous êtes connecté.</p>
            </div>
          </div>
        </div>

        {/* Livraison */}
        <div className="bg-white border border-[#e0ddd4] p-8 rounded-2xl shadow-sm">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-[#e0ddd4]">
            <div className="w-12 h-12 rounded-xl bg-[#fafaf7] text-[#1A1A1A] flex items-center justify-center">
              <CreditCard size={24} />
            </div>
            <div>
              <h3 className="text-[16px] font-semibold text-[#1A1A1A]">Paiement & Livraison</h3>
              <p className="text-[13px] text-[#6B6B6B]">Définir les frais de livraison appliqués au panier</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold tracking-[0.1em] uppercase text-[#9A9A9A] mb-2">Frais de livraison (MAD)</label>
              <input 
                type="number" 
                name="shippingFee"
                value={config.shippingFee || 0}
                onChange={handleChange}
                className="w-full bg-[#fafaf7] border border-[#e0ddd4] rounded-xl px-4 py-3 text-[13px] focus:outline-none focus:border-[#0ea5e9]"
              />
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white border border-[#e0ddd4] p-8 rounded-2xl shadow-sm">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-[#e0ddd4]">
            <div className="w-12 h-12 rounded-xl bg-[#fafaf7] text-[#1A1A1A] flex items-center justify-center">
              <Phone size={24} />
            </div>
            <div>
              <h3 className="text-[16px] font-semibold text-[#1A1A1A]">Informations de Contact</h3>
              <p className="text-[13px] text-[#6B6B6B]">Affichées sur le site pour vos clients</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold tracking-[0.1em] uppercase text-[#9A9A9A] mb-2">Numéro de téléphone</label>
              <input 
                type="text" 
                name="contactPhone"
                value={config.contactPhone || ''}
                onChange={handleChange}
                className="w-full bg-[#fafaf7] border border-[#e0ddd4] rounded-xl px-4 py-3 text-[13px] focus:outline-none focus:border-[#0ea5e9]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold tracking-[0.1em] uppercase text-[#9A9A9A] mb-2">Adresse Email</label>
              <input 
                type="email" 
                name="contactEmail"
                value={config.contactEmail || ''}
                onChange={handleChange}
                className="w-full bg-[#fafaf7] border border-[#e0ddd4] rounded-xl px-4 py-3 text-[13px] focus:outline-none focus:border-[#0ea5e9]"
              />
            </div>
          </div>
        </div>

        {/* Page d'accueil */}
        <div className="bg-white border border-[#e0ddd4] p-8 rounded-2xl shadow-sm">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-[#e0ddd4]">
            <div className="w-12 h-12 rounded-xl bg-[#fafaf7] text-[#1A1A1A] flex items-center justify-center">
              <LayoutTemplate size={24} />
            </div>
            <div>
              <h3 className="text-[16px] font-semibold text-[#1A1A1A]">Page d'Accueil (Hero)</h3>
              <p className="text-[13px] text-[#6B6B6B]">Textes affichés dans la bannière principale</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold tracking-[0.1em] uppercase text-[#9A9A9A] mb-2">Titre Principal</label>
              <input 
                type="text" 
                name="heroTitle"
                value={config.heroTitle || ''}
                onChange={handleChange}
                className="w-full bg-[#fafaf7] border border-[#e0ddd4] rounded-xl px-4 py-3 text-[13px] focus:outline-none focus:border-[#0ea5e9]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold tracking-[0.1em] uppercase text-[#9A9A9A] mb-2">Sous-titre</label>
              <textarea 
                name="heroSubtitle"
                rows={3}
                value={config.heroSubtitle || ''}
                onChange={handleChange}
                className="w-full bg-[#fafaf7] border border-[#e0ddd4] rounded-xl px-4 py-3 text-[13px] focus:outline-none focus:border-[#0ea5e9] resize-none"
              />
            </div>
          </div>
        </div>

        {/* Coffrets Cover */}
        <div className="bg-white border border-[#e0ddd4] p-8 rounded-2xl shadow-sm">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-[#e0ddd4]">
            <div className="w-12 h-12 rounded-xl bg-[#fafaf7] text-[#1A1A1A] flex items-center justify-center">
              <LayoutTemplate size={24} />
            </div>
            <div>
              <h3 className="text-[16px] font-semibold text-[#1A1A1A]">Cover Coffrets (Accueil)</h3>
              <p className="text-[13px] text-[#6B6B6B]">L'image de couverture du grand carrousel</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold tracking-[0.1em] uppercase text-[#9A9A9A] mb-2">URL de l'image</label>
              <input 
                type="text" 
                name="coffretsCoverImage"
                value={config.coffretsCoverImage || ''}
                onChange={handleChange}
                className="w-full bg-[#fafaf7] border border-[#e0ddd4] rounded-xl px-4 py-3 text-[13px] focus:outline-none focus:border-[#0ea5e9]"
                placeholder="/images/category/pack-decouverte-luxe.jpg"
              />
            </div>
          </div>
        </div>

        {/* Réseaux Sociaux */}
        <div className="bg-white border border-[#e0ddd4] p-8 rounded-2xl shadow-sm">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-[#e0ddd4]">
            <div className="w-12 h-12 rounded-xl bg-[#fafaf7] text-[#1A1A1A] flex items-center justify-center">
              <Share2 size={24} />
            </div>
            <div>
              <h3 className="text-[16px] font-semibold text-[#1A1A1A]">Réseaux Sociaux</h3>
              <p className="text-[13px] text-[#6B6B6B]">Liens vers vos pages sociales</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold tracking-[0.1em] uppercase text-[#9A9A9A] mb-2">Instagram (URL)</label>
              <input 
                type="text" 
                name="instagramUrl"
                value={config.instagramUrl || ''}
                onChange={handleChange}
                className="w-full bg-[#fafaf7] border border-[#e0ddd4] rounded-xl px-4 py-3 text-[13px] focus:outline-none focus:border-[#0ea5e9]"
                placeholder="https://instagram.com/..."
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold tracking-[0.1em] uppercase text-[#9A9A9A] mb-2">Facebook (URL)</label>
              <input 
                type="text" 
                name="facebookUrl"
                value={config.facebookUrl || ''}
                onChange={handleChange}
                className="w-full bg-[#fafaf7] border border-[#e0ddd4] rounded-xl px-4 py-3 text-[13px] focus:outline-none focus:border-[#0ea5e9]"
                placeholder="https://facebook.com/..."
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold tracking-[0.1em] uppercase text-[#9A9A9A] mb-2">TikTok (URL)</label>
              <input 
                type="text" 
                name="tiktokUrl"
                value={config.tiktokUrl || ''}
                onChange={handleChange}
                className="w-full bg-[#fafaf7] border border-[#e0ddd4] rounded-xl px-4 py-3 text-[13px] focus:outline-none focus:border-[#0ea5e9]"
                placeholder="https://tiktok.com/@..."
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold tracking-[0.1em] uppercase text-[#9A9A9A] mb-2">WhatsApp (URL ou numéro)</label>
              <input 
                type="text" 
                name="whatsappUrl"
                value={config.whatsappUrl || ''}
                onChange={handleChange}
                className="w-full bg-[#fafaf7] border border-[#e0ddd4] rounded-xl px-4 py-3 text-[13px] focus:outline-none focus:border-[#0ea5e9]"
                placeholder="https://wa.me/212..."
              />
            </div>
          </div>
        </div>

        {/* Bouton de Sauvegarde global */}
        <div className="lg:col-span-2 flex justify-end pt-4">
          <button 
            type="submit" 
            disabled={isSaving}
            className="btn-blue flex items-center gap-2 px-8 py-4 rounded-xl text-[13px] font-bold tracking-[0.1em] uppercase disabled:opacity-50"
          >
            <Save size={18} />
            {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
        </div>
      </form>
    </div>
  );
}
