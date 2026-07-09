'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import { User, Package, MapPin, Heart, LogOut, ChevronLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { formatMAD } from '@/lib/products';

export default function AccountClient() {
  const { customer, setCustomer, isLoading, logout } = useAuth();
  const [authStep, setAuthStep] = useState<'login' | 'signup'>('login');
  const [authData, setAuthData] = useState({ name: '', email: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [loadingAuth, setLoadingAuth] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);

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
        // Refresh customer context
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

  return (
    <div className="min-h-screen bg-[#F5F5F3] font-sans selection:bg-[#1A1A1A] selection:text-white flex flex-col">
      <Header />

      <main className="flex-1 pt-[100px] lg:pt-[130px] pb-20">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          
          {customer ? (
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                  {activeTab !== 'dashboard' && (
                    <button onClick={() => { setActiveTab('dashboard'); setFormStatus({loading: false, success: '', error: ''}); }} className="w-10 h-10 flex items-center justify-center bg-white border border-[#e0ddd4] rounded-full hover:bg-gray-50 transition-colors">
                      <ChevronLeft size={18} className="text-[#1A1A1A]" />
                    </button>
                  )}
                  <h1 className="heading-font text-3xl lg:text-4xl text-[#1A1A1A]">
                    {activeTab === 'dashboard' && `Bonjour, ${customer.name.split(' ')[0]}`}
                    {activeTab === 'orders' && 'Mes Commandes'}
                    {activeTab === 'info' && 'Mes Informations'}
                    {activeTab === 'address' && "Carnet d'Adresses"}
                    {activeTab === 'wishlist' && "Ma Liste d'Envies"}
                  </h1>
                </div>
                {activeTab === 'dashboard' && (
                  <button 
                    onClick={logout}
                    className="flex items-center gap-2 text-[#6B6B6B] hover:text-[#1A1A1A] text-[13px] font-bold tracking-wider transition-colors"
                  >
                    <LogOut size={16} /> Déconnexion
                  </button>
                )}
              </div>

              {activeTab === 'dashboard' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div onClick={() => setActiveTab('orders')} className="bg-white p-8 rounded-2xl border border-[#e0ddd4] hover:shadow-lg transition-all cursor-pointer group">
                    <Package className="w-8 h-8 text-[#0ea5e9] mb-4 group-hover:scale-110 transition-transform" />
                    <h3 className="heading-font text-xl mb-2">Mes Commandes</h3>
                    <p className="text-[13px] text-[#6B6B6B]">Suivez vos commandes et achats récents.</p>
                  </div>
                  
                  <div onClick={() => setActiveTab('info')} className="bg-white p-8 rounded-2xl border border-[#e0ddd4] hover:shadow-lg transition-all cursor-pointer group">
                    <User className="w-8 h-8 text-[#0ea5e9] mb-4 group-hover:scale-110 transition-transform" />
                    <h3 className="heading-font text-xl mb-2">Mes Informations</h3>
                    <p className="text-[13px] text-[#6B6B6B]">Modifiez votre mot de passe, votre nom ou votre e-mail.</p>
                  </div>

                  <div onClick={() => setActiveTab('address')} className="bg-white p-8 rounded-2xl border border-[#e0ddd4] hover:shadow-lg transition-all cursor-pointer group">
                    <MapPin className="w-8 h-8 text-[#0ea5e9] mb-4 group-hover:scale-110 transition-transform" />
                    <h3 className="heading-font text-xl mb-2">Carnet d'Adresses</h3>
                    <p className="text-[13px] text-[#6B6B6B]">Gérez vos adresses de livraison.</p>
                  </div>

                  <div onClick={() => setActiveTab('wishlist')} className="bg-white p-8 rounded-2xl border border-[#e0ddd4] hover:shadow-lg transition-all cursor-pointer group">
                    <Heart className="w-8 h-8 text-[#0ea5e9] mb-4 group-hover:scale-110 transition-transform" />
                    <h3 className="heading-font text-xl mb-2">Ma Liste d'Envies</h3>
                    <p className="text-[13px] text-[#6B6B6B]">Retrouvez tous les articles que vous avez sauvegardés.</p>
                  </div>
                </div>
              )}

              {activeTab === 'orders' && (
                <div className="bg-white p-8 rounded-2xl border border-[#e0ddd4]">
                  {orders.length === 0 ? (
                    <p className="text-[14px] text-[#6B6B6B]">Vous n'avez passé aucune commande pour le moment.</p>
                  ) : (
                    <div className="space-y-6">
                      {orders.map(order => (
                        <div key={order.id} className="border border-[#e0ddd4] p-5 rounded-xl">
                          <div className="flex flex-col md:flex-row justify-between md:items-center gap-3 mb-4 border-b border-[#e0ddd4] pb-4">
                            <div>
                              <span className="font-bold text-[14px] text-[#1A1A1A] block">{order.orderNumber}</span>
                              <span className="text-[12px] text-[#9A9A9A]">{new Date(order.createdAt).toLocaleDateString('fr-FR')}</span>
                            </div>
                            <div className="text-left md:text-right">
                              <span className="text-[#0ea5e9] font-bold text-[15px] block">{formatMAD(order.total)}</span>
                              <span className={`text-[12px] font-bold px-2 py-1 rounded ${
                                order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                order.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                                order.status === 'shipped' ? 'bg-purple-100 text-purple-700' :
                                order.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                              }`}>
                                {order.status === 'pending' ? 'En attente' :
                                 order.status === 'confirmed' ? 'Confirmée' :
                                 order.status === 'shipped' ? 'Expédiée' :
                                 order.status === 'delivered' ? 'Livrée' : 'Annulée'}
                              </span>
                            </div>
                          </div>
                          <div className="text-[13px] text-[#6B6B6B]">
                            <p><strong>Livraison :</strong> {order.shippingAddress}, {order.shippingCity} {order.shippingPostalCode}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'info' && (
                <div className="bg-white p-8 rounded-2xl border border-[#e0ddd4] max-w-xl">
                  {formStatus.success && <div className="bg-green-50 text-green-700 p-3 rounded-lg text-[13px] mb-6 border border-green-200">{formStatus.success}</div>}
                  {formStatus.error && <div className="bg-red-50 text-red-700 p-3 rounded-lg text-[13px] mb-6 border border-red-200">{formStatus.error}</div>}
                  
                  <form onSubmit={(e) => handleUpdate(e, 'updateInfo')} className="space-y-5">
                    <div>
                      <label className="block text-[12px] font-bold text-[#1A1A1A] mb-2 uppercase tracking-wider">Nom complet</label>
                      <input required type="text" value={infoForm.name} onChange={e => setInfoForm({...infoForm, name: e.target.value})} className="w-full border border-[#e0ddd4] rounded-lg px-4 py-3 text-[14px] focus:outline-none focus:border-[#0ea5e9]" />
                    </div>
                    <div>
                      <label className="block text-[12px] font-bold text-[#1A1A1A] mb-2 uppercase tracking-wider">Adresse e-mail</label>
                      <input required type="email" value={infoForm.email} onChange={e => setInfoForm({...infoForm, email: e.target.value})} className="w-full border border-[#e0ddd4] rounded-lg px-4 py-3 text-[14px] focus:outline-none focus:border-[#0ea5e9]" />
                    </div>
                    <div className="pt-4 border-t border-[#e0ddd4]">
                      <h4 className="text-[14px] font-bold mb-4">Changer de mot de passe</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-[12px] font-bold text-[#1A1A1A] mb-2 uppercase tracking-wider">Mot de passe actuel</label>
                          <input type="password" placeholder="Laisser vide si inchangé" value={infoForm.currentPassword} onChange={e => setInfoForm({...infoForm, currentPassword: e.target.value})} className="w-full border border-[#e0ddd4] rounded-lg px-4 py-3 text-[14px] focus:outline-none focus:border-[#0ea5e9]" />
                        </div>
                        <div>
                          <label className="block text-[12px] font-bold text-[#1A1A1A] mb-2 uppercase tracking-wider">Nouveau mot de passe</label>
                          <input type="password" placeholder="Nouveau mot de passe" minLength={6} value={infoForm.newPassword} onChange={e => setInfoForm({...infoForm, newPassword: e.target.value})} className="w-full border border-[#e0ddd4] rounded-lg px-4 py-3 text-[14px] focus:outline-none focus:border-[#0ea5e9]" />
                        </div>
                      </div>
                    </div>
                    <button type="submit" disabled={formStatus.loading} className="w-full btn-blue py-3 rounded-full text-[13px] font-bold tracking-wider disabled:opacity-70 mt-4">
                      {formStatus.loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
                    </button>
                  </form>
                </div>
              )}

              {activeTab === 'address' && (
                <div className="bg-white p-8 rounded-2xl border border-[#e0ddd4] max-w-xl">
                  {formStatus.success && <div className="bg-green-50 text-green-700 p-3 rounded-lg text-[13px] mb-6 border border-green-200">{formStatus.success}</div>}
                  {formStatus.error && <div className="bg-red-50 text-red-700 p-3 rounded-lg text-[13px] mb-6 border border-red-200">{formStatus.error}</div>}
                  
                  <form onSubmit={(e) => handleUpdate(e, 'updateAddress')} className="space-y-5">
                    <div>
                      <label className="block text-[12px] font-bold text-[#1A1A1A] mb-2 uppercase tracking-wider">Téléphone</label>
                      <input type="tel" value={addressForm.phone} onChange={e => setAddressForm({...addressForm, phone: e.target.value})} className="w-full border border-[#e0ddd4] rounded-lg px-4 py-3 text-[14px] focus:outline-none focus:border-[#0ea5e9]" />
                    </div>
                    <div>
                      <label className="block text-[12px] font-bold text-[#1A1A1A] mb-2 uppercase tracking-wider">Adresse complète</label>
                      <input type="text" value={addressForm.address} onChange={e => setAddressForm({...addressForm, address: e.target.value})} className="w-full border border-[#e0ddd4] rounded-lg px-4 py-3 text-[14px] focus:outline-none focus:border-[#0ea5e9]" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[12px] font-bold text-[#1A1A1A] mb-2 uppercase tracking-wider">Ville</label>
                        <input type="text" value={addressForm.city} onChange={e => setAddressForm({...addressForm, city: e.target.value})} className="w-full border border-[#e0ddd4] rounded-lg px-4 py-3 text-[14px] focus:outline-none focus:border-[#0ea5e9]" />
                      </div>
                      <div>
                        <label className="block text-[12px] font-bold text-[#1A1A1A] mb-2 uppercase tracking-wider">Code Postal</label>
                        <input type="text" value={addressForm.postalCode} onChange={e => setAddressForm({...addressForm, postalCode: e.target.value})} className="w-full border border-[#e0ddd4] rounded-lg px-4 py-3 text-[14px] focus:outline-none focus:border-[#0ea5e9]" />
                      </div>
                    </div>
                    <button type="submit" disabled={formStatus.loading} className="w-full btn-blue py-3 rounded-full text-[13px] font-bold tracking-wider disabled:opacity-70 mt-4">
                      {formStatus.loading ? 'Enregistrement...' : 'Enregistrer l\'adresse'}
                    </button>
                  </form>
                </div>
              )}

              {activeTab === 'wishlist' && (
                <div className="bg-white p-12 rounded-2xl border border-[#e0ddd4] text-center">
                  <div className="w-16 h-16 bg-[#f4f4f0] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart size={24} className="text-[#9A9A9A]" />
                  </div>
                  <h3 className="heading-font text-2xl text-[#1A1A1A] mb-2">Votre liste d'envies est vide</h3>
                  <p className="text-[#6B6B6B] text-[14px] max-w-sm mx-auto mb-6">
                    Découvrez nos parfums et ajoutez-les à vos favoris pour les retrouver ici plus tard.
                  </p>
                  <a href="/shop" className="inline-block btn-blue py-3 px-8 rounded-full text-[12px] font-bold tracking-wider">
                    Découvrir le catalogue
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div className="max-w-md mx-auto bg-white p-8 rounded-2xl border border-[#e0ddd4] shadow-lg mt-10">
              
              {authStep === 'login' && (
                <div className="text-center py-4">
                  <h3 className="heading-font text-3xl mb-2">Connexion</h3>
                  <p className="text-[#6B6B6B] text-[13px] mb-6">Connectez-vous pour accéder à votre compte.</p>
                  
                  {authError && (
                    <div className="bg-red-50 text-red-600 border border-red-200 rounded-lg p-3 text-[12px] mb-4">
                      {authError}
                    </div>
                  )}

                  <form className="space-y-4" onSubmit={handleAuth}>
                    <div>
                      <input required type="email" placeholder="Adresse e-mail" value={authData.email} onChange={e => setAuthData({...authData, email: e.target.value})} className="w-full border border-[#e0ddd4] rounded-lg px-4 py-3 text-[13px] focus:outline-none focus:border-[#0ea5e9]" />
                    </div>
                    <div>
                      <input required type="password" placeholder="Mot de passe" value={authData.password} onChange={e => setAuthData({...authData, password: e.target.value})} className="w-full border border-[#e0ddd4] rounded-lg px-4 py-3 text-[13px] focus:outline-none focus:border-[#0ea5e9]" />
                    </div>
                    <div className="text-right">
                      <a href="#" className="text-[12px] text-[#0ea5e9] hover:underline">Mot de passe oublié ?</a>
                    </div>
                    <button type="submit" disabled={loadingAuth} className="w-full btn-blue py-3 rounded-full text-[12px] mt-4 font-bold tracking-wider disabled:opacity-70">
                      {loadingAuth ? 'Connexion...' : 'Se Connecter'}
                    </button>
                  </form>
                  <div className="mt-8 text-[12px] text-[#6B6B6B] border-t border-[#e0ddd4] pt-6">
                    Nouveau client ? <button onClick={() => { setAuthStep('signup'); setAuthError(''); }} className="text-[#0ea5e9] font-bold underline">Créer un compte</button>
                  </div>
                </div>
              )}

              {authStep === 'signup' && (
                <div className="text-center py-4">
                  <h3 className="heading-font text-3xl mb-2">Créer un compte</h3>
                  <p className="text-[#6B6B6B] text-[13px] mb-6">Rejoignez-nous pour gérer vos commandes.</p>
                  
                  {authError && (
                    <div className="bg-red-50 text-red-600 border border-red-200 rounded-lg p-3 text-[12px] mb-4">
                      {authError}
                    </div>
                  )}

                  <form className="space-y-4" onSubmit={handleAuth}>
                    <div>
                      <input required type="text" placeholder="Nom complet" value={authData.name} onChange={e => setAuthData({...authData, name: e.target.value})} className="w-full border border-[#e0ddd4] rounded-lg px-4 py-3 text-[13px] focus:outline-none focus:border-[#0ea5e9]" />
                    </div>
                    <div>
                      <input required type="email" placeholder="Adresse e-mail" value={authData.email} onChange={e => setAuthData({...authData, email: e.target.value})} className="w-full border border-[#e0ddd4] rounded-lg px-4 py-3 text-[13px] focus:outline-none focus:border-[#0ea5e9]" />
                    </div>
                    <div>
                      <input required type="password" placeholder="Mot de passe" minLength={6} value={authData.password} onChange={e => setAuthData({...authData, password: e.target.value})} className="w-full border border-[#e0ddd4] rounded-lg px-4 py-3 text-[13px] focus:outline-none focus:border-[#0ea5e9]" />
                    </div>
                    <button type="submit" disabled={loadingAuth} className="w-full btn-blue py-3 rounded-full text-[12px] mt-4 font-bold tracking-wider disabled:opacity-70">
                      {loadingAuth ? 'Inscription...' : "S'inscrire"}
                    </button>
                  </form>
                  <div className="mt-8 text-[12px] text-[#6B6B6B] border-t border-[#e0ddd4] pt-6">
                    Déjà un compte ? <button onClick={() => { setAuthStep('login'); setAuthError(''); }} className="text-[#0ea5e9] font-bold underline">Se connecter</button>
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
