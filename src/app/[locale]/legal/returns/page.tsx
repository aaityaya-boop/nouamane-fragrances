import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function ReturnsPage() {
  return (
    <div className="bg-[#fafaf7] min-h-screen text-[#1A1A1A]">
      <Header />
      <main className="max-w-3xl mx-auto px-6 py-32 lg:py-48">
        <h1 className="heading-font text-4xl lg:text-5xl mb-10">Retours et Remboursements</h1>
        
        <div className="space-y-8 text-[15px] leading-relaxed text-[#6B6B6B]">
          <section>
            <h2 className="text-xl font-bold text-[#1A1A1A] mb-4">1. Conditions de retour</h2>
            <p>Conformément à notre politique d'hygiène et pour garantir l'authenticité de nos produits, les parfums ne peuvent être retournés ou échangés que sous certaines conditions très strictes :</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Le produit doit être dans son emballage d'origine scellé et intact (blister non ouvert).</li>
              <li>Le retour doit être signalé dans un délai de 7 jours après la réception de la commande.</li>
            </ul>
            <p className="mt-4 font-medium text-[#1A1A1A]">Un parfum dont le blister (film plastique) a été ouvert, même sans avoir été vaporisé, ne sera ni repris ni échangé.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1A1A1A] mb-4">2. Produit défectueux ou erreur de livraison</h2>
            <p>Si vous avez reçu un produit défectueux ou s'il y a eu une erreur dans votre commande, veuillez nous contacter immédiatement via WhatsApp ou par email dans les 48 heures suivant la réception. Nous procéderons à l'échange à nos frais après vérification.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1A1A1A] mb-4">3. Procédure de retour</h2>
            <p>Pour effectuer un retour éligible, veuillez contacter notre service client pour obtenir un numéro d'autorisation de retour. Les frais d'expédition pour le retour d'un produit conforme sont à la charge du client.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
