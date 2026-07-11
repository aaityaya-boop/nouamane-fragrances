const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/[locale]/product/[slug]/ProductClient.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add Gift Option after the "QUANTITY + ADD" div
const giftCode = `
            {/* GIFT OPTION */}
            <div className="mt-4">
              <a 
                href={\`https://wa.me/212694186787?text=\${encodeURIComponent("Bonjour, j'aimerais offrir " + product.name + " en cadeau et personnaliser mon emballage.")}\`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-3 bg-[#f8fafc] border border-[#e0ddd4] text-[#1A1A1A] py-4 rounded-xl hover:bg-white hover:border-[#0ea5e9] transition-all group"
              >
                <Gift className="text-[#0ea5e9] group-hover:scale-110 transition-transform" size={20} />
                <span className="text-[13px] font-semibold tracking-wide">C'est pour offrir ? Personnalisez votre cadeau</span>
              </a>
            </div>
`;

// Insert after the flex-col md:flex-row div that contains the Add to Cart button
// It's easiest to insert before "TRUST BADGES / SHIPPING PERKS"
content = content.replace(
  '{/* TRUST BADGES / SHIPPING PERKS */}',
  giftCode + '\n            {/* TRUST BADGES / SHIPPING PERKS */}'
);


// 2. Add FAQ before REVIEWS
const faqCode = `
          {/* FAQ */}
          <div className="max-w-3xl mx-auto space-y-6 pt-12">
            <h2 className="heading-font text-3xl text-center text-[#1A1A1A] mb-8 tracking-wide">Foire Aux Questions</h2>
            {[
              { q: "Les testeurs sont-ils authentiques ?", a: "Oui, nos testeurs sont 100% originaux et proviennent directement des maisons de parfum. Ils contiennent exactement la même fragrance que le produit de vente classique." },
              { q: "Quels sont les délais de livraison ?", a: "La livraison s'effectue généralement sous 24h à 48h partout au Maroc via notre partenaire de livraison express." },
              { q: "Comment fonctionne le paiement ?", a: "Pour votre sécurité, le paiement s'effectue intégralement à la livraison. Vous payez uniquement lorsque vous recevez votre commande." },
              { q: "Puis-je retourner le produit ?", a: "Oui, vous disposez d'un délai de 14 jours pour retourner le produit dans son état d'origine, conformément à notre politique de retour." }
            ].map((faq, i) => (
              <details key={i} className="group bg-white border border-[#e0ddd4] rounded-xl overflow-hidden hover:border-[#0ea5e9] transition-colors">
                <summary className="flex justify-between items-center font-medium cursor-pointer list-none p-5 text-[15px] text-[#1A1A1A]">
                  <span>{faq.q}</span>
                  <span className="transition group-open:rotate-180">
                    <ChevronDown size={18} className="text-[#9A9A9A]" />
                  </span>
                </summary>
                <div className="text-[#6B6B6B] text-[14px] mt-1 p-5 pt-0 leading-relaxed border-t border-[#e0ddd4]/50">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
`;

// Find end of the "Pourquoi Choisir" section which is right before </section> of PRO DESCRIPTION
content = content.replace(
  '        </div>\n      </section>\n\n      {/* ====== REVIEWS ====== */}',
  faqCode + '\n        </div>\n      </section>\n\n      {/* ====== REVIEWS ====== */}'
);

// We need ChevronDown import in ProductClient.tsx
if (!content.includes('ChevronDown')) {
  content = content.replace(
    'ChevronRight as Chev,',
    'ChevronRight as Chev,\n  ChevronDown,'
  );
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Marketing updates applied!');
