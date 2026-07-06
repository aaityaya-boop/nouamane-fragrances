const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, '../src/app/page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

const bentoBoxMatch = /\{\/\* Bento Box Grid Container \*\/\}[\s\S]*?<\/motion\.div>\s*<\/div>/;

const newCarousel = `{/* Drag Carousel Container */}
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
                        src={p.images[0]}
                        alt={p.name}
                        fill
                        className="object-contain scale-110 group-hover:scale-125 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                      />
                    </div>
                    
                    {/* Content */}
                    <div className="text-center relative z-10 mt-6">
                      <div className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#9A9A9A] mb-3">
                        {p.brandLabel}
                      </div>
                      <h3 className="heading-font text-2xl lg:text-3xl text-[#1A1A1A] mb-4 leading-tight tracking-wide">
                        {p.name}
                      </h3>
                      <div className="text-[13px] text-[#1A1A1A]/60 italic mb-8">
                        {p.tagline}
                      </div>
                      <div className="flex items-center justify-center gap-4">
                        <span className="text-lg font-medium text-[#1A1A1A]">
                          {p.price} DHS
                        </span>
                        {p.originalPrice && (
                          <span className="text-[13px] text-[#9A9A9A] line-through">
                            {p.originalPrice} DHS
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
        </div>`;

if (bentoBoxMatch.test(content)) {
  content = content.replace(bentoBoxMatch, newCarousel);
  fs.writeFileSync(pagePath, content);
  console.log("Carousel restored!");
} else {
  console.log("Bento Box not found. Check regex.");
}
