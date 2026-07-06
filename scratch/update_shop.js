const fs = require('fs');
const path = require('path');

const shopPath = path.join(__dirname, '../src/components/ShopCatalog.tsx');
let content = fs.readFileSync(shopPath, 'utf8');

// 1. Add state for season
if (!content.includes('const [selectedSeasons, setSelectedSeasons]')) {
  content = content.replace(
    /const \[subcategory, setSubcategory\] = useState<string>\(lockedSubcategory \|\| 'all'\);/,
    "const [subcategory, setSubcategory] = useState<string>(lockedSubcategory || 'all');\n  const [selectedSeasons, setSelectedSeasons] = useState<string[]>([]);"
  );
}

// 2. Add filter logic for season
if (!content.includes('if (selectedSeasons.length > 0)')) {
  content = content.replace(
    /if \(selectedSizes\.length > 0\) \{/,
    "if (selectedSeasons.length > 0)\n      list = list.filter((p) => selectedSeasons.includes(p.perfectSeason));\n\n    if (selectedSizes.length > 0) {"
  );
}

// 3. Add season to dependency array of filtered
content = content.replace(
  /\[brand, gender, subcategory, priceRange, selectedSizes, selectedColors, selectedMaterials, minRating, sortBy, lockedBrand, lockedGender\]/,
  "[brand, gender, subcategory, priceRange, selectedSizes, selectedColors, selectedMaterials, minRating, sortBy, lockedBrand, lockedGender, selectedSeasons]"
);

// 4. Update clearFilters
if (!content.includes('setSelectedSeasons([]);')) {
  content = content.replace(
    /setSelectedSizes\(\[\]\);/,
    "setSelectedSizes([]);\n    setSelectedSeasons([]);"
  );
}

// 5. Update activeCount
if (!content.includes('selectedSeasons.length +')) {
  content = content.replace(
    /selectedSizes\.length \+/,
    "selectedSeasons.length +\n    selectedSizes.length +"
  );
}

// 6. Update FiltersPanel props
if (!content.includes('selectedSeasons: string[]; toggleSeason: (v: string) => void;')) {
  content = content.replace(
    /selectedSizes: string\[\]; toggleSize: \(v: string\) => void;/,
    "selectedSeasons: string[]; toggleSeason: (v: string) => void;\n  selectedSizes: string[]; toggleSize: (v: string) => void;"
  );
}

// 7. Update <FiltersPanel /> invocations
content = content.replace(
  /selectedSizes=\{selectedSizes\} toggleSize=\{\(v\) => setSelectedSizes\(toggleFrom\(selectedSizes, v\)\)\}/g,
  "selectedSeasons={selectedSeasons} toggleSeason={(v) => setSelectedSeasons(toggleFrom(selectedSeasons, v))}\n              selectedSizes={selectedSizes} toggleSize={(v) => setSelectedSizes(toggleFrom(selectedSizes, v))}"
);

// 8. Add the UI for Season filter in FiltersPanel
if (!content.includes('Saison Idéale')) {
  const seasonUI = `
      {/* Season */}
      <FilterGroup title="Saison Idéale">
        <div className="space-y-2.5">
          {['Printemps', 'Été', 'Automne', 'Hiver', 'Toutes Saisons'].map((m) => (
            <label key={m} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={props.selectedSeasons.includes(m)}
                onChange={() => props.toggleSeason(m)}
                className="w-4 h-4 accent-[#0ea5e9]"
              />
              <span className={\`text-[13px] transition-colors \${
                props.selectedSeasons.includes(m) ? 'text-[#1A1A1A] font-semibold' : 'text-[#6B6B6B]'
              }\`}>{m}</span>
            </label>
          ))}
        </div>
      </FilterGroup>
`;
  content = content.replace(
    /\{\/\* Size \*\/\}/,
    seasonUI + "\n      {/* Size */}"
  );
}

fs.writeFileSync(shopPath, content);
console.log("ShopCatalog updated!");
