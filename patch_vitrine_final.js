const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/app/admin/vitrine/page.tsx');
let content = fs.readFileSync(file, 'utf8');

// 1. Add latestSlug state
content = content.replace(
  'const [seasonalSlug, setSeasonalSlug] = useState<string[]>([]);',
  `const [seasonalSlug, setSeasonalSlug] = useState<string[]>([]);\n  const [latestSlug, setLatestSlug] = useState<string[]>([]);`
);

// 2. Add latest tab state
content = content.replace(
  `const [activeTab, setActiveTab] = useState<'bestsellers' | 'seasonal'>('bestsellers');`,
  `const [activeTab, setActiveTab] = useState<'bestsellers' | 'seasonal' | 'latest'>('bestsellers');`
);

// 3. Load from config
content = content.replace(
  `setSeasonalSlug(JSON.parse(config.featuredSeasonal || '[]'));`,
  `setSeasonalSlug(JSON.parse(config.featuredSeasonal || '[]'));\n        setLatestSlug(JSON.parse(config.featuredLatest || '[]'));`
);

content = content.replace(
  'setSeasonalSlug([]);',
  `setSeasonalSlug([]);\n        setLatestSlug([]);`
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
  `featuredSeasonal: JSON.stringify(seasonalSlug),\n          featuredLatest: JSON.stringify(latestSlug),`
);

// 6. Update UI tabs
const targetText = `                  <Sparkles size={16} className={activeTab === 'seasonal' ? 'text-[#0ea5e9]' : ''} />\n                  Tendances\n                </span>\n              </button>\n            </div>`;
const replacementText = `                  <Sparkles size={16} className={activeTab === 'seasonal' ? 'text-[#0ea5e9]' : ''} />
                  Tendances
                </span>
              </button>
              <button
                onClick={() => setActiveTab('latest')}
                className={\`relative flex items-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-bold transition-colors \${activeTab === 'latest' ? 'text-[#1A1A1A]' : 'text-[#9A9A9A] hover:text-[#1A1A1A]'}\`}
              >
                {activeTab === 'latest' && (
                  <motion.div layoutId="activeTab" className="absolute inset-0 bg-white shadow-sm rounded-xl border border-black/5" />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <Sparkles size={16} className={activeTab === 'latest' ? 'text-[#10b981]' : ''} />
                  Dernières Sorties
                </span>
              </button>
            </div>`;

// Replace ignoring \r
const normalizedContent = content.replace(/\\r\\n/g, '\\n');
const newContent = normalizedContent.replace(targetText.replace(/\\r\\n/g, '\\n'), replacementText);

if (newContent !== normalizedContent) {
  fs.writeFileSync(file, newContent);
  console.log('patched vitrine successfully with split');
} else {
  console.log('could not find target text');
}
