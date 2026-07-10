const fs = require('fs');

const path = 'src/app/admin/products/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Remove activeTab
content = content.replace(/const \[activeTab, setActiveTab\] = useState<'original' \| 'tester'>\('original'\);\n/, '');

// 2. Fix matchesTab
content = content.replace(/const matchesTab = activeTab === 'tester' \? p\.isTester === true : !p\.isTester;\n/, '');
content = content.replace(/&& matchesTab/g, '');

// 3. Remove the Tabs UI
const tabsUI = `        <div className="flex items-center gap-6 border-b border-[#e0ddd4] mb-6">
          <button
            onClick={() => setActiveTab('original')}
            className={\`pb-3 px-4 text-[14px] font-bold transition-colors \${activeTab === 'original' ? 'border-b-2 border-[#0ea5e9] text-[#0ea5e9]' : 'text-[#6B6B6B] hover:text-[#1A1A1A]'}\`}
          >
            Boîtes Originales
          </button>
          <button
            onClick={() => setActiveTab('tester')}
            className={\`pb-3 px-4 text-[14px] font-bold transition-colors \${activeTab === 'tester' ? 'border-b-2 border-[#10b981] text-[#10b981]' : 'text-[#6B6B6B] hover:text-[#1A1A1A]'}\`}
          >
            Testeurs
          </button>
        </div>`;
content = content.replace(tabsUI, '');

// 4. Default isTester: true
content = content.replace(/isTester: false,/g, 'isTester: true,');

// 5. Remove isTesterToggle block
const toggleRegex = /<div className="col-span-1 md:col-span-2">[\s\S]*?id="isTesterToggle"[\s\S]*?<\/div>/;
content = content.replace(toggleRegex, '');

fs.writeFileSync(path, content);
console.log('Cleaned up admin products page');
