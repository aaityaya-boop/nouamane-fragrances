import React from 'react';

export default function LandingFooter() {
  return (
    <footer className="bg-white py-12 border-t border-gray-100 mt-20">
      <div className="max-w-[1200px] mx-auto px-6 text-center">
        <div className="heading-font text-xl font-light tracking-[0.25em] text-[#1A1A1A] mb-4">
          NOUAMANE
        </div>
        <p className="text-[12px] text-gray-500 max-w-md mx-auto mb-6">
          Votre distributeur exclusif de parfums de créateurs au Maroc. 
          Paiement à la livraison et authenticité garantie à 100%.
        </p>
        <div className="text-[10px] uppercase tracking-[0.2em] text-gray-400">
          © {new Date().getFullYear()} NOUAMANE PARFUMS. TOUS DROITS RÉSERVÉS.
        </div>
      </div>
    </footer>
  );
}
