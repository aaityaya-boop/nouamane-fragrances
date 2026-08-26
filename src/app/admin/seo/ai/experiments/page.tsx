import { FlaskConical, TrendingUp, TrendingDown, Minus } from "lucide-react";

export default function ExperimentsPage() {
  const experiments = [
    {
      id: "EXP-01",
      name: "Added FAQ Schema to Best Sellers",
      status: "Running",
      startDate: "2024-10-01",
      impact: "positive",
      metric: "+15% CTR"
    },
    {
      id: "EXP-02",
      name: "Updated Product Descriptions using AI",
      status: "Completed",
      startDate: "2024-09-15",
      impact: "neutral",
      metric: "0% Change"
    },
    {
      id: "EXP-03",
      name: "Added Organization Schema to Homepage",
      status: "Analyzing",
      startDate: "2024-10-10",
      impact: "pending",
      metric: "TBD"
    },
    {
      id: "EXP-04",
      name: "Tested new Title Tag format for Collections",
      status: "Completed",
      startDate: "2024-08-20",
      impact: "negative",
      metric: "-5% Clicks"
    }
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <FlaskConical className="h-8 w-8" />
        AI Visibility Experiments
      </h1>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-4 font-semibold text-gray-600">Experiment</th>
              <th className="p-4 font-semibold text-gray-600">Status</th>
              <th className="p-4 font-semibold text-gray-600">Start Date</th>
              <th className="p-4 font-semibold text-gray-600">Impact</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {experiments.map(exp => (
              <tr key={exp.id} className="hover:bg-gray-50">
                <td className="p-4">
                  <div className="font-medium text-gray-900">{exp.name}</div>
                  <div className="text-xs text-gray-500">{exp.id}</div>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    exp.status === 'Running' ? 'bg-blue-100 text-blue-700' :
                    exp.status === 'Completed' ? 'bg-gray-100 text-gray-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {exp.status}
                  </span>
                </td>
                <td className="p-4 text-sm text-gray-600">
                  {exp.startDate}
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    {exp.impact === 'positive' && <TrendingUp className="h-4 w-4 text-green-500" />}
                    {exp.impact === 'negative' && <TrendingDown className="h-4 w-4 text-red-500" />}
                    {exp.impact === 'neutral' && <Minus className="h-4 w-4 text-gray-500" />}
                    {exp.impact === 'pending' && <span className="h-2 w-2 rounded-full bg-amber-400 mx-1"></span>}
                    <span className={`text-sm font-medium ${
                      exp.impact === 'positive' ? 'text-green-600' :
                      exp.impact === 'negative' ? 'text-red-600' :
                      'text-gray-600'
                    }`}>
                      {exp.metric}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
