'use client';

import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Shield, 
  CreditCard, 
  LayoutTemplate, 
  Phone, 
  Save, 
  Share2, 
  Lock, 
  Check, 
  Loader2,
  Mail,
  Truck,
  Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
        setTimeout(() => setSaveMessage(''), 3500);
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
    return (
      <div className="h-full w-full flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-neutral-800 mb-3" size={32} />
        <p className="text-xs text-neutral-500 font-medium tracking-wide uppercase">Chargement des paramètres...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-semibold tracking-wider bg-neutral-100 text-neutral-700 border border-neutral-200">
              Configuration
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 flex items-center gap-2">
            <Settings size={22} className="text-neutral-900" />
            <span>Paramètres de la Boutique</span>
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Gérez les configurations générales de votre boutique (Frais, Accueil, Contact, Réseaux...).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <AnimatePresence>
            {saveMessage && (
              <motion.div
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg shadow-2xs ${
                  saveMessage.includes('succès') 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                <Check size={13} />
                {saveMessage}
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 bg-neutral-900 text-white px-4 py-2 rounded-lg text-xs font-medium transition-all hover:bg-black shadow-xs disabled:opacity-60 cursor-pointer"
          >
            {isSaving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
            <span>Enregistrer les paramètres</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Sécurité */}
        <div className="lg:col-span-2 bg-white border border-neutral-200 p-6 rounded-2xl shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 pb-4 border-b border-neutral-100">
            <div className="w-8 h-8 rounded-lg bg-neutral-100 text-neutral-800 flex items-center justify-center border border-neutral-200">
              <Lock size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Accès Administrateur Principal</h3>
              <p className="text-xs text-neutral-500">Identifiants d&apos;accès par défaut au panneau d&apos;administration</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                Identifiant Admin
              </label>
              <input
                type="text"
                value={config?.adminUsername || ''}
                onChange={e => updateConfig('adminUsername', e.target.value)}
                className="w-full bg-[#f8fafc] border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-[13px] text-neutral-900 focus:bg-white focus:border-neutral-900 focus:outline-none transition-colors"
              />
              <p className="text-[11px] text-neutral-400 mt-1.5">Identifiant d&apos;accès par défaut (ex: admin).</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                Mot de Passe Admin
              </label>
              <input
                type="text"
                value={config?.adminPassword || ''}
                onChange={e => updateConfig('adminPassword', e.target.value)}
                className="w-full bg-[#f8fafc] border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-[13px] text-neutral-900 focus:bg-white focus:border-neutral-900 focus:outline-none transition-colors"
              />
              <p className="text-[11px] text-neutral-400 mt-1.5">Ce mot de passe est visible uniquement dans ce panneau connecté.</p>
            </div>
          </div>
        </div>

        {/* Livraison */}
        <div className="bg-white border border-neutral-200 p-6 rounded-2xl shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 pb-4 border-b border-neutral-100">
            <div className="w-8 h-8 rounded-lg bg-neutral-100 text-neutral-800 flex items-center justify-center border border-neutral-200">
              <Truck size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Paiement & Livraison</h3>
              <p className="text-xs text-neutral-500">Définir les frais de livraison appliqués au panier</p>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                Frais de livraison standard (MAD)
              </label>
              <input 
                type="number" 
                name="shippingFee"
                value={config?.shippingFee || 0}
                onChange={handleChange}
                className="w-full bg-[#f8fafc] border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-[13px] text-neutral-900 focus:bg-white focus:border-neutral-900 focus:outline-none transition-colors"
              />
              <p className="text-[11px] text-neutral-400 mt-1.5">Mettre 0 pour la livraison gratuite par défaut.</p>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white border border-neutral-200 p-6 rounded-2xl shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 pb-4 border-b border-neutral-100">
            <div className="w-8 h-8 rounded-lg bg-neutral-100 text-neutral-800 flex items-center justify-center border border-neutral-200">
              <Phone size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Informations de Contact</h3>
              <p className="text-xs text-neutral-500">Coordonnées affichées aux clients sur la boutique</p>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                Numéro de téléphone
              </label>
              <input 
                type="text" 
                name="contactPhone"
                value={config?.contactPhone || ''}
                onChange={handleChange}
                placeholder="+212 6 XX XX XX XX"
                className="w-full bg-[#f8fafc] border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-[13px] text-neutral-900 focus:bg-white focus:border-neutral-900 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                Adresse Email Contact
              </label>
              <input 
                type="email" 
                name="contactEmail"
                value={config?.contactEmail || ''}
                onChange={handleChange}
                placeholder="contact@nouamane-fragrances.ma"
                className="w-full bg-[#f8fafc] border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-[13px] text-neutral-900 focus:bg-white focus:border-neutral-900 focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Page d'accueil Hero */}
        <div className="bg-white border border-neutral-200 p-6 rounded-2xl shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 pb-4 border-b border-neutral-100">
            <div className="w-8 h-8 rounded-lg bg-neutral-100 text-neutral-800 flex items-center justify-center border border-neutral-200">
              <LayoutTemplate size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Bannière Accueil (Hero)</h3>
              <p className="text-xs text-neutral-500">Textes mis en avant dans la section principale</p>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                Titre Principal
              </label>
              <input 
                type="text" 
                name="heroTitle"
                value={config?.heroTitle || ''}
                onChange={handleChange}
                className="w-full bg-[#f8fafc] border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-[13px] text-neutral-900 focus:bg-white focus:border-neutral-900 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                Sous-titre
              </label>
              <textarea 
                name="heroSubtitle"
                rows={3}
                value={config?.heroSubtitle || ''}
                onChange={handleChange}
                className="w-full bg-[#f8fafc] border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-[13px] text-neutral-900 focus:bg-white focus:border-neutral-900 focus:outline-none transition-colors resize-none"
              />
            </div>
          </div>
        </div>

        {/* Coffrets Cover */}
        <div className="bg-white border border-neutral-200 p-6 rounded-2xl shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 pb-4 border-b border-neutral-100">
            <div className="w-8 h-8 rounded-lg bg-neutral-100 text-neutral-800 flex items-center justify-center border border-neutral-200">
              <ImageIcon size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Cover Coffrets (Accueil)</h3>
              <p className="text-xs text-neutral-500">Image de couverture du carrousel de coffrets</p>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                URL de l&apos;image de couverture
              </label>
              <input 
                type="text" 
                name="coffretsCoverImage"
                value={config?.coffretsCoverImage || ''}
                onChange={handleChange}
                className="w-full bg-[#f8fafc] border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-[13px] text-neutral-900 focus:bg-white focus:border-neutral-900 focus:outline-none transition-colors"
                placeholder="/images/category/pack-decouverte-luxe.jpg"
              />
            </div>
          </div>
        </div>

        {/* Réseaux Sociaux */}
        <div className="lg:col-span-2 bg-white border border-neutral-200 p-6 rounded-2xl shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 pb-4 border-b border-neutral-100">
            <div className="w-8 h-8 rounded-lg bg-neutral-100 text-neutral-800 flex items-center justify-center border border-neutral-200">
              <Share2 size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Réseaux Sociaux & Messagerie</h3>
              <p className="text-xs text-neutral-500">Liens publics vers vos comptes sociaux et canal WhatsApp</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                Instagram (URL)
              </label>
              <input 
                type="text" 
                name="instagramUrl"
                value={config?.instagramUrl || ''}
                onChange={handleChange}
                className="w-full bg-[#f8fafc] border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-[13px] text-neutral-900 focus:bg-white focus:border-neutral-900 focus:outline-none transition-colors"
                placeholder="https://instagram.com/..."
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                Facebook (URL)
              </label>
              <input 
                type="text" 
                name="facebookUrl"
                value={config?.facebookUrl || ''}
                onChange={handleChange}
                className="w-full bg-[#f8fafc] border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-[13px] text-neutral-900 focus:bg-white focus:border-neutral-900 focus:outline-none transition-colors"
                placeholder="https://facebook.com/..."
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                TikTok (URL)
              </label>
              <input 
                type="text" 
                name="tiktokUrl"
                value={config?.tiktokUrl || ''}
                onChange={handleChange}
                className="w-full bg-[#f8fafc] border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-[13px] text-neutral-900 focus:bg-white focus:border-neutral-900 focus:outline-none transition-colors"
                placeholder="https://tiktok.com/@..."
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                WhatsApp (URL ou numéro)
              </label>
              <input 
                type="text" 
                name="whatsappUrl"
                value={config?.whatsappUrl || ''}
                onChange={handleChange}
                className="w-full bg-[#f8fafc] border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-[13px] text-neutral-900 focus:bg-white focus:border-neutral-900 focus:outline-none transition-colors"
                placeholder="https://wa.me/212..."
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="lg:col-span-2 flex justify-end pt-2">
          <button 
            type="submit" 
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2.5 bg-neutral-900 hover:bg-black text-white rounded-xl text-xs font-medium transition-all shadow-xs disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            <span>Enregistrer toutes les modifications</span>
          </button>
        </div>
      </form>
    </div>
  );
}
