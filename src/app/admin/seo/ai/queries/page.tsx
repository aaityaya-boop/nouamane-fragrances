import { PrismaClient } from "@prisma/client";
import { Plus, Search, Filter } from "lucide-react";
import Link from "next/link";

const prisma = new PrismaClient();

export default async function AiQueriesPage() {
  const queries = await prisma.seoAiQuery.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-bold">AI Queries</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Track and manage the prompts users use to find your brand via AI platforms.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
          <Plus className="w-4 h-4" />
          Add Query
        </button>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search queries..." 
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
                <th className="px-6 py-4">Prompt</th>
                <th className="px-6 py-4">Target Entity</th>
                <th className="px-6 py-4">Language</th>
                <th className="px-6 py-4">Country</th>
                <th className="px-6 py-4">Added</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {queries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No queries found. Add one to start tracking.
                  </td>
                </tr>
              ) : (
                queries.map((q) => (
                  <tr key={q.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{q.prompt}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                        {q.targetEntity}
                      </span>
                    </td>
                    <td className="px-6 py-4">{q.language}</td>
                    <td className="px-6 py-4">{q.country}</td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(q.createdAt).toLocaleDateString()}
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
