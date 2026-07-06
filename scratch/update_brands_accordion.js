const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, '../src/app/page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

const oldBrandsMatch = /<motion\.div\s+variants=\{staggerContainer\}\s+initial="hidden"\s+whileInView="show"\s+viewport=\{\{ once: true, margin: "-100px" \}\}\s+className="grid grid-cols-1 md:grid-cols-3 gap-5"\s*>[\s\S]*?<\/motion\.div>/;

const newBrands = `<motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="flex flex-col md:flex-row h-[800px] md:h-[600px] w-full gap-2 lg:gap-4 overflow-hidden group/accordion"
        >
          {BRANDS.map((brand) => (
            <motion.div 
              variants={staggerItem} 
              key={brand.slug} 
              className="brand-slice group relative flex-1 md:hover:flex-[4] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden rounded-2xl md:rounded-3xl cursor-pointer"
            >
              <Link href={\`/brands/\${brand.slug}\`} className="block w-full h-full">
                <Image
                  src={brand.heroImage}
                  alt={brand.label}
                  fill
                  className="object-cover brightness-[0.6] md:brightness-[0.4] group-hover:brightness-[0.8] transition-all duration-700 scale-105 group-hover:scale-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                
                {/* Vertical Text (Collapsed state on desktop) */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 md:opacity-100 group-hover:opacity-0 transition-opacity duration-300 pointer-events-none">
                  <span className="heading-font text-white text-3xl -rotate-90 whitespace-nowrap tracking-widest">{brand.label}</span>
                </div>

                {/* Expanded Content */}
                <div className="absolute bottom-0 left-0 right-0 p-8 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all duration-700 md:translate-y-4 md:group-hover:translate-y-0">
                  <div className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#38bdf8]">
                    Depuis {brand.founded} · {brand.origin}
                  </div>
                  <div className="heading-font text-3xl lg:text-5xl text-white mt-2 tracking-wide leading-tight whitespace-nowrap">
                    {brand.label}
                  </div>
                  <div className="mt-3 text-white/80 text-[14px] italic max-w-sm line-clamp-2">
                    {brand.tagline}
                  </div>
                  <div className="mt-6 inline-flex items-center justify-center bg-white/20 backdrop-blur-md px-6 py-3 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase text-white hover:bg-white hover:text-black transition-colors">
                    Explorer la collection
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>`;

if (oldBrandsMatch.test(content)) {
  content = content.replace(oldBrandsMatch, newBrands);
  fs.writeFileSync(pagePath, content);
  console.log("Brands Accordion updated!");
} else {
  console.log("Brands Accordion not found. It may have already been updated.");
}
