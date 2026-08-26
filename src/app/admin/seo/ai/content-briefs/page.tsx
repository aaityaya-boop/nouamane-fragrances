import { FileText, Search, Target, Users } from "lucide-react";

export default function ContentBriefsPage() {
  const briefs = [
    {
      id: 1,
      title: "Best Long-Lasting Perfumes for Men 2024",
      h1: "Top 10 Long-Lasting Men's Fragrances",
      intent: "Informational / Commercial Investigation",
      audience: "Men looking for durable, high-quality fragrances",
      status: "Ready for Review"
    },
    {
      id: 2,
      title: "How to Store Perfume to Make it Last Longer",
      h1: "The Ultimate Guide to Perfume Storage",
      intent: "Informational",
      audience: "Fragrance enthusiasts, general consumers",
      status: "In Progress"
    },
    {
      id: 3,
      title: "Oud vs. Musk: What's the Difference?",
      h1: "Oud and Musk Explained: A Beginner's Guide",
      intent: "Informational",
      audience: "People interested in niche perfumery",
      status: "Completed"
    }
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <FileText className="h-8 w-8" />
        Content Briefs
      </h1>
      
      <div className="grid gap-6">
        {briefs.map(brief => (
          <div key={brief.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-semibold mb-1">{brief.title}</h2>
                <p className="text-gray-500 text-sm">H1: {brief.h1}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                brief.status === 'Completed' ? 'bg-green-100 text-green-700' :
                brief.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                'bg-amber-100 text-amber-700'
              }`}>
                {brief.status}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-gray-400" />
                <span className="font-medium text-gray-700">Intent:</span> {brief.intent}
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-400" />
                <span className="font-medium text-gray-700">Audience:</span> {brief.audience}
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
                View Full Brief <Target className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
