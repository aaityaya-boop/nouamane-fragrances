import prisma from "@/lib/prisma";
import { LinkIcon, ExternalLink } from "lucide-react";

export default async function CitationsPage() {
  const citations = await prisma.seoAiMention.findMany({
    where: {
      cited: true,
    },
    orderBy: {
      checkedAt: "desc",
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI Citations</h1>
          <p className="text-muted-foreground">
            Monitor where AI platforms are citing your website as a source.
          </p>
        </div>
      </div>
      
      <div className="rounded-md border bg-card">
        <div className="p-4">
          <div className="space-y-4">
            {citations.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <LinkIcon className="mx-auto h-12 w-12 opacity-20 mb-4" />
                <p>No citations found.</p>
              </div>
            ) : (
              citations.map((citation) => (
                <div key={citation.id} className="flex items-start justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div>
                    <div className="font-medium text-lg">{citation.platform}</div>
                    <div className="text-sm text-muted-foreground mt-1 font-medium">Prompt: <span className="font-normal">{citation.prompt}</span></div>
                    {citation.citationUrl && (
                      <a href={citation.citationUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex items-center mt-2">
                        {citation.citationUrl}
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground whitespace-nowrap">
                    {citation.checkedAt.toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
