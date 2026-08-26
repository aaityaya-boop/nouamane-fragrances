import Link from "next/link";
import { 
  BarChart, 
  Search, 
  MessageSquare, 
  Link as LinkIcon, 
  Database, 
  HelpCircle, 
  FileText, 
  PenTool, 
  FlaskConical, 
  Map, 
  Settings 
} from "lucide-react";

export default function AiVisibilityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navItems = [
    { name: "Overview", href: "/admin/seo/ai", icon: BarChart },
    { name: "Queries", href: "/admin/seo/ai/queries", icon: Search },
    { name: "Mentions", href: "/admin/seo/ai/mentions", icon: MessageSquare },
    { name: "Citations", href: "/admin/seo/ai/citations", icon: LinkIcon },
    { name: "Entity", href: "/admin/seo/ai/entity", icon: Database },
    { name: "Questions", href: "/admin/seo/ai/questions", icon: HelpCircle },
    { name: "Content Gaps", href: "/admin/seo/ai/content-gaps", icon: FileText },
    { name: "Content Briefs", href: "/admin/seo/ai/content-briefs", icon: PenTool },
    { name: "Experiments", href: "/admin/seo/ai/experiments", icon: FlaskConical },
    { name: "Roadmap", href: "/admin/seo/ai/roadmap", icon: Map },
    { name: "Settings", href: "/admin/seo/ai/settings", icon: Settings },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">AI Visibility Command Center</h2>
          <p className="text-muted-foreground mt-1">
            Monitor and optimize your brand's presence across generative AI platforms.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 overflow-x-auto hide-scrollbar">
          <nav className="flex space-x-1 px-4" aria-label="Tabs">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center gap-2 whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-colors"
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
