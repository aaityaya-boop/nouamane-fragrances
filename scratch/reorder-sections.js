const fs = require('fs');

const file = 'src/app/[locale]/HomePageClient.tsx';
const content = fs.readFileSync(file, 'utf8');

const bsStart = content.indexOf('{/* ===============================\n          FEATURED — BESTSELLERS');
const naStart = content.indexOf('{/* ===============================\n          FEATURED — NEW ARRIVALS');
const ssStart = content.indexOf('{/* ===============================\n          FEATURED — SEASONAL');
const vpStart = content.indexOf('{/* ===============================\n          VALUE PROPOSITIONS');

if (bsStart !== -1 && naStart !== -1 && ssStart !== -1 && vpStart !== -1) {
  const head = content.substring(0, bsStart);
  
  const bsBlock = content.substring(bsStart, naStart);
  const naBlock = content.substring(naStart, ssStart);
  const ssBlock = content.substring(ssStart, vpStart);
  
  const tail = content.substring(vpStart);
  
  // Reorder: Seasonal -> New Arrivals -> Bestsellers
  const newContent = head + ssBlock + naBlock + bsBlock + tail;
  
  fs.writeFileSync(file, newContent);
  console.log('Reordered successfully');
} else {
  console.log('Could not find all blocks');
}
