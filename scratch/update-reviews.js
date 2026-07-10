const fs = require('fs');
const file = 'src/app/[locale]/HomePageClient.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add MessageCircle and Quote to lucide imports
if (!content.includes('MessageCircle')) {
  content = content.replace(/import \{([\s\S]*?)\} from 'lucide-react';/, "import {\n  MessageCircle,\n  Quote,\n$1} from 'lucide-react';");
}

// 2. Replace the duplicated "Authenticité garantie" value proposition with "Service client réactif"
content = content.replace(
  /\{\s*icon: <Star size=\{22\} strokeWidth=\{1\.5\} \/>,\s*title: 'Authenticité garantie',\s*desc: 'Tous nos parfums sont 100% originaux et certifiés authentiques\.'\s*\}/,
  "{ icon: <MessageCircle size={22} strokeWidth={1.5} />, title: 'Service client réactif', desc: 'Une équipe à votre écoute 7j/7 pour vous conseiller.' }"
);

// 3. Replace the Testimonials block with an attractive masonry grid with Darija reviews
const oldTestimonialsStart = content.indexOf('{/* ===============================\n          TESTIMONIALS (AVIS CLIENTS)');
const oldTestimonialsEnd = content.indexOf('<FAQ />');

if (oldTestimonialsStart !== -1 && oldTestimonialsEnd !== -1) {
  const newTestimonials = `{/* ===============================
          TESTIMONIALS (AVIS CLIENTS)
          =============================== */}
      <motion.section {...fadeUpProps} className="bg-[#f8fafc] border-y border-[#e0ddd4] py-20 lg:py-28 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-[#0ea5e9]/5 to-transparent rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-[#0ea5e9]/5 to-transparent rounded-full blur-[80px] pointer-events-none" />
        
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 relative z-10">
          <div className="text-center mb-16">
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#0ea5e9]">
              Ce qu'ils en pensent
            </span>
            <h2 className="heading-font text-4xl lg:text-5xl mt-2 tracking-wide">
              Avis de nos clients
            </h2>
          </div>
          
          <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
            {[
              {
                text: "Saraha mzyan bzaf, ri7a aslia 100% w l'emballage nadi. Tawsil kan f nhar, tbarkellah 3likom!",
                author: "Yassine M.",
                city: "Marrakech",
                product: "Tom Ford Ombré Leather"
              },
              {
                text: "J'étais fatigué d'acheter des parfums chez des revendeurs douteux. La garantie d'authenticité et la livraison rapide de Nouamane font toute la différence. Stronger With You est parfait !",
                author: "Hassan L.",
                city: "Casablanca",
                product: "Armani Stronger With You"
              },
              {
                text: "Top top! Parfum mjahd w kaydreb bzaf f l7wayj. Service client m39ol w mzyanin.",
                author: "Karim O.",
                city: "Agadir",
                product: "YSL Y Eau de Parfum"
              },
              {
                text: "Expérience incroyable. Le parfum est arrivé dans un emballage soigné en moins de 48h. L'odeur est 100% authentique. Je recommande à tous mes proches.",
                author: "Salma B.",
                city: "Rabat",
                product: "YSL Libre Eau de Parfum"
              },
              {
                text: "T3amola mzyana bzaf, w taman munasib par rapport l souq. Merci Nouamane Parfums!",
                author: "Sofia K.",
                city: "Tanger",
                product: "Armani My Way"
              },
              {
                text: "C'est de loin ma meilleure expérience d'achat de parfum au Maroc. Service pro, qualité 100% garantie. 3jebni bzaf l'emballage kiji b7al kado.",
                author: "Youssef E.",
                city: "Fès",
                product: "Valentino Uomo Intense"
              }
            ].map((review, i) => (
              <div key={i} className="break-inside-avoid bg-white p-8 rounded-[2rem] border border-[#e0ddd4]/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(14,165,233,0.08)] transition-shadow duration-300 relative group flex flex-col justify-between">
                <Quote className="absolute top-6 right-6 text-[#0ea5e9]/5 group-hover:text-[#0ea5e9]/10 transition-colors" size={64} />
                
                <div className="relative z-10">
                  <div className="flex gap-1 mb-6">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} size={16} className="text-[#0ea5e9] fill-[#0ea5e9]" />
                    ))}
                  </div>
                  <blockquote className="text-[15px] text-[#4A4A4A] leading-[1.8] font-medium italic mb-8">
                    "{review.text}"
                  </blockquote>
                </div>
                
                <div className="relative z-10 pt-6 border-t border-[#e0ddd4]/40">
                  <div className="text-[12px] font-bold tracking-[0.15em] uppercase text-[#1A1A1A]">
                    {review.author}
                  </div>
                  <div className="text-[11px] text-[#9A9A9A] mt-1.5 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span> Client vérifié · {review.city}
                  </div>
                  <div className="inline-block mt-4 px-3 py-1 bg-[#f8fafc] rounded-full border border-[#e0ddd4] text-[10px] text-[#0ea5e9] font-semibold">
                    Acheté: {review.product}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.section>\n\n      `;
      
  const head = content.substring(0, oldTestimonialsStart);
  const tail = content.substring(oldTestimonialsEnd);
  content = head + newTestimonials + tail;
}

fs.writeFileSync(file, content);
console.log('Successfully updated reviews and value propositions');
