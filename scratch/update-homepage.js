const fs = require('fs');

const path = 'src/app/[locale]/HomePageClient.tsx';
let content = fs.readFileSync(path, 'utf8');

const startCat = '{/* ===============================\n          CATEGORY SHORTCUTS';
const endCat = '{/* ===============================\n          FEATURED — BESTSELLERS';

const startIndexCat = content.indexOf(startCat);
const endIndexCat = content.indexOf(endCat);

if (startIndexCat !== -1 && endIndexCat !== -1) {
  content = content.substring(0, startIndexCat) + 
`{/* ===============================
          CATEGORY SHORTCUTS (Redesigned)
          =============================== */}
      <section className="relative w-full overflow-hidden bg-white text-[#1A1A1A] py-24 lg:py-32 border-b border-[#e0ddd4]">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="flex flex-col lg:flex-row items-end justify-between mb-16 lg:mb-24 gap-8">
            <div className="max-w-xl">
              <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#0ea5e9] mb-4 block">
                Trouvez votre signature
              </span>
              <h2 className="heading-font text-5xl lg:text-7xl tracking-wide">
                Parcourir par<br/><span className="text-[#9A9A9A] italic">Catégorie</span>
              </h2>
            </div>
            <p className="text-[#6B6B6B] text-[14px] lg:text-[15px] max-w-sm">
              Découvrez nos sélections exclusives de parfums authentiques, choisies pour révéler votre personnalité unique.
            </p>
          </div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10"
          >
            {MAIN_CATEGORIES.map((cat, index) => (
              <motion.div variants={staggerItem} key={cat.slug} className={\`relative group h-[500px] lg:h-[700px] rounded-3xl overflow-hidden \${index === 1 ? 'lg:mt-24' : ''}\`}>
                <Link href={\`/shop/\${cat.slug}\`} className="block w-full h-full">
                  <Image
                    src={cat.heroImage}
                    alt={cat.label}
                    fill
                    className="object-cover brightness-[0.7] group-hover:brightness-[0.9] group-hover:scale-105 transition-all duration-[1.5s] ease-[cubic-bezier(0.25,1,0.5,1)]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  <div className="absolute inset-0 p-10 lg:p-14 flex flex-col justify-end">
                    <div className="overflow-hidden mb-4">
                      <h3 className="heading-font text-5xl lg:text-7xl text-white tracking-wide transform translate-y-4 group-hover:translate-y-0 opacity-80 group-hover:opacity-100 transition-all duration-700">
                        {cat.labelShort}
                      </h3>
                    </div>
                    
                    <div className="flex flex-wrap gap-3 transform translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700 delay-100">
                      {cat.subcategories.slice(0, 4).map((sc) => (
                        <span
                          key={sc.slug}
                          className="text-[10px] font-bold tracking-[0.2em] uppercase bg-white/10 backdrop-blur-md text-white px-4 py-2 rounded-full border border-white/20 hover:bg-white hover:text-black transition-colors"
                        >
                          {sc.label}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      ` + content.substring(endIndexCat);
  console.log("Replaced Categories");
}


const startBrand = '{/* ===============================\n          BRAND SHOWCASE';
const endBrand = '{/* ===============================\n          VALUE PROPOSITIONS';

const startIndexBrand = content.indexOf(startBrand);
const endIndexBrand = content.indexOf(endBrand);

if (startIndexBrand !== -1 && endIndexBrand !== -1) {
  content = content.substring(0, startIndexBrand) + 
`{/* ===============================
          BRAND SHOWCASE (5 Marques Mythiques)
          =============================== */}
      <section id="brands" className="max-w-[1400px] mx-auto px-6 lg:px-10 py-20 lg:py-28">
        <div className="text-center mb-16">
          <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#0ea5e9]">
            L'Élite de la Parfumerie
          </span>
          <h2 className="heading-font text-5xl lg:text-6xl mt-4 tracking-wide">
            5 Marques Mythiques
          </h2>
        </div>

        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="flex flex-col md:flex-row h-[900px] md:h-[700px] w-full gap-3 overflow-hidden group/accordion"
        >
          {[
            { name: 'Yves Saint Laurent', slug: 'yves-saint-laurent', logo: '/logos/ysl.png', img: 'https://images.pexels.com/photos/11216321/pexels-photo-11216321.jpeg?auto=compress&cs=tinysrgb&w=800' },
            { name: 'Valentino', slug: 'valentino', logo: '/logos/valentino.jpg', img: 'https://images.pexels.com/photos/965989/pexels-photo-965989.jpeg?auto=compress&cs=tinysrgb&w=800' },
            { name: 'Jean Paul Gaultier', slug: 'jean-paul-gaultier', logo: '/logos/jean-paul-gaultier.png', img: 'https://images.pexels.com/photos/1961791/pexels-photo-1961791.jpeg?auto=compress&cs=tinysrgb&w=800' },
            { name: 'Dior', slug: 'dior', logo: '/logos/dior.jpeg', img: 'https://images.pexels.com/photos/432059/pexels-photo-432059.jpeg?auto=compress&cs=tinysrgb&w=800' },
            { name: 'Giorgio Armani', slug: 'armani', logo: '/logos/armani.png', img: 'https://images.pexels.com/photos/1961795/pexels-photo-1961795.jpeg?auto=compress&cs=tinysrgb&w=800' }
          ].map((brand) => (
            <motion.div 
              variants={staggerItem} 
              key={brand.slug} 
              className="brand-slice group relative flex-1 md:hover:flex-[4] transition-all duration-[1s] ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden rounded-3xl cursor-pointer"
            >
              <Link href={\`/brands/\${brand.slug}\`} className="block w-full h-full bg-white relative">
                <Image
                  src={brand.img}
                  alt={brand.name}
                  fill
                  className="object-cover brightness-[0.4] group-hover:brightness-[0.9] transition-all duration-[1.5s] scale-110 group-hover:scale-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent md:opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                
                {/* Vertical Text (Collapsed state on desktop) */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 md:opacity-100 group-hover:opacity-0 transition-opacity duration-500 pointer-events-none">
                  <span className="heading-font text-white text-3xl -rotate-90 whitespace-nowrap tracking-widest">{brand.name}</span>
                </div>

                {/* Content shown on hover */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all duration-700 pointer-events-none transform translate-y-8 group-hover:translate-y-0 z-10">
                  <div className="w-48 h-48 bg-white/95 rounded-full flex items-center justify-center p-6 shadow-2xl mb-8 transform scale-90 group-hover:scale-100 transition-transform duration-700 backdrop-blur-sm border border-white/50 overflow-hidden">
                    <Image
                      src={brand.logo}
                      alt={\`\${brand.name} logo\`}
                      width={160}
                      height={160}
                      className="object-contain w-full h-full mix-blend-multiply"
                    />
                  </div>
                  <span className="text-[12px] font-bold tracking-[0.3em] uppercase text-white bg-black/30 backdrop-blur-md px-6 py-3 rounded-full border border-white/20">
                    Découvrir {brand.name}
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      ` + content.substring(endIndexBrand);
  console.log("Replaced Brands");
}

fs.writeFileSync(path, content, 'utf8');
console.log("Done");
