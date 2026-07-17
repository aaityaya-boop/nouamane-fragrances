const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/app/admin/vitrine/page.tsx');
let content = fs.readFileSync(file, 'utf8');

const newTabs = `<button
                onClick={() => setActiveTab('bestsellers')}
                className={\`relative flex items-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-bold transition-colors \${activeTab === 'bestsellers' ? 'text-[#1A1A1A]' : 'text-[#9A9A9A] hover:text-[#1A1A1A]'}\`}
              >
                {activeTab === 'bestsellers' && (
                  <motion.div layoutId="activeTab" className="absolute inset-0 bg-white shadow-sm rounded-xl border border-black/5" />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <Flame size={16} className={activeTab === 'bestsellers' ? 'text-[#ea580c]' : ''} />
                  Bestsellers
                </span>
              </button>
              <button
                onClick={() => setActiveTab('seasonal')}
                className={\`relative flex items-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-bold transition-colors \${activeTab === 'seasonal' ? 'text-[#1A1A1A]' : 'text-[#9A9A9A] hover:text-[#1A1A1A]'}\`}
              >
                {activeTab === 'seasonal' && (
                  <motion.div layoutId="activeTab" className="absolute inset-0 bg-white shadow-sm rounded-xl border border-black/5" />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <Sparkles size={16} className={activeTab === 'seasonal' ? 'text-[#0ea5e9]' : ''} />
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
              </button>`;

content = content.replace(/<button[\s\S]*?<\/button>\s*<button[\s\S]*?<\/button>/m, newTabs);

fs.writeFileSync(file, content);
console.log('patched tabs');
