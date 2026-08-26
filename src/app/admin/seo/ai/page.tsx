import { PrismaClient } from "@prisma/client";
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  Activity,
  Database,
  Link as LinkIcon,
  FileText,
  ShoppingBag,
  HelpCircle,
  MapPin,
  Settings
} from "lucide-react";

const prisma = new PrismaClient();

// Helper to get status color and icon
const getStatusDisplay = (score: number) => {
  if (score >= 80) return { color: "text-green-600", bg: "bg-green-50", icon: CheckCircle2, text: "PASS" };
  if (score >= 60) return { color: "text-yellow-600", bg: "bg-yellow-50", icon: AlertTriangle, text: "WARNING" };
  return { color: "text-red-600", bg: "bg-red-50", icon: XCircle, text: "NEEDS ACTION" };
};

export default async function AiVisibilityOverviewPage() {
  const audit = await prisma.seoAiVisibilityAudit.findFirst({
    orderBy: { createdAt: "desc" },
  });

  const data = audit || {
    aiVisibilityScore: 0,
    entityStrength: 0,
    citationReadiness: 0,
    contentCoverage: 0,
    productCoverage: 0,
    questionCoverage: 0,
    moroccoCoverage: 0,
    technicalAccessibility: 0,
    status: "NEEDS ACTION"
  };

  const metrics = [
    { name: "Entity Strength", score: data.entityStrength, icon: Database },
    { name: "Citation Readiness", score: data.citationReadiness, icon: LinkIcon },
    { name: "Content Coverage", score: data.contentCoverage, icon: FileText },
    { name: "Product Coverage", score: data.productCoverage, icon: ShoppingBag },
    { name: "Question Coverage", score: data.questionCoverage, icon: HelpCircle },
    { name: "Morocco Coverage", score: data.moroccoCoverage, icon: MapPin },
    { name: "Technical Accessibility", score: data.technicalAccessibility, icon: Settings },
  ];

  return (
    <div className="space-y-8">
      {/* Main Score Card */}
      <div className="bg-gradient-to-br from-indigo-50 to-blue-100 rounded-2xl p-8 border border-indigo-100 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-xl font-semibold text-indigo-900 mb-2 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Overall AI Visibility Score
          </h3>
          <p className="text-indigo-700 max-w-lg">
            This score represents how well your brand is understood and recommended by AI platforms like ChatGPT, Claude, and Gemini.
          </p>
        </div>
        <div className="flex flex-col items-center">
          <div className="text-6xl font-black text-indigo-700 tracking-tighter">
            {data.aiVisibilityScore}
            <span className="text-2xl text-indigo-400 font-medium">/100</span>
          </div>
          <div className={`mt-3 px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 ${
            data.aiVisibilityScore >= 80 ? "bg-green-100 text-green-700" : 
            data.aiVisibilityScore >= 60 ? "bg-yellow-100 text-yellow-700" : 
            "bg-red-100 text-red-700"
          }`}>
            {data.status}
          </div>
        </div>
      </div>

      {/* Sub-Metrics Grid */}
      <div>
        <h3 className="text-lg font-bold mb-4">Pillars of AI Visibility</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {metrics.map((metric) => {
            const status = getStatusDisplay(metric.score);
            const Icon = metric.icon;
            const StatusIcon = status.icon;

            return (
              <div key={metric.name} className="p-5 rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <Icon className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${status.bg} ${status.color}`}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    {status.text}
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-1">{metric.score}<span className="text-sm font-normal text-gray-400">/100</span></div>
                  <div className="text-sm font-medium text-gray-700">{metric.name}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
