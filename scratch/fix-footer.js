const fs = require('fs');
const file = 'src/components/Footer.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('usePathname')) {
  content = content.replace("import Link from 'next/link';", "import Link from 'next/link';\nimport { usePathname } from 'next/navigation';");
}

if (!content.includes('const locale = pathname?.split')) {
  content = content.replace("const dict = useDictionary();", "const dict = useDictionary();\n  const pathname = usePathname();\n  const locale = pathname?.split('/')[1] || 'fr';");
}

// Replace all href="/..." with href={`/${locale}/...`}
content = content.replace(/href="\/([^"]*)"/g, (match, p1) => {
  // Ignore specific paths that shouldn't be localized if there are any
  if (p1.startsWith('api') || p1.startsWith('_next') || p1.startsWith('images')) {
    return match;
  }
  return 'href={`/${locale}/' + p1 + '`}';
});

content = content.replace(/href={`\/shop/g, 'href={`/${locale}/shop');
content = content.replace(/href={`\/brands/g, 'href={`/${locale}/brands');
content = content.replace(/href={`\/product/g, 'href={`/${locale}/product');

fs.writeFileSync(file, content);
console.log('Fixed Footer.tsx!');
