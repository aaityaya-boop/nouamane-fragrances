
const fs = require("fs");
const path = require("path");

const basePath = path.join(__dirname, "src", "app", "admin", "seo");

const pages = [
  {
    name: "keywords",
    title: "Morocco Keywords",
    desc: "Keyword performance in Google Morocco.",
    model: "SeoKeyword",
    empty: "No keywords synchronized yet.",
  },
  {
    name: "opportunities",
    title: "Keyword Opportunities",
    desc: "Discover High-Opportunity keywords in Morocco.",
    model: "SeoKeywordOpportunity",
    empty: "No opportunities detected yet.",
  },
  {
    name: "search-intent",
    title: "Search Intent Analysis",
    desc: "Analyze intent distribution for your keywords.",
    model: "SeoKeyword",
    empty: "No search intent data available.",
  },
  {
    name: "topical-authority",
    title: "Topical Authority",
    desc: "Analyze your coverage of fragrance topics.",
    model: "SeoTopic",
    empty: "No topic clusters built yet.",
  },
  {
    name: "content-updates",
    title: "Content Updates",
    desc: "Pages that require your attention.",
    model: "SeoContentUpdate",
    empty: "No content updates recommended at the moment.",
  },
  {
    name: "internal-links",
    title: "Internal Link Opportunities",
    desc: "Improve your internal linking structure.",
    model: "SeoInternalLink",
    empty: "No internal link suggestions currently.",
  },
  {
    name: "backlinks",
    title: "Morocco Backlinks",
    desc: "Track referring domains and backlinks.",
    model: "SeoBacklink",
    empty: "No backlinks tracked yet.",
  },
  {
    name: "local",
    title: "Local SEO (Morocco)",
    desc: "City-level SEO performance.",
    model: "SeoSearchConsoleDaily",
    empty: "No city-level data available. Google Search Console API does not provide city dimensions.",
  },
  {
    name: "calendar",
    title: "Morocco SEO Calendar",
    desc: "Prepare for seasonal demand in Morocco.",
    model: "SeoOpportunity",
    empty: "No upcoming seasonal events mapped.",
  }
];

pages.forEach(p => {
  const dirPath = path.join(basePath, p.name);
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
  
  const content = `import React from "react";
import prisma from "@/lib/prisma";
import { AlertCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ${p.name.replace(/-/g,"_")}Page() {
  const data = await prisma.${p.model.charAt(0).toLowerCase() + p.model.slice(1)}.findMany({ take: 50 });
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">${p.title}</h2>
          <p className="text-sm text-gray-500">${p.desc}</p>
        </div>
      </div>
      
      {data.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-12 flex flex-col items-center justify-center text-center border border-gray-100">
          <AlertCircle className="text-gray-400 mb-3" size={32} />
          <h3 className="text-gray-900 font-medium mb-1">No Data</h3>
          <p className="text-gray-500 text-sm">${p.empty}</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500">
              <tr>
                <th className="px-6 py-4 font-medium">ID</th>
                <th className="px-6 py-4 font-medium">Created At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.map((item: any) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{item.id}</td>
                  <td className="px-6 py-4">{new Date(item.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
`;
  fs.writeFileSync(path.join(dirPath, "page.tsx"), content);
});
console.log("Pages generated!");

