import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSeoAiProvider } from "@/lib/seo-ai/provider";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { opportunityId } = body;

    if (!opportunityId) {
      return NextResponse.json({ error: "Missing opportunityId" }, { status: 400 });
    }

    const opportunity = await prisma.seoOpportunity.findUnique({
      where: { id: opportunityId }
    });

    if (!opportunity) {
      return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });
    }

    // Attempt to find search intent from SeoKeyword
    let searchIntent = "COMMERCIAL"; // Default
    let language = "FR";
    if (opportunity.keyword) {
      const kw = await prisma.seoKeyword.findUnique({ where: { keyword: opportunity.keyword } });
      if (kw) {
        searchIntent = kw.searchIntent;
        language = kw.language;
      }
    }

    const aiProvider = await getSeoAiProvider();

    // Call AI Provider to generate Content Brief
    const input = {
      primaryKeyword: opportunity.keyword || "NAY Parfum",
      targetUrl: opportunity.targetUrl || "",
      searchIntent,
      language,
      topic: opportunity.type,
      relatedQueries: [opportunity.keyword || ""], // In reality, fetch related queries from SeoTopicKeyword
    };

    const brief = await aiProvider.generateContentBrief(input);

    // Record the AI generation
    await prisma.seoAiGeneration.create({
      data: {
        entityType: "SeoOpportunity",
        entityId: opportunity.id,
        inputData: JSON.stringify(input),
        generatedTitle: brief.recommendedTitle,
        generatedContent: JSON.stringify(brief),
        model: process.env.SEO_AI_MODEL || "gemini-1.5-pro",
        createdBy: "ADMIN",
        status: "GENERATED"
      }
    });

    // We can also update the opportunity recommendation with a note that a brief was generated
    await prisma.seoOpportunity.update({
      where: { id: opportunity.id },
      data: { 
        recommendation: opportunity.recommendation + "\n[AI Content Brief Generated]"
      }
    });

    return NextResponse.json({
      success: true,
      brief
    });

  } catch (error: any) {
    console.error("Generate Brief Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
