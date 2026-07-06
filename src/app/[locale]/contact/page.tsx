'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function ContactPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    
    const formData = new FormData(e.target as HTMLFormElement);
    const data = {
      name: formData.get('name'),
      phone: formData.get('phone'),
      email: formData.get('email'),
      message: formData.get('message'),
    };

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setStatus('success');
      } else {
        setStatus('idle');
        alert("Erreur lors de l'envoi. Veuillez réessayer.");
      }
    } catch (error) {
      console.error(error);
      setStatus('idle');
      alert('Erreur de connexion.');
    }
  };

  return (
    <div className="bg-[#fafaf7] min-h-screen text-[#1A1A1A]">
      <Header />
      <main className="max-w-[1400px] mx-auto px-6 py-32 lg:py-48">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          <div>
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#0ea5e9]">
              Nous contacter
            </span>
            <h1 className="heading-font text-4xl lg:text-6xl mt-4 mb-8">Discutons de votre projet olfactif.</h1>
            <p className="text-[#6B6B6B] text-[15px] leading-relaxed mb-12">
              Une question sur une fragrance ? Besoin d'aide pour suivre votre commande ? Notre équipe d'experts est là pour vous accompagner.
            </p>

            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow-sm border border-[#e0ddd4]">
                  <Phone size={18} className="text-[#1A1A1A]" />
                </div>
                <div>
                  <h3 className="text-[14px] font-bold text-[#1A1A1A] mb-1">Téléphone & WhatsApp</h3>
                  <p className="text-[14px] text-[#6B6B6B]">+212 5 22 45 67 89</p>
                  <p className="text-[12px] text-[#9A9A9A] mt-1">Lun-Sam, 9h-19h</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow-sm border border-[#e0ddd4]">
                  <Mail size={18} className="text-[#1A1A1A]" />
                </div>
                <div>
                  <h3 className="text-[14px] font-bold text-[#1A1A1A] mb-1">Email</h3>
                  <p className="text-[14px] text-[#6B6B6B]">contact@nouamane-parfums.ma</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow-sm border border-[#e0ddd4]">
                  <MapPin size={18} className="text-[#1A1A1A]" />
                </div>
                <div>
                  <h3 className="text-[14px] font-bold text-[#1A1A1A] mb-1">Boutique</h3>
                  <p className="text-[14px] text-[#6B6B6B]">Boulevard Mohammed V<br/>Casablanca, Maroc</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 lg:p-12 rounded-3xl border border-[#e0ddd4] shadow-sm">
            <h2 className="text-2xl font-semibold mb-8">Envoyez-nous un message</h2>
            
            {status === 'success' ? (
              <div className="bg-[#fafaf7] border border-[#e0ddd4] rounded-2xl p-8 text-center">
                <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail size={24} />
                </div>
                <h3 className="text-xl font-bold mb-2">Message envoyé !</h3>
                <p className="text-[#6B6B6B] text-[14px]">Notre équipe vous répondra dans les plus brefs délais.</p>
                <button 
                  onClick={() => setStatus('idle')}
                  className="mt-6 text-[11px] font-bold tracking-[0.1em] uppercase text-[#0ea5e9] hover:underline"
                >
                  Envoyer un autre message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[12px] font-bold text-[#1A1A1A] mb-2 uppercase tracking-wide">Nom complet</label>
                  <input type="text" name="name" required className="w-full bg-[#fafaf7] border border-[#e0ddd4] px-4 py-3 rounded-xl text-[14px] focus:outline-none focus:border-[#0ea5e9] transition-colors" placeholder="Votre nom" />
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-[#1A1A1A] mb-2 uppercase tracking-wide">Téléphone</label>
                    <input type="tel" name="phone" required className="w-full bg-[#fafaf7] border border-[#e0ddd4] px-4 py-3 rounded-xl text-[14px] focus:outline-none focus:border-[#0ea5e9] transition-colors" placeholder="06 XX XX XX XX" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-[12px] font-bold text-[#1A1A1A] mb-2 uppercase tracking-wide">Email</label>
                  <input type="email" name="email" required className="w-full bg-[#fafaf7] border border-[#e0ddd4] px-4 py-3 rounded-xl text-[14px] focus:outline-none focus:border-[#0ea5e9] transition-colors" placeholder="vous@exemple.com" />
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-[#1A1A1A] mb-2 uppercase tracking-wide">Message</label>
                  <textarea name="message" required rows={5} className="w-full bg-[#fafaf7] border border-[#e0ddd4] px-4 py-3 rounded-xl text-[14px] focus:outline-none focus:border-[#0ea5e9] transition-colors resize-none" placeholder="Comment pouvons-nous vous aider ?"></textarea>
                </div>

                <button 
                  type="submit" 
                  disabled={status === 'loading'}
                  className="w-full bg-[#1A1A1A] text-white py-4 rounded-full text-[11px] font-bold tracking-[0.2em] uppercase hover:bg-black transition-colors disabled:opacity-50"
                >
                  {status === 'loading' ? 'Envoi en cours...' : 'Envoyer le message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
