
const fs = require("fs");
const path = require("path");
const file = path.join(__dirname, "prisma/schema.prisma");
let content = fs.readFileSync(file, "utf8");

// We want to delete `model SeoKeywordOpportunity` entirely
content = content.replace(/model SeoKeywordOpportunity\s*\{[\s\S]*?\n\}/g, "");

// We want to completely replace `model SeoOpportunity`
const newModel = `model SeoOpportunity {
  id              String   @id @default(cuid())
  type            String   @default("KEYWORD")
  keyword         String?
  targetUrl       String?
  title           String?
  description     String?
  position        Float?
  impressions     Int?
  clicks          Int?
  ctr             Float?
  impact          String   @default("MEDIUM")
  effort          String   @default("MEDIUM")
  businessValue   Int      @default(50)
  country         String   @default("MA")
  priority        Int      @default(0)
  recommendation  String?
  status          String   @default("NEW")
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([type])
  @@index([status])
  @@index([priority])
}`;

content = content.replace(/model SeoOpportunity\s*\{[\s\S]*?\n\}/g, newModel);

// Add fields to Settings if not exist
const settingsPattern = /model SeoSettings \{[\s\S]*?\n\}/;
const oldSettings = content.match(settingsPattern)[0];
if (!oldSettings.includes("aiProvider")) {
  const newSettings = oldSettings.replace(
    "createdAt                    DateTime @default(now())",
    `aiProvider                   String   @default("GEMINI")
  aiModel                      String   @default("gemini-1.5-pro")
  aiAutoApply                  Boolean  @default(false)
  createdAt                    DateTime @default(now())`
  );
  content = content.replace(oldSettings, newSettings);
}

fs.writeFileSync(file, content);
console.log("Fixed");

