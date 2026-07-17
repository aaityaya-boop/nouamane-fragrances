const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/app/[locale]/product/[slug]/ProductClient.tsx');
let content = fs.readFileSync(file, 'utf8');

// 1. Add visibleReviews state
content = content.replace(
  'const [reviews, setReviews] = useState(initialReviews);',
  `const [reviews, setReviews] = useState(initialReviews);
  const [visibleReviewsCount, setVisibleReviewsCount] = useState(5);`
);

// 2. Change the mapping to slice the reviews array
content = content.replace(
  '                {reviews.map((review) => (',
  '                {reviews.slice(0, visibleReviewsCount).map((review) => ('
);

// 3. Add the "Show more" button
const showMoreCode = `                {reviews.length > visibleReviewsCount && (
                  <div className="flex justify-center mt-8">
                    <button 
                      onClick={() => setVisibleReviewsCount(prev => prev + 5)}
                      className="px-6 py-2.5 rounded-full border border-[#0ea5e9] text-[#0ea5e9] text-[12px] font-bold tracking-wide hover:bg-[#0ea5e9] hover:text-white transition-colors"
                    >
                      Voir plus d'avis ({reviews.length - visibleReviewsCount} restants)
                    </button>
                  </div>
                )}`;

content = content.replace(
  '              </div>\n            )}\n          </div>\n        </div>\n      </section>',
  `              </div>
            )}
${showMoreCode}
          </div>
        </div>
      </section>`
);

fs.writeFileSync(file, content);
console.log('patched ProductClient reviews');
