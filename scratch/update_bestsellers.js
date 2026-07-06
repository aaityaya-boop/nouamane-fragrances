const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, '../src/app/page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

const oldBestsellersMatch = /<section className="bg-transparent border-y border-\[\#e0ddd4\]">\s*<div className="max-w-\[1400px\] mx-auto px-6 lg:px-10 py-20 lg:py-28">\s*<SectionHeader[\s\S]*?<\/motion\.div>\s*<\/div>\s*<\/section>/;

const newBestsellers = `<section className="relative bg-[#f8fafc] border-y border-[#e0ddd4] overflow-hidden py-24 lg:py-32">
        {/* Massive Radial Spotlight Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-[#0ea5e9]/10 to-transparent rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 mb-16 relative z-10">
          <SectionHeader
            icon={<Flame size={16} className="text-[#0ea5e9]" />}
            eyebrow="Les plus vendus au Maroc"
            title="Bestsellers"
            subtitle="Les fragrances plébiscitées par nos clients ce mois-ci."
            linkLabel="Voir tous les bestsellers"
            linkHref="/shop"
          />
        </div>

        {/* Drag Carousel Container */}
        <div className="relative z-10 w-full pl-6 lg:pl-10 pb-16">
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="flex gap-8 lg:gap-16 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-20 pt-16 pr-6 lg:pr-10"
            style={{ scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch' }}
          >
            {bestsellers.map((p) => (
              <motion.div variants={staggerItem} key={p.id} className="snap-center shrink-0 w-[280px] sm:w-[320px] lg:w-[380px] relative group">
                <Link href={\`/product/\${p.slug}\`} className="block">
                  {/* Glass Base Card */}
                  <div className="relative bg-white/60 backdrop-blur-xl border border-white shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] rounded-3xl p-8 pt-32 transition-all duration-700 group-hover:shadow-[0_20px_60px_-15px_rgba(14,165,233,0.15)] group-hover:bg-white mt-16">
                    {/* Floating 3D Breakout Bottle */}
                    <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[80%] h-[260px] pointer-events-none drop-shadow-2xl z-20 group-hover:-translate-y-6 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]">
                      <Image
                        src={p.image}
                        alt={p.name}
                        fill
                        className="object-contain scale-110 group-hover:scale-125 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                      />
                    </div>
                    
                    {/* Content */}
                    <div className="text-center relative z-10 mt-6">
                      <div className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#9A9A9A] mb-3">
                        {p.brand}
                      </div>
                      <h3 className="heading-font text-2xl lg:text-3xl text-[#1A1A1A] mb-4 leading-tight tracking-wide">
                        {p.name}
                      </h3>
                      <div className="text-[13px] text-[#1A1A1A]/60 italic mb-8">
                        {p.concentration}
                      </div>
                      <div className="flex items-center justify-center gap-4">
                        <span className="text-lg font-medium text-[#1A1A1A]">
                          {p.price} DHS
                        </span>
                        {p.oldPrice && (
                          <span className="text-[13px] text-[#9A9A9A] line-through">
                            {p.oldPrice} DHS
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Floor Reflection glow */}
                    <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[60%] h-4 bg-black/5 blur-xl rounded-[100%] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>`;

if (oldBestsellersMatch.test(content)) {
  content = content.replace(oldBestsellersMatch, newBestsellers);
  fs.writeFileSync(pagePath, content);
  console.log("Bestsellers Carousel updated!");
} else {
  console.log("Bestsellers Carousel not found. Check regex.");
}

// Ensure scrollbar-hide is in globals.css
const cssPath = path.join(__dirname, '../src/app/globals.css');
let cssContent = fs.readFileSync(cssPath, 'utf8');
if (!cssContent.includes('.scrollbar-hide')) {
  cssContent += `\n/* Hide scrollbar for Chrome, Safari and Opera */\n.scrollbar-hide::-webkit-scrollbar {\n  display: none;\n}\n\n/* Hide scrollbar for IE, Edge and Firefox */\n.scrollbar-hide {\n  -ms-overflow-style: none;  /* IE and Edge */\n  scrollbar-width: none;  /* Firefox */\n}\n`;
  fs.writeFileSync(cssPath, cssContent);
  console.log("Added scrollbar-hide to globals.css");
}
