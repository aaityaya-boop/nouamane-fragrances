import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function AmbassadeurPage() {
  return (
    <div className="bg-[#fafaf7] text-[#1A1A1A] min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pt-32 pb-24">
        <div className="max-w-[800px] mx-auto px-6 text-center">
          <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#0ea5e9] mb-4 block">
            Programme Affiliation
          </span>
          <h1 className="heading-font text-4xl lg:text-6xl mb-6">Devenez Ambassadeur NAY</h1>
          <p className="text-[#6B6B6B] mb-12 text-lg">
            Rejoignez notre réseau exclusif, partagez votre passion pour la haute parfumerie avec votre communauté, et soyez récompensé pour chaque vente générée.
          </p>

          <div className="bg-white border border-[#e0ddd4] rounded-2xl p-8 lg:p-12 text-left mb-12 shadow-sm">
            <h2 className="heading-font text-2xl mb-6">Comment ça marche ?</h2>
            <ul className="space-y-6">
              <li className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-[#0ea5e9]/10 text-[#0ea5e9] flex items-center justify-center font-bold shrink-0">1</div>
                <div>
                  <h3 className="font-bold mb-1">Postulez au programme</h3>
                  <p className="text-[14px] text-[#6B6B6B]">Contactez-nous via WhatsApp ou par email avec le lien vers vos réseaux sociaux.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-[#0ea5e9]/10 text-[#0ea5e9] flex items-center justify-center font-bold shrink-0">2</div>
                <div>
                  <h3 className="font-bold mb-1">Recevez votre lien unique</h3>
                  <p className="text-[14px] text-[#6B6B6B]">Nous vous créons un lien personnalisé (ex: nouamane.ma/vip/votre-nom) à partager avec vos abonnés.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-[#0ea5e9]/10 text-[#0ea5e9] flex items-center justify-center font-bold shrink-0">3</div>
                <div>
                  <h3 className="font-bold mb-1">Gagnez des commissions</h3>
                  <p className="text-[14px] text-[#6B6B6B]">Chaque commande passée via votre lien vous rapporte une commission directe sur la vente.</p>
                </div>
              </li>
            </ul>
          </div>

          <Link href="/contact" className="btn-blue inline-block px-10 py-4 rounded-full text-[13px] font-bold tracking-[0.1em] uppercase shadow-lg shadow-sky-500/20 hover:-translate-y-1 transition-transform">
            Nous contacter pour postuler
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
