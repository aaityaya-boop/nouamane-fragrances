'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import { User, Package, MapPin, Heart, LogOut, ChevronLeft, ChevronRight, CheckCircle2, Truck, Clock, Check, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { formatMAD } from '@/lib/products';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from '@/components/ProductCard';

const OrderTimeline = ({ status }: { status: string }) => {
  const steps = [
    { id: 'pending', label: 'En attente', icon: Clock },
    { id: 'confirmed', label: 'Confirmée', icon: CheckCircle2 },
    { id: 'shipped', label: 'Expédiée', icon: Truck },
    { id: 'delivered', label: 'Livrée', icon: Check },
  ];

  const currentIndex = steps.findIndex(s => s.id === status) === -1 ? 0 : steps.findIndex(s => s.id === status);
  const isCancelled = status === 'cancelled';

  if (isCancelled) {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100">
        <X className="w-5 h-5" />
        <span className="font-bold text-[14px]">Commande Annulée</span>
      </div>
    );
  }

  return (
    <div className="relative pt-8 pb-4">
      {/* Background Line */}
      <div className="absolute top-11 left-[10%] right-[10%] h-[2px] bg-[#e0ddd4] z-0"></div>
      
      {/* Active Line */}
      <div 
        className="absolute top-11 left-[10%] h-[2px] bg-[#0ea5e9] z-0 transition-all duration-700 ease-in-out" 
        style={{ width: `${(currentIndex / (steps.length - 1)) * 80}%` }}
      ></div>

      <div className="relative z-10 flex justify-between">
        {steps.map((step, index) => {
          const isActive = index <= currentIndex;
          const isCurrent = index === currentIndex;
          const Icon = step.icon;
          
          return (
            <div key={step.id} className="flex flex-col items-center gap-3">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                  isActive 
                    ? 'bg-[#0ea5e9] text-white shadow-md shadow-[#0ea5e9]/30 scale-110' 
                    : 'bg-white border-2 border-[#e0ddd4] text-[#9A9A9A]'
                }`}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[11px] font-bold uppercase tracking-wider ${isActive ? 'text-[#1A1A1A]' : 'text-[#9A9A9A]'}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function AccountClient() {
  const { customer, setCustomer, isLoading, logout } = useAuth();
  const [authStep, setAuthStep] = useState<'login' | 'signup'>('login');
  const [authData, setAuthData] = useState({ name: '', email: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [loadingAuth, setLoadingAuth] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  
  const [wishlistProducts, setWishlistProducts] = useState<any[]>([]);
  const [loadingWishlist, setLoadingWishlist] = useState(false);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'info' | 'address' | 'wishlist'>('dashboard');

  const [infoForm, setInfoForm] = useState({ name: '', email: '', currentPassword: '', newPassword: '' });
  const [addressForm, setAddressForm] = useState({ phone: '', address: '', city: '', postalCode: '' });
  const [formStatus, setFormStatus] = useState({ loading: false, success: '', error: '' });

  useEffect(() => {
    if (customer) {
      const fetchOrders = async () => {
        try {
          const res = await fetch('/api/account/orders');
          if (res.ok) {
            const data = await res.json();
            setOrders(data.orders);
          }
        } catch (error) {
          console.error('Error fetching orders:', error);
        }
      };
      fetchOrders();

      setInfoForm({
        name: customer.name || '',
        email: customer.email || '',
        currentPassword: '',
        newPassword: ''
      });
      setAddressForm({
        phone: customer.phone || '',
        address: customer.address || '',
        city: customer.city || '',
        postalCode: customer.postalCode || ''
      });
    }
  }, [customer]);

  useEffect(() => {
    if (activeTab === 'wishlist' && customer?.wishlist && customer.wishlist.length > 0) {
      const fetchWishlist = async () => {
        setLoadingWishlist(true);
        try {
          const slugs = customer.wishlist!.join(',');
          const res = await fetch(`/api/products/wishlist?slugs=${slugs}`);
          if (res.ok) {
            const data = await res.json();
            setWishlistProducts(data.products || []);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setLoadingWishlist(false);
        }
      };
      fetchWishlist();
    }
  }, [activeTab, customer?.wishlist]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setLoadingAuth(true);

    const endpoint = authStep === 'login' ? '/api/auth/login' : '/api/auth/register';
    
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authData),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setCustomer(data.customer);
      } else {
        setAuthError(data.error || 'Une erreur est survenue');
      }
    } catch (error) {
      setAuthError('Erreur de connexion au serveur');
    } finally {
      setLoadingAuth(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent, action: 'updateInfo' | 'updateAddress') => {
    e.preventDefault();
    setFormStatus({ loading: true, success: '', error: '' });

    const payload = action === 'updateInfo' ? { action, ...infoForm } : { action, ...addressForm };

    try {
      const res = await fetch('/api/account/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        setFormStatus({ loading: false, success: data.message, error: '' });
        const meRes = await fetch('/api/auth/me');
        if (meRes.ok) {
          const meData = await meRes.json();
          if (meData.authenticated && meData.customer) {
            setCustomer(meData.customer);
          }
        }
        if (action === 'updateInfo') {
          setInfoForm(prev => ({ ...prev, currentPassword: '', newPassword: '' }));
        }
      } else {
        setFormStatus({ loading: false, success: '', error: data.error || 'Erreur lors de la mise à jour' });
      }
    } catch (err) {
      setFormStatus({ loading: false, success: '', error: 'Erreur serveur' });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F5F3] flex flex-col items-center justify-center">
        <Header />
        <div className="text-[#9A9A9A] tracking-wider text-[12px] uppercase animate-pulse">Chargement...</div>
        <Footer />
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard', label: 'Tableau de bord', icon: Package },
    { id: 'orders', label: 'Mes commandes', icon: Package },
    { id: 'wishlist', label: "Ma liste d'envies", icon: Heart },
    { id: 'info', label: 'Mes informations', icon: User },
    { id: 'address', label: "Carnet d'adresses", icon: MapPin },
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F3] font-sans selection:bg-[#1A1A1A] selection:text-white flex flex-col">
      <Header />

      <main className="flex-1 pt-[100px] lg:pt-[130px] pb-20">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          
          {customer ? (
            <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
              
              {/* SIDEBAR NAVIGATION */}
              <aside className="lg:w-72 flex-shrink-0">
                <div className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-sm rounded-3xl p-8 sticky top-[150px]">
                  <div className="mb-8">
                    <div className="w-16 h-16 bg-[#0ea5e9]/10 text-[#0ea5e9] rounded-2xl flex items-center justify-center mb-4">
                      <User size={28} />
                    </div>
                    <h2 className="heading-font text-2xl text-[#1A1A1A]">Bonjour, {customer.name.split(' ')[0]}</h2>
                    <p className="text-[13px] text-[#9A9A9A] mt-1">{customer.email}</p>
                  </div>
                  
                  <nav className="space-y-2">
                    {tabs.map(tab => {
                      const Icon = tab.icon;
                      const isActive = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => { setActiveTab(tab.id as any); setFormStatus({loading: false, success: '', error: ''}); }}
                          className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 ${
                            isActive 
                              ? 'bg-[#1A1A1A] text-white shadow-lg shadow-black/10 scale-[1.02]' 
                              : 'hover:bg-white text-[#6B6B6B] hover:text-[#1A1A1A]'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <Icon size={18} />
                            <span className="text-[13px] font-bold tracking-wider">{tab.label}</span>
                          </div>
                          {isActive && <ChevronRight size={16} className="opacity-50" />}
                        </button>
                      );
                    })}
                  </nav>

                  <div className="mt-8 pt-8 border-t border-[#e0ddd4]">
                    <button 
                      onClick={logout}
                      className="flex items-center gap-3 text-red-500 hover:text-red-700 transition-colors w-full p-4 rounded-2xl hover:bg-red-50"
                    >
                      <LogOut size={18} />
                      <span className="text-[13px] font-bold tracking-wider">Déconnexion</span>
                    </button>
                  </div>
                </div>
              </aside>

              {/* MAIN CONTENT AREA */}
              <div className="flex-1">
                <AnimatePresence mode="wait">
                  
                  {activeTab === 'dashboard' && (
                    <motion.div
                      key="dashboard"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="space-y-8"
                    >
                      <div className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-sm rounded-3xl p-10 lg:p-12">
                        <h3 className="heading-font text-3xl mb-4">Bienvenue sur votre espace personnel</h3>
                        <p className="text-[#6B6B6B] text-[15px] leading-relaxed max-w-2xl">
                          Gérez vos informations personnelles, suivez l'état de vos commandes en temps réel, et gardez un œil sur vos parfums préférés grâce à votre liste d'envies.
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
                          <div onClick={() => setActiveTab('orders')} className="bg-[#F5F5F3] p-8 rounded-2xl hover:bg-white hover:shadow-lg transition-all cursor-pointer group border border-transparent hover:border-[#e0ddd4]">
                            <Package className="w-8 h-8 text-[#0ea5e9] mb-4 group-hover:scale-110 transition-transform" />
                            <h4 className="heading-font text-xl mb-2">Suivi de Commandes</h4>
                            <p className="text-[13px] text-[#9A9A9A]">Vérifiez l'état de vos livraisons.</p>
                          </div>
                          
                          <div onClick={() => setActiveTab('wishlist')} className="bg-[#F5F5F3] p-8 rounded-2xl hover:bg-white hover:shadow-lg transition-all cursor-pointer group border border-transparent hover:border-[#e0ddd4]">
                            <Heart className="w-8 h-8 text-[#0ea5e9] mb-4 group-hover:scale-110 transition-transform" />
                            <h4 className="heading-font text-xl mb-2">Liste d'envies</h4>
                            <p className="text-[13px] text-[#9A9A9A]">{customer.wishlist?.length || 0} produits sauvegardés.</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'orders' && (
                    <motion.div
                      key="orders"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="space-y-8"
                    >
                      <div className="flex items-center justify-between mb-8">
                        <h2 className="heading-font text-3xl text-[#1A1A1A]">Historique & Suivi</h2>
                      </div>
                      
                      {orders.length === 0 ? (
                        <div className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-sm rounded-3xl p-16 text-center">
                          <Package className="w-16 h-16 text-[#e0ddd4] mx-auto mb-6" />
                          <h3 className="heading-font text-2xl text-[#1A1A1A] mb-2">Aucune commande</h3>
                          <p className="text-[#9A9A9A] text-[14px] mb-8">Vous n'avez passé aucune commande pour le moment.</p>
                          <a href="/shop" className="btn-blue py-4 px-10 rounded-full text-[13px] font-bold tracking-wider inline-block">Découvrir nos parfums</a>
                        </div>
                      ) : (
                        <div className="space-y-8">
                          {orders.map(order => (
                            <div key={order.id} className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-sm rounded-3xl overflow-hidden">
                              <div className="bg-[#1A1A1A] text-white p-6 lg:px-10 flex flex-col md:flex-row justify-between md:items-center gap-4">
                                <div>
                                  <span className="text-[11px] text-[#9A9A9A] uppercase tracking-wider block mb-1">Commande N°</span>
                                  <span className="font-bold text-[18px]">{order.orderNumber}</span>
                                </div>
                                <div className="flex gap-8">
                                  <div>
                                    <span className="text-[11px] text-[#9A9A9A] uppercase tracking-wider block mb-1">Date</span>
                                    <span className="font-bold text-[14px]">{new Date(order.createdAt).toLocaleDateString('fr-FR')}</span>
                                  </div>
                                  <div>
                                    <span className="text-[11px] text-[#9A9A9A] uppercase tracking-wider block mb-1">Total</span>
                                    <span className="font-bold text-[14px] text-[#0ea5e9]">{formatMAD(order.total)}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="p-6 lg:p-10">
                                <h4 className="text-[14px] font-bold text-[#1A1A1A] mb-6">Suivi de la livraison</h4>
                                <OrderTimeline status={order.status} />
                                
                                <div className="mt-8 pt-8 border-t border-[#e0ddd4] text-[13px] text-[#6B6B6B] bg-[#F5F5F3] p-6 rounded-2xl">
                                  <div className="flex items-start gap-4">
                                    <MapPin className="w-5 h-5 text-[#9A9A9A] mt-0.5" />
                                    <div>
                                      <strong className="text-[#1A1A1A] block mb-1">Adresse de livraison :</strong>
                                      {order.shippingAddress}, <br/>{order.shippingCity} {order.shippingPostalCode}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {activeTab === 'wishlist' && (
                    <motion.div
                      key="wishlist"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <div className="flex items-center justify-between mb-8">
                        <h2 className="heading-font text-3xl text-[#1A1A1A]">Ma liste d'envies</h2>
                        <span className="bg-white px-4 py-1.5 rounded-full text-[12px] font-bold text-[#9A9A9A] border border-[#e0ddd4]">
                          {customer.wishlist?.length || 0} articles
                        </span>
                      </div>

                      {loadingWishlist ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {[1, 2].map(i => (
                            <div key={i} className="bg-white/50 animate-pulse aspect-[3/4] rounded-3xl border border-white/40"></div>
                          ))}
                        </div>
                      ) : wishlistProducts.length === 0 ? (
                        <div className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-sm rounded-3xl p-16 text-center">
                          <Heart className="w-16 h-16 text-[#e0ddd4] mx-auto mb-6" />
                          <h3 className="heading-font text-2xl text-[#1A1A1A] mb-2">Votre liste d'envies est vide</h3>
                          <p className="text-[#9A9A9A] text-[14px] max-w-sm mx-auto mb-8">
                            Découvrez nos parfums et ajoutez-les à vos favoris pour les retrouver ici plus tard.
                          </p>
                          <a href="/shop" className="btn-blue py-4 px-10 rounded-full text-[13px] font-bold tracking-wider inline-block">
                            Découvrir le catalogue
                          </a>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                          {wishlistProducts.map(product => (
                            <ProductCard key={product.id} product={product} />
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {activeTab === 'info' && (
                    <motion.div
                      key="info"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <h2 className="heading-font text-3xl text-[#1A1A1A] mb-8">Informations Personnelles</h2>
                      <div className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-sm rounded-3xl p-8 lg:p-10 max-w-2xl">
                        {formStatus.success && <div className="bg-green-50 text-green-700 p-4 rounded-xl text-[13px] mb-8 border border-green-200 flex items-center gap-3"><CheckCircle2 size={18}/> {formStatus.success}</div>}
                        {formStatus.error && <div className="bg-red-50 text-red-700 p-4 rounded-xl text-[13px] mb-8 border border-red-200 flex items-center gap-3"><X size={18}/> {formStatus.error}</div>}
                        
                        <form onSubmit={(e) => handleUpdate(e, 'updateInfo')} className="space-y-6">
                          <div className="grid md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-[11px] font-bold text-[#9A9A9A] mb-2 uppercase tracking-wider">Nom complet</label>
                              <input required type="text" value={infoForm.name} onChange={e => setInfoForm({...infoForm, name: e.target.value})} className="w-full bg-[#F5F5F3] border-transparent rounded-xl px-5 py-4 text-[14px] focus:bg-white focus:outline-none focus:border-[#0ea5e9] focus:ring-1 focus:ring-[#0ea5e9] transition-all" />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-[#9A9A9A] mb-2 uppercase tracking-wider">Adresse e-mail</label>
                              <input required type="email" value={infoForm.email} onChange={e => setInfoForm({...infoForm, email: e.target.value})} className="w-full bg-[#F5F5F3] border-transparent rounded-xl px-5 py-4 text-[14px] focus:bg-white focus:outline-none focus:border-[#0ea5e9] focus:ring-1 focus:ring-[#0ea5e9] transition-all" />
                            </div>
                          </div>

                          <div className="pt-8 mt-8 border-t border-[#e0ddd4]">
                            <h4 className="text-[16px] font-bold mb-6 text-[#1A1A1A]">Sécurité</h4>
                            <div className="space-y-6">
                              <div>
                                <label className="block text-[11px] font-bold text-[#9A9A9A] mb-2 uppercase tracking-wider">Mot de passe actuel</label>
                                <input type="password" placeholder="Laisser vide si inchangé" value={infoForm.currentPassword} onChange={e => setInfoForm({...infoForm, currentPassword: e.target.value})} className="w-full bg-[#F5F5F3] border-transparent rounded-xl px-5 py-4 text-[14px] focus:bg-white focus:outline-none focus:border-[#0ea5e9] focus:ring-1 focus:ring-[#0ea5e9] transition-all" />
                              </div>
                              <div>
                                <label className="block text-[11px] font-bold text-[#9A9A9A] mb-2 uppercase tracking-wider">Nouveau mot de passe</label>
                                <input type="password" placeholder="Nouveau mot de passe" minLength={6} value={infoForm.newPassword} onChange={e => setInfoForm({...infoForm, newPassword: e.target.value})} className="w-full bg-[#F5F5F3] border-transparent rounded-xl px-5 py-4 text-[14px] focus:bg-white focus:outline-none focus:border-[#0ea5e9] focus:ring-1 focus:ring-[#0ea5e9] transition-all" />
                              </div>
                            </div>
                          </div>
                          
                          <div className="pt-6">
                            <button type="submit" disabled={formStatus.loading} className="w-full md:w-auto btn-blue py-4 px-10 rounded-full text-[13px] font-bold tracking-wider disabled:opacity-70 transition-transform hover:scale-105 active:scale-95">
                              {formStatus.loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
                            </button>
                          </div>
                        </form>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'address' && (
                    <motion.div
                      key="address"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <h2 className="heading-font text-3xl text-[#1A1A1A] mb-8">Carnet d'adresses</h2>
                      <div className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-sm rounded-3xl p-8 lg:p-10 max-w-2xl">
                        {formStatus.success && <div className="bg-green-50 text-green-700 p-4 rounded-xl text-[13px] mb-8 border border-green-200 flex items-center gap-3"><CheckCircle2 size={18}/> {formStatus.success}</div>}
                        {formStatus.error && <div className="bg-red-50 text-red-700 p-4 rounded-xl text-[13px] mb-8 border border-red-200 flex items-center gap-3"><X size={18}/> {formStatus.error}</div>}
                        
                        <form onSubmit={(e) => handleUpdate(e, 'updateAddress')} className="space-y-6">
                          <div>
                            <label className="block text-[11px] font-bold text-[#9A9A9A] mb-2 uppercase tracking-wider">Téléphone</label>
                            <input type="tel" value={addressForm.phone} onChange={e => setAddressForm({...addressForm, phone: e.target.value})} className="w-full bg-[#F5F5F3] border-transparent rounded-xl px-5 py-4 text-[14px] focus:bg-white focus:outline-none focus:border-[#0ea5e9] focus:ring-1 focus:ring-[#0ea5e9] transition-all" />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-[#9A9A9A] mb-2 uppercase tracking-wider">Adresse complète</label>
                            <input type="text" value={addressForm.address} onChange={e => setAddressForm({...addressForm, address: e.target.value})} className="w-full bg-[#F5F5F3] border-transparent rounded-xl px-5 py-4 text-[14px] focus:bg-white focus:outline-none focus:border-[#0ea5e9] focus:ring-1 focus:ring-[#0ea5e9] transition-all" />
                          </div>
                          <div className="grid grid-cols-2 gap-6">
                            <div>
                              <label className="block text-[11px] font-bold text-[#9A9A9A] mb-2 uppercase tracking-wider">Ville</label>
                              <input type="text" value={addressForm.city} onChange={e => setAddressForm({...addressForm, city: e.target.value})} className="w-full bg-[#F5F5F3] border-transparent rounded-xl px-5 py-4 text-[14px] focus:bg-white focus:outline-none focus:border-[#0ea5e9] focus:ring-1 focus:ring-[#0ea5e9] transition-all" />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-[#9A9A9A] mb-2 uppercase tracking-wider">Code Postal</label>
                              <input type="text" value={addressForm.postalCode} onChange={e => setAddressForm({...addressForm, postalCode: e.target.value})} className="w-full bg-[#F5F5F3] border-transparent rounded-xl px-5 py-4 text-[14px] focus:bg-white focus:outline-none focus:border-[#0ea5e9] focus:ring-1 focus:ring-[#0ea5e9] transition-all" />
                            </div>
                          </div>
                          
                          <div className="pt-6">
                            <button type="submit" disabled={formStatus.loading} className="w-full md:w-auto btn-blue py-4 px-10 rounded-full text-[13px] font-bold tracking-wider disabled:opacity-70 transition-transform hover:scale-105 active:scale-95">
                              {formStatus.loading ? 'Enregistrement...' : 'Enregistrer l\'adresse'}
                            </button>
                          </div>
                        </form>
                      </div>
                    </motion.div>
                  )}
                  
                </AnimatePresence>
              </div>
            </div>
          ) : (
            <div className="max-w-md mx-auto bg-white/80 backdrop-blur-xl border border-white/40 shadow-xl p-10 rounded-3xl mt-10 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8]"></div>
              
              {authStep === 'login' && (
                <div className="text-center py-4">
                  <h3 className="heading-font text-3xl mb-3 text-[#1A1A1A]">Bienvenue</h3>
                  <p className="text-[#9A9A9A] text-[13px] mb-8">Connectez-vous pour accéder à votre espace personnel.</p>
                  
                  {authError && (
                    <div className="bg-red-50 text-red-600 border border-red-100 rounded-xl p-4 text-[13px] mb-6 flex items-center justify-center gap-2">
                      <X size={16} /> {authError}
                    </div>
                  )}

                  <form className="space-y-5" onSubmit={handleAuth}>
                    <div>
                      <input required type="email" placeholder="Adresse e-mail" value={authData.email} onChange={e => setAuthData({...authData, email: e.target.value})} className="w-full bg-[#F5F5F3] border-transparent rounded-xl px-5 py-4 text-[14px] focus:bg-white focus:outline-none focus:border-[#0ea5e9] focus:ring-1 focus:ring-[#0ea5e9] transition-all" />
                    </div>
                    <div>
                      <input required type="password" placeholder="Mot de passe" value={authData.password} onChange={e => setAuthData({...authData, password: e.target.value})} className="w-full bg-[#F5F5F3] border-transparent rounded-xl px-5 py-4 text-[14px] focus:bg-white focus:outline-none focus:border-[#0ea5e9] focus:ring-1 focus:ring-[#0ea5e9] transition-all" />
                    </div>
                    <div className="text-right">
                      <a href="#" className="text-[12px] text-[#0ea5e9] font-bold hover:underline">Mot de passe oublié ?</a>
                    </div>
                    <button type="submit" disabled={loadingAuth} className="w-full btn-blue py-4 rounded-full text-[13px] mt-4 font-bold tracking-wider disabled:opacity-70 transition-transform hover:scale-[1.02] active:scale-[0.98]">
                      {loadingAuth ? 'Connexion en cours...' : 'Se Connecter'}
                    </button>
                  </form>
                  <div className="mt-10 text-[13px] text-[#6B6B6B]">
                    Nouveau chez Nouamane ? <button onClick={() => { setAuthStep('signup'); setAuthError(''); }} className="text-[#0ea5e9] font-bold underline decoration-2 underline-offset-4 ml-1 hover:text-[#0284c7]">Créer un compte</button>
                  </div>
                </div>
              )}

              {authStep === 'signup' && (
                <div className="text-center py-4">
                  <h3 className="heading-font text-3xl mb-3 text-[#1A1A1A]">Créer un compte</h3>
                  <p className="text-[#9A9A9A] text-[13px] mb-8">Rejoignez notre programme de fidélité.</p>
                  
                  {authError && (
                    <div className="bg-red-50 text-red-600 border border-red-100 rounded-xl p-4 text-[13px] mb-6 flex items-center justify-center gap-2">
                      <X size={16} /> {authError}
                    </div>
                  )}

                  <form className="space-y-5" onSubmit={handleAuth}>
                    <div>
                      <input required type="text" placeholder="Nom complet" value={authData.name} onChange={e => setAuthData({...authData, name: e.target.value})} className="w-full bg-[#F5F5F3] border-transparent rounded-xl px-5 py-4 text-[14px] focus:bg-white focus:outline-none focus:border-[#0ea5e9] focus:ring-1 focus:ring-[#0ea5e9] transition-all" />
                    </div>
                    <div>
                      <input required type="email" placeholder="Adresse e-mail" value={authData.email} onChange={e => setAuthData({...authData, email: e.target.value})} className="w-full bg-[#F5F5F3] border-transparent rounded-xl px-5 py-4 text-[14px] focus:bg-white focus:outline-none focus:border-[#0ea5e9] focus:ring-1 focus:ring-[#0ea5e9] transition-all" />
                    </div>
                    <div>
                      <input required type="password" placeholder="Mot de passe" minLength={6} value={authData.password} onChange={e => setAuthData({...authData, password: e.target.value})} className="w-full bg-[#F5F5F3] border-transparent rounded-xl px-5 py-4 text-[14px] focus:bg-white focus:outline-none focus:border-[#0ea5e9] focus:ring-1 focus:ring-[#0ea5e9] transition-all" />
                    </div>
                    <button type="submit" disabled={loadingAuth} className="w-full btn-blue py-4 rounded-full text-[13px] mt-4 font-bold tracking-wider disabled:opacity-70 transition-transform hover:scale-[1.02] active:scale-[0.98]">
                      {loadingAuth ? 'Création...' : "S'inscrire"}
                    </button>
                  </form>
                  <div className="mt-10 text-[13px] text-[#6B6B6B]">
                    Déjà un compte ? <button onClick={() => { setAuthStep('login'); setAuthError(''); }} className="text-[#0ea5e9] font-bold underline decoration-2 underline-offset-4 ml-1 hover:text-[#0284c7]">Se connecter</button>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
      </main>

      <Footer />
      <CartDrawer />
    </div>
  );
}
