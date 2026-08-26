import { PrismaClient } from "@prisma/client";
import { Search, Filter, RefreshCw, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

const prisma = new PrismaClient();

const getStatusBadge = (status: string) => {
  switch (status.toUpperCase()) {
    case 'VERIFIED':
    case 'SUCCESS':
    case 'ACTIVE':
      return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-green-50 text-green-700 border border-green-200"><CheckCircle2 className="w-3.5 h-3.5" /> {status}</span>;
    case 'PENDING':
    case 'UNKNOWN':
      return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-yellow-50 text-yellow-700 border border-yellow-200"><AlertCircle className="w-3.5 h-3.5" /> {status}</span>;
    case 'FAILED':
    case 'MISSING':
      return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-red-50 text-red-700 border border-red-200"><XCircle className="w-3.5 h-3.5" /> {status}</span>;
    default:
      return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-gray-50 text-gray-700 border border-gray-200">{status}</span>;
  }
};

export default async function AiMentionsPage() {
  const mentions = await prisma.seoAiMention.findMany({
    orderBy: { checkedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-bold">AI Mentions & Citations</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Track where and how your brand is being mentioned in AI-generated responses.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm">
          <RefreshCw className="w-4 h-4" />
          Run Audit
        </button>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search mentions..." 
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
          />
        </div>
        <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600">
          <Filter className="w-4 h-4" />
        </button>
      </div>

      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Platform</th>
                <th className="px-6 py-4">Prompt</th>
                <th className="px-6 py-4">Mentioned</th>
                <th className="px-6 py-4">Cited</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Checked At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {mentions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No mentions tracked yet. Run an audit to start monitoring.
                  </td>
                </tr>
              ) : (
                mentions.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{m.platform}</td>
                    <td className="px-6 py-4 max-w-xs truncate" title={m.prompt}>{m.prompt}</td>
                    <td className="px-6 py-4">
                      {m.mentioned ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-gray-300" />
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {m.cited ? (
                        <span className="text-green-600 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Yes
                        </span>
                      ) : (
                        <span className="text-gray-400 flex items-center gap-1">
                          <XCircle className="w-4 h-4" /> No
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(m.status)}</td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(m.checkedAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
