import React from "react";
import prisma from "@/lib/prisma";
import { AlertCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function backlinksPage() {
  const data = await prisma.seoBacklink.findMany({ take: 50 });
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Morocco Backlinks</h2>
          <p className="text-sm text-gray-500">Track referring domains and backlinks.</p>
        </div>
      </div>
      
      {data.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-12 flex flex-col items-center justify-center text-center border border-gray-100">
          <AlertCircle className="text-gray-400 mb-3" size={32} />
          <h3 className="text-gray-900 font-medium mb-1">No Data</h3>
          <p className="text-gray-500 text-sm">No backlinks tracked yet.</p>
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
