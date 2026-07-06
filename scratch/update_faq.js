const fs = require('fs');
const path = require('path');

const faqPath = path.join(__dirname, '../src/components/FAQ.tsx');
let content = fs.readFileSync(faqPath, 'utf8');

// We want to keep the imports and FAQ_ITEMS, but replace everything from export default function FAQ() to the end.
const faqComponentRegex = /export default function FAQ\(\) \{[\s\S]*/;

const newFaqComponent = `import { motion, AnimatePresence } from 'framer-motion';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="relative overflow-hidden bg-white text-[#1a1a1a] py-20 lg:py-28 border-t border-gray-100">
      <div className="relative max-w-[900px] mx-auto px-6 lg:px-10">
        <div className="text-center max-w-2xl mx-auto mb-16 scroll-reveal">
          <span className="text-[11px] font-bold tracking-[0.25em] uppercase text-[#5e4b52] mb-3 block" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            Help Center
          </span>
          <h2 className="heading-font text-4xl lg:text-5xl mt-3 tracking-wide text-[#1a1a1a]">
            Frequently Asked Questions
          </h2>
          <p className="mt-5 text-gray-500 text-[15px] leading-relaxed" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 500 }}>
            Clear answers for designer perfume shoppers. Authenticity, delivery,
            returns, payment, and care — everything you need to know.
          </p>
        </div>

        <div className="grid gap-4">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={item.question}
                className="scroll-reveal rounded-xl border border-gray-200 bg-gray-50/50 overflow-hidden transition-all duration-300 hover:border-gray-300 hover:shadow-sm"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between gap-5 px-6 lg:px-8 py-6 text-left transition-colors"
                >
                  <div>
                    <div 
                      className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 mb-2" 
                      style={{ fontFamily: "'Montserrat', sans-serif" }}
                    >
                      {item.category}
                    </div>
                    <div 
                      className="text-lg lg:text-xl text-[#1a1a1a] font-semibold"
                      style={{ fontFamily: "'Montserrat', sans-serif" }}
                    >
                      {item.question}
                    </div>
                  </div>
                  <ChevronDown
                    size={22}
                    className={\`text-[#5e4b52] flex-shrink-0 transition-transform duration-400 ease-out \${
                      isOpen ? 'rotate-180' : ''
                    }\`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div 
                        className="px-6 lg:px-8 pb-7 pt-2 text-[15px] leading-relaxed text-gray-600 font-medium"
                        style={{ fontFamily: "'Montserrat', sans-serif" }}
                      >
                        {item.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
`;

// Also need to inject the import for framer-motion if it's not there
let updatedContent = content.replace(faqComponentRegex, newFaqComponent);

fs.writeFileSync(faqPath, updatedContent);
console.log("FAQ component updated.");
