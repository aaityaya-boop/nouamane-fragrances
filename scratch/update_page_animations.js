const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Ensure framer-motion is imported correctly if not already fully imported
// It's already imported at the top, we just need to add motion where missing.

// Add motion.section wrappers to the main sections
const sectionsToAnimate = [
  /className="py-20 lg:py-32 bg-white relative"/g,
  /className="py-20 lg:py-28 bg-\[\#fdfdfd\]"/g,
  /className="py-20 lg:py-28 bg-white"/g,
  /className="py-24 lg:py-32 bg-\[\#f8f8f8\]"/g,
  /className="py-20 lg:py-28 bg-\[\#fcfcfc\]"/g
];

// Simple replacement: replace <section className="..."> with <motion.section initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true, margin: "-50px" }} className="...">
content = content.replace(/<section className="py-20 lg:py-32 bg-white relative">/g, '<motion.section initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true, margin: "-50px" }} className="py-20 lg:py-32 bg-white relative">');
content = content.replace(/<\/section>([\s]*\{\/\* ===============================[\s]*NEW ARRIVALS)/g, '</motion.section>$1');

content = content.replace(/<section className="py-20 lg:py-28 bg-\[\#fdfdfd\]">/g, '<motion.section initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true, margin: "-50px" }} className="py-20 lg:py-28 bg-[#fdfdfd]">');
content = content.replace(/<\/section>([\s]*\{\/\* ===============================[\s]*CATEGORIES)/g, '</motion.section>$1');

content = content.replace(/<section className="py-20 lg:py-28 bg-white" id="categories">/g, '<motion.section initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true, margin: "-50px" }} className="py-20 lg:py-28 bg-white" id="categories">');
content = content.replace(/<\/section>([\s]*\{\/\* ===============================[\s]*BRANDS)/g, '</motion.section>$1');

content = content.replace(/<section className="py-24 lg:py-32 bg-\[\#f8f8f8\]" id="brands">/g, '<motion.section initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true, margin: "-50px" }} className="py-24 lg:py-32 bg-[#f8f8f8]" id="brands">');
content = content.replace(/<\/section>([\s]*\{\/\* ===============================[\s]*TESTIMONIALS)/g, '</motion.section>$1');

content = content.replace(/<section className="py-20 lg:py-28 bg-\[\#fcfcfc\]">/g, '<motion.section initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true, margin: "-50px" }} className="py-20 lg:py-28 bg-[#fcfcfc]">');
content = content.replace(/<\/section>([\s]*<FAQ \/>)/g, '</motion.section>$1');

// Change map wrappers to staggerChildren
// We'll wrap the product grids in motion.div with staggerChildren
const gridRegex = /<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">/g;
content = content.replace(gridRegex, `<motion.div 
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: { staggerChildren: 0.1 }
              }
            }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8"
          >`);
content = content.replace(/<\/div>([\s]*<\/div>[\s]*<\/motion\.section>)/g, '</motion.div>$1');

fs.writeFileSync(filePath, content);
console.log("Page.tsx updated with scroll animations.");
