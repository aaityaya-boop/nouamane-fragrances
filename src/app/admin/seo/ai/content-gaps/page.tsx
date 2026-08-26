import prisma from "@/lib/prisma";
import { FileText, Wand2, BarChart } from "lucide-react";

export default async function ContentGapsPage() {
  const gaps = await prisma.seoOpportunity.findMany({
    where: {
      type: {
        contains: "GAP",
      },
    },
    orderBy: {
      businessValue: "desc",
    },
  });

  const displayGaps = gaps.length > 0 ? gaps : [
    {
      id: "gap1",
      keyword: "Parfum d'hiver pour femme",
      description: "Missing content targeting winter fragrances for women in the Moroccan market.",
      impressions: 3500,
      businessValue: 85,
    },
    {
      id: "gap2",
      keyword: "Différence entre Eau de Parfum et Extrait",
      description: "Educational gap comparing concentration levels, high informational value.",
      impressions: 2100,
      businessValue: 60,
    },
    {
      id: "gap3",
      keyword: "Ingrédients parfum orientaux",
      description: "Content gap highlighting our use of oud, amber, and musk.",
      impressions: 1800,
      businessValue: 75,
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Content Gaps</h1>
          <p className="text-muted-foreground">
            Identify and fill topical gaps in your content strategy.
          </p>
        </div>
      </div>
      
      <div className="rounded-md border bg-card">
        <div className="p-0">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-muted/50 border-b">
              <tr>
                <th className="px-6 py-4 font-medium">Topic / Keyword</th>
                <th className="px-6 py-4 font-medium">Description</th>
                <th className="px-6 py-4 font-medium">Pot. Traffic</th>
                <th className="px-6 py-4 font-medium">Biz Value</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {displayGaps.map((gap) => (
                <tr key={gap.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 font-medium">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      {(gap as any).keyword || (gap as any).title || "Unknown Gap"}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground max-w-xs truncate">
                    {gap.description || "No description provided."}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <BarChart className="h-3 w-3 text-muted-foreground" />
                      {gap.impressions ? gap.impressions.toLocaleString() : "-"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-full bg-secondary rounded-full h-2 max-w-[80px]">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: `${Math.min(gap.businessValue || 50, 100)}%` }} 
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-transparent hover:bg-accent hover:text-accent-foreground h-8 px-3 py-1">
                      <Wand2 className="mr-2 h-3 w-3" />
                      Generate Brief
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
