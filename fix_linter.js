
const fs = require("fs");
const path = require("path");
const file = path.join(__dirname, "src/components/SplitTypographyHero.tsx");
let content = fs.readFileSync(file, "utf8");

content = content.replace(
  /{mounted && \[\.\.\.Array\(15\)\].map\(\(_, i\) => \([\s\S]*?\)\)}/m,
  `{mounted && [...Array(15)].map((_, i) => {
            const r1 = (i * 13) % 100;
            const r2 = (i * 17) % 100;
            const r4 = (i * 29) % 50 - 25;
            const r5 = (i * 31) % 10;
            const r6 = (i * 37) % 10;
            const r7 = (i * 41) % 4 + 1;
            const r8 = (i * 43) % 4 + 1;
            const r9 = (i * 47) % 100;
            const r10 = (i * 53) % 100;
            return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: r1 }}
              animate={{ 
                opacity: [0, 0.5, 0],
                y: [r1, r2 * -1 - 50],
                x: r4
              }}
              transition={{
                duration: 10 + r5,
                repeat: Infinity,
                delay: r6,
                ease: "linear"
              }}
              className="absolute rounded-full bg-[#111]/10"
              style={{
                width: r7 + "px",
                height: r8 + "px",
                left: r9 + "%",
                top: r10 + "%",
              }}
            />
          )})}`
);

fs.writeFileSync(file, content);
console.log("Done");

