import prisma from "@/lib/prisma";
import { Search, HelpCircle, ArrowRight } from "lucide-react";

export default async function QuestionsPage() {
  const dbQuestions = await prisma.seoOpportunity.findMany({
    where: {
      type: "QUESTION",
    },
    orderBy: {
      impressions: "desc",
    },
    take: 10,
  });

  const mockQuestions = [
    {
      id: "mock1",
      keyword: "quel est le meilleur parfum homme au maroc",
      intent: "INFORMATIONAL",
      impressions: 1200,
      difficulty: "MEDIUM",
    },
    {
      id: "mock2",
      keyword: "prix parfum nay maroc",
      intent: "TRANSACTIONAL",
      impressions: 850,
      difficulty: "LOW",
    },
    {
      id: "mock3",
      keyword: "comment choisir un parfum d'été au maroc",
      intent: "INFORMATIONAL",
      impressions: 450,
      difficulty: "MEDIUM",
    },
    {
      id: "mock4",
      keyword: "acheter extrait de parfum en ligne casablanca",
      intent: "TRANSACTIONAL",
      impressions: 600,
      difficulty: "HIGH",
    },
  ];

  const questions = dbQuestions.length > 0 
    ? dbQuestions.map(q => ({
        id: q.id,
        keyword: q.keyword || q.title || "Unknown Question",
        intent: q.keyword?.toLowerCase().includes("prix") || q.keyword?.toLowerCase().includes("acheter") ? "TRANSACTIONAL" : "INFORMATIONAL",
        impressions: q.impressions || 0,
        difficulty: q.effort || "MEDIUM",
      }))
    : mockQuestions;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Search Intent Questions</h1>
          <p className="text-muted-foreground">
            Questions asked by Moroccan users related to your entity.
          </p>
        </div>
      </div>
      
      <div className="rounded-md border bg-card">
        <div className="p-0">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-muted/50 border-b">
              <tr>
                <th className="px-6 py-4 font-medium">Question</th>
                <th className="px-6 py-4 font-medium">Intent</th>
                <th className="px-6 py-4 font-medium">Search Vol</th>
                <th className="px-6 py-4 font-medium">Difficulty</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q) => (
                <tr key={q.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 font-medium flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    {q.keyword}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      q.intent === 'TRANSACTIONAL' 
                        ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}>
                      {q.intent}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Search className="h-3 w-3" />
                      {q.impressions > 0 ? q.impressions.toLocaleString() : "-"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-muted-foreground">{q.difficulty}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-transparent hover:bg-accent hover:text-accent-foreground h-8 px-3 py-1">
                      Answer
                      <ArrowRight className="ml-2 h-3 w-3" />
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
