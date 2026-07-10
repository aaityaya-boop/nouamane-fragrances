const fs = require('fs');

const file = 'src/app/[locale]/HomePageClient.tsx';
const content = fs.readFileSync(file, 'utf8');

const blocks = content.split('      {/* ===============================');

let head = [];
let brandBlock = '';
let ssBlock = '';
let naBlock = '';
let bsBlock = '';
let tail = [];

blocks.forEach((block, index) => {
  if (index === 0) {
    head.push(block);
    return;
  }
  
  if (block.includes('BRAND SHOWCASE')) {
    brandBlock = '      {/* ===============================' + block;
  } else if (block.includes('FEATURED — SEASONAL')) {
    ssBlock = '      {/* ===============================' + block;
  } else if (block.includes('FEATURED — NEW ARRIVALS')) {
    naBlock = '      {/* ===============================' + block;
  } else if (block.includes('FEATURED — BESTSELLERS')) {
    bsBlock = '      {/* ===============================' + block;
  } else if (!brandBlock && !ssBlock && !naBlock && !bsBlock) {
    head.push('      {/* ===============================' + block);
  } else {
    tail.push('      {/* ===============================' + block);
  }
});

// New Order: Head -> Seasonal -> New Arrivals -> Bestsellers -> Brand Showcase -> Tail
const newContent = head.join('') + ssBlock + naBlock + bsBlock + brandBlock + tail.join('');

fs.writeFileSync(file, newContent);
console.log('Successfully reordered brands section!');
