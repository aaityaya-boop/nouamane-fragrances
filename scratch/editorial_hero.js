const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, '../src/app/page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

// I need to replace the grid layout inside the hero section with the new editorial overlap layout.
// Start: <div className="container mx-auto px-6 lg:px-12 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
// End:   </motion.div> (Right Image end)
//      </div> (Grid container end)

const oldHero = `<div className="container mx-auto px-6 lg:px-12 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Content */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="flex flex-col items-center lg:items-start text-center lg:text-left max-w-xl mx-auto lg:mx-0 mt-10 lg:mt-0"
          >
            <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-gray-500 mb-4">
              Exclusive Offer -20% Off This Week
            </span>
            
            <motion.h1 
              style={{ y: yHero, opacity: opacityHero }}
              className="heading-font text-[#1A1A1A] text-[clamp(3rem,6vw,5.5rem)] leading-[1.05] mb-6"
            >
              Nouamane
              <br />
              <span className="font-light text-[#0ea5e9]">luxury perfume</span>
            </motion.h1>

            <p className="text-gray-600 text-base md:text-lg font-light mb-10 leading-relaxed max-w-md">
              Les parfums iconiques du monde entier. 100% authentiques, livrés chez vous au Maroc en 24-48h. Découvrez l'exclusivité dès aujourd'hui.
            </p>

            <Link
              href="/shop"
              className="group inline-flex items-center justify-center bg-[#0ea5e9] hover:bg-[#0369a1] text-white transition-all duration-300 px-12 py-4 text-[12px] font-bold tracking-[0.15em] uppercase shadow-[0_0_15px_rgba(14,165,233,0.5)] hover:shadow-[0_0_25px_rgba(14,165,233,0.8)] rounded-sm"
            >
              Shopping Now
            </Link>
          </motion.div>

          {/* Right Image */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
            className="relative h-[50vh] lg:h-[75vh] w-full"
          >
            <Image
              src="/images/hero_cluster.png"
              alt="Nouamane Luxury Perfumes"
              fill
              className="object-contain object-center lg:object-right drop-shadow-2xl"
              priority
            />
          </motion.div>
        </div>`;

const newHero = `        <div className="container mx-auto px-6 lg:px-12 relative z-10 h-full w-full flex flex-col items-center justify-center min-h-[90vh]">
          
          {/* Background Massive Typography (Z-0) */}
          <motion.h1 
            style={{ y: yHero, opacity: opacityHero }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] heading-font text-[15vw] lg:text-[18vw] leading-none font-light tracking-tight text-[#1A1A1A]/5 whitespace-nowrap z-0 pointer-events-none"
          >
            NOUAMANE
          </motion.h1>

          {/* Foreground Hero Image (Z-10) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 h-[60vh] lg:h-[80vh] w-full max-w-2xl mx-auto"
          >
            <Image
              src="/images/valentino_hero.png"
              alt="Valentino Donna Intense"
              fill
              className="object-contain object-center drop-shadow-2xl"
              priority
            />
          </motion.div>

          {/* Floating Call to Action (Z-20) */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.4 }}
            className="relative z-20 flex flex-col items-center text-center mt-[-40px] lg:mt-[-80px]"
          >
            <h2 className="heading-font text-3xl lg:text-5xl text-[#1A1A1A] tracking-wider mb-4">
              LUXURY REDEFINED
            </h2>
            <p className="text-gray-600 text-sm md:text-base font-light mb-8 max-w-md mx-auto">
              L'essence de l'élégance italienne. Découvrez notre collection exclusive de haute parfumerie.
            </p>
            <Link
              href="/shop"
              className="group inline-flex items-center justify-center bg-[#1A1A1A] hover:bg-black text-white transition-all duration-300 px-12 py-4 text-[12px] font-bold tracking-[0.2em] uppercase rounded-full"
            >
              Explorer la collection
            </Link>
          </motion.div>
        </div>`;

if (content.includes('grid-cols-2')) {
  content = content.replace(oldHero, newHero);
  fs.writeFileSync(pagePath, content);
  console.log('Editorial Hero applied!');
} else {
  console.log('Hero already updated or old layout not found.');
}
