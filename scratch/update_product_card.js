const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/ProductCard.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Ensure framer-motion is imported
if (!content.includes('framer-motion')) {
  content = content.replace("import Image from 'next/image';", "import Image from 'next/image';\nimport { motion } from 'framer-motion';");
}

// Convert top wrapper to motion.div
content = content.replace(/<div\n[\s]*className="product-card/g, '<motion.div\n        whileHover={{ y: -8, scale: 1.02 }}\n        transition={{ type: "spring", stiffness: 300, damping: 20 }}\n        className="product-card');
content = content.replace(/<\/div>\n    <\/Link>\n  \);\n}/g, '</motion.div>\n    </Link>\n  );\n}');

fs.writeFileSync(filePath, content);
console.log("ProductCard updated.");
