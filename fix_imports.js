
const fs = require("fs");
const files = [
  "src/app/admin/seo/ai-assistant/page.tsx",
  "src/app/admin/seo/settings/page.tsx",
  "src/app/api/admin/seo/ai/analyze-keyword/route.ts",
  "src/app/api/admin/seo/ai/product/route.ts"
];

for (const file of files) {
  let content = fs.readFileSync(file, "utf8");
  content = content.replace("import { prisma } from \"@/lib/prisma\";", "import prisma from \"@/lib/prisma\";");
  fs.writeFileSync(file, content);
}
console.log("Imports fixed!");

