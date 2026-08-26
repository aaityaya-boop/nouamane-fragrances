import { Map, Calendar, ArrowRight, CheckCircle2 } from "lucide-react";

export default function RoadmapPage() {
  const roadmap = [
    {
      period: "THIS WEEK",
      items: [
        { title: "Implement Organization Schema", status: "completed" },
        { title: "Generate content briefs for Top 5 collections", status: "in-progress" },
        { title: "Optimize product image alt tags with AI", status: "pending" }
      ]
    },
    {
      period: "THIS MONTH",
      items: [
        { title: "Publish 10 Product Knowledge Pages", status: "pending" },
        { title: "Run A/B test on Collection Page Titles", status: "pending" },
        { title: "Automate internal linking for new blog posts", status: "pending" }
      ]
    },
    {
      period: "NEXT 3 MONTHS",
      items: [
        { title: "Launch AI-driven dynamic FAQs on Product Pages", status: "pending" },
        { title: "Expand language support via AI translation (French & Arabic)", status: "pending" },
        { title: "Implement Video structured data for perfume reviews", status: "pending" }
      ]
    }
  ];

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
        <Map className="h-8 w-8" />
        AI SEO Roadmap
      </h1>
      <p className="text-gray-600 mb-8">Strategic plan for NAY Parfum visibility improvements.</p>
      
      <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-300 before:to-transparent">
        {roadmap.map((phase, index) => (
          <div key={phase.period} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-blue-100 text-blue-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
              <Calendar className="h-4 w-4" />
            </div>
            
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-lg text-blue-900 mb-4">{phase.period}</h3>
              <ul className="space-y-3">
                {phase.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    {item.status === 'completed' ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    ) : item.status === 'in-progress' ? (
                      <ArrowRight className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                    ) : (
                      <div className="h-2 w-2 rounded-full bg-gray-300 mt-2 shrink-0 ml-1.5 mr-1.5" />
                    )}
                    <span className={item.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-700'}>
                      {item.title}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
