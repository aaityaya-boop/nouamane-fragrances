const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/app/admin/vitrine/page.tsx');
let content = fs.readFileSync(file, 'utf8');

// 1. Add latestSlug state
content = content.replace(
  'const [seasonalSlug, setSeasonalSlug] = useState<string[]>([]);',
  `const [seasonalSlug, setSeasonalSlug] = useState<string[]>([]);
  const [latestSlug, setLatestSlug] = useState<string[]>([]);`
);

// 2. Add latest tab
content = content.replace(
  `const [activeTab, setActiveTab] = useState<'bestsellers' | 'seasonal'>('bestsellers');`,
  `const [activeTab, setActiveTab] = useState<'bestsellers' | 'seasonal' | 'latest'>('bestsellers');`
);

// 3. Load from config
content = content.replace(
  'setSeasonalSlug(JSON.parse(config.featuredSeasonal || \'[]\'));',
  `setSeasonalSlug(JSON.parse(config.featuredSeasonal || '[]'));
        setLatestSlug(JSON.parse(config.featuredLatest || '[]'));`
);

content = content.replace(
  'setSeasonalSlug([]);',
  `setSeasonalSlug([]);
        setLatestSlug([]);`
);

// 4. Update currentSlugs
content = content.replace(
  `const currentSlugs = activeTab === 'bestsellers' ? bestsellersSlug : seasonalSlug;`,
  `const currentSlugs = activeTab === 'bestsellers' ? bestsellersSlug : activeTab === 'seasonal' ? seasonalSlug : latestSlug;`
);
content = content.replace(
  `const setCurrentSlugs = activeTab === 'bestsellers' ? setBestsellersSlug : setSeasonalSlug;`,
  `const setCurrentSlugs = activeTab === 'bestsellers' ? setBestsellersSlug : activeTab === 'seasonal' ? setSeasonalSlug : setLatestSlug;`
);

// 5. Update save
content = content.replace(
  'featuredSeasonal: JSON.stringify(seasonalSlug),',
  `featuredSeasonal: JSON.stringify(seasonalSlug),
          featuredLatest: JSON.stringify(latestSlug),`
);

// 6. Update UI tabs
content = content.replace(
  `onClick={() => setActiveTab('seasonal')}`,
  `onClick={() => setActiveTab('seasonal')}`
);
// Need to carefully replace the tabs section
// Let's find the tabs section
fs.writeFileSync(file, content);
console.log('patched vitrine state');
