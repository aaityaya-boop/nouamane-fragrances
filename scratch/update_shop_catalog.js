const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/ShopCatalog.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Ensure framer-motion is imported
if (!content.includes('framer-motion')) {
  content = content.replace("import { Filter, X, ChevronDown, Check } from 'lucide-react';", "import { Filter, X, ChevronDown, Check } from 'lucide-react';\nimport { motion } from 'framer-motion';");
}

// Convert grid to motion.div
const gridRegex = /<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">/g;
content = content.replace(gridRegex, `<motion.div 
              layout
              initial="hidden"
              animate="show"
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: { staggerChildren: 0.1 }
                }
              }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6"
            >`);
content = content.replace(/<\/div>\n[\s]*\{filtered\.length === 0/g, '</motion.div>\n            {filtered.length === 0');

fs.writeFileSync(filePath, content);
console.log("ShopCatalog updated.");
