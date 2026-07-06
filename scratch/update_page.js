const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add imports
content = content.replace(
  "import Link from 'next/link';",
  "import Link from 'next/link';\nimport { motion, useScroll, useTransform } from 'framer-motion';"
);

// 2. Add animation configs before HomePage
const animationConfigs = `
const fadeUpProps = {
  initial: { opacity: 0, y: 30, filter: 'blur(5px)' },
  whileInView: { opacity: 1, y: 0, filter: 'blur(0px)' },
  viewport: { once: true, margin: '-100px' },
  transition: { duration: 0.8, ease: 'easeOut' }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const staggerItem = {
  hidden: { opacity: 0, y: 30, filter: 'blur(5px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.8, ease: 'easeOut' } }
};

export default function HomePage() {
  const { scrollY } = useScroll();
  const yHero = useTransform(scrollY, [0, 1000], [0, 300]);
  const opacityHero = useTransform(scrollY, [0, 600], [1, 0.15]);
`;
content = content.replace("export default function HomePage() {", animationConfigs);

// 3. Hero image wrapper
content = content.replace(
  /<Image[\s\S]*?priority\n\s*\/>\n\s*<div className="absolute inset-0 bg-gradient-to-b from-black\/40 via-black\/55 to-black\/75" \/>/m,
  `<motion.div style={{ y: yHero, opacity: opacityHero }} className="absolute inset-0 z-0">
          <Image
            src="/images/hero-bg.jpg"
            alt="Parfums de créateur Valentino YSL Armani"
            fill
            className="object-cover brightness-[0.5] scale-105"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/55 to-black/75" />
        </motion.div>`
);

// 4. Hero text container
content = content.replace(
  /<div className="relative z-10 text-center px-6 max-w-5xl mx-auto scroll-reveal">/m,
  `<motion.div 
          initial={{ opacity: 0, y: 30, filter: 'blur(5px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.1 }}
          className="relative z-10 text-center px-6 max-w-5xl mx-auto"
        >`
);
// The closing div of hero text is correct.

// 5. Brands grid
content = content.replace(
  /<div className="grid grid-cols-1 md:grid-cols-3 gap-5">\n\s*\{BRANDS\.map\(\(brand\) => \(\n\s*<Link/m,
  `<motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-5"
        >
          {BRANDS.map((brand) => (
            <motion.div variants={staggerItem} key={brand.slug} className="h-full">
              <Link`
);
content = content.replace(
  /<\/Link>\n\s*\)\)}\n\s*<\/div>/m,
  `</Link>\n            </motion.div>\n          ))}\n        </motion.div>`
);
// Need to add `block w-full` to the Link inside brands to ensure it fills the motion.div
content = content.replace(
  /className="group relative h-\[420px\] rounded-2xl overflow-hidden border border-\[#e0ddd4\] hover:border-\[#b8860b\]\/50 transition-all"/m,
  `className="group block w-full relative h-[420px] rounded-2xl overflow-hidden border border-[#e0ddd4] hover:border-[#b8860b]/50 transition-all"`
);

// 6. Bestsellers grid
content = content.replace(
  /<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-7">\n\s*\{bestsellers\.map\(\(p\) => <ProductCard key=\{p\.id\} product=\{p\} \/>\)\}\n\s*<\/div>/m,
  `<motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-7"
          >
            {bestsellers.map((p) => (
              <motion.div variants={staggerItem} key={p.id}>
                <ProductCard product={p} />
              </motion.div>
            ))}
          </motion.div>`
);

// 7. New arrivals grid
content = content.replace(
  /<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-7">\n\s*\{newArrivals\.map\(\(p\) => <ProductCard key=\{p\.id\} product=\{p\} \/>\)\}\n\s*<\/div>/m,
  `<motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-7"
        >
          {newArrivals.map((p) => (
            <motion.div variants={staggerItem} key={p.id}>
              <ProductCard product={p} />
            </motion.div>
          ))}
        </motion.div>`
);

// 8. Seasonal grid
content = content.replace(
  /<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-7">\n\s*\{seasonalTrends\.map\(\(p\) => <ProductCard key=\{p\.id\} product=\{p\} \/>\)\}\n\s*<\/div>/m,
  `<motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-7"
          >
            {seasonalTrends.map((p) => (
              <motion.div variants={staggerItem} key={p.id}>
                <ProductCard product={p} />
              </motion.div>
            ))}
          </motion.div>`
);

// 9. Categories grid
content = content.replace(
  /<div className="grid grid-cols-1 md:grid-cols-3 gap-5">\n\s*\{MAIN_CATEGORIES\.map\(\(cat\) => \(\n\s*<Link/m,
  `<motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-5"
        >
          {MAIN_CATEGORIES.map((cat) => (
            <motion.div variants={staggerItem} key={cat.slug} className="h-full">
              <Link`
);
content = content.replace(
  /<\/Link>\n\s*\)\)}\n\s*<\/div>/g,
  `</Link>\n            </motion.div>\n          ))}\n        </motion.div>`
);
// Need to add `block w-full` to the Link inside categories
content = content.replace(
  /className="group relative h-\[320px\] rounded-2xl overflow-hidden border border-\[#e0ddd4\]"/m,
  `className="group block w-full relative h-[320px] rounded-2xl overflow-hidden border border-[#e0ddd4]"`
);

// 10. Value Propositions
content = content.replace(
  /<div className="max-w-\[1400px\] mx-auto px-6 lg:px-10 py-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">\n\s*\{\[\n\s*\{ icon/m,
  `<motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="max-w-[1400px] mx-auto px-6 lg:px-10 py-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8"
        >
          {[
            { icon`
);
content = content.replace(
  /\]\.map\(\(item\) => \(\n\s*<div key=\{item\.title\} className="text-center lg:text-left">/m,
  `].map((item) => (
            <motion.div variants={staggerItem} key={item.title} className="text-center lg:text-left">`
);
content = content.replace(
  /<\/p>\n\s*<\/div>\n\s*\)\)}\n\s*<\/div>/m,
  `</p>\n            </motion.div>\n          ))}\n        </motion.div>`
);

// 11. Testimonial Section
content = content.replace(
  /<section className="max-w-\[1400px\] mx-auto px-6 lg:px-10 py-20 lg:py-28">\n\s*<div className="max-w-3xl mx-auto text-center">/m,
  `<motion.section {...fadeUpProps} className="max-w-[1400px] mx-auto px-6 lg:px-10 py-20 lg:py-28">
        <div className="max-w-3xl mx-auto text-center">`
);
content = content.replace(
  /Client vérifié · Armani Stronger With You 100ml\n\s*<\/div>\n\s*<\/div>\n\s*<\/section>/m,
  `Client vérifié · Armani Stronger With You 100ml\n          </div>\n        </div>\n      </motion.section>`
);

// 12. Section Header
content = content.replace(
  /<div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12">/m,
  `<motion.div 
      initial={{ opacity: 0, x: -20, filter: 'blur(3px)' }}
      whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12"
    >`
);
// Since there's a </div> at the end of SectionHeader
content = content.replace(
  /<\/Link>\n\s*<\/div>\n\s*\);\n\s*\}/m,
  `</Link>\n    </motion.div>\n  );\n}`
);

fs.writeFileSync(filePath, content);
console.log("Successfully updated page.tsx");
