const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/Header.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Ensure framer-motion is imported
if (!content.includes('framer-motion')) {
  content = content.replace("import { Menu, X, ShoppingBag } from 'lucide-react';", "import { Menu, X, ShoppingBag } from 'lucide-react';\nimport { motion } from 'framer-motion';");
}

// Wrap header in motion.header
content = content.replace(/<header className="fixed top-0 left-0 right-0 z-50 glass transition-all duration-300">/g, '<motion.header initial={{ y: -100 }} animate={{ y: 0 }} transition={{ type: "spring", stiffness: 100, damping: 20 }} className="fixed top-0 left-0 right-0 z-50 glass transition-all duration-300">');
content = content.replace(/<\/header>/g, '</motion.header>');

// Fix navigation links hover animations
content = content.replace(/className="text-\[11px\] font-bold tracking-\[0\.25em\] uppercase text-gray-500 hover:text-\[#1a1a1a\] transition-colors"/g, 'className="text-[11px] font-bold tracking-[0.25em] uppercase text-gray-500 hover:text-[#1a1a1a] transition-all hover:tracking-[0.3em]"');

fs.writeFileSync(filePath, content);
console.log("Header updated.");
