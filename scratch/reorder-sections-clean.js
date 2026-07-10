const fs = require('fs');

const file = 'src/app/[locale]/HomePageClient.tsx';
const content = fs.readFileSync(file, 'utf8');

const blocks = content.split('      {/* ===============================');
// blocks[0] is the top of the file up to the first '      {/* ==============================='
// Then each block starts with '\n          HEADER_NAME\n          =============================== */}'

let head = [];
let bsBlock = '';
let naBlock = '';
let ssBlock = '';
let tail = [];

blocks.forEach((block, index) => {
  if (index === 0) {
    head.push(block);
    return;
  }
  
  if (block.includes('FEATURED — BESTSELLERS')) {
    bsBlock = '      {/* ===============================' + block;
  } else if (block.includes('FEATURED — NEW ARRIVALS')) {
    naBlock = '      {/* ===============================' + block;
  } else if (block.includes('FEATURED — SEASONAL')) {
    ssBlock = '      {/* ===============================' + block;
  } else if (!bsBlock && !naBlock && !ssBlock) {
    head.push('      {/* ===============================' + block);
  } else {
    tail.push('      {/* ===============================' + block);
  }
});

// User wants: Seasonal, then New Arrivals, then Bestsellers
const newContent = head.join('') + ssBlock + naBlock + bsBlock + tail.join('');

fs.writeFileSync(file, newContent);
console.log('Successfully reordered sections!');
