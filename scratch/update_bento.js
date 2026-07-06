const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, '../src/app/page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

const oldBestsellersMatch = /\{\/\* Drag Carousel Container \*\/\}[\s\S]*?<\/motion\.div>\s*<\/div>/;

const newBentoBox = `{/* Bento Box Grid Container */}
        <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 lg:px-10 pb-16">
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 lg:gap-8 auto-rows-[400px] lg:auto-rows-[380px]"
          >
            {bestsellers.slice(0, 4).map((p, index) => {
              // Layout logic for Bento Boxes
              const isHero = index === 0;
              const isLandscape = index === 1;
              const isSquare = index > 1;

              let gridClasses = "relative group rounded-[2.5rem] overflow-hidden bg-white/60 backdrop-blur-xl border border-white shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] transition-all duration-700 hover:shadow-[0_20px_60px_-15px_rgba(14,165,233,0.15)] hover:bg-white";
              
              if (isHero) {
                gridClasses += " md:col-span-2 md:row-span-2 flex flex-col md:flex-row items-center p-10 lg:p-14";
              } else if (isLandscape) {
                gridClasses += " md:col-span-2 md:row-span-1 flex flex-row items-center p-8";
              } else {
                gridClasses += " md:col-span-1 md:row-span-1 flex flex-col items-center justify-center p-8";
              }

              return (
              <motion.div variants={staggerItem} key={p.id} className={gridClasses}>
                <Link href={\`/product/\${p.slug}\`} className="block w-full h-full relative">
                  
                  {isHero && (
                    <div className="w-full h-full flex flex-col md:flex-row items-center justify-between gap-10">
                      <div className="flex-1 z-10 order-2 md:order-1 text-center md:text-left">
                        <div className="inline-block px-4 py-1.5 rounded-full bg-[#1A1A1A] text-white text-[10px] font-bold tracking-[0.2em] uppercase mb-6">
                          #1 Bestseller
                        </div>
                        <h3 className="heading-font text-4xl lg:text-[4rem] text-[#1A1A1A] mb-4 leading-[1.05] tracking-wide">
                          {p.name}
                        </h3>
                        <div className="text-[12px] font-bold tracking-[0.3em] uppercase text-[#9A9A9A] mb-8">
                          {p.brandLabel}
                        </div>
                        <div className="flex items-center justify-center md:justify-start gap-4">
                          <span className="text-xl lg:text-2xl font-medium text-[#1A1A1A]">
                            {p.price} DHS
                          </span>
                        </div>
                      </div>
                      <div className="relative flex-1 h-[250px] md:h-[450px] w-full pointer-events-none drop-shadow-2xl z-20 group-hover:scale-105 group-hover:-rotate-3 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] order-1 md:order-2">
                        <Image src={p.images[0]} alt={p.name} fill className="object-contain" />
                      </div>
                    </div>
                  )}

                  {isLandscape && (
                    <div className="w-full h-full flex items-center justify-between gap-6">
                      <div className="flex-1 z-10 pl-2 lg:pl-6">
                        <div className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#0ea5e9] mb-3">
                          Tendance
                        </div>
                        <h3 className="heading-font text-2xl lg:text-3xl text-[#1A1A1A] mb-2 leading-tight tracking-wide">
                          {p.name}
                        </h3>
                        <div className="text-[11px] uppercase tracking-widest text-[#9A9A9A] mb-6">
                          {p.brandLabel}
                        </div>
                        <div className="text-lg font-medium text-[#1A1A1A]">
                          {p.price} DHS
                        </div>
                      </div>
                      <div className="relative flex-1 h-[220px] lg:h-[260px] w-full pointer-events-none drop-shadow-2xl z-20 group-hover:scale-110 group-hover:-translate-y-2 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]">
                        <Image src={p.images[0]} alt={p.name} fill className="object-contain" />
                      </div>
                    </div>
                  )}

                  {isSquare && (
                    <div className="w-full h-full flex flex-col items-center justify-between text-center">
                      <div className="relative w-[180px] h-[220px] pointer-events-none drop-shadow-2xl z-20 group-hover:-translate-y-4 group-hover:scale-110 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] mt-2">
                        <Image src={p.images[0]} alt={p.name} fill className="object-contain" />
                      </div>
                      <div className="z-10 mt-auto">
                        <div className="text-[9px] font-bold tracking-[0.3em] uppercase text-[#9A9A9A] mb-2">
                          {p.brandLabel}
                        </div>
                        <h3 className="heading-font text-xl text-[#1A1A1A] mb-1 leading-tight tracking-wide">
                          {p.name}
                        </h3>
                        <div className="text-sm font-medium text-[#1A1A1A]">
                          {p.price} DHS
                        </div>
                      </div>
                    </div>
                  )}

                </Link>
              </motion.div>
              );
            })}
          </motion.div>
        </div>`;

if (oldBestsellersMatch.test(content)) {
  content = content.replace(oldBestsellersMatch, newBentoBox);
  fs.writeFileSync(pagePath, content);
  console.log("Bento Box applied!");
} else {
  console.log("Drag Carousel not found. Check regex.");
}
